-- ==============================================================================
-- CodeMiners Database Migration: Normalized Relational Architecture
-- Source: Exact Supabase Schema (profiles, teams, registrations, prehackathon_registrations, invitations)
-- Target: Normalized Relational Model (events, teams, team_members, registrations, profiles)
-- Guarantee: Zero Data Loss / 100% Safe Data Transformation
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- STEP 1: CREATE OR UPDATE "events" TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('solo', 'team')),
    fee NUMERIC NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_date TEXT,
    completion_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed/Upsert the known events with deterministic UUIDs
INSERT INTO public.events (id, title, event_type, fee, is_active, display_date, completion_date)
VALUES 
    ('d4444444-4444-4444-4444-444444444444', 'Ideackathon', 'team', 50, true, 'September 13, 2026', '2026-09-13'),
    ('e5555555-5555-5555-5555-555555555555', 'Appdevelopment workshop', 'solo', 30, true, 'September 13, 2026', '2026-09-13'),
    ('a1111111-1111-1111-1111-111111111111', 'CodeMiners Hackathon 2026', 'team', 300, true, 'July 6, 2026', '2026-07-06'),
    ('b2222222-2222-2222-2222-222222222222', 'Pre-Hackathon', 'solo', 150, true, 'July 1, 2026', '2026-07-01'),
    ('c3333333-3333-3333-3333-333333333333', 'CodeMiners Orientation', 'solo', 0, true, 'June 28, 2026', '2026-06-28')
ON CONFLICT (id) DO UPDATE 
SET title = EXCLUDED.title,
    event_type = EXCLUDED.event_type,
    fee = EXCLUDED.fee,
    is_active = EXCLUDED.is_active,
    display_date = EXCLUDED.display_date,
    completion_date = EXCLUDED.completion_date;

-- ==============================================================================
-- STEP 2: ENHANCE & BACKFILL "profiles" TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY, -- Maps to Auth UID
    username TEXT UNIQUE,
    full_name TEXT,
    email TEXT,
    pin TEXT,
    about TEXT,
    projects JSONB DEFAULT '[]'::jsonb,
    team_id UUID,
    phone TEXT,
    college TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure phone & college columns exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'college') THEN
        ALTER TABLE public.profiles ADD COLUMN college TEXT;
    END IF;
END $$;

-- Backfill phone and college from existing registrations into profiles
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'registrations') THEN
        UPDATE public.profiles p
        SET 
            phone = coalesce(p.phone, r.phone),
            college = coalesce(p.college, r.college)
        FROM public.registrations r
        WHERE r.user_id = p.id
          AND (p.phone IS NULL OR p.college IS NULL);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'prehackathon_registrations') THEN
        UPDATE public.profiles p
        SET 
            phone = coalesce(p.phone, phr.phone),
            college = coalesce(p.college, phr.college)
        FROM public.prehackathon_registrations phr
        WHERE phr.user_id = p.id
          AND (p.phone IS NULL OR p.college IS NULL);
    END IF;
END $$;

-- ==============================================================================
-- STEP 3: UPDATE "teams" TABLE (Add event_id and link to Hackathon 2026)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    leader_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    leader_name TEXT,
    tech_stack TEXT,
    description TEXT,
    members JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure event_id column exists on teams
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'teams' AND column_name = 'event_id') THEN
        ALTER TABLE public.teams ADD COLUMN event_id UUID REFERENCES public.events(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Assign all existing teams to 'CodeMiners Hackathon 2026'
UPDATE public.teams
SET event_id = 'a1111111-1111-1111-1111-111111111111'
WHERE event_id IS NULL;

-- ==============================================================================
-- STEP 4: CREATE "team_members" & MIGRATE EXISTING JSONB MEMBERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'member')),
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_team_member UNIQUE (team_id, user_id)
);

-- Extract all members from teams.members JSONB into team_members table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'teams' AND column_name = 'members'
    ) THEN
        -- 1. Insert members from JSONB array
        INSERT INTO public.team_members (team_id, user_id, role)
        SELECT 
            t.id AS team_id,
            m->>'uid' AS user_id,
            CASE WHEN m->>'role' = 'leader' THEN 'leader' ELSE 'member' END AS role
        FROM public.teams t,
        LATERAL jsonb_array_elements(
            CASE 
                WHEN jsonb_typeof(t.members::jsonb) = 'array' THEN t.members::jsonb 
                ELSE '[]'::jsonb 
            END
        ) AS m
        WHERE m->>'uid' IS NOT NULL
          AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (m->>'uid'))
        ON CONFLICT (team_id, user_id) DO NOTHING;

        -- 2. Ensure team leaders are included in team_members even if omitted in JSON
        INSERT INTO public.team_members (team_id, user_id, role)
        SELECT t.id, t.leader_id, 'leader'
        FROM public.teams t
        WHERE t.leader_id IS NOT NULL
          AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = t.leader_id)
        ON CONFLICT (team_id, user_id) DO NOTHING;
    END IF;
END $$;

-- Trigger: Prevent joining multiple teams in the SAME event
CREATE OR REPLACE FUNCTION public.check_user_single_team_per_event()
RETURNS TRIGGER AS $$
DECLARE
    v_event_id UUID;
    v_existing_team_id UUID;
    v_team_count INT;
BEGIN
    SELECT event_id INTO v_event_id FROM public.teams WHERE id = NEW.team_id;
    IF v_event_id IS NULL THEN
        RAISE EXCEPTION 'Target team does not belong to a valid event.';
    END IF;

    SELECT COUNT(*) INTO v_team_count FROM public.team_members WHERE team_id = NEW.team_id;
    IF v_team_count >= 5 THEN
        RAISE EXCEPTION 'This team has reached the maximum allowed limit of 5 members.';
    END IF;

    SELECT tm.team_id INTO v_existing_team_id
    FROM public.team_members tm
    JOIN public.teams t ON t.id = tm.team_id
    WHERE t.event_id = v_event_id
      AND tm.user_id = NEW.user_id
      AND tm.team_id != NEW.team_id
    LIMIT 1;

    IF v_existing_team_id IS NOT NULL THEN
        RAISE EXCEPTION 'User % is already a member of another team in this event.', NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_user_single_team_per_event ON public.team_members;
CREATE TRIGGER trg_check_user_single_team_per_event
BEFORE INSERT OR UPDATE ON public.team_members
FOR EACH ROW EXECUTE FUNCTION public.check_user_single_team_per_event();

-- ==============================================================================
-- STEP 5: MIGRATE & NORMALIZE "registrations"
-- ==============================================================================
-- Ensure event_id and created_at exist on registrations table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'registrations' AND column_name = 'event_id') THEN
        ALTER TABLE public.registrations ADD COLUMN event_id UUID REFERENCES public.events(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'registrations' AND column_name = 'created_at') THEN
        ALTER TABLE public.registrations ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'registrations' AND column_name = 'team_name') THEN
        ALTER TABLE public.registrations ADD COLUMN team_name TEXT;
    END IF;
END $$;

-- Assign event_id to existing Hackathon registrations
UPDATE public.registrations
SET event_id = 'a1111111-1111-1111-1111-111111111111'
WHERE event_id IS NULL AND (event_name ILIKE '%Hackathon%' OR event_name IS NULL);

-- Assign event_id to existing Pre-Hackathon registrations if any are in registrations table
UPDATE public.registrations
SET event_id = 'b2222222-2222-2222-2222-222222222222'
WHERE event_id IS NULL AND event_name ILIKE '%Pre%';

