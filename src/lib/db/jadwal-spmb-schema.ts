import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const jadwalSpmb = pgTable("jadwal_spmb", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    timeDetails: text("time_details"), // opsional, misalnya "08:00 - 20:00"
    tahap: text("tahap"), // e.g., "tahap1" atau "tahap2"
    status: text("status").notNull().default("Akan Datang"), // "Selesai", "Aktif", "Akan Datang"
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
