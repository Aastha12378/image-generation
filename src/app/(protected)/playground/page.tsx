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
  Settings,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Slider } from "@/src/components/ui/slider";
import Link from "next/link";
import { signOutAction } from "@/src/lib/actions/auth";
import { Label } from "@/components/ui/label";

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
      // const generatedImages = await generateImage(prompt, style, colorMode, outputCount);
      const generatedImages = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          style,
          colorMode,
          outputCount,
        }),
      });
      console.log("Generated images:", generatedImages);

      // setGeneratedResults(generatedImages);
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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white py-4 px-6 sticky flex items-center justify-between">
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
        <div className="w-2/5 h-screen overflow-y-auto">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="p-6 h-full flex flex-col">
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

        <div className="w-3/5 h-screen sticky top-0 overflow-y-auto bg-gray-50">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Generated Illustrations
              </h2>
              <p className="text-gray-500">
                Your AI-generated illustrations will appear here
              </p>
            </div>

            <div className="w-full">
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
                <div
                  className={`grid ${
                    outputCount === 1 ? "grid-cols-1" : "grid-cols-2"
                  } gap-6`}
                >
                  {generatedResults.map((result, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg capitalize">
                          {result.provider} Generated
                        </CardTitle>
                        <CardDescription className="line-clamp-1">
                          {prompt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="relative aspect-square w-full bg-gray-100">
                          {result.imageUrl ? (
                            <img
                              src={result.imageUrl}
                              alt={`AI generated illustration from ${result.provider}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <p className="text-gray-400">
                                Failed to generate image
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between p-4">
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          Use as Template
                        </Button>
                      </CardFooter>
                    </Card>
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
