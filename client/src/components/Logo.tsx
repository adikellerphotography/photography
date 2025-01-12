import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <div className={cn("text-lg font-cormorant", className)}>
      Adi Keller Photography
    </div>
  );
}