-- =======================================================
-- SQL MIGRATION: METADATOS DE PRODUCTOS Y NOTAS DE PEDIDOS
-- COPIAR Y PEGAR EN EL SQL EDITOR DE SUPABASE
-- =======================================================

-- 1. Agregar columna stock_min a la tabla de productos para alertas de inventario
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_min integer DEFAULT 5;

-- 2. Agregar columna notes a la tabla de pedidos para anotaciones administrativas
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes text;
