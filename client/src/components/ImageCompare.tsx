import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

interface ImageCompareProps {
  beforeImage: string;
  afterImage: string;
}

export default function ImageCompare({ beforeImage, afterImage }: ImageCompareProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = (x / rect.width) * 100;

      setSliderPosition(Math.min(Math.max(percentage, 0), 100));
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
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
      className="relative w-full aspect-[16/9] overflow-hidden rounded-lg bg-muted"
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* After image (base layer) */}
      <img
        src={afterImage}
        alt="After"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />

      {/* Before image (overlay) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeImage}
          alt="Before"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: `${100 / (sliderPosition / 100)}%` }}
          loading="lazy"
        />
      </div>

      {/* Slider handle */}
      <div
        className="absolute inset-y-0"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute inset-y-0 -left-px w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.3)]" />
        <motion.div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center"
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
              d="M2.66667 5.33333L8 10.6667L13.3333 5.33333"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
