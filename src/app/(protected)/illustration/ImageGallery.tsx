import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/src/components/ui/card";

interface ImageGalleryProps {
  images: string[];
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(images[0] || null);

  return (
    <div className="space-y-4">
      {selectedImage && (
        <div className="border rounded-lg overflow-hidden">
          <Image 
            src={selectedImage} 
            alt="Selected illustration" 
            width={512}
            height={512}
            className="w-full aspect-square object-cover"
          />
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-3">
        {images.map((image, index) => (
          <Card 
            key={index} 
            className={`overflow-hidden cursor-pointer ${selectedImage === image ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedImage(image)}
          >
            <CardContent className="p-0">
              <Image 
                src={image} 
                alt={`Generated illustration ${index + 1}`} 
                width={256}
                height={256}
                className="w-full aspect-square object-cover"
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;