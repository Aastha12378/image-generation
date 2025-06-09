"use client";
import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { toast } from "sonner";
import IllustrationLogo from "@/src/components/IllustrationLogo";
import Image from "next/image";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { Loader2, Image as ImageIcon, Zap } from "lucide-react";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Slider } from "@/src/components/ui/slider";
import Link from "next/link";
import { signOutAction } from "@/src/lib/actions/auth";
import { Label } from "@/src/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { getUser } from "@/src/lib/actions/auth";
import { FileUpload } from "@/src/components/file-upload";

interface GeneratedImage {
  provider: string;
  imageUrl: string;
}

interface ApiResponse {
  images: Array<{
    mimeType: string;
    base64: string;
  }>;
}

const IllustrationStyles = [
  { id: "notion", name: "Notion", icon: "👤" },
  { id: "doodle", name: "Doodle", icon: "🐶" },
  { id: "flat", name: "Flat", icon: "👩" },
  { id: "custom", name: "Suggest", icon: "💡" },
];

const Playground = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<GeneratedImage[]>([]);
  const [colorMode, setColorMode] = useState<"color" | "blackAndWhite">(
    "color"
  );
  const [style, setStyle] = useState("notion");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [outputCount, setOutputCount] = useState<number>(1);
  const [referenceImageUrl, setReferenceImageUrl] = useState<string>("");
  const router = useRouter();
  const [remainingCredits, setRemainingCredits] = useState<number>(0);

  // Check if the form is valid for generation
  const isFormValid = !!prompt.trim();

  useEffect(() => {
    const fetchUserCredits = async () => {
      const response = await getUser();
      setRemainingCredits(response.userData?.remaining_credits || 0);
    };
    fetchUserCredits();
  }, []);

  const handleGenerateClick = async () => {
    if (!isFormValid) {
      toast.error("Please enter a prompt");
      return;
    }

    if (remainingCredits <= 0) {
      toast.error(
        "You have no credits remaining. Please purchase more credits to continue.",
        {
          duration: 10000,
          action: {
            label: "Purchase Credits",
            onClick: () => router.push("/payment"),
          },
        }
      );
      return;
    }

    setIsGenerating(true);
    toast.success("Generating illustration...");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          style,
          colorMode,
          outputCount,
          template: selectedTemplate,
        }),
      });
      const data: ApiResponse = await response.json();
      const results = (data.images || []).map((img) => ({
        provider: style,
        imageUrl: `data:${img.mimeType};base64,${img.base64}`,
      }));
      setGeneratedResults(results);
      toast.success("Illustration generated successfully");

      // Update remaining credits after successful generation
      const updatedResponse = await getUser();
      setRemainingCredits(updatedResponse.userData?.remaining_credits || 0);
    } catch (error) {
      console.error("Error generating illustration:", error);
      toast.error("Error generating illustration");
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to download a data URL
  function downloadDataUrl(dataUrl: string, filename: string) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Helper function to convert SVG data URL to PNG and download
  async function downloadSvgAsPng(svgUrl: string, filename: string) {
    return new Promise<void>((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Canvas context not found");
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            downloadDataUrl(url, filename);
            URL.revokeObjectURL(url);
            resolve();
          } else {
            reject("Failed to create PNG blob");
          }
        }, "image/png");
      };
      img.onerror = reject;
      img.src = svgUrl;
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-gray-200 py-3 px-6 sticky flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <IllustrationLogo small />
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Home</Link>
          </Button>
          <div className="border-r border-gray-200 h-6"></div>
          <div className="flex items-center space-x-2 border border-gray-200 bg-gray-50 px-4 py-2 rounded-xl shadow-sm">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600">Credits:</span>
            <span className="text-base font-semibold text-gray-900">
              {remainingCredits}
            </span>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/profile">Profile</Link>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={async () => {
              await signOutAction();
              router.push("/login");
            }}
          >
            Sign Out
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <div className="w-2/5 overflow-y-auto">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="p-3 h-full flex flex-col">
              <div className="flex-1 overflow-y-auto">
                {/* Prompt Input */}
                <div className="mb-6">
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt
                  </Label>
                  <Textarea
                    placeholder="Describe the illustration you want to create..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>

                {/* Color Mode */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Color Mode
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={colorMode === "color" ? "default" : "outline"}
                      className="justify-center w-full h-10"
                      onClick={() => setColorMode("color")}
                    >
                      Color
                    </Button>
                    <Button
                      variant={
                        colorMode === "blackAndWhite" ? "default" : "outline"
                      }
                      className="justify-center w-full h-10"
                      onClick={() => setColorMode("blackAndWhite")}
                    >
                      Black & White
                    </Button>
                  </div>
                </div>

                {/* Style Selector */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Style
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {IllustrationStyles.map((styleOption) => (
                      <Button
                        key={styleOption.id}
                        variant={
                          style === styleOption.id ? "default" : "outline"
                        }
                        className="justify-center w-full h-20 flex flex-col p-2"
                        onClick={() => setStyle(styleOption.id)}
                      >
                        <div className="text-2xl mb-1">{styleOption.icon}</div>
                        <span className="text-xs">{styleOption.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Output Count */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Number of Outputs:{" "}
                    <span className="font-semibold">{outputCount}</span>
                  </h3>
                  <Slider
                    value={[outputCount]}
                    min={1}
                    max={2}
                    step={1}
                    onValueChange={(value) => setOutputCount(value[0])}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 (Best result)</span>
                    <span>2 (Compare models)</span>
                  </div>
                </div>

                {/* Reference Image */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Reference Image
                  </h3>
                  <Tabs defaultValue="upload">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upload">Upload Image</TabsTrigger>
                      <TabsTrigger value="template">Templates</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload" className="mt-2">
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-6">
                        {referenceImageUrl ? (
                          <div className="w-full">
                            <Image
                              src={referenceImageUrl}
                              alt="Reference"
                              width={128}
                              height={128}
                              className="mx-auto object-contain mb-2"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                setReferenceImageUrl("");
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <FileUpload
                            onChange={(files: File[]) => {
                              if (files.length > 0) {
                                const file = files[0];
                                const fileReader = new FileReader();
                                fileReader.onload = (event) => {
                                  if (event.target?.result) {
                                    setReferenceImageUrl(
                                      event.target.result as string
                                    );
                                  }
                                };
                                fileReader.readAsDataURL(file);
                              }
                            }}
                            multiple={false}
                            maxSize={5 * 1024 * 1024}
                          />
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="template" className="mt-2">
                      <p className="text-sm font-semibold mb-1">
                        Choose a style
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                        {[
                          { label: "Ghibli", img: "/images/ghibli.jpeg" },
                          { label: "Comic", img: "/images/comic.jpeg" },
                          { label: "Anime", img: "/images/anime.jpeg" },
                          {
                            label: "Prophetic Vision",
                            img: "/images/prophetic-vision-generator.jpeg",
                          },
                          { label: "Cartoon", img: "/images/cartoon.jpeg" },
                          { label: "Doodle", img: "/images/doodle.jpeg" },
                          { label: "Notion", img: "/images/notion.png" },
                          { label: "Isometric", img: "/images/isometric.jpeg" },
                          { label: "Pop Art", img: "/images/PopArt.jpeg" },
                          { label: "Sketch", img: "/images/sketch.jpeg" },
                          {
                            label: "Vintage",
                            img: "/images/vintagePoster.jpeg",
                          },
                          {
                            label: "Watercolor",
                            img: "/images/waterColor.jpeg",
                          },
                        ].map((style, idx) => (
                          <div
                            key={idx}
                            className={`flex flex-col items-center justify-center border rounded-xl p-3 cursor-pointer hover:border-blue-500 transition text-center ${
                              selectedTemplate === style.label
                                ? "border-blue-500 bg-blue-50"
                                : ""
                            }`}
                            onClick={() => {
                              setSelectedTemplate(style.label);
                              setStyle(style.label.toLowerCase());
                            }}
                          >
                            <Image
                              src={style.img}
                              alt={style.label}
                              width={64}
                              height={64}
                              className="object-cover rounded-md mb-2"
                            />
                            <p className="text-xs font-medium leading-tight line-clamp-2">
                              {style.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Generate Button */}
                <div className="mt-4">
                  <Button
                    onClick={handleGenerateClick}
                    className="w-full"
                    disabled={isGenerating || !isFormValid}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Illustration"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        <div className="w-3/5 sticky top-0 overflow-y-auto">
          <div className="p-6 h-full flex flex-col">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Generated Illustrations
              </h2>
              <p className="text-gray-500">
                Your AI-generated illustrations will appear here
              </p>
            </div>

            <div className="w-full flex-1 overflow-y-auto">
              {isGenerating ? (
                <div className="flex items-center justify-center p-12">
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-20 w-20 animate-spin text-illustration-accent mb-4" />
                    <h3 className="text-lg font-medium">
                      Creating your illustration...
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      This may take a few moments
                    </p>
                  </div>
                </div>
              ) : generatedResults.length === 0 ? (
                <div className="rounded-lg shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center">
                  <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900">
                    No illustrations yet
                  </h3>
                  <p className="text-gray-500 mt-1 text-center max-w-md">
                    Enter a prompt and click the Generate button to create
                    illustrations
                  </p>
                </div>
              ) : (
                <div
                  className={`flex ${
                    outputCount === 1 ? "justify-center" : "justify-between"
                  } gap-6 h-full min-h-0`}
                >
                  {generatedResults.map((result, index) => (
                    <div key={index} className={`${outputCount === 1 ? 'w-full' : 'w-1/2'} flex flex-col items-center`}>
                      <div
                        className="relative flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 w-full"
                      >
                        {result.imageUrl ? (
                          <Image
                            src={result.imageUrl}
                            alt={`AI generated illustration from ${result.provider}`}
                            width={300}
                            height={533} // Adjust height to fit illustration (approx. phone aspect ratio)
                            className="object-contain rounded-xl" // Ensure image scales and maintains rounded corners
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-gray-400">
                              Failed to generate image
                            </p>
                          </div>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="mt-4">
                            Download
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center">
                          <DropdownMenuItem
                            onClick={() => {
                              // Download SVG directly
                              downloadDataUrl(
                                result.imageUrl,
                                `illustration-${index + 1}.svg`
                              );
                            }}
                          >
                            Download as SVG
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={async () => {
                              // Convert SVG to PNG and download
                              await downloadSvgAsPng(
                                result.imageUrl,
                                `illustration-${index + 1}.png`
                              );
                            }}
                          >
                            Download as PNG
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Playground;
