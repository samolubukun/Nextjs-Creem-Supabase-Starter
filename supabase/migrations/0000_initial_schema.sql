CREATE TYPE "public"."credit_transaction_type_check" AS ENUM('subscription_topup', 'purchase', 'spend', 'refund');--> statement-breakpoint
CREATE TYPE "public"."role_check" AS ENUM('user', 'assistant', 'system');--> statement-breakpoint
CREATE TYPE "public"."subscriptions_status_check" AS ENUM('active', 'trialing', 'past_due', 'scheduled_cancel', 'cancelled', 'paused', 'expired', 'inactive');--> statement-breakpoint
CREATE TABLE "billing_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"event_type" text NOT NULL,
	"creem_transaction_id" text,
	"creem_subscription_id" text,
	"amount" integer,
	"currency" text,
	"reason" text,
	"status" text DEFAULT 'open',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "billing_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chat_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "chat_messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "chats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text DEFAULT 'New Conversation',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "chats" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "credit_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "credit_transactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "credits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "credits" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "licenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"creem_license_key" text NOT NULL,
	"creem_product_id" text NOT NULL,
	"product_name" text,
	"status" text DEFAULT 'inactive' NOT NULL,
	"instance_name" text,
	"instance_id" text,
	"activated_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "licenses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"creem_customer_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"total_spent_cents" bigint DEFAULT 0,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"creem_customer_id" text,
	"creem_product_id" text NOT NULL,
	"product_name" text,
	"purchased_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "purchases" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"creem_customer_id" text,
	"creem_subscription_id" text,
	"creem_product_id" text,
	"product_name" text,
	"status" text DEFAULT 'inactive',
	"current_period_end" timestamp with time zone,
	"cancel_at" timestamp with time zone,
	"previous_product_id" text,
	"seats" integer DEFAULT 1,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" text PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_billing_events_user_id" ON "billing_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_chat_messages_chat_id" ON "chat_messages" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "idx_chats_user_id" ON "chats" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_credit_transactions_user_id" ON "credit_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_credits_user_id" ON "credits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_licenses_key" ON "licenses" USING btree ("creem_license_key");--> statement-breakpoint
CREATE INDEX "idx_licenses_user_id" ON "licenses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_purchases_user_id" ON "purchases" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_creem_customer_id" ON "subscriptions" USING btree ("creem_customer_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_creem_subscription_id" ON "subscriptions" USING btree ("creem_subscription_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_user_id" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_webhook_events_processed_at" ON "webhook_events" USING btree ("processed_at");--> statement-breakpoint
CREATE POLICY "Users can view own billing events" ON "billing_events" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can view own chat messages" ON "chat_messages" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can create own chat messages" ON "chat_messages" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Users can view own chats" ON "chats" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can create own chats" ON "chats" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Users can delete own chats" ON "chats" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "Users can view own credit transactions" ON "credit_transactions" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can view own credits" ON "credits" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can view own licenses" ON "licenses" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can view own profile" ON "profiles" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = id));--> statement-breakpoint
CREATE POLICY "Users can update own profile" ON "profiles" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Users can view own purchases" ON "purchases" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can view own subscription" ON "subscriptions" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));