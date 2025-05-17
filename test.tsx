import { supabase } from "./src/integrations/supabase/client";

async function uploadDummyImage() {
  // Create a simple SVG image as a string
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='skyblue'/><text x='10' y='50' font-size='20'>Dummy</text></svg>`;
  const fileName = `dummy-${Date.now()}.svg`;
  const fileBuffer = Buffer.from(svg, "utf-8");

  // Upload to Supabase Storage (bucket: generated-images)
  const { data, error } = await supabase.storage
    .from("generated-images")
    .upload(fileName, fileBuffer, {
      contentType: "image/svg+xml",
      upsert: true,
    });

  if (error) {
    console.error("Upload error:", error);
  } else {
    console.log("Upload success:", data);
  }
}

uploadDummyImage();
