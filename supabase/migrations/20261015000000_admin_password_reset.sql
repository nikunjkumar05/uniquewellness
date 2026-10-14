-- Admin-managed password resets: the new password is chosen by the admin at
-- approval time (temporary password via the service-role Admin API), so the
-- request row no longer needs to carry a password hash.
ALTER TABLE public.password_reset_requests
  ALTER COLUMN new_password_hash DROP NOT NULL;