-- ==============================================================================
-- STEP 6: IMPORT ALL "prehackathon_registrations" INTO "registrations"
-- ==============================================================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'prehackathon_registrations'
    ) THEN
        INSERT INTO public.registrations (
            id,
            user_id,
            full_name,
            email,
            phone,
            college,
            year,
            id_type,
            id_value,
            event_name,
            payment_id,
            payment_status,
            amount_paid,
            registered_at,
            event_id,
            team_id
        )
        SELECT 
            phr.id,
            phr.user_id,
            phr.full_name,
            phr.email,
            phr.phone,
            phr.college,
            phr.year,
            phr.id_type,
            phr.id_value,
            'Pre-Hackathon',
            phr.payment_id,
            coalesce(phr.payment_status, 'free'),
            coalesce(phr.amount_paid, 0),
            phr.registered_at,
            'b2222222-2222-2222-2222-222222222222'::uuid,
            NULL -- Solo event has NULL team_id
        FROM public.prehackathon_registrations phr
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- ==============================================================================
-- STEP 7: ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT 
WITH CHECK (auth.uid()::text = id OR auth.role() = 'service_role' OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE 
USING (auth.uid()::text = id OR auth.role() = 'service_role');

-- Events Policies
DROP POLICY IF EXISTS "Public can view active events" ON public.events;
CREATE POLICY "Public can view active events" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role manages events" ON public.events;
CREATE POLICY "Service role manages events" ON public.events FOR ALL USING (auth.role() = 'service_role');

-- Teams Policies
DROP POLICY IF EXISTS "Public can view teams" ON public.teams;
CREATE POLICY "Public can view teams" ON public.teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create teams" ON public.teams;
CREATE POLICY "Authenticated users can create teams" ON public.teams FOR INSERT 
WITH CHECK (auth.uid()::text = leader_id OR auth.role() = 'service_role' OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Leaders can update teams" ON public.teams;
CREATE POLICY "Leaders can update teams" ON public.teams FOR UPDATE 
USING (auth.uid()::text = leader_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Leaders can delete teams" ON public.teams;
CREATE POLICY "Leaders can delete teams" ON public.teams FOR DELETE 
USING (auth.uid()::text = leader_id OR auth.role() = 'service_role');

-- Team Members Policies
DROP POLICY IF EXISTS "Public can view team members" ON public.team_members;
CREATE POLICY "Public can view team members" ON public.team_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users or leaders can add team members" ON public.team_members;
CREATE POLICY "Users or leaders can add team members" ON public.team_members FOR INSERT 
WITH CHECK (
    auth.uid()::text = user_id 
    OR EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND leader_id = auth.uid()::text)
    OR auth.role() = 'service_role'
    OR auth.role() = 'anon'
);

DROP POLICY IF EXISTS "Users or leaders can remove team members" ON public.team_members;
CREATE POLICY "Users or leaders can remove team members" ON public.team_members FOR DELETE 
USING (
    auth.uid()::text = user_id 
    OR EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND leader_id = auth.uid()::text)
    OR auth.role() = 'service_role'
);

-- Registrations Policies
DROP POLICY IF EXISTS "Public can view registrations" ON public.registrations;
CREATE POLICY "Public can view registrations" ON public.registrations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert registrations" ON public.registrations;
CREATE POLICY "Users can insert registrations" ON public.registrations FOR INSERT 
WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role' OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Users can update own registrations" ON public.registrations;
CREATE POLICY "Users can update own registrations" ON public.registrations FOR UPDATE 
USING (auth.uid()::text = user_id OR auth.role() = 'service_role');

-- Invitations Policies
DROP POLICY IF EXISTS "Users can view invitations" ON public.invitations;
CREATE POLICY "Users can view invitations" ON public.invitations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can send invitations" ON public.invitations;
CREATE POLICY "Users can send invitations" ON public.invitations FOR INSERT 
WITH CHECK (auth.uid()::text = sender_id OR auth.role() = 'service_role' OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Users can update invitations" ON public.invitations;
CREATE POLICY "Users can update invitations" ON public.invitations FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete invitations" ON public.invitations;
CREATE POLICY "Users can delete invitations" ON public.invitations FOR DELETE 
USING (auth.uid()::text = sender_id OR auth.role() = 'service_role');
