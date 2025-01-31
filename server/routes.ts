import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { horses, appointments, users, documents, type SelectHorse, type SelectAppointment, type SelectDocument } from "@db/schema";
import { eq } from "drizzle-orm";
import { setupAuth } from "./auth";
import { createUploadthingExpressHandler } from "uploadthing/express";
import { uploadRouter } from "./uploadthing";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

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

  // UploadThing route handler
  app.use("/api/uploadthing", createUploadthingExpressHandler(uploadRouter));

  const httpServer = createServer(app);
  return httpServer;
}