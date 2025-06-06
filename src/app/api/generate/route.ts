import { experimental_generateImage } from "ai";
import { createReplicate } from "@ai-sdk/replicate";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/src/integrations/supabase/server";
import { supabaseAdmin } from "@/src/integrations/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { prompt, style, colorMode, outputCount, referenceImage, template } =
      body;

    // Get user's current credits
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("remaining_credits")
      .eq("id", user.id)
      .single();

    if (userError) {
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: 500 }
      );
    }

    if (!userData || userData.remaining_credits <= 0) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 400 }
      );
    }

    const replicate = createReplicate({
      apiToken: process.env.REPLICATE_API_TOKEN ?? "",
    });

    const finalPrompt = `
Create a high-quality vector illustration in SVG format designed for a mobile app onboarding screen.

Scene Description:
- The illustration should visually represent the concept: "${
      prompt || "a general onboarding step"
    }".
- Show 1–2 characters (diverse, friendly, modern) interacting with a mobile phone or app interface.
- Include thematic elements related to the concept (e.g., travel icons, shopping items, location pins) while keeping the layout balanced and clean.

Visual Style:
- Use a ${
      style?.toLowerCase() || "modern flat"
    } illustration style, popular in UI/UX onboarding flows.
- ${
      colorMode === "blackAndWhite"
        ? "Use black and white with subtle lines and minimal shading."
        : colorMode === "color"
        ? "Apply a soft, modern color palette with muted tones (no harsh gradients)."
        : "Use smooth, clean lines and a limited pastel color palette."
    }

Layout & Composition:
- Keep the composition centered with generous whitespace for mobile onboarding.
- The background should be clean, minimal, and should not distract from the primary action or character.
- Ensure all elements are SVG-friendly and scalable.

${
  template
    ? `Incorporate visual traits or iconography from the "${template}" theme.`
    : ""
}
${
  referenceImage
    ? `Use this reference image for visual inspiration: ${referenceImage}`
    : ""
}
Ensure the illustration fits within a mobile phone screen layout: aspect ratio around 9:16. Center the main content vertically with padding.

Final output:
Return a structured, clean SVG vector illustration that is visually engaging and suitable for a mobile app's onboarding screen.
`.trim();

    const imageDataList: { base64: string; mimeType: string }[] = [];
    const imageIds: string[] = [];

    for (let i = 0; i < outputCount; i++) {
      // Generate image using Replicate
      const { image } = await experimental_generateImage({
        model: replicate.image("recraft-ai/recraft-v3"),
        prompt: finalPrompt,
        size: "1024x2048",
        providerOptions: {
          replicate: {
            // style: "vector_illustration",
            output_format: "svg",
            // vector_style: style?.toLowerCase() || "modern_flat",
          },
        },
      });

      console.log("Image generated:", image);

      // Use image.base64 for storage and response

      const base64Image = image.base64;

      const imageId = uuidv4();

      // Validate that we received SVG data

      const base64Data = base64Image.replace(
        /^data:image\/svg\+xml;base64,/,
        ""
      );

      const svgBuffer = Buffer.from(base64Data, "base64");

      // const svgString = svgBuffer.toString("utf-8");

      // if (!svgString.startsWith("<svg")) {

      //   throw new Error("Generated image is not in SVG format");

      // }

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
      .from("users")
      .update({ remaining_credits: userData.remaining_credits - outputCount })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update credits" },

        { status: 500 }
      );
    }

    return NextResponse.json({ images: imageDataList, ids: imageIds });
  } catch (error: unknown) {
    console.error("Image generation failed:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({
      error: errorMessage,
    });
  }
}
