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
            <path
              d="M 0,50 Q 25,0 50,50 T 100,50"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-foreground"
            />
            <path
              d="M 0,25 Q 25,-25 50,25 T 100,25"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-foreground"
            />
            <path
              d="M 0,75 Q 25,125 50,75 T 100,75"
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
