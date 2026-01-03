import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const setting = pgTable("setting", {
    id: text("id").primaryKey(),
    tanggalPengumuman: timestamp("tanggal_pengumuman"),
    tahunAjaran: text("tahun_ajaran"), // e.g., "2026/2027" - active academic year
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
