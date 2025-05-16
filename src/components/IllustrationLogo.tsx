// components/IllustrationLogo.tsx
import { cn } from "@/src/lib/utils";

interface IllustrationLogoProps {
  small?: boolean;
  className?: string;
}

const IllustrationLogo = ({ small = false, className }: IllustrationLogoProps) => {
  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex items-center justify-center bg-illustration-accent rounded-md p-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("text-black", small ? "w-5 h-5" : "w-6 h-6")}
        >
          <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
          <path d="M2 2l7.586 7.586"></path>
          <circle cx="11" cy="11" r="2"></circle>
        </svg>
      </div>
      <span className={cn("font-bold text-gray-900", small ? "ml-1 text-sm" : "ml-2 text-lg")}>
        Illustration.app
      </span>
    </div>
  );
};

export default IllustrationLogo;