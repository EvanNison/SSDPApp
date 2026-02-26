-- Create avatars storage bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload their own avatar
create policy "Users can upload own avatar"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] is not null
);

-- Allow authenticated users to update (overwrite) their own avatar
create policy "Users can update own avatar"
on storage.objects for update
to authenticated
using (bucket_id = 'avatars')
with check (bucket_id = 'avatars');

-- Allow public read access to all avatars
create policy "Public avatar read access"
on storage.objects for select
to public
using (bucket_id = 'avatars');
