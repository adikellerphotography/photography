
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function BackgroundPattern() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 h-full w-full overflow-hidden">
      <div className="absolute inset-0 bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,217,217,0.4),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.12),rgba(0,0,0,0))]" />
      <svg
        className="absolute inset-0 h-[200%] w-full opacity-[0.65] dark:opacity-[0.75] will-change-transform"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
        viewBox="0 0 1000 2000"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="wave-pattern"
            patternUnits="userSpaceOnUse"
            width="800"
            height="1600"
            patternTransform="rotate(15) scale(0.8)"
          >
            {/* Base wave layer */}
            <path
              d="M0,800 
                C200,640 300,960 800,800 
                M0,800 
                C300,960 500,640 800,800"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-foreground/50 dark:text-foreground/70"
            />

            {/* Secondary waves with different phases */}
            <path
              d="M0,400 
                C200,240 300,560 800,400 
                M0,400 
                C300,560 500,240 800,400"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-foreground/30 dark:text-foreground/50"
            />

            <path
              d="M0,1200 
                C200,1040 300,1360 800,1200 
                M0,1200 
                C300,1360 500,1040 800,1200"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-foreground/30 dark:text-foreground/50"
            />

            {/* Subtle detail waves */}
            <path
              d="M0,600 
                C200,520 300,680 800,600 
                M0,600 
                C300,680 500,520 800,600"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-foreground/20 dark:text-foreground/40"
            />

            <path
              d="M0,1000 
                C200,920 300,1080 800,1000 
                M0,1000 
                C300,1080 500,920 800,1000"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-foreground/20 dark:text-foreground/40"
            />

            {/* Fine detail waves */}
            <path
              d="M0,700 
                C200,660 300,740 800,700 
                M0,700 
                C300,740 500,660 800,700"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-foreground/10 dark:text-foreground/30"
            />

            <path
              d="M0,900 
                C200,860 300,940 800,900 
                M0,900 
                C300,940 500,860 800,900"
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
