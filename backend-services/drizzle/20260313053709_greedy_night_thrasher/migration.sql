CREATE TABLE "scheduled_jobs" (
	"id" varchar(255) PRIMARY KEY,
	"name" text NOT NULL,
	"run_at" timestamp NOT NULL,
	"payload" jsonb,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
