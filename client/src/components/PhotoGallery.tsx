import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { Photo } from "@/lib/types";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface PhotoGalleryProps {
  category?: string;
}

export default function PhotoGallery({ category }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [retryAttempts, setRetryAttempts] = useState<Record<string, number>>({});
  const galleryRef = useRef<HTMLDivElement>(null);
  const imageCache = useRef<Record<string, HTMLImageElement>>({});
  const photoRefs = useRef<HTMLDivElement[]>([]);

  const getImagePaths = (photo: Photo, isThumb = false): string[] => {
    if (!photo?.imageUrl) return [];
    const fileName = photo.imageUrl;
    const baseFileName = fileName.replace(/\.(jpeg|jpg)$/, '');
    const categoryPath = category?.replace(/\s+/g, '_');

    return [
      `/attached_assets/galleries/${categoryPath}/${fileName}`,
      `/attached_assets/galleries/${categoryPath}/${baseFileName}${isThumb ? '-thumb' : ''}.jpeg`,
      `/assets/galleries/${categoryPath}/${fileName}`,
      `/assets/galleries/${categoryPath}/${baseFileName}${isThumb ? '-thumb' : ''}.jpeg`,
      `/public/assets/galleries/${categoryPath}/${fileName}`,
      `/public/assets/galleries/${categoryPath}/${baseFileName}${isThumb ? '-thumb' : ''}.jpeg`
    ];
  };

  const { data: photos = [], isLoading, refetch } = useQuery<Photo[]>({
    queryKey: ["/api/photos", category],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/photos?category=${encodeURIComponent(category || '')}`);
        if (!response.ok) throw new Error('Failed to fetch photos');
        const data = await response.json();
        return data.filter((photo: Photo) => photo && photo.imageUrl);
      } catch (error) {
        console.error('Error fetching photos:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 5 * 60 * 1000,
  });

  const preloadImage = async (photo: Photo): Promise<void> => {
    if (!photo.imageUrl) return;

    const paths = getImagePaths(photo);
    const thumbPaths = getImagePaths(photo, true);
    const allPaths = [...paths, ...thumbPaths];
    const timestamp = Date.now();
    const retryCount = retryAttempts[paths[0]] || 0;

    if (loadedImages.has(paths[0]) || failedImages.has(paths[0])) return;

    try {
      const img = new Image();
      imageCache.current[paths[0]] = img;

      await new Promise<void>((resolve, reject) => {
        let currentPathIndex = 0;
        const maxAttempts = allPaths.length;
        let timeoutId: NodeJS.Timeout;

        const tryNextPath = () => {
          if (currentPathIndex >= maxAttempts) {
            clearTimeout(timeoutId);
            reject(new Error('All paths failed'));
            return;
          }

          const currentPath = allPaths[currentPathIndex];
          const urlWithCache = `${currentPath}?t=${timestamp}&r=${retryCount}`;

          img.onload = () => {
            clearTimeout(timeoutId);
            setLoadedImages(prev => new Set(prev).add(paths[0]));
            resolve();
          };

          img.onerror = () => {
            clearTimeout(timeoutId);
            currentPathIndex++;
            tryNextPath();
          };

          timeoutId = setTimeout(() => {
            img.src = '';
            currentPathIndex++;
            tryNextPath();
          }, 5000);

          img.src = urlWithCache;
        };

        tryNextPath();
      });
    } catch (error) {
      console.error(`Error loading image for ${photo.imageUrl}:`, error);
      if (retryCount < 3) {
        setRetryAttempts(prev => ({ ...prev, [paths[0]]: retryCount + 1 }));
      } else {
        setFailedImages(prev => new Set(prev).add(paths[0]));
      }
    }
  };

  useEffect(() => {
    if (!photos?.length) return;

    const preloadQueue = [...photos];
    let running = 0;
    const maxConcurrent = 3;
    let cancelled = false;

    const processNext = async () => {
      if (cancelled || preloadQueue.length === 0 || running >= maxConcurrent) return;
      running++;
      const photo = preloadQueue.shift();
      if (photo) {
        await preloadImage(photo);
        running--;
        if (!cancelled) processNext();
      }
    };

    for (let i = 0; i < maxConcurrent; i++) {
      processNext();
    }

    return () => {
      cancelled = true;
      Object.values(imageCache.current).forEach(img => {
        img.onload = null;
        img.onerror = null;
        img.src = '';
      });
      imageCache.current = {};
    };
  }, [photos]);

  const retryImage = (path: string) => {
    setFailedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(path);
      return newSet;
    });
    setRetryAttempts(prev => ({ ...prev, [path]: 0 }));
    const photo = photos.find(p => getImagePaths(p)[0] === path);
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
          const paths = getImagePaths(photo);
          const mainPath = paths[0];
          const isLoaded = loadedImages.has(mainPath);
          const hasFailed = failedImages.has(mainPath);

          return (
            <motion.div
              key={`${photo.id}-${index}`}
              ref={(el) => (photoRefs.current[index] = el)}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                boxShadow: selectedIndex === index && !selectedPhoto ? "0 0 20px rgba(255, 149, 0, 0.5)" : "none",
              }}
              transition={{
                duration: 0.5,
                delay: Math.min(index * 0.1, 1),
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className={`relative overflow-hidden rounded-lg cursor-pointer group ${
                selectedIndex === index && !selectedPhoto ? 'ring-2 ring-[#FF9500] ring-offset-2 ring-offset-background' : ''
              }`}
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
                          retryImage(mainPath);
                        }}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <img
                      src={mainPath}
                      alt={photo.title || "Gallery image"}
                      className={`relative w-full h-full transition-all duration-500 ${
                        isLoaded ? 'opacity-100 group-hover:scale-110' : 'opacity-0'
                      } object-cover`}
                      loading={index < 6 ? "eager" : "lazy"}
                      decoding={index < 6 ? "sync" : "async"}
                      fetchpriority={index < 6 ? "high" : "low"}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
        <DialogContent
          onEscapeKeyDown={() => {
            setSelectedPhoto(null);
            setTimeout(() => {
              photoRefs.current[selectedIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 100);
          }}
          onInteractOutside={() => {
            setSelectedPhoto(null);
            setTimeout(() => {
              photoRefs.current[selectedIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 100);
          }}
          className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-black/80 shadow-xl backdrop-blur-sm"
        >
          <VisuallyHidden>
            <h2>Image Preview</h2>
          </VisuallyHidden>

          {selectedPhoto && (
            <div
              className="relative w-full h-full flex items-center justify-center"
              onTouchStart={(e) => {
                const touch = e.touches[0];
                e.currentTarget.dataset.touchStartX = touch.clientX.toString();
              }}
              onTouchMove={(e) => {
                const touch = e.touches[0];
                const startX = Number(e.currentTarget.dataset.touchStartX);
                const currentX = touch.clientX;
                const diff = startX - currentX;

                if (Math.abs(diff) > 50) {
                  e.currentTarget.dataset.shouldSwipe = "true";
                }
              }}
              onTouchEnd={(e) => {
                if (e.currentTarget.dataset.shouldSwipe === "true") {
                  const startX = Number(e.currentTarget.dataset.touchStartX);
                  const endX = e.changedTouches[0].clientX;
                  const diff = startX - endX;

                  if (diff > 0) {
                    // Swipe left - next photo
                    const newIndex = (selectedIndex + 1) % photos.length;
                    setSelectedIndex(newIndex);
                    setSelectedPhoto(photos[newIndex]);
                  } else {
                    // Swipe right - previous photo
                    const newIndex = selectedIndex === 0 ? photos.length - 1 : selectedIndex - 1;
                    setSelectedIndex(newIndex);
                    setSelectedPhoto(photos[newIndex]);
                  }
                }
                e.currentTarget.dataset.touchStartX = "";
                e.currentTarget.dataset.shouldSwipe = "false";
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
                src={getImagePaths(selectedPhoto)[0]}
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