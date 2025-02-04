import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { Photo } from "@/lib/types";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PhotoGalleryProps {
  category?: string;
}

const GALLERIES_PATH = '/attached_assets/galleries';

export default function PhotoGallery({ category }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isFullImageLoaded, setIsFullImageLoaded] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [loadedImages, setLoadedImages] = useState(new Set<string>());
  const [retryCount, setRetryCount] = useState({});
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;

  const { data: photos = [], isLoading, refetch } = useQuery<Photo[]>({
    queryKey: ["/api/photos", category],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/photos?category=${encodeURIComponent(category || '')}`);
        if (!response.ok) {
          throw new Error('Failed to fetch photos');
        }
        const data = await response.json();
        // Filter out photos that don't exist and map remaining ones
        const validPhotos = data.filter((photo: Photo) => photo && photo.imageUrl);
        const shuffledData = [...validPhotos].sort(() => Math.random() - 0.5);

        // Verify images exist by preloading them
        const verifiedPhotos = await Promise.all(
          shuffledData.map(async (photo: Photo) => {
            try {
              const fullPath = `/attached_assets/galleries/${category?.replace(/\s+/g, '_')}/${photo.imageUrl}`;
              const response = await fetch(fullPath, { method: 'HEAD' });
              if (response.ok) {
                return {
                  ...photo,
                  imageUrl: fullPath,
                  thumbnailUrl: fullPath.replace('.jpeg', '-thumb.jpeg')
                };
              }
              return null;
            } catch {
              return null;
            }
          })
        );

        return verifiedPhotos.filter(Boolean);
      } catch (error) {
        console.error('Error fetching photos:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  useEffect(() => {
    refetch();
  }, [category, refetch]);

  const getImagePath = (photo: Photo): string => {
    if (!photo?.imageUrl) return '';
    
    const categoryMap: Record<string, string> = {
      'Family': 'Family',
      'Horses': 'Horses',
      'Kids': 'Kids',
      'Yoga': 'Yoga',
      'Modeling': 'Modeling',
      'Femininity': 'Femininity',
      'Artful Nude': 'Artful_Nude',
      'Bat Mitsva': 'Bat_Mitsva'
    };

    const folder = categoryMap[photo.category] || photo.category.replace(/\s+/g, '_');
    return `/attached_assets/galleries/${folder}/${photo.imageUrl}`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative overflow-hidden rounded-lg"
          >
            <AspectRatio ratio={1.5}>
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
        {photos.map((photo, index) => (
          <motion.div
            key={`${photo.id}-${index}`}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: Math.min(index * 0.1, 1),
              ease: [0.34, 1.56, 0.64, 1],
            }}
            onClick={() => {
              setSelectedPhoto(photo);
              setSelectedIndex(index);
            }}
            className="relative overflow-hidden rounded-lg cursor-pointer group"
          >
            <AspectRatio ratio={4/3}>
              <div className="relative w-full h-full">
                  {!loadedImages.has(getImagePath(photo)) && (
                    <div className="absolute inset-0 bg-muted/10 animate-pulse" />
                  )}
                  <img
                    src={getImagePath(photo)}
                    alt={photo.title || ""}
                    className={`relative w-full h-full transition-all duration-500 group-hover:scale-110 object-cover ${
                      loadedImages.has(getImagePath(photo)) ? 'opacity-100' : 'opacity-0'
                    }`}
                    loading="eager"
                    decoding="async"
                    fetchpriority={index < 12 ? "high" : "auto"}
                    style={{
                      transition: 'opacity 0.3s ease-in-out',
                    }}
                    onLoad={(e) => {
                      const img = e.target as HTMLImageElement;
                      setLoadedImages(prev => new Set([...prev, img.src]));
                      if (img.naturalHeight > img.naturalWidth) {
                        img.style.objectPosition = "center 50%";
                      }
                    }}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      const currentRetries = retryCount[img.src] || 0;

                      if (currentRetries < MAX_RETRIES) {
                        setRetryCount(prev => ({
                          ...prev,
                          [img.src]: currentRetries + 1
                        }));

                        setTimeout(() => {
                          const timestamp = Date.now();
                          img.src = `${img.src.split('?')[0]}?retry=${currentRetries + 1}&t=${timestamp}`;
                        }, RETRY_DELAY * (currentRetries + 1));
                      } else {
                        // Try alternative format after all retries fail
                        const altPath = `/attached_assets/galleries/${category}/${photo.imageUrl.split('/').pop()}`;
                        if (img.src !== altPath) {
                          img.src = altPath;
                        }
                      }
                    }}
                  />
                </div>
            </AspectRatio>
          </motion.div>
        ))}
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
                  const newIndex =
                    selectedIndex === 0 ? photos.length - 1 : selectedIndex - 1;
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
                src={getImagePath(selectedPhoto)}
                alt={selectedPhoto.title || ""}
                className="w-full h-full object-contain"
                loading="eager"
                onLoad={() => setIsFullImageLoaded(true)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}