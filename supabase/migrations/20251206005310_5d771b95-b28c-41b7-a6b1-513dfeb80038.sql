-- Create ticket_replies table for threaded conversations
CREATE TABLE public.ticket_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_admin_reply BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view replies on their own tickets, admins can view all
CREATE POLICY "Users can view replies on own tickets"
ON public.ticket_replies
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.support_tickets
    WHERE id = ticket_replies.ticket_id
    AND (user_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

-- Policy: Users can add replies to their own tickets
CREATE POLICY "Users can add replies to own tickets"
ON public.ticket_replies
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  (
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE id = ticket_id AND user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin')
  )
);

-- Policy: Admins can delete replies
CREATE POLICY "Admins can delete replies"
ON public.ticket_replies
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Enable realtime for ticket_replies
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_replies;