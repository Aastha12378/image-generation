import { NextResponse } from "next/server";
import { createClient } from "@/src/integrations/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch 31 random images from the generated_images table
    const { data: images, error } = await supabase
      .from("generated_images")
      .select("image_url")
      .order("created_at", { ascending: false })
      .limit(31);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Extract just the image URLs
    const imageUrls = images.map(img => img.image_url);

    return NextResponse.json({ images: imageUrls });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "An error occurred" },
      { status: 500 }
    );
  }
} 