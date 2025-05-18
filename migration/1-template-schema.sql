  -- Enable necessary extensions
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  -- Create users table
  CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    avatar_url TEXT,
    first_name TEXT,
    last_name TEXT,
    dodo_customer_id VARCHAR(255),
    remaining_credits INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    saved_templates UUID[] DEFAULT '{}'::UUID[],
    stripe_customer_id TEXT,
    billing_data JSONB
  );

  -- Create trigger to add user to public.users on auth.users email verification
  CREATE OR REPLACE FUNCTION public.handle_new_verified_user() 
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO public.users (id, email, first_name, last_name, avatar_url)
    VALUES (
      NEW.id, 
      NEW.email,
      (NEW.raw_user_meta_data->>'first_name'),
      (NEW.raw_user_meta_data->>'last_name'),
      (NEW.raw_user_meta_data->>'avatar_url')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE OR REPLACE TRIGGER on_auth_user_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_verified_user();

  -- Enable Row Level Security (RLS)
  ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

  -- Users policies
  CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

  CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

