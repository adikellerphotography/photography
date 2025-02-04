import { useState, useRef } from "react";
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

  const { data: photos = [], isLoading } = useQuery<Photo[]>({
    queryKey: ["/api/photos", category],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/photos?category=${encodeURIComponent(category || '')}`);
        if (!response.ok) {
          throw new Error('Failed to fetch photos');
        }
        const data = await response.json();
        return data.map((photo: Photo) => ({
          ...photo,
          imageUrl: photo.imageUrl.startsWith('/assets/') ? photo.imageUrl : `/assets/${category}/${photo.imageUrl}`
        }));
      } catch (error) {
        console.error('Error fetching photos:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const getImagePath = (photo: Photo): string => {
    if (!photo?.imageUrl) return '';
    const categoryMap: Record<string, string> = {
      'Family': 'Family',
      'Horses': 'Horses', 
      'Kids': 'kids',
      'Yoga': 'Yoga',
      'Modeling': 'Modeling',
      'Femininity': 'Femininity',
      'Artful Nude': 'Artful_Nude',
      'Bat Mitsva': 'Bat_Mitsva'
    };
    const normalizedCategory = categoryMap[category || ''] || category;
    const paddedId = photo.id.toString().padStart(3, '0');
    return `/attached_assets/galleries/${normalizedCategory}/${paddedId}.jpeg`;
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
                <div className="absolute inset-0 animate-pulse bg-muted/10" />
                <img
                  src={getImagePath(photo)}
                  alt={photo.title || ""}
                  className="relative w-full h-full transition-all duration-500 group-hover:scale-110 object-cover"
                  loading={index < 8 ? "eager" : "lazy"}
                  decoding={index < 8 ? "sync" : "async"}
                  style={{
                    opacity: '0',
                    transition: 'opacity 0.3s ease-in-out',
                  }}
                  onLoad={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.opacity = '1';
                  }}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    const retryCount = Number(img.dataset.retryCount || 0);
                    if (retryCount < 3) {
                      img.dataset.retryCount = String(retryCount + 1);
                      setTimeout(() => {
                        img.src = getImagePath(photo);
                      }, 1000 * (retryCount + 1));
                    } else {
                      img.src = `/attached_assets/galleries/${category?.replace(/\s+/g, '_')}/${photo.imageUrl.split('/').pop()}`;
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