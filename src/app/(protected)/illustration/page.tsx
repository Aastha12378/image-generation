'use client'
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Card, CardContent } from "@/src/components/ui/card";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Upload } from "lucide-react";
import StyleOption from "./StyleOption";
import ImageUploader from "./ImageUploader";
import ImageGallery from "./ImageGallery";
import ImagePlaceholder from "./ImagePlaceholder";

// Define the available style options
const styleOptions = [
  { id: "realistic", name: "Realistic", icon: "user" },
  { id: "doodle", name: "Doodle", icon: "pencil" },
  { id: "flat", name: "Flat", icon: "square" },
  { id: "suggest", name: "Suggest", icon: "lightbulb" },
];

// // Define color mode options
// const colorOptions = [
//   { id: "color", name: "Color" },
//   { id: "blackwhite", name: "Black & White" },
// ];

export default function Index() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  // const [colorMode, setColorMode] = useState("color");
  const [numOutputs, setNumOutputs] = useState(1);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate image generation
    setTimeout(() => {
      // In a real app, this would call an AI API
      const mockGeneratedImage = `https://source.unsplash.com/random/400x400?${prompt.split(' ').join(',')}`;
      setGeneratedImages([mockGeneratedImage, ...generatedImages]);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white border-b p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">illustration.app</h1>
          <div className="flex gap-4">
            <Button variant="ghost">Home</Button>
            <Button variant="ghost">Playground</Button>
            <Button variant="ghost">Profile</Button>
            <Button variant="outline">Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Prompt form */}
        <div className="w-full md:w-1/2 border-r">
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="p-4 space-y-6">
              <div>
                <Label htmlFor="prompt" className="text-lg font-medium">Prompt</Label>
                <Textarea 
                  id="prompt"
                  placeholder="Describe the illustration you want to create..."
                  className="mt-2 h-32"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              
              {/* <div>
                <Label className="text-lg font-medium">Color Mode</Label>
                <RadioGroup 
                  value={colorMode} 
                  onValueChange={setColorMode}
                  className="grid grid-cols-2 gap-4 mt-2"
                >
                  {colorOptions.map((option) => (
                    <div key={option.id} className="flex items-center border rounded-md p-3">
                      <RadioGroupItem value={option.id} id={`color-${option.id}`} />
                      <Label htmlFor={`color-${option.id}`} className="ml-2">{option.name}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div> */}

              <div>
                <Label className="text-lg font-medium">Style</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {styleOptions.map((option) => (
                    <StyleOption
                      key={option.id}
                      id={option.id}
                      name={option.name}
                      icon={option.icon}
                      selected={style === option.id}
                      onSelect={() => setStyle(option.id)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-lg font-medium">Number of Outputs: {numOutputs}</Label>
                <div className="flex items-center mt-2 space-x-2">
                  <input
                    type="radio"
                    id="single-output"
                    checked={numOutputs === 1}
                    onChange={() => setNumOutputs(1)}
                  />
                  <Label htmlFor="single-output">1 (Best result)</Label>
                </div>
                <div className="flex items-center mt-1">
                  <input
                    type="radio"
                    id="compare-outputs"
                    checked={numOutputs === 2}
                    onChange={() => setNumOutputs(2)}
                  />
                  <Label htmlFor="compare-outputs" className="ml-2">2 (Compare models)</Label>
                </div>
              </div>

              <div>
                <Label className="text-lg font-medium">Reference Image</Label>
                <Tabs defaultValue="upload" className="mt-2">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Upload Image</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="mt-2">
                    <ImageUploader />
                  </TabsContent>
                  <TabsContent value="templates" className="mt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Card className="cursor-pointer hover:bg-gray-50">
                        <CardContent className="p-2">
                          <div className="aspect-square bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-500">Ghibli Style</span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="cursor-pointer hover:bg-gray-50">
                        <CardContent className="p-2">
                          <div className="aspect-square bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-500">Anime</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="flex flex-col gap-4">
                <Button 
                  onClick={handleGenerate} 
                  disabled={!prompt || isGenerating} 
                  className="py-6"
                >
                  {isGenerating ? "Generating Illustration..." : "Generate Illustration"}
                </Button>
                
                <Button variant="outline" className="py-6 gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Image
                </Button>
                
                <Button variant="secondary" className="py-6">
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Right content - Generated images */}
        <div className="hidden md:block w-1/2 bg-gray-50 h-[calc(100vh-4rem)] overflow-hidden">
          <div className="p-4 h-full">
            <h2 className="text-2xl font-bold mb-1">Generated Illustrations</h2>
            <p className="text-gray-500 mb-4">Your AI-generated illustrations will appear here</p>
            
            <div className="h-[calc(100%-5rem)] overflow-auto">
              {generatedImages.length > 0 ? (
                <ImageGallery images={generatedImages} />
              ) : (
                <ImagePlaceholder />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}