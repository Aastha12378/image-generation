-- Create the generated_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS generated_images (
  id TEXT PRIMARY KEY,
  color_mode TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  prompt TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  image_url TEXT NOT NULL,
  style TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Create storage bucket for generated images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('generated-images', 'generated-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own generated images
CREATE POLICY "Users can view their own generated images" 
ON generated_images 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own generated images
CREATE POLICY "Users can insert their own generated images" 
ON generated_images 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own generated images
CREATE POLICY "Users can update their own generated images" 
ON generated_images 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own generated images
CREATE POLICY "Users can delete their own generated images" 
ON generated_images 
FOR DELETE 
USING (auth.uid() = user_id);

-- Storage policies
CREATE POLICY "Public read access for generated images"
ON storage.objects FOR SELECT
USING (bucket_id = 'generated-images');

CREATE POLICY "Users can upload generated images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'generated-images' AND
  auth.uid() IS NOT NULL
);


-- Create useful indexes
CREATE INDEX IF NOT EXISTS idx_generated_images_storage_path ON generated_images(storage_path);
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON generated_images(user_id);
