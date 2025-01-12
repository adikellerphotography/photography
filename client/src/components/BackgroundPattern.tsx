import { cn } from "@/lib/utils";

export default function BackgroundPattern() {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full">
      <div className="absolute inset-0 bg-background" />
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.03] dark:opacity-[0.04]"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="wave-pattern"
            patternUnits="userSpaceOnUse"
            width="200"
            height="200"
            patternTransform="rotate(10)"
          >
            {/* Multiple overlapping wave paths for depth */}
            <path
              d="M0,100 C50,80 100,120 200,100 M0,100 C50,120 150,80 200,100"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-foreground"
            />
            <path
              d="M0,50 C50,30 100,70 200,50 M0,50 C50,70 150,30 200,50"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-foreground/80"
            />
            <path
              d="M0,150 C50,130 100,170 200,150 M0,150 C50,170 150,130 200,150"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
              className="text-foreground/90"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wave-pattern)" />
      </svg>
    </div>
  );
}