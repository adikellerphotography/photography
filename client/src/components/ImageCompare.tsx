import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

interface ImageCompareProps {
  beforeImage: string;
  afterImage: string;
}

export default function ImageCompare({ beforeImage, afterImage }: ImageCompareProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageLoad = () => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      setDimensions({ width: naturalWidth, height: naturalHeight });
    }
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current || !isDragging) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const x = Math.min(Math.max(0, clientX - rect.left), rect.width);
      const percentage = (x / rect.width) * 100;

      setSliderPosition(percentage);
    },
    [isDragging]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [handleMouseMove, handleTouchMove]);

  if (!dimensions) {
    return (
      <div className="relative w-full h-0 pb-[75%] bg-muted animate-pulse rounded-lg" />
    );
  }

  return (
    <div className="relative w-full">
      <div 
        className="grid grid-cols-1 grid-rows-1" 
        style={{ 
          aspectRatio: `${dimensions.width} / ${dimensions.height}`,
        }}
      >
        <div 
          ref={containerRef} 
          className="col-start-1 row-start-1 relative w-full h-full overflow-hidden rounded-lg"
          onMouseDown={handleMouseDown} 
          onTouchStart={handleMouseDown}
        >
          {/* After image */}
          <img
            ref={imageRef}
            src={afterImage}
            alt="After"
            className="w-full h-full object-contain"
            onLoad={handleImageLoad}
            loading="lazy"
          />

          {/* Before image with clip mask */}
          <div 
            className="absolute inset-0"
            style={{
              clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
            }}
          >
            <img
              src={beforeImage}
              alt="Before"
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>

          {/* Slider */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.3)]"
            style={{ left: `${sliderPosition}%` }}
          />

          {/* Handle */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center"
            style={{ left: `${sliderPosition}%`, x: "-50%" }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-600"
            >
              <path
                d="M2 8h12M4 5l-3 3 3 3M12 5l3 3-3 3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </div>
      </div>
    </div>
  );
}