
import { useState, useEffect } from 'react';

interface ImageErrorBoundaryProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  maxRetries?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export default function ImageErrorBoundary({
  src,
  alt,
  className = "",
  fallbackSrc = "/assets/placeholder.jpeg",
  maxRetries = 3,
  onLoad,
  onError,
}: ImageErrorBoundaryProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setRetryCount(0);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      const timestamp = Date.now();
      setCurrentSrc(`${src}?retry=${retryCount + 1}&t=${timestamp}`);
    } else {
      setHasError(true);
      onError?.();
    }
  };

  if (hasError) {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        onLoad={onLoad}
      />
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={onLoad}
    />
  );
}
