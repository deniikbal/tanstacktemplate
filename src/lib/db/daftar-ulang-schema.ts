import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { kelulusan } from "./kelulusan-schema";
import { relations } from "drizzle-orm";

export const daftarUlang = pgTable("daftar_ulang", {
    id: serial("id").primaryKey(),
    kelulusanId: integer("kelulusan_id").references(() => kelulusan.id, { onDelete: 'cascade' }).notNull().unique(),
    skl: boolean("skl").default(false).notNull(),
    tatib: boolean("tatib").default(false).notNull(),
    kk: boolean("kk").default(false).notNull(),
    bukti: boolean("bukti").default(false).notNull(),
    pernyataan: boolean("pernyataan").default(false).notNull(),
    keterangan: text("keterangan"),
    petugas: text("petugas"),
    fileSklId: text("file_skl_id"),
    fileTatibId: text("file_tatib_id"),
    fileKkId: text("file_kk_id"),
    fileBuktiId: text("file_bukti_id"),
    filePernyataanId: text("file_pernyataan_id"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const daftarUlangRelations = relations(daftarUlang, ({ one }) => ({
    kelulusan: one(kelulusan, {
        fields: [daftarUlang.kelulusanId],
        references: [kelulusan.id],
    }),
}));
