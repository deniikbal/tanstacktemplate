CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"role" text DEFAULT 'user' NOT NULL,
	"banned" boolean,
	"ban_reason" text,
	"ban_expires" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "student" (
	"id" text PRIMARY KEY NOT NULL,
	"nis" text,
	"nisn" text,
	"nm_siswa" text NOT NULL,
	"tempat_lahir" text,
	"tanggal_lahir" date,
	"jenis_kelamin" text,
	"agama" text,
	"alamat_siswa" text,
	"telepon_siswa" text,
	"diterima_tanggal" date,
	"nm_ayah" text,
	"nm_ibu" text,
	"pekerjaan_ayah" text,
	"pekerjaan_ibu" text,
	"nm_wali" text,
	"pekerjaan_wali" text,
	"status_dalam_kel" text,
	"anak_ke" text,
	"sekolah_asal" text,
	"diterima_kelas" text,
	"alamat_ortu" text,
	"telepon_ortu" text,
	"alamat_wali" text,
	"telepon_wali" text,
	"foto_siswa" text,
	"no_ijasahnas" text,
	"tgl_lulus" date,
	"no_transkrip" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "student_nisn_unique" UNIQUE("nisn")
);
--> statement-breakpoint
CREATE TABLE "pendaftar" (
	"id" text PRIMARY KEY NOT NULL,
	"nm_lengkap" text NOT NULL,
	"tempat_lahir" text,
	"tanggal_lahir" date,
	"alamat" text,
	"asal_sekolah" text,
	"no_handphone" text,
	"tahun_lulus" text,
	"jalur_masuk" text,
	"keterangan" text,
	"tahap" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;