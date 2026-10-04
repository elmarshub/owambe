-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'paid', 'failed');

-- CreateEnum
CREATE TYPE "DeliverySpeed" AS ENUM ('std', 'exp');

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "ref" TEXT NOT NULL,
    "user_id" UUID,
    "email" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "subtotal" INTEGER NOT NULL,
    "delivery_fee" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "delivery_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "speed" "DeliverySpeed" NOT NULL,
    "paystack" JSONB,
    "paid_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "piece_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colour" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "add_on" BOOLEAN NOT NULL DEFAULT false,
    "unit_price" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_ref_key" ON "orders"("ref");

-- CreateIndex
CREATE INDEX "orders_user_id_created_at_idx" ON "orders"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Hand-written: rules Prisma's schema language can't express.

-- Money and quantities can't go negative, and totals must add up.
ALTER TABLE "orders"
  ADD CONSTRAINT "orders_amounts_check" CHECK ("subtotal" >= 0 AND "delivery_fee" >= 0 AND "total" = "subtotal" + "delivery_fee");
ALTER TABLE "order_items"
  ADD CONSTRAINT "order_items_qty_check" CHECK ("qty" BETWEEN 1 AND 10),
  ADD CONSTRAINT "order_items_amounts_check" CHECK ("unit_price" >= 0 AND "total" = "unit_price" * "qty");

-- Supabase exposes the public schema over its REST API. Turn on row-level security with no policies,
-- so the anon and authenticated keys can't read or write orders there. The app reaches these tables
-- through Prisma as the table owner, which RLS doesn't restrict.
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;
