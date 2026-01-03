import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { student } from "./student-schema";
import { relations } from "drizzle-orm";

export const kelulusan = pgTable("kelulusan", {
    id: serial("id").primaryKey(),
    studentId: text("student_id").references(() => student.id, { onDelete: 'cascade' }).notNull().unique(),
    jalur: text("jalur"),
    status: text("status").notNull(), // 'Lulus', 'Tidak Lulus', 'Cadangan'
    tahap: text("tahap").notNull(), // 'Tahap 1', 'Tahap 2'
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const kelulusanRelations = relations(kelulusan, ({ one }) => ({
    student: one(student, {
        fields: [kelulusan.studentId],
        references: [student.id],
    }),
}));
