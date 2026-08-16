-- Bootstrap the platform administrator for the initial deployment.
-- The regular sign-in flow still applies; this only assigns the admin role
-- to the matching Supabase Auth account.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url, auth_provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      split_part(COALESCE(NEW.email, 'researcher'), '@', 1)
    ),
    NEW.raw_user_meta_data ->> 'avatar_url',
    COALESCE(NEW.raw_app_meta_data ->> 'provider', 'email')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE
      WHEN lower(COALESCE(NEW.email, '')) = '025bscphy016@sxc.edu.np' THEN 'admin'::public.app_role
      ELSE 'user'::public.app_role
    END
  )
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Also promote the account if it was created before this migration ran.
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE lower(COALESCE(email, '')) = '025bscphy016@sxc.edu.np'
ON CONFLICT (user_id, role) DO NOTHING;