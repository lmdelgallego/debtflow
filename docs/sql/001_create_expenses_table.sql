-- ============================================================
-- Migration: Create expenses table
-- Description: Tabla de gastos para el módulo de gestión de gastos
-- ============================================================

-- Crear la tabla expenses si no existe
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índice para queries filtradas por user_id (todas las queries lo usan)
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);

-- Índice compuesto para ordenamiento por fecha (fetchAllExpenses y fetchExpenses ordenan por date DESC)
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, date DESC);

-- Habilitar RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: cada usuario solo ve/modifica sus propios gastos
CREATE POLICY "Users can view own expenses"
  ON public.expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON public.expenses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON public.expenses FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- Si la tabla ya existe pero le faltan columnas, ejecutar solo las necesarias:
-- ============================================================
-- ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS subcategory TEXT;
-- ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS description TEXT;
-- ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS date DATE NOT NULL DEFAULT CURRENT_DATE;
-- ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

-- ============================================================
-- Verificación (ejecutar después de la migración)
-- ============================================================
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'expenses' AND table_schema = 'public'
-- ORDER BY ordinal_position;
--
-- SELECT * FROM pg_policies WHERE tablename = 'expenses';
--
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'expenses';
