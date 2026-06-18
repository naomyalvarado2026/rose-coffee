-- Migration: Add stock_min and unit columns to inventory_items table
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS stock_min integer DEFAULT 5;
ALTER TABLE public.inventory_items ADD COLUMN IF NOT EXISTS unit text DEFAULT 'unidades';
