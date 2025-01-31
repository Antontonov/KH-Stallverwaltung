import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { horses, appointments, users, documents, type SelectHorse, type SelectAppointment, type SelectDocument } from "@db/schema";
import { eq } from "drizzle-orm";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import express from "express";
import fs from "fs";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Configure multer for file uploads
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(process.cwd(), "uploads", file.fieldname === "profile" ? "profiles" : "documents");
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ 
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: function (req, file, cb) {
      if (file.fieldname === "profile") {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new Error('Nur Bilder sind erlaubt'));
        }
      } else if (file.fieldname === "document") {
        const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedMimes.includes(file.mimetype)) {
          return cb(new Error('Nicht unterstütztes Dateiformat'));
        }
      }
      cb(null, true);
    }
  });

  // Create upload directories if they don't exist
  const uploadDirs = ['profiles', 'documents'].map(dir => path.join(process.cwd(), 'uploads', dir));
  uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Upload endpoints
  app.post("/api/upload/profile", upload.single('profile'), (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!req.file) return res.status(400).send("Keine Datei hochgeladen");
    res.json({ url: `/uploads/${req.file.fieldname}/${req.file.filename}` });
  });

  app.post("/api/upload/document", upload.single('document'), (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!req.file) return res.status(400).send("Keine Datei hochgeladen");
    res.json({ url: `/uploads/${req.file.fieldname}/${req.file.filename}` });
  });

  // Serve uploaded files
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Document management
  app.get("/api/documents/:entityType/:entityId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { entityType, entityId } = req.params;
    const allDocuments = await db.query.documents.findMany({
      where: (doc) => eq(doc.entity_type, entityType) && eq(doc.entity_id, +entityId),
      with: {
        uploadedBy: true,
      },
    });
    res.json(allDocuments);
  });

  app.post("/api/documents", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const doc = await db
      .insert(documents)
      .values({ ...req.body, uploaded_by_id: req.user.id })
      .returning();
    res.json(doc[0]);
  });

  // Horse management
  app.get("/api/horses", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const allHorses = await db.query.horses.findMany({
      with: {
        owner: true,
        stable: true,
        documents: true,
      },
    });
    res.json(allHorses);
  });

  app.post("/api/horses", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const horse = await db.insert(horses).values(req.body).returning();
    res.json(horse[0]);
  });

  app.patch("/api/horses/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const horse = await db
      .update(horses)
      .set(req.body)
      .where(eq(horses.id, +req.params.id))
      .returning();
    res.json(horse[0]);
  });

  // Appointment management
  app.get("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const allAppointments = await db.query.appointments.findMany({
      with: {
        horse: true,
        assignedTo: true,
      },
    });
    res.json(allAppointments);
  });

  app.post("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const appointment = await db
      .insert(appointments)
      .values({ ...req.body, created_by_id: req.user.id })
      .returning();
    res.json(appointment[0]);
  });

  // User management
  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const allUsers = await db.query.users.findMany({
      with: {
        role: true,
        horses: true,
        stable: true,
      },
    });
    res.json(allUsers);
  });

  app.patch("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = await db
      .update(users)
      .set(req.body)
      .where(eq(users.id, +req.params.id))
      .returning();
    res.json(user[0]);
  });


  const httpServer = createServer(app);
  return httpServer;
}