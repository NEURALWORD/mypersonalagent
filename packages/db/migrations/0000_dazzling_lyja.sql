CREATE TABLE "integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"expires_at" timestamp with time zone,
	"scopes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_sync_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "privacy_settings" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"retention_days_raw" integer DEFAULT 90 NOT NULL,
	"retention_days_memory" integer,
	"training_opt_in" boolean DEFAULT false NOT NULL,
	"wisdom_opt_in" boolean DEFAULT false NOT NULL,
	"always_on_voice" boolean DEFAULT false NOT NULL,
	"proactive_level" text DEFAULT 'medium' NOT NULL,
	"share_location" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"locale" text DEFAULT 'en' NOT NULL,
	"agent_name" text DEFAULT 'Atlas' NOT NULL,
	"agent_voice_id" text,
	"preferences" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"cohort_attributes" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "privacy_settings" ADD CONSTRAINT "privacy_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;