CREATE TABLE "cycle_settings" (
	"profile_id" uuid PRIMARY KEY NOT NULL,
	"cycle_length" integer DEFAULT 28 NOT NULL,
	"period_length" integer DEFAULT 5 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "period_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"symptoms" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	CONSTRAINT "period_entries_profile_id_start_date_unique" UNIQUE("profile_id","start_date")
);
--> statement-breakpoint
ALTER TABLE "cycle_settings" ADD CONSTRAINT "cycle_settings_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "period_entries" ADD CONSTRAINT "period_entries_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;