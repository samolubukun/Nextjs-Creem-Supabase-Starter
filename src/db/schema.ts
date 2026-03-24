import { sql } from "drizzle-orm";
import {
  bigint,
  foreignKey,
  index,
  integer,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Enums matched from database
export const creditTransactionTypeCheck = pgEnum("credit_transaction_type_check", [
  "subscription_topup",
  "purchase",
  "spend",
  "refund",
]);
export const roleCheck = pgEnum("role_check", ["user", "assistant", "system"]);
export const subscriptionsStatusCheck = pgEnum("subscriptions_status_check", [
  "active",
  "trialing",
  "past_due",
  "scheduled_cancel",
  "cancelled",
  "paused",
  "expired",
  "inactive",
]);

export const BILLING_EVENT_TYPES = [
  "checkout.completed",
  "subscription_topup",
  "purchase",
  "subscription.canceled",
  "subscription.past_due",
  "subscription.upgraded",
  "subscription.downgraded",
  "refund",
  "dispute",
] as const;

export type BillingEventType = (typeof BILLING_EVENT_TYPES)[number];
export const billingEventType = pgEnum("billing_event_type", BILLING_EVENT_TYPES);

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: text().primaryKey().notNull(),
    eventType: text("event_type").notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [index("idx_webhook_events_processed_at").on(table.processedAt)],
);

export const billingEvents = pgTable(
  "billing_events",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id"),
    eventType: billingEventType("event_type").notNull(),
    creemTransactionId: text("creem_transaction_id"),
    creemSubscriptionId: text("creem_subscription_id"),
    amount: integer(),
    currency: text(),
    reason: text(),
    status: text().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_billing_events_user_id").on(table.userId),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [profiles.id],
      name: "billing_events_user_id_profiles_id_fk",
    }).onDelete("cascade"),
    pgPolicy("Users can view own billing events", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
  ],
);

export const licenses = pgTable(
  "licenses",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    creemLicenseKey: text("creem_license_key").notNull(),
    creemProductId: text("creem_product_id").notNull(),
    productName: text("product_name"),
    status: text().default("inactive").notNull(),
    instanceName: text("instance_name"),
    instanceId: text("instance_id"),
    activatedAt: timestamp("activated_at", { withTimezone: true, mode: "string" }),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_licenses_key").on(table.creemLicenseKey),
    index("idx_licenses_user_id").on(table.userId),
    pgPolicy("Users can view own licenses", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
  ],
);

export const creditTransactions = pgTable(
  "credit_transactions",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    amount: integer().notNull(),
    type: text().notNull(),
    description: text(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_credit_transactions_user_id").on(table.userId),
    pgPolicy("Users can view own credit transactions", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
  ],
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull().unique(),
    creemCustomerId: text("creem_customer_id"),
    creemSubscriptionId: text("creem_subscription_id"),
    creemProductId: text("creem_product_id"),
    productName: text("product_name"),
    status: text().default("inactive"),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true, mode: "string" }),
    cancelAt: timestamp("cancel_at", { withTimezone: true, mode: "string" }),
    previousProductId: text("previous_product_id"),
    seats: integer().default(1),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_subscriptions_creem_customer_id").on(table.creemCustomerId),
    index("idx_subscriptions_creem_subscription_id").on(table.creemSubscriptionId),
    index("idx_subscriptions_user_id").on(table.userId),
    pgPolicy("Users can view own subscription", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
  ],
);

export const credits = pgTable(
  "credits",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull().unique(),
    balance: integer().default(0).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_credits_user_id").on(table.userId),
    pgPolicy("Users can view own credits", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
  ],
);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid().primaryKey().notNull(),
    email: text().notNull(),
    fullName: text("full_name"),
    creemCustomerId: text("creem_customer_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
    totalSpentCents: bigint("total_spent_cents", { mode: "number" }).default(0),
    notes: text("notes"),
  },
  (_table) => [
    pgPolicy("Users can view own profile", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(auth.uid() = id)`,
    }),
    pgPolicy("Users can update own profile", { as: "permissive", for: "update", to: ["public"] }),
  ],
);

export const chats = pgTable(
  "chats",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    title: text().default("New Conversation"),
    metadata: text("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_chats_user_id").on(table.userId),
    pgPolicy("Users can view own chats", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy("Users can create own chats", { as: "permissive", for: "insert", to: ["public"] }),
    pgPolicy("Users can delete own chats", { as: "permissive", for: "delete", to: ["public"] }),
  ],
);

export const purchases = pgTable(
  "purchases",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    creemCustomerId: text("creem_customer_id"),
    creemProductId: text("creem_product_id").notNull(),
    productName: text("product_name"),
    purchasedAt: timestamp("purchased_at", { withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_purchases_user_id").on(table.userId),
    pgPolicy("Users can view own purchases", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
  ],
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    chatId: uuid("chat_id").notNull(),
    userId: uuid("user_id").notNull(),
    role: text().notNull(),
    content: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_chat_messages_chat_id").on(table.chatId),
    pgPolicy("Users can view own chat messages", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy("Users can create own chat messages", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
  ],
);

export const files = pgTable(
  "files",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    storageProvider: text("storage_provider").notNull(),
    bucket: text().notNull(),
    objectKey: text("object_key").notNull().unique(),
    originalFilename: text("original_filename").notNull(),
    contentType: text("content_type").notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    status: text().default("uploaded").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_files_user_id").on(table.userId),
    index("idx_files_object_key").on(table.objectKey),
    pgPolicy("Users can view own files", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy("Users can create own files", {
      as: "permissive",
      for: "insert",
      to: ["public"],
      withCheck: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy("Users can update own files", {
      as: "permissive",
      for: "update",
      to: ["public"],
      using: sql`(auth.uid() = user_id)`,
    }),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    action: text("action").notNull(),
    metadata: text("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_audit_logs_user_id").on(table.userId),
    pgPolicy("Admins can view all audit logs", { as: "permissive", for: "select", to: ["public"] }),
  ],
);
