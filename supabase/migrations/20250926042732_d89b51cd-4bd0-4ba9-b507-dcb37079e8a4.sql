-- Update the handle_new_user function to automatically assign admin role to jerry.zhou25@gmail.com
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', 'User'),
    CASE 
      WHEN NEW.email = 'jerry.zhou25@gmail.com' THEN 'admin'
      ELSE 'student'
    END
  );
  RETURN NEW;
END;
$function$;