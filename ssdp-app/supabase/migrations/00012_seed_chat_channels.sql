-- Seed default chat channels so the Chat tab is functional
INSERT INTO public.chat_channels (name, description, required_role, is_chapter_channel, sort_order)
VALUES
  ('General', 'Open discussion for all SSDP members', 'registered', false, 1),
  ('Harm Reduction', 'Share harm reduction resources and strategies', 'registered', false, 2),
  ('Policy & Advocacy', 'Discuss drug policy reform and advocacy campaigns', 'registered', false, 3),
  ('Conference Chat', 'Connect with other conference attendees', 'registered', false, 4),
  ('Ambassador Lounge', 'Exclusive space for SSDP Ambassadors', 'ambassador', false, 5)
ON CONFLICT DO NOTHING;
