import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex flex-col pt-3", className)}>
      <span className="font-cormorant text-lg tracking-wide">
        Adi Keller
        <span className="block -mt-1.5 text-sm text-muted-foreground">
          Photography
        </span>
      </span>
    </div>
  );
}