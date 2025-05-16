import { ImageIcon } from "lucide-react";

const ImagePlaceholder = () => {
  return (
    <div className="border rounded-lg p-8 bg-white flex flex-col items-center justify-center min-h-[300px]">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <ImageIcon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No illustrations yet</h3>
      <p className="text-sm text-gray-500 text-center">
        Enter a prompt and click the Generate button to create illustrations
      </p>
    </div>
  );
};

export default ImagePlaceholder;