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

  const constructImagePath = (photo: Photo, isThumb = false): string => {
    if (!photo?.imageUrl) return '';
    const basePath = `/attached_assets/galleries/${category?.replace(/\s+/g, '_')}`;
    const fileName = photo.imageUrl;

    // Try different paths in sequence if image fails to load
    const paths = [
      `${basePath}/${fileName}`,
      `${basePath}/${fileName.replace('.jpeg', isThumb ? '-thumb.jpeg' : '.jpeg')}`,
      `/assets/galleries/${category?.replace(/\s+/g, '_')}/${fileName}`,
      `/public/assets/galleries/${category?.replace(/\s+/g, '_')}/${fileName}`
    ];

    return paths[0]; // Start with first path
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

    const path = constructImagePath(photo);
    const thumbPath = constructImagePath(photo, true);

    if (loadedImages.has(path) || failedImages.has(path)) return;

    const timestamp = Date.now();
    const retryCount = retryAttempts[path] || 0;
    const urlWithCache = `${path}?t=${timestamp}&r=${retryCount}`;
    const thumbUrlWithCache = `${thumbPath}?t=${timestamp}&r=${retryCount}`;

    try {
      const [img, thumbImg] = [new Image(), new Image()];
      imageCache.current[path] = img;

      // First load thumbnail
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          thumbImg.src = '';
          resolve(); // Don't reject on thumb timeout, continue to main image
        }, 5000);

        thumbImg.onload = () => {
          clearTimeout(timeoutId);
          setLoadedImages(prev => new Set(prev).add(thumbPath));
          resolve();
        };

        thumbImg.onerror = () => {
          clearTimeout(timeoutId);
          resolve(); // Continue even if thumb fails
        };

        thumbImg.src = thumbUrlWithCache;
      });

      // Then load main image
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          img.src = '';
          if (retryCount < 5) {
            setRetryAttempts(prev => ({ ...prev, [path]: retryCount + 1 }));
            reject(new Error('Timeout loading image'));
          } else {
            setFailedImages(prev => new Set(prev).add(path));
            reject(new Error(`Max retries reached for: ${path}`));
          }
        }, 20000);

        img.onload = () => {
          clearTimeout(timeoutId);
          setLoadedImages(prev => new Set(prev).add(path));
          resolve();
        };

        img.onerror = () => {
          clearTimeout(timeoutId);
          if (retryCount < 5) {
            setRetryAttempts(prev => ({ ...prev, [path]: retryCount + 1 }));
            // Try alternative path formats
            const altPaths = [
              path,
              path.replace('.jpeg', '.jpg'),
              `/assets/${photo.category.replace(/\s+/g, "_")}/${photo.imageUrl}`
            ];
            img.src = `${altPaths[retryCount % altPaths.length]}?t=${timestamp}&r=${retryCount}`;
          } else {
            setFailedImages(prev => new Set(prev).add(path));
            reject(new Error(`Max retries reached for: ${path}`));
          }
        };

        img.src = urlWithCache;
      });
    } catch (error) {
      console.error(`Error loading image ${path}:`, error);
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
    const photo = photos.find(p => constructImagePath(p) === path);
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
          const path = constructImagePath(photo);
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
                    <>
                      {!isLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted/10">
                          <div className="animate-spin">
                            <RefreshCw className="w-6 h-6 text-muted-foreground" />
                          </div>
                        </div>
                      )}
                      <img
                        src={constructImagePath(photo)}
                        alt={photo.title || "Gallery image"}
                        className={`relative w-full h-full transition-all duration-500 ${
                          isLoaded ? 'opacity-100 group-hover:scale-110' : 'opacity-0'
                        } object-cover`}
                        loading={index < 6 ? "eager" : "lazy"}
                        decoding={index < 6 ? "sync" : "async"}
                        fetchpriority={index < 6 ? "high" : "low"}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const retryCount = Number(target.dataset.retryCount || "0");
                          const maxRetries = 5;
                          const categoryPath = category?.replace(/\s+/g, '_');
                          const fileName = photo.imageUrl;

                          // Comprehensive path fallbacks with cache busting
                          const paths = [
                            `/attached_assets/galleries/${categoryPath}/${fileName}`,
                            `/attached_assets/galleries/${categoryPath}/${fileName.replace('.jpeg', '.jpg')}`,
                            `/attached_assets/galleries/${categoryPath}/${fileName.replace('.jpg', '.jpeg')}`,
                            `/attached_assets/facebook_posts_image/${categoryPath}/${fileName}`,
                            `/assets/galleries/${categoryPath}/${fileName}`
                          ].filter(Boolean);

                          if (retryCount < maxRetries) {
                            console.log(`Retrying image load (${retryCount + 1}/${maxRetries}):`, target.src);
                            target.dataset.retryCount = String(retryCount + 1);

                            const pathIndex = retryCount % paths.length;
                            const nextPath = paths[pathIndex];
                            const cacheBuster = `?v=${Date.now()}&r=${retryCount}`;

                            // Clear browser cache for this image
                            const img = new Image();
                            img.onload = () => {
                              target.src = `${nextPath}${cacheBuster}`;
                            };
                            img.onerror = () => {
                              setTimeout(() => {
                                target.src = `${nextPath}${cacheBuster}`;
                              }, Math.min(retryCount * 1000, 3000));
                            };
                            img.src = `${nextPath}${cacheBuster}`;
                          } else {
                            console.error("Failed to load image after all retries:", target.src);
                            target.onerror = null;
                            target.style.opacity = "0.7";
                            target.style.background = "rgba(0,0,0,0.1)";
                            target.dataset.loadFailed = "true";
                          }
                        }}
                      />
                    </>
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
          <VisuallyHidden>
            <h2>Image Preview</h2>
          </VisuallyHidden>

          {selectedPhoto && (
            <div className="relative w-full h-full flex items-center justify-center">
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
                src={constructImagePath(selectedPhoto)}
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