-- Enable RLS on profiles and investor_profiles just to be safe

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view, only owner can update
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Investor Profiles: Anyone can view, only owner can update
CREATE POLICY "Investor profiles are viewable by everyone" ON public.investor_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own investor profile" ON public.investor_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investor profile" ON public.investor_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investor profile" ON public.investor_profiles
    FOR DELETE USING (auth.uid() = user_id);
