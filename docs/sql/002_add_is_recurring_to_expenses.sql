xx-- ============================================================
-- Migration: Add is_recurring to expenses table
-- Description: Añade el flag para indicar si un gasto es mensual recurrente
-- ============================================================

-- Añadir la columna is_recurring a la tabla expenses
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT false;

-- Opcional: Crear índice si se van a hacer muchas búsquedas por recurrentes
CREATE INDEX IF NOT EXISTS idx_expenses_is_recurring ON public.expenses(is_recurring) WHERE is_recurring = true;

-- Verificación:
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'expenses' AND column_name = 'is_recurring';
