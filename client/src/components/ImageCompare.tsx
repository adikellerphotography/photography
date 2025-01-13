import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

interface ImageCompareProps {
  beforeImage: string;
  afterImage: string;
}

export default function ImageCompare({ beforeImage, afterImage }: ImageCompareProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [imageOrientation, setImageOrientation] = useState<'landscape' | 'portrait' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageLoad = () => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      setImageOrientation(naturalWidth >= naturalHeight ? 'landscape' : 'portrait');
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

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-lg select-none max-h-[80vh] w-full"
      style={{ aspectRatio: imageOrientation === 'landscape' ? '16/9' : '3/4' }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* After image (base layer) */}
      <img
        ref={imageRef}
        src={afterImage}
        alt="After"
        className="absolute inset-0 w-full h-full object-contain"
        onLoad={handleImageLoad}
        loading="lazy"
      />

      {/* Before image (overlay) with clip effect */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
        }}
      >
        <img
          src={beforeImage}
          alt="Before"
          className="absolute inset-0 w-full h-full object-contain"
          loading="lazy"
        />
      </div>

      {/* Slider line */}
      <div
        className="absolute inset-y-0 w-0.5 bg-white/80 shadow-[0_0_10px_rgba(0,0,0,0.3)]"
        style={{ left: `${sliderPosition}%` }}
      />

      {/* Slider handle with bidirectional arrow */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center"
        style={{ left: `${sliderPosition}%`, x: "-50%" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-gray-600"
        >
          {/* Bidirectional arrow icon */}
          <path
            d="M7.5 12L3.5 8M3.5 8L7.5 4M3.5 8H20.5M16.5 12L20.5 16M20.5 16L16.5 20M20.5 16H3.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </div>
  );
}