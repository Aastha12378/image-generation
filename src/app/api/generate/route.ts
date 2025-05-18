import { experimental_generateImage } from "ai";
import { createReplicate } from "@ai-sdk/replicate";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/src/integrations/supabase/server";
import { supabaseAdmin } from "@/src/integrations/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { prompt, style, colorMode, outputCount, referenceImage } = body;

    // Get user's current credits
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('remaining_credits')
      .eq('id', user.id)
      .single();

    if (userError) {
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }

    if (!userData || userData.remaining_credits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
    }

    const replicate = createReplicate({
      apiToken: process.env.REPLICATE_API_TOKEN ?? "",
    });

    const finalPrompt = `Create a detailed SVG vector illustration. For ${prompt},
    use ${style.toLowerCase()} techniques with a ${colorMode.toLowerCase()} color palette.
    Focus on clean vector shapes, crisp lines and scalable elements suitable for SVG format.
    The composition should use geometric shapes, paths and curves typical of vector graphics.
    Ensure the design works well at any scale while maintaining sharp edges and smooth curves.
    Optimize for SVG output with clear shapes, minimal gradients and clean paths.
    Create a professional vector illustration suitable for SVG format and web use.`;

    const imageDataList: { base64: string; mimeType: string }[] = [];
    const imageIds: string[] = [];

    for (let i = 0; i < outputCount; i++) {
      // Generate image using Replicate
      const { image } = await experimental_generateImage({
        model: replicate.image("black-forest-labs/flux-schnell"),
        prompt: referenceImage
          ? `${finalPrompt} Use this reference image as inspiration: ${referenceImage}`
          : finalPrompt,
        size: "1365x1024",
      });

      // Use image.base64 for storage and response
      const base64Image = image.base64;
      const imageId = uuidv4();

      // If image.base64 is a base64-encoded SVG string, decode it before upload
      const base64Data = base64Image.replace(/^data:image\/webp;base64,/, "");

      const svgBuffer = Buffer.from(base64Data, "base64");
      const svgString = svgBuffer.toString("utf-8");
      if (!svgString.startsWith("<svg")) {
        console.log("Invalid SVG data");
      }

      // Upload SVG buffer to Supabase Storage
      const { data: storageData, error: storageError } =
        await supabaseAdmin.storage
          .from("generated-images")
          .upload(`${imageId}.svg`, svgBuffer, {
            contentType: "image/svg+xml",
            upsert: true,
          });

      if (storageError) {
        throw storageError;
      }

      // Store the image metadata in Supabase Database
      const { data: dbData, error: dbError } = await supabaseAdmin
        .from("generated_images")
        .insert({
          id: imageId,
          prompt,
          style,
          color_mode: colorMode,
          storage_path: storageData.path,
          image_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/generated-images/${storageData.path}`,
          created_at: new Date().toISOString(),
          user_id: user.id,
        })
        .select()
        .single();
      if (dbError) {
        throw dbError;
      }

      imageIds.push(dbData.id);
      imageDataList.push({
        base64: base64Image,
        mimeType: "image/svg",
      });
    }

    // Update user's credits after successful generation
    const { error: updateError } = await supabase
      .from('users')
      .update({ remaining_credits: userData.remaining_credits - outputCount })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 });
    }

    return NextResponse.json({ images: imageDataList, ids: imageIds });
  } catch (error: any) {
    console.error("Image generation failed:", error);
    return NextResponse.json({
      error: error?.message || "An unexpected error occurred",
    });
  }
}
