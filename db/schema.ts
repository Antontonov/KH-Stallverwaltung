import { pgTable, text, serial, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

// User roles
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

// Users table with extended profile information
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
  address: text("address").notNull(),
  bankAccount: text("bankAccount").notNull(),
  birthDate: date("birthDate").notNull(),
  roleId: integer("roleId").references(() => roles.id),
});

// Horses table
export const horses = pgTable("horses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  breed: text("breed").notNull(),
  height: integer("height").notNull(), // in cm
  nextVetAppointment: date("nextVetAppointment"),
  ownerId: integer("ownerId").references(() => users.id),
  stableId: integer("stableId").references(() => stables.id),
});

// Stables/Boxes table
export const stables = pgTable("stables", {
  id: serial("id").primaryKey(),
  number: text("number").unique().notNull(),
  occupied: boolean("occupied").default(false),
  currentTenantId: integer("currentTenantId").references(() => users.id),
});

// Appointments/Calendar events
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  horseId: integer("horseId").references(() => horses.id),
  assignedToId: integer("assignedToId").references(() => users.id),
  createdById: integer("createdById").references(() => users.id),
});

// Relations
export const userRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  horses: many(horses),
  stable: one(stables, {
    fields: [users.id],
    references: [stables.currentTenantId],
  }),
}));

export const horseRelations = relations(horses, ({ one }) => ({
  owner: one(users, {
    fields: [horses.ownerId],
    references: [users.id],
  }),
  stable: one(stables, {
    fields: [horses.stableId],
    references: [stables.id],
  }),
}));

export const appointmentRelations = relations(appointments, ({ one }) => ({
  horse: one(horses, {
    fields: [appointments.horseId],
    references: [horses.id],
  }),
  assignedTo: one(users, {
    fields: [appointments.assignedToId],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [appointments.createdById],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertHorseSchema = createInsertSchema(horses);
export const selectHorseSchema = createSelectSchema(horses);
export const insertAppointmentSchema = createInsertSchema(appointments);
export const selectAppointmentSchema = createSelectSchema(appointments);

// Types
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertHorse = typeof horses.$inferInsert;
export type SelectHorse = typeof horses.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;
export type SelectAppointment = typeof appointments.$inferSelect;
