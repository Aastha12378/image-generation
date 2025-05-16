import { useState } from "react";
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
          <img 
            src={selectedImage} 
            alt="Selected illustration" 
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
              <img 
                src={image} 
                alt={`Generated illustration ${index + 1}`} 
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