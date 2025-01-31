import { pgTable, text, serial, integer, boolean, date, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

// Enums
export const documentTypeEnum = pgEnum("document_type", ["invoice", "other"]);
export const languageEnum = pgEnum("language", ["de", "en"]);

// User roles
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

// Event groups for calendar
export const eventGroups = pgTable("event_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

// Users table with extended profile information
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  address: text("address").notNull(),
  bank_account: text("bank_account").notNull(),
  birth_date: date("birth_date").notNull(),
  role_id: integer("role_id").references(() => roles.id),
  profile_image_url: text("profile_image_url"),
  preferred_language: text("preferred_language").default("de").notNull(),
});

// User-Event Group relations
export const userEventGroups = pgTable("user_event_groups", {
  user_id: integer("user_id").references(() => users.id),
  group_id: integer("group_id").references(() => eventGroups.id),
});

// Horses table
export const horses = pgTable("horses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  breed: text("breed").notNull(),
  height: integer("height").notNull(), // in cm
  next_vet_appointment: date("next_vet_appointment"),
  owner_id: integer("owner_id").references(() => users.id),
  stable_id: integer("stable_id").references(() => stables.id),
  profile_image_url: text("profile_image_url"),
});

// Documents table for both users and horses
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  file_url: text("file_url").notNull(),
  document_type: documentTypeEnum("document_type").notNull(),
  uploaded_at: timestamp("uploaded_at").defaultNow().notNull(),
  entity_type: text("entity_type").notNull(), // "user" or "horse"
  entity_id: integer("entity_id").notNull(),
  uploaded_by_id: integer("uploaded_by_id").references(() => users.id),
});

// Translations table
export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  language: languageEnum("language").notNull(),
  key: text("key").notNull(),
  value: text("value").notNull(),
});

// Stables/Boxes table
export const stables = pgTable("stables", {
  id: serial("id").primaryKey(),
  number: text("number").unique().notNull(),
  occupied: boolean("occupied").default(false),
  current_tenant_id: integer("current_tenant_id").references(() => users.id),
});

// Appointments/Calendar events
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  start_time: timestamp("start_time").notNull(),
  end_time: timestamp("end_time").notNull(),
  horse_id: integer("horse_id").references(() => horses.id),
  assigned_to_id: integer("assigned_to_id").references(() => users.id),
  created_by_id: integer("created_by_id").references(() => users.id),
  event_group_id: integer("event_group_id").references(() => eventGroups.id),
  recurrence_pattern: jsonb("recurrence_pattern"), // Store recurrence info as JSON
});

// Relations
export const userRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.role_id],
    references: [roles.id],
  }),
  horses: many(horses),
  stable: one(stables, {
    fields: [users.id],
    references: [stables.current_tenant_id],
  }),
  eventGroups: many(userEventGroups),
  documents: many(documents, { relationName: "userDocuments" }),
  uploadedDocuments: many(documents, { relationName: "documentUploader" }),
}));

export const eventGroupRelations = relations(eventGroups, ({ many }) => ({
  users: many(userEventGroups),
  appointments: many(appointments),
}));

export const horseRelations = relations(horses, ({ one, many }) => ({
  owner: one(users, {
    fields: [horses.owner_id],
    references: [users.id],
  }),
  stable: one(stables, {
    fields: [horses.stable_id],
    references: [stables.id],
  }),
  documents: many(documents),
}));

export const documentRelations = relations(documents, ({ one }) => ({
  uploadedBy: one(users, {
    fields: [documents.uploaded_by_id],
    references: [users.id],
  }),
}));

export const appointmentRelations = relations(appointments, ({ one }) => ({
  horse: one(horses, {
    fields: [appointments.horse_id],
    references: [horses.id],
  }),
  assignedTo: one(users, {
    fields: [appointments.assigned_to_id],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [appointments.created_by_id],
    references: [users.id],
  }),
  eventGroup: one(eventGroups, {
    fields: [appointments.event_group_id],
    references: [eventGroups.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertHorseSchema = createInsertSchema(horses);
export const selectHorseSchema = createSelectSchema(horses);
export const insertDocumentSchema = createInsertSchema(documents);
export const selectDocumentSchema = createSelectSchema(documents);
export const insertAppointmentSchema = createInsertSchema(appointments);
export const selectAppointmentSchema = createSelectSchema(appointments);
export const insertEventGroupSchema = createInsertSchema(eventGroups);
export const selectEventGroupSchema = createSelectSchema(eventGroups);
export const insertTranslationSchema = createInsertSchema(translations);
export const selectTranslationSchema = createSelectSchema(translations);

// Types
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertHorse = typeof horses.$inferInsert;
export type SelectHorse = typeof horses.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;
export type SelectDocument = typeof documents.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;
export type SelectAppointment = typeof appointments.$inferSelect;
export type InsertEventGroup = typeof eventGroups.$inferInsert;
export type SelectEventGroup = typeof eventGroups.$inferSelect;
export type InsertTranslation = typeof translations.$inferInsert;
export type SelectTranslation = typeof translations.$inferSelect;