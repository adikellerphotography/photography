
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { Photo } from "@/lib/types";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

interface PhotoGalleryProps {
  category?: string;
}

export default function PhotoGallery({ category }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const galleryRef = useRef<HTMLDivElement>(null);

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
  });

  const preloadImage = async (photo: Photo): Promise<void> => {
    if (!photo.imageUrl) return;

    const path = `/attached_assets/galleries/${category?.replace(/\s+/g, '_')}/${photo.imageUrl}`;
    
    const img = new Image();
    const loadPromise = new Promise<void>((resolve, reject) => {
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(path));
        resolve();
      };
      img.onerror = async () => {
        const retryCount = parseInt(img.dataset.retryCount || '0', 10);
        if (retryCount < 3) {
          img.dataset.retryCount = (retryCount + 1).toString();
          img.src = `${path}?retry=${retryCount + 1}&t=${Date.now()}`;
        } else {
          setFailedImages(prev => new Set(prev).add(path));
          reject(new Error(`Failed to load image: ${path}`));
        }
      };
    });

    img.src = path;
    try {
      await Promise.race([
        loadPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (photos.length) {
      const preloadQueue = [...photos];
      let running = 0;
      const maxConcurrent = 4;

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
    }
  }, [photos]);

  const retryImage = (path: string) => {
    setFailedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(path);
      return newSet;
    });
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
                    <div className="absolute inset-0 animate-pulse bg-muted/10" />
                  )}
                  {hasFailed ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/10">
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
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
          {selectedPhoto && (
            <div className="relative w-full h-full">
              <Button
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  const newIndex = selectedIndex === 0 ? photos.length - 1 : selectedIndex - 1;
                  setSelectedIndex(newIndex);
                  setSelectedPhoto(photos[newIndex]);
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <Button
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  const newIndex = (selectedIndex + 1) % photos.length;
                  setSelectedIndex(newIndex);
                  setSelectedPhoto(photos[newIndex]);
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              <img
                src={`/attached_assets/galleries/${category?.replace(/\s+/g, '_')}/${selectedPhoto.imageUrl}`}
                alt={selectedPhoto.title || ""}
                className="w-full h-full object-contain"
                loading="eager"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
