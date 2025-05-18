import { NextResponse } from "next/server";
import { createClient } from "@/src/integrations/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: images, error: fetchError } = await supabase
      .from("generated_images")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const formattedImages = (images || []).map((img: any) => {
      const imagePath =
        img.storage_path || img.path || img.image_path || img.file_path || "";

      const { data: urlData } = supabase.storage
        .from("generated-images")
        .getPublicUrl(imagePath);

      console.log("Image URL:", urlData);

      return {
        id: img.id ?? null,
        prompt: img.prompt ?? null,
        style: img.style ?? null,
        color_mode: img.color_mode ?? null,
        created_at: img.created_at ?? null,
        publicUrl: urlData?.publicUrl ?? null,
      };
    });

    return NextResponse.json({ images: formattedImages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
