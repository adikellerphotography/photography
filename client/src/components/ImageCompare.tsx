
import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

interface ImageCompareProps {
  beforeImage: string;
  afterImage: string;
  className?: string;
  priority?: boolean;
  isMobile?: boolean;
}

export default function ImageCompare({ 
  beforeImage, 
  afterImage, 
  className = "", 
  priority = false,
  isMobile = false 
}: ImageCompareProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const beforeImageRef = useRef<HTMLImageElement>(null);

  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      setImageSize({ width: naturalWidth, height: naturalHeight });
      setIsLoaded(true);
      setLoadError(false);
    }
  }, []);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    const retryCount = Number(img.dataset.retryCount || 0);
    const maxRetries = 3;

    if (retryCount < maxRetries) {
      img.dataset.retryCount = String(retryCount + 1);
      const timestamp = Date.now();
      img.src = `${img.src.split('?')[0]}?retry=${retryCount + 1}&t=${timestamp}`;
    } else {
      setLoadError(true);
      setIsLoaded(true);
    }
  }, []);

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

  if (loadError) {
    return (
      <div className={`relative bg-muted flex items-center justify-center ${className}`} style={{ aspectRatio: "4/3" }}>
        <div className="text-center text-muted-foreground">
          <p>Failed to load image</p>
          <button 
            onClick={() => {
              setLoadError(false);
              setIsLoaded(false);
              if (imageRef.current) {
                imageRef.current.src = afterImage;
              }
              if (beforeImageRef.current) {
                beforeImageRef.current.src = beforeImage;
              }
            }}
            className="mt-2 text-sm underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-muted select-none w-full max-w-full ${className} ${!isLoaded ? 'animate-pulse' : ''}`}
      style={{
        aspectRatio: imageSize.width && imageSize.height ? `${imageSize.width}/${imageSize.height}` : "4/3"
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      <img
        ref={imageRef}
        src={afterImage}
        alt="After"
        className="absolute inset-0 w-full h-full object-contain"
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={priority || isMobile ? "eager" : "lazy"}
        decoding={priority || isMobile ? "sync" : "async"}
        fetchpriority={priority || isMobile ? "high" : "low"}
      />

      <div
        className="absolute inset-0"
        style={{
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
        }}
      >
        <img
          ref={beforeImageRef}
          src={beforeImage}
          alt="Before"
          className="absolute inset-0 w-full h-full object-contain"
          onError={handleImageError}
          loading={priority || isMobile ? "eager" : "lazy"}
          decoding={priority || isMobile ? "sync" : "async"}
          fetchpriority={priority || isMobile ? "high" : "low"}
        />
      </div>

      <div
        className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.3)]"
        style={{ left: `${sliderPosition}%` }}
      />

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
  );
}
