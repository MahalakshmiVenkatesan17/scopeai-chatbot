-- Migration: Add missing columns to subscriptions table
-- This script adds columns required for Razorpay and payment type support

-- Check if column exists and add if it doesn't
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS plan_id VARCHAR(255) NOT NULL DEFAULT 'plan_default' AFTER plan_name,
ADD COLUMN IF NOT EXISTS subscription_status ENUM('active', 'cancelled', 'expired', 'past_due', 'created', 'authenticated', 'paused', 'halted', 'completed') DEFAULT 'active' AFTER billing_cycle,
ADD COLUMN IF NOT EXISTS payment_type ENUM('razorpay', 'stripe') NULL AFTER currency,
ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255) NULL AFTER payment_type,
ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255) NULL AFTER trial_end,
ADD COLUMN IF NOT EXISTS invoice_data JSON AFTER payment_id;

-- Update existing status values to subscription_status if they exist
-- This handles the transition from old schema to new schema
UPDATE subscriptions SET subscription_status = status WHERE subscription_status IS NULL;

-- We can't drop the old 'status' column yet in case migration is rolled back
-- Keep it for now for backwards compatibility
