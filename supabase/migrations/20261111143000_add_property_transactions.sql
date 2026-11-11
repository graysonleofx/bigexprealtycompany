ALTER TABLE public.properties
  ADD COLUMN transaction_type TEXT NOT NULL DEFAULT 'sale'
    CHECK (transaction_type IN ('sale', 'rent', 'both')),
  ADD COLUMN rent_price NUMERIC(15, 2),
  ADD COLUMN rent_period TEXT
    CHECK (rent_period IS NULL OR rent_period IN ('weekly', 'monthly', 'yearly')),
  ADD COLUMN security_deposit NUMERIC(15, 2),
  ADD COLUMN availability_date DATE,
  ADD COLUMN minimum_rental_period INTEGER,
  ADD COLUMN availability_status TEXT NOT NULL DEFAULT 'available'
    CHECK (availability_status IN ('available', 'pending', 'sold', 'rented', 'unavailable')),
  ADD CONSTRAINT properties_rental_details_check CHECK (
    (transaction_type = 'sale')
    OR (rent_price IS NOT NULL AND rent_price > 0 AND rent_period IS NOT NULL)
  ),
  ADD CONSTRAINT properties_rent_values_check CHECK (
    (security_deposit IS NULL OR security_deposit >= 0)
    AND (minimum_rental_period IS NULL OR minimum_rental_period > 0)
  );

CREATE TABLE public.property_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('purchase', 'rental')),
  property_title TEXT NOT NULL,
  property_price NUMERIC(15, 2) NOT NULL CHECK (property_price > 0),
  applicant_name TEXT NOT NULL CHECK (length(trim(applicant_name)) BETWEEN 2 AND 120),
  applicant_email TEXT NOT NULL CHECK (applicant_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  applicant_phone TEXT NOT NULL CHECK (length(trim(applicant_phone)) BETWEEN 7 AND 30),
  contact_method TEXT NOT NULL DEFAULT 'email' CHECK (contact_method IN ('email', 'phone')),
  move_in_date DATE,
  number_of_occupants INTEGER,
  message TEXT NOT NULL DEFAULT '' CHECK (length(message) <= 2000),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'under_review', 'accepted', 'approved', 'rejected', 'completed', 'leased')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT property_requests_rental_fields_check CHECK (
    (request_type = 'purchase' AND move_in_date IS NULL AND number_of_occupants IS NULL)
    OR
    (request_type = 'rental' AND move_in_date IS NOT NULL AND number_of_occupants BETWEEN 1 AND 20)
  )
);

CREATE INDEX property_requests_user_created_idx
  ON public.property_requests (user_id, created_at DESC);
CREATE INDEX property_requests_property_type_status_idx
  ON public.property_requests (property_id, request_type, status);

CREATE UNIQUE INDEX property_requests_one_active_per_user
  ON public.property_requests (user_id, property_id, request_type)
  WHERE property_id IS NOT NULL
    AND status IN ('pending', 'under_review', 'accepted', 'approved');

ALTER TABLE public.property_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users and admins can view property requests"
  ON public.property_requests FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update property requests"
  ON public.property_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_property_requests_updated_at
  BEFORE UPDATE ON public.property_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.validate_property_request_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  IF auth.uid() = OLD.user_id AND NEW.status IN ('accepted', 'approved', 'completed', 'leased') THEN
    RAISE EXCEPTION 'You cannot approve or complete your own property request.';
  END IF;

  IF NEW.status IN ('accepted', 'approved') THEN
    PERFORM 1 FROM public.properties
    WHERE id = NEW.property_id AND availability_status = 'available'
    FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'This property is no longer available.';
    END IF;
  END IF;

  IF OLD.status = 'pending'
    AND (NEW.status = 'under_review' OR NEW.status = 'rejected'
      OR (OLD.request_type = 'purchase' AND NEW.status = 'accepted')
      OR (OLD.request_type = 'rental' AND NEW.status = 'approved'))
  THEN
    RETURN NEW;
  END IF;

  IF OLD.status = 'under_review'
    AND (NEW.status = 'rejected'
      OR (OLD.request_type = 'purchase' AND NEW.status = 'accepted')
      OR (OLD.request_type = 'rental' AND NEW.status = 'approved'))
  THEN
    RETURN NEW;
  END IF;

  IF OLD.status = 'accepted' AND OLD.request_type = 'purchase' AND NEW.status = 'completed' THEN
    RETURN NEW;
  END IF;

  IF OLD.status = 'approved' AND OLD.request_type = 'rental' AND NEW.status = 'leased' THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Invalid status transition for this property request.';
END;
$$;

CREATE TRIGGER property_requests_status_guard
  BEFORE UPDATE OF status ON public.property_requests
  FOR EACH ROW EXECUTE FUNCTION public.validate_property_request_status();

CREATE OR REPLACE FUNCTION public.sync_property_availability_from_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.status = OLD.status OR NEW.property_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.status IN ('accepted', 'approved') THEN
    UPDATE public.properties SET availability_status = 'pending'
    WHERE id = NEW.property_id AND availability_status = 'available';
  ELSIF NEW.status = 'completed' THEN
    UPDATE public.properties SET availability_status = 'sold'
    WHERE id = NEW.property_id AND availability_status = 'pending';
  ELSIF NEW.status = 'leased' THEN
    UPDATE public.properties SET availability_status = 'rented'
    WHERE id = NEW.property_id AND availability_status = 'pending';
  ELSE
    RETURN NEW;
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Property availability could not be updated for this request.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER property_requests_sync_availability
  AFTER UPDATE OF status ON public.property_requests
  FOR EACH ROW EXECUTE FUNCTION public.sync_property_availability_from_request();

ALTER PUBLICATION supabase_realtime ADD TABLE public.property_requests;

CREATE OR REPLACE FUNCTION public.create_property_request(
  p_property_id UUID,
  p_request_type TEXT,
  p_applicant_name TEXT,
  p_applicant_email TEXT,
  p_applicant_phone TEXT,
  p_contact_method TEXT,
  p_message TEXT DEFAULT '',
  p_move_in_date DATE DEFAULT NULL,
  p_number_of_occupants INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_property public.properties%ROWTYPE;
  request_price NUMERIC(15, 2);
  new_request_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Please sign in to continue.';
  END IF;

  IF p_request_type NOT IN ('purchase', 'rental')
    OR p_contact_method NOT IN ('email', 'phone')
    OR p_applicant_name IS NULL
    OR length(trim(p_applicant_name)) NOT BETWEEN 2 AND 120
    OR p_applicant_email IS NULL
    OR p_applicant_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    OR p_applicant_phone IS NULL
    OR length(trim(p_applicant_phone)) NOT BETWEEN 7 AND 30
    OR length(coalesce(p_message, '')) > 2000
  THEN
    RAISE EXCEPTION 'Please provide valid contact and request information.';
  END IF;

  IF p_request_type = 'rental'
    AND (p_move_in_date IS NULL OR p_move_in_date < current_date
      OR p_number_of_occupants IS NULL OR p_number_of_occupants NOT BETWEEN 1 AND 20)
  THEN
    RAISE EXCEPTION 'Please provide a valid move-in date and number of occupants.';
  END IF;

  SELECT * INTO current_property
  FROM public.properties
  WHERE id = p_property_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'This property could not be found.';
  END IF;

  IF current_property.availability_status <> 'available' THEN
    RAISE EXCEPTION 'This property is no longer available.';
  END IF;

  IF p_request_type = 'purchase' THEN
    IF current_property.transaction_type NOT IN ('sale', 'both') THEN
      RAISE EXCEPTION 'This property is not listed for sale.';
    END IF;
    request_price := current_property.price;
  ELSE
    IF current_property.transaction_type NOT IN ('rent', 'both') THEN
      RAISE EXCEPTION 'This property is not listed for rent.';
    END IF;
    request_price := current_property.rent_price;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.property_requests
    WHERE user_id = auth.uid()
      AND property_id = p_property_id
      AND request_type = p_request_type
      AND status IN ('pending', 'under_review', 'accepted', 'approved')
  ) THEN
    RAISE EXCEPTION 'You already have an active request for this property.';
  END IF;

  INSERT INTO public.property_requests (
    property_id, user_id, request_type, property_title, property_price,
    applicant_name, applicant_email, applicant_phone, contact_method,
    message, move_in_date, number_of_occupants
  )
  VALUES (
    p_property_id, auth.uid(), p_request_type, current_property.title, request_price,
    trim(p_applicant_name), lower(trim(p_applicant_email)), trim(p_applicant_phone),
    p_contact_method, coalesce(p_message, ''), p_move_in_date, p_number_of_occupants
  )
  RETURNING id INTO new_request_id;

  RETURN new_request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_property_request(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DATE, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_property_request(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DATE, INTEGER) TO authenticated;
