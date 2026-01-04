import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const tahunAjaran = pgTable("tahun_ajaran", {
    id: text("id").primaryKey(),
    tahun: text("tahun").notNull().unique(), // e.g., "2026/2027"
    tahap: text("tahap"), // e.g., "Tahap 2"
    tanggalPengumuman: timestamp("tanggal_pengumuman"),
    isAktif: boolean("is_aktif").default(false).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
