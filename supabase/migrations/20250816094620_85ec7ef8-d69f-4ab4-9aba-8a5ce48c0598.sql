-- Create profiles table for users with cafe_id
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cafe_id UUID NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles - users can only see their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add cafe_id to inventory table
ALTER TABLE public.inventory 
ADD COLUMN cafe_id UUID;

-- Add cafe_id to history table  
ALTER TABLE public.history 
ADD COLUMN cafe_id UUID;

-- Update RLS policies for inventory to filter by cafe_id
DROP POLICY IF EXISTS "Allow all operations on inventory" ON public.inventory;

CREATE POLICY "Users can view inventory for their cafe" 
ON public.inventory 
FOR SELECT 
USING (cafe_id IN (SELECT profiles.cafe_id FROM public.profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Users can insert inventory for their cafe" 
ON public.inventory 
FOR INSERT 
WITH CHECK (cafe_id IN (SELECT profiles.cafe_id FROM public.profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Users can update inventory for their cafe" 
ON public.inventory 
FOR UPDATE 
USING (cafe_id IN (SELECT profiles.cafe_id FROM public.profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Users can delete inventory for their cafe" 
ON public.inventory 
FOR DELETE 
USING (cafe_id IN (SELECT profiles.cafe_id FROM public.profiles WHERE profiles.user_id = auth.uid()));

-- Update RLS policies for history to filter by cafe_id
DROP POLICY IF EXISTS "Allow all operations on history" ON public.history;

CREATE POLICY "Users can view history for their cafe" 
ON public.history 
FOR SELECT 
USING (cafe_id IN (SELECT profiles.cafe_id FROM public.profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Users can insert history for their cafe" 
ON public.history 
FOR INSERT 
WITH CHECK (cafe_id IN (SELECT profiles.cafe_id FROM public.profiles WHERE profiles.user_id = auth.uid()));

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, cafe_id, display_name)
  VALUES (
    NEW.id, 
    gen_random_uuid(), -- Generate a new cafe_id for each user for now
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();