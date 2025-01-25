
import { useState, useEffect } from 'react';

interface ImageErrorBoundaryProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  maxRetries?: number;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  fetchpriority?: 'high' | 'low' | 'auto';
}

export default function ImageErrorBoundary({
  src,
  alt,
  className = "",
  fallbackSrc = "/assets/placeholder.jpeg",
  maxRetries = 3,
  onLoad,
  onError,
  style,
  loading = 'lazy',
  sizes,
  fetchpriority,
}: ImageErrorBoundaryProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setRetryCount(0);
    setHasError(false);
  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      const timestamp = Date.now();
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000);
      
      setTimeout(() => {
        // Try thumbnail version first
        const thumbSrc = src.replace(/\.jpeg$/, '-thumb.jpeg');
        setCurrentSrc(thumbSrc + `?retry=${retryCount + 1}&t=${timestamp}`);
      }, retryDelay);
    } else {
      setHasError(true);
      onError?.(e);
    }
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (currentSrc.includes('-thumb.jpeg') && !hasError) {
      // If thumbnail loaded successfully, try loading the full image
      const fullSrc = currentSrc.replace(/-thumb\.jpeg/, '.jpeg');
      const img = new Image();
      img.src = fullSrc;
      img.onload = () => setCurrentSrc(fullSrc);
    }
    onLoad?.(e);
  };

  return (
    <img
      src={hasError ? fallbackSrc : currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      style={{
        backgroundColor: 'transparent',
        objectFit: 'cover',
        objectPosition: 'center',
        WebkitBackfaceVisibility: 'hidden',
        WebkitTransform: 'translate3d(0, 0, 0)',
        WebkitPerspective: '1000',
        transition: 'opacity 0.3s ease-in-out',
        ...style
      }}
      loading={loading}
      sizes={sizes}
      fetchpriority={fetchpriority}
    />
  );
}
