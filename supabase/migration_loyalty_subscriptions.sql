-- Migration: Loyalty Program and Coffee Subscriptions tables

-- Loyalty points table (user points balance)
CREATE TABLE IF NOT EXISTS public.loyalty_points (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  points_balance INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Loyalty transactions log
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  points_change INTEGER NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table (coffee club subscriptions)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  plan_name TEXT NOT NULL, -- e.g., 'Experto', 'Aficionado', 'Artesano'
  frequency TEXT NOT NULL, -- e.g., 'Semanal', 'Quincenal', 'Mensual'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'paused'
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for loyalty_points
DROP POLICY IF EXISTS "Users can read own loyalty points" ON public.loyalty_points;
CREATE POLICY "Users can read own loyalty points" ON public.loyalty_points
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage loyalty_points" ON public.loyalty_points;
CREATE POLICY "Admins can manage loyalty_points" ON public.loyalty_points
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for loyalty_transactions
DROP POLICY IF EXISTS "Users can read own loyalty transactions" ON public.loyalty_transactions;
CREATE POLICY "Users can read own loyalty transactions" ON public.loyalty_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage loyalty transactions" ON public.loyalty_transactions;
CREATE POLICY "Admins can manage loyalty transactions" ON public.loyalty_transactions
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for subscriptions
DROP POLICY IF EXISTS "Users can read own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can read own subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
