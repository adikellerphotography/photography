import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        {/* Camera body */}
        <path
          d="M26 24H6C4.89543 24 4 23.1046 4 22V12C4 10.8954 4.89543 10 6 10H9L11 7H21L23 10H26C27.1046 10 28 10.8954 28 12V22C28 23.1046 27.1046 24 26 24Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Lens */}
        <circle
          cx="16"
          cy="17"
          r="5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Flash */}
        <path
          d="M24 14H24.01"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-cormorant text-lg tracking-wide">
        Adi Keller
        <span className="block -mt-1.5 text-sm text-muted-foreground">Photography</span>
      </span>
    </div>
  );
}
