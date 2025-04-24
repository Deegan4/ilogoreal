-- Enable Row Level Security on the contacts table
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to insert into contacts
CREATE POLICY "Anyone can submit a contact form" 
ON public.contacts
FOR INSERT
WITH CHECK (true);

-- Create a policy that allows users to see only their own contact submissions
CREATE POLICY "Users can view their own contact submissions" 
ON public.contacts
FOR SELECT
USING (auth.uid() = user_id);

-- Create a policy that allows admins to see all contacts
-- Note: You would need to implement an admin role system
CREATE POLICY "Admins can view all contacts" 
ON public.contacts
FOR SELECT
USING (
  -- Replace this condition with your actual admin check
  -- For example: auth.uid() IN (SELECT user_id FROM admins)
  -- For now, we'll just allow all authenticated users to see all contacts
  auth.uid() IS NOT NULL
);

-- Create a policy that allows admins to update contacts
CREATE POLICY "Admins can update contacts" 
ON public.contacts
FOR UPDATE
USING (
  -- Replace with your admin check
  auth.uid() IS NOT NULL
);

-- Create a policy that allows admins to delete contacts
CREATE POLICY "Admins can delete contacts" 
ON public.contacts
FOR DELETE
USING (
  -- Replace with your admin check
  auth.uid() IS NOT NULL
);
