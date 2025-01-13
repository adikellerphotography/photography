import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

interface ImageComparisonProps {
  beforeImage: string;
  afterImage: string;
  position: number;
  onPositionChange: (position: number) => void;
}

export default function ImageComparison({
  beforeImage,
  afterImage,
  position,
  onPositionChange,
}: ImageComparisonProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderPosition = useMotionValue(position);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleDrag = (event: any, info: any) => {
    const newPosition = (info.point.x / dimensions.width) * 100;
    const clampedPosition = Math.max(0, Math.min(100, newPosition));
    sliderPosition.set(clampedPosition);
    onPositionChange(clampedPosition);
  };

  useEffect(() => {
    sliderPosition.set(position);
  }, [position, sliderPosition]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-[4/3] overflow-hidden bg-muted"
    >
      {/* Before Image */}
      <img
        src={beforeImage}
        alt="Before"
        className="absolute top-0 left-0 w-full h-full object-cover"
      />

      {/* After Image */}
      <div
        className="absolute top-0 left-0 w-full h-full overflow-hidden"
        style={{ 
          clipPath: `inset(0 ${100 - position}% 0 0)`
        }}
      >
        <img
          src={afterImage}
          alt="After"
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
      </div>

      {/* Slider */}
      <motion.div
        drag="x"
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={containerRef}
        onDrag={handleDrag}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        style={{ x: sliderPosition.get() * dimensions.width / 100 }}
        className={cn(
          "absolute top-0 w-1 h-full bg-white cursor-ew-resize",
          "after:content-[''] after:absolute after:top-1/2 after:left-1/2",
          "after:w-8 after:h-8 after:bg-white after:rounded-full",
          "after:-translate-x-1/2 after:-translate-y-1/2",
          "after:flex after:items-center after:justify-center",
          "after:shadow-lg",
          isDragging ? "after:scale-110" : ""
        )}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <path d="M21 17H3M21 7H3M7 12h10" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}
