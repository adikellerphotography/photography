import { cn } from "@/lib/utils";

export default function BackgroundPattern() {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full">
      <div className="absolute inset-0 bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,217,217,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.03),rgba(0,0,0,0))]" />
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.12] dark:opacity-[0.18]"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="wave-pattern"
            patternUnits="userSpaceOnUse"
            width="800"
            height="800"
            patternTransform="rotate(15) scale(0.8)"
          >
            {/* Base wave layer */}
            <path
              d="M0,400 
                C200,320 300,480 800,400 
                M0,400 
                C300,480 500,320 800,400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-foreground/50 dark:text-foreground/70"
            />

            {/* Secondary waves with different phases */}
            <path
              d="M0,200 
                C200,120 300,280 800,200 
                M0,200 
                C300,280 500,120 800,200"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-foreground/30 dark:text-foreground/50"
            />

            <path
              d="M0,600 
                C200,520 300,680 800,600 
                M0,600 
                C300,680 500,520 800,600"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-foreground/30 dark:text-foreground/50"
            />

            {/* Subtle detail waves */}
            <path
              d="M0,300 
                C200,260 300,340 800,300 
                M0,300 
                C300,340 500,260 800,300"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-foreground/20 dark:text-foreground/40"
            />

            <path
              d="M0,500 
                C200,460 300,540 800,500 
                M0,500 
                C300,540 500,460 800,500"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-foreground/20 dark:text-foreground/40"
            />

            {/* Fine detail waves */}
            <path
              d="M0,350 
                C200,330 300,370 800,350 
                M0,350 
                C300,370 500,330 800,350"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-foreground/10 dark:text-foreground/30"
            />

            <path
              d="M0,450 
                C200,430 300,470 800,450 
                M0,450 
                C300,470 500,430 800,450"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-foreground/10 dark:text-foreground/30"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wave-pattern)" />
      </svg>
    </div>
  );
}