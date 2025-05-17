"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { toast } from "sonner";
import IllustrationLogo from "@/src/components/IllustrationLogo";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import {
  Loader2,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Slider } from "@/src/components/ui/slider";
import Link from "next/link";
import { signOutAction } from "@/src/lib/actions/auth";
import { Label } from "@/src/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";

const IllustrationStyles = [
  { id: "notion", name: "Notion", icon: "👤" },
  { id: "doodle", name: "Doodle", icon: "🐶" },
  { id: "flat", name: "Flat", icon: "👩" },
  { id: "custom", name: "Suggest", icon: "💡" },
];

const Playground = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<Array<any>>([]);
  const [colorMode, setColorMode] = useState<"color" | "blackAndWhite">(
    "color"
  );
  const [style, setStyle] = useState("notion");
  const [outputCount, setOutputCount] = useState<number>(1);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referenceImageUrl, setReferenceImageUrl] = useState<string>("");
  const [templates, setTemplates] = useState<Array<any>>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if the form is valid for generation
  const isFormValid = !!prompt.trim();

  // Fetch templates from Supabase
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // In a real implementation, fetch templates from Supabase
        // This is a placeholder for demo purposes
        setTemplates([]);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    fetchTemplates();
  }, []);

  const handleGenerateClick = async () => {
    if (!isFormValid) {
      toast.error("Please enter a prompt");
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
        }),
      });
      const data = await response.json();
      const results = (data.images || []).map((img: any, idx: number) => ({
        provider: style,
        imageUrl: `data:${img.mimeType};base64,${img.base64}`,
      }));
      setGeneratedResults(results);
      toast.success("Illustration generated successfully");
    } catch (error) {
      console.error("Error generating illustration:", error);
      toast.error("Error generating illustration");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setReferenceImage(file);
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        if (event.target?.result) {
          setReferenceImageUrl(event.target.result as string);
        }
      };
      fileReader.readAsDataURL(file);
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading file");
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
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              downloadDataUrl(url, filename);
              URL.revokeObjectURL(url);
              resolve();
            } else {
              reject("Failed to create PNG blob");
            }
          },
          "image/png"
        );
      };
      img.onerror = reject;
      img.src = svgUrl;
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white py-3 px-6 sticky flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <IllustrationLogo small />
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/playground">Playground</Link>
          </Button>
          <div className="border-r border-gray-200 h-6"></div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/profile">Profile</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => signOutAction()}>
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
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                        {referenceImageUrl ? (
                          <div className="w-full">
                            <img
                              src={referenceImageUrl}
                              alt="Reference"
                              className="mx-auto h-32 object-contain mb-2"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                setReferenceImage(null);
                                setReferenceImageUrl("");
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-10 w-10 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">
                              Click to upload or drag and drop
                            </p>
                            <input
                              type="file"
                              ref={fileInputRef}
                              accept="image/*"
                              className="hidden"
                              onChange={handleFileUpload}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              Upload Image
                            </Button>
                          </>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="template" className="mt-2">
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {templates.length > 0 ? (
                          templates.map((template, index) => (
                            <div
                              key={index}
                              className="border rounded-md p-2 cursor-pointer hover:border-blue-500"
                              onClick={() => setReferenceImageUrl(template.url)}
                            >
                              <img
                                src={template.url}
                                alt={`Template ${index}`}
                                className="w-full h-20 object-cover"
                              />
                            </div>
                          ))
                        ) : (
                          <div className="border rounded-md p-2 flex items-center justify-center h-20 col-span-2">
                            <p className="text-xs text-gray-500">
                              No templates yet
                            </p>
                          </div>
                        )}
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

        <div className="w-3/5 sticky top-0 overflow-y-auto bg-gray-50">
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
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center">
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
                <div className={`grid ${outputCount === 1 ? "grid-cols-1" : "grid-cols-2"} gap-6 h-full min-h-0`}>
                  {generatedResults.map((result, index) => (
                    <div key={index} className="grid w-full place-items-center">
                      <div className="relative w-full h-full flex items-center justify-center bg-white rounded-2xl border-2 border-dashed border-gray-200" style={{ width: 500, height: 500, marginBottom: 20 }}>
                        {result.imageUrl ? (
                          <img
                            src={result.imageUrl}
                            alt={`AI generated illustration from ${result.provider}`}
                            className="object-contain rounded-2xl"
                            style={{ width: 440, height: 440, background: 'white' }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-gray-400">
                              Failed to generate image
                            </p>
                          </div>
                        )}
                      </div>
                      {/* <div className="rounded-full bg-white border border-gray-200 px-4 py-2 text-black text-center text-base font-medium max-w-full shadow-sm mb-2">
                        {prompt || "Prompt not available"}
                      </div> */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="mb-2">Download</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center">
                          <DropdownMenuItem
                            onClick={() => {
                              // Download SVG directly
                              downloadDataUrl(result.imageUrl, `illustration-${index + 1}.svg`);
                            }}
                          >
                            Download as SVG
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={async () => {
                              // Convert SVG to PNG and download
                              await downloadSvgAsPng(result.imageUrl, `illustration-${index + 1}.png`);
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
