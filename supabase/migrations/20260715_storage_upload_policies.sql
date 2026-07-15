-- Permite upload e update no bucket blog-images para authenticated e anon
-- (CMS usa anon key para upload de imagens)

CREATE POLICY "Authenticated users can upload to blog-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Anon can upload to blog-images"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can update blog-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images')
WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Anon can update blog-images"
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id = 'blog-images')
WITH CHECK (bucket_id = 'blog-images');
