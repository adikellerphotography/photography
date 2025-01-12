import { cn } from "@/lib/utils";

export default function BackgroundPattern() {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full">
      <div className="absolute inset-0 bg-background" />
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.025] dark:opacity-[0.04]"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="wave-pattern"
            patternUnits="userSpaceOnUse"
            width="400"
            height="400"
            patternTransform="rotate(15)"
          >
            {/* Base wave layer */}
            <path
              d="M0,200 
                C100,160 150,240 400,200 
                M0,200 
                C150,240 250,160 400,200"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-foreground/60"
            />

            {/* Secondary waves with different phases */}
            <path
              d="M0,100 
                C100,60 150,140 400,100 
                M0,100 
                C150,140 250,60 400,100"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-foreground/40"
            />

            <path
              d="M0,300 
                C100,260 150,340 400,300 
                M0,300 
                C150,340 250,260 400,300"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-foreground/40"
            />

            {/* Subtle detail waves */}
            <path
              d="M0,150 
                C100,130 150,170 400,150 
                M0,150 
                C150,170 250,130 400,150"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-foreground/30"
            />

            <path
              d="M0,250 
                C100,230 150,270 400,250 
                M0,250 
                C150,270 250,230 400,250"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-foreground/30"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wave-pattern)" />
      </svg>
    </div>
  );
}