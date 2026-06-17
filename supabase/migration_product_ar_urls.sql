-- Migration: Add AR model and poster URLs to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS ar_model_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS ar_poster_url text;
