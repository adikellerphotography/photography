
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { Photo } from "@/lib/types";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from "lucide-react";

interface PhotoGalleryProps {
  category?: string;
}

export default function PhotoGallery({ category }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [retryAttempts, setRetryAttempts] = useState<Record<string, number>>({});
  const galleryRef = useRef<HTMLDivElement>(null);
  const imageCache = useRef<Record<string, HTMLImageElement>>({});

  const { data: photos = [], isLoading, refetch } = useQuery<Photo[]>({
    queryKey: ["/api/photos", category],
    queryFn: async () => {
      const response = await fetch(`/api/photos?category=${encodeURIComponent(category || '')}`);
      if (!response.ok) throw new Error('Failed to fetch photos');
      const data = await response.json();
      return data.filter((photo: Photo) => photo && photo.imageUrl);
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const preloadImage = async (photo: Photo): Promise<void> => {
    if (!photo.imageUrl) return;

    const path = `/attached_assets/galleries/${category?.replace(/\s+/g, '_')}/${photo.imageUrl}`;
    if (loadedImages.has(path) || failedImages.has(path)) return;

    const timestamp = Date.now();
    const retryCount = retryAttempts[path] || 0;
    const urlWithCache = `${path}?t=${timestamp}&r=${retryCount}`;

    try {
      const img = new Image();
      imageCache.current[path] = img;

      const loadPromise = new Promise<void>((resolve, reject) => {
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(path));
          resolve();
        };

        img.onerror = () => {
          if (retryCount < 3) {
            setRetryAttempts(prev => ({ ...prev, [path]: retryCount + 1 }));
            reject(new Error(`Failed to load image: ${path}`));
          } else {
            setFailedImages(prev => new Set(prev).add(path));
            reject(new Error(`Max retries reached for: ${path}`));
          }
        };
      });

      img.src = urlWithCache;
      await Promise.race([
        loadPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
      ]);
    } catch (error) {
      console.error(`Error loading image ${path}:`, error);
    }
  };

  useEffect(() => {
    if (photos.length) {
      const preloadQueue = [...photos];
      let running = 0;
      const maxConcurrent = 3;

      const processNext = async () => {
        if (preloadQueue.length === 0 || running >= maxConcurrent) return;
        running++;
        const photo = preloadQueue.shift();
        if (photo) {
          await preloadImage(photo);
          running--;
          processNext();
        }
      };

      for (let i = 0; i < maxConcurrent; i++) {
        processNext();
      }

      return () => {
        // Cleanup image cache on unmount
        Object.values(imageCache.current).forEach(img => {
          img.onload = null;
          img.onerror = null;
          img.src = '';
        });
        imageCache.current = {};
      };
    }
  }, [photos]);

  const retryImage = (path: string) => {
    setFailedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(path);
      return newSet;
    });
    setRetryAttempts(prev => ({ ...prev, [path]: 0 }));
    const photo = photos.find(p => p.imageUrl === path.split('/').pop());
    if (photo) {
      preloadImage(photo);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <AspectRatio ratio={4/3}>
              <Skeleton className="w-full h-full" />
            </AspectRatio>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8" ref={galleryRef}>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-background/50">
        {photos.map((photo, index) => {
          const path = `/attached_assets/galleries/${category?.replace(/\s+/g, '_')}/${photo.imageUrl}`;
          const isLoaded = loadedImages.has(path);
          const hasFailed = failedImages.has(path);

          return (
            <motion.div
              key={`${photo.id}-${index}`}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: Math.min(index * 0.1, 1),
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className="relative overflow-hidden rounded-lg cursor-pointer group"
              onClick={() => {
                if (isLoaded) {
                  setSelectedPhoto(photo);
                  setSelectedIndex(index);
                }
              }}
            >
              <AspectRatio ratio={4/3}>
                <div className="relative w-full h-full">
                  {!isLoaded && !hasFailed && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/10">
                      <div className="animate-spin">
                        <RefreshCw className="w-6 h-6 text-muted-foreground" />
                      </div>
                    </div>
                  )}
                  {hasFailed ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/10">
                      <AlertCircle className="w-6 h-6 text-destructive mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">Failed to load</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          retryImage(path);
                        }}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <img
                      src={path}
                      alt={photo.title || ""}
                      className={`relative w-full h-full transition-all duration-500 ${
                        isLoaded ? 'opacity-100 group-hover:scale-110' : 'opacity-0'
                      } object-cover`}
                      loading={index < 12 ? "eager" : "lazy"}
                      decoding={index < 12 ? "sync" : "async"}
                      fetchpriority={index < 12 ? "high" : "low"}
                    />
                  )}
                </div>
              </AspectRatio>
            </motion.div>
          );
        })}
      </div>

      <Dialog
        open={!!selectedPhoto}
        onOpenChange={(open) => {
          if (!open) setSelectedPhoto(null);
        }}
      >
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-black/80 shadow-xl backdrop-blur-sm">
          {selectedPhoto && (
            <div 
              className="relative w-full h-full flex items-center justify-center"
              onTouchStart={(e) => {
                const touch = e.touches[0];
                setTouchStart({ x: touch.clientX, y: touch.clientY });
              }}
              onTouchMove={(e) => {
                if (!touchStart) return;
                const touch = e.touches[0];
                const deltaX = touchStart.x - touch.clientX;
                const deltaY = touchStart.y - touch.clientY;

                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                  e.preventDefault();
                }
              }}
              onTouchEnd={(e) => {
                if (!touchStart) return;
                const touch = e.changedTouches[0];
                const deltaX = touchStart.x - touch.clientX;

                if (Math.abs(deltaX) > 50) {
                  const newIndex = deltaX > 0 
                    ? (selectedIndex + 1) % photos.length 
                    : selectedIndex === 0 ? photos.length - 1 : selectedIndex - 1;
                  setSelectedIndex(newIndex);
                  setSelectedPhoto(photos[newIndex]);
                }
                setTouchStart(null);
              }}
            >
              <Button
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 transition-colors"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  const newIndex = selectedIndex === 0 ? photos.length - 1 : selectedIndex - 1;
                  setSelectedIndex(newIndex);
                  setSelectedPhoto(photos[newIndex]);
                }}
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </Button>

              <Button
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 transition-colors"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  const newIndex = (selectedIndex + 1) % photos.length;
                  setSelectedIndex(newIndex);
                  setSelectedPhoto(photos[newIndex]);
                }}
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </Button>

              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                src={`/attached_assets/galleries/${category?.replace(/\s+/g, '_')}/${selectedPhoto.imageUrl}`}
                alt={selectedPhoto.title || ""}
                className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                loading="eager"
                draggable={false}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
