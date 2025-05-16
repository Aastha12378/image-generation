import { 
  User, Pencil, Square, Lightbulb,
  type LucideIcon 
} from "lucide-react";

interface StyleOptionProps {
  id: string;
  name: string;
  icon: string;
  selected: boolean;
  onSelect: () => void;
}

const StyleOption = ({ id, name, icon, selected, onSelect }: StyleOptionProps) => {
  let IconComponent: LucideIcon;
  
  switch (icon) {
    case "user":
      IconComponent = User;
      break;
    case "pencil":
      IconComponent = Pencil;
      break;
    case "square":
      IconComponent = Square;
      break;
    case "lightbulb":
      IconComponent = Lightbulb;
      break;
    default:
      IconComponent = User;
  }

  return (
    <div 
      className={`flex flex-col items-center justify-center border rounded-md p-4 cursor-pointer transition-colors ${
        selected ? "bg-primary text-primary-foreground" : "hover:bg-gray-50"
      }`}
      onClick={onSelect}
    >
      <IconComponent className="w-6 h-6 mb-2" />
      <span>{name}</span>
    </div>
  );
};

export default StyleOption;
