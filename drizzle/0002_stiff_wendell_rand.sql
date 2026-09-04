CREATE TABLE "live_status" (
	"profile_id" uuid PRIMARY KEY NOT NULL,
	"couple_id" uuid NOT NULL,
	"status" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "location_lat" double precision;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "location_lng" double precision;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "location_label" text;--> statement-breakpoint
ALTER TABLE "live_status" ADD CONSTRAINT "live_status_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_status" ADD CONSTRAINT "live_status_couple_id_couples_id_fk" FOREIGN KEY ("couple_id") REFERENCES "public"."couples"("id") ON DELETE no action ON UPDATE no action;