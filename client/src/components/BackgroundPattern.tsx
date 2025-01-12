import { cn } from "@/lib/utils";

export default function BackgroundPattern() {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full">
      <div className="absolute inset-0 bg-background" />
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.015] dark:opacity-[0.025]"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="curved-line-pattern"
            patternUnits="userSpaceOnUse"
            width="100"
            height="100"
            patternTransform="rotate(45)"
          >
            {/* Gentle curved lines with varying thickness and opacity */}
            <path
              d="M 0,50 C 20,20 30,80 50,50 S 80,20 100,50"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              className="text-foreground"
            />
            <path
              d="M 0,25 C 20,-5 30,55 50,25 S 80,-5 100,25"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-foreground"
            />
            <path
              d="M 0,75 C 20,45 30,105 50,75 S 80,45 100,75"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-foreground"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#curved-line-pattern)" />
      </svg>
    </div>
  );
}