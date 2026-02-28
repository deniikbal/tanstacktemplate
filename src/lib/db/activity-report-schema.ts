import { pgTable, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { student } from "./student-schema";
import { relations } from "drizzle-orm";

export const activityReport = pgTable("activity_report", {
    id: text("id").primaryKey(),
    studentId: text("student_id")
        .notNull()
        .references(() => student.id),
    tanggal: text("tanggal").notNull(), // Format: YYYY-MM-DD
    hari: text("hari").notNull(),
    jamKe: integer("jam_ke").notNull(),
    waktu: text("waktu").notNull(),
    kegiatan: text("kegiatan").notNull(),
    guruMasuk: text("guru_masuk").notNull(),
    isAbsent: boolean("is_absent").default(false),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const activityReportRelations = relations(activityReport, ({ one }) => ({
    student: one(student, {
        fields: [activityReport.studentId],
        references: [student.id],
    }),
}));
