import { experimental_generateImage } from "ai";
import { createReplicate, replicate } from "@ai-sdk/replicate";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/src/integrations/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, style, colorMode, outputCount, referenceImage } = body;

    let replicate = createReplicate({
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
      const { image } = await experimental_generateImage({
        model: replicate.image("black-forest-labs/flux-schnell"),
        prompt: referenceImage
          ? `${finalPrompt} Use this reference image as inspiration: ${referenceImage}`
          : finalPrompt,
        size: "1365x1024",
      });

      console.log("Generated image:", image);

      const base64Image = Buffer.from(image.uint8Array).toString("base64");
      const imageId = uuidv4();

      const supabase = await createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Store the image in Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from("generated-images")
        .upload(`${imageId}.svg`, Buffer.from(base64Image, "base64"), {
          contentType: "image/svg+xml",
          upsert: true,
        });
      console.log({ storageError, storageData });
      if (storageError) {
        throw storageError;
      }

      // Store the image metadata in Supabase Database
      const { data: dbData, error: dbError } = await supabase
        .from("generated_images")
        .insert({
          prompt,
          style,
          color_mode: colorMode,
          storage_path: storageData.path,
          created_at: new Date().toISOString(),
          reference_image: referenceImage ? storageData.path : null,
          user_id: user.id,
        })
        .select()
        .single();
      console.log({ dbError, dbData });
      if (dbError) {
        throw dbError;
      }

      imageIds.push(dbData.id);
      imageDataList.push({
        base64: base64Image,
        mimeType: "image/svg",
      });
    }

    return { images: imageDataList, imageIds };
  } catch (error: any) {
    console.error("Image generation failed:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
