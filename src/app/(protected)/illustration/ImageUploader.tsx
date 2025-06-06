import { useState } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const ImageUploader = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setUploadedImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {uploadedImage ? (
        <div className="relative">
          <Image 
            src={uploadedImage} 
            alt="Uploaded reference" 
            width={512}
            height={512}
            className="w-full aspect-square object-cover rounded-md" 
          />
          <Button 
            variant="destructive" 
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => setUploadedImage(null)}
          >
            Remove
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer ${
            isDragging ? "border-primary bg-primary/5" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm text-center text-gray-600">Click to upload or drag and drop</p>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />
        </div>
      )}
      {!uploadedImage && (
        <Button variant="outline" className="w-full" onClick={() => document.getElementById("file-upload")?.click()}>
          Upload Image
        </Button>
      )}
    </div>
  );
};

export default ImageUploader;
