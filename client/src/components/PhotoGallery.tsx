import { FC, useState, useRef, useEffect, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Photo } from "@/lib/types";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface PhotoGalleryProps {
  category?: string;
  photos: Photo[];
}

const PhotoGallery: FC<PhotoGalleryProps> = ({ category, photos }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const galleryRef = useRef<HTMLDivElement>(null);
  const photoRefs = useRef<Array<HTMLDivElement | null>>([]);

  const getImagePaths = (photo: Photo): string[] => {
    if (!photo?.imageUrl) return [];
    const paths = [photo.imageUrl];
    if (photo.thumbnailUrl) {
      paths.unshift(photo.thumbnailUrl); // Try thumbnail first
    }
    return paths.map(path => 
      path.startsWith('http') || path.startsWith('/photography') ? path : `/photography${path}`
    );
  };

  const handleImageLoad = (photo: Photo) => {
    setLoadedImages(prev => new Set([...Array.from(prev), photo.imageUrl]));
    setFailedImages(prev => {
      const newSet = new Set(Array.from(prev));
      newSet.delete(photo.imageUrl);
      return newSet;
    });
  };

  const handleImageError = async (photo: Photo) => {
    if (!failedImages.has(photo.imageUrl)) {
      console.warn(`Failed to load image: ${photo.imageUrl}`);
      setFailedImages(prev => new Set([...Array.from(prev), photo.imageUrl]));
    }
  };

  return (
    <div 
      ref={galleryRef}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      {photos.map((photo, index) => {
        const paths = getImagePaths(photo);
        const isLoaded = loadedImages.has(photo.imageUrl);
        const hasFailed = failedImages.has(photo.imageUrl);

        return (
          <motion.div
            key={`${photo.id}-${index}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            className="relative group cursor-pointer"
            onClick={() => {
              setSelectedPhoto(photo);
              setSelectedIndex(index);
            }}
            ref={el => (photoRefs.current[index] = el)}
          >
            <div className="relative overflow-hidden rounded-lg bg-muted/30">
              <AspectRatio ratio={1.5}>
                {!isLoaded && !hasFailed && (
                  <div className="absolute inset-0 bg-muted/30 animate-pulse" />
                )}
                {paths.map((path, pathIndex) => (
                  <img
                    key={`${path}-${pathIndex}`}
                    src={path}
                    alt={photo.title || `Photo ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                      isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => handleImageLoad(photo)}
                    onError={() => handleImageError(photo)}
                    loading="lazy"
                  />
                ))}
              </AspectRatio>
            </div>
          </motion.div>
        );
      })}

      <Dialog
        open={selectedPhoto !== null}
        onOpenChange={(open: boolean) => !open && setSelectedPhoto(null)}
      >
        <DialogContent className="max-w-screen-lg w-[95vw] p-0 bg-transparent border-none">
          <div className="relative">
            {selectedPhoto && (
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title || 'Selected photo'}
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70"
              onClick={(e: MouseEvent) => {
                e.stopPropagation();
                if (selectedIndex > 0) {
                  setSelectedIndex(selectedIndex - 1);
                  setSelectedPhoto(photos[selectedIndex - 1]);
                }
              }}
              disabled={selectedIndex === 0}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70"
              onClick={(e: MouseEvent) => {
                e.stopPropagation();
                if (selectedIndex < photos.length - 1) {
                  setSelectedIndex(selectedIndex + 1);
                  setSelectedPhoto(photos[selectedIndex + 1]);
                }
              }}
              disabled={selectedIndex === photos.length - 1}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhotoGallery;