import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/hooks/use-language";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import type { Photo } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PhotoGalleryProps {
  category?: string;
}

const IMAGE_PATHS = {
  GALLERIES: '/assets/galleries'
};

export default function PhotoGallery({ category }: PhotoGalleryProps) {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isFullImageLoaded, setIsFullImageLoaded] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    console.log('PhotoGallery mounted with category:', category);
  }, [category]);

  const { data: photos = [], isLoading } = useQuery<Photo[]>({
    queryKey: ["/api/photos", category],
    queryFn: async () => {
      const response = await fetch(`/api/photos?category=${encodeURIComponent(category || '')}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching photos:', errorText);
        throw new Error(`Failed to fetch photos: ${errorText}`);
      }
      const data = await response.json();
      console.log('Received photos:', data.length);
      return data;
    },
    staleTime: 0,
    refetchOnWindowFocus: false
  });

  const getImagePath = (photo: Photo): string[] => {
    if (!photo?.category) return [];

    const id = String(photo.id).padStart(3, '0');
    const categoryPath = photo.category.replace(/\s+/g, '_');

    return [
      `${IMAGE_PATHS.GALLERIES}/${categoryPath}/${id}.jpeg`
    ];
  };

  const handleImageError = async (
    img: HTMLImageElement, 
    photo: Photo, 
    pathIndex: number = 0
  ) => {
    const paths = getImagePath(photo);
    const nextPath = paths[pathIndex + 1];

    if (nextPath && pathIndex < paths.length - 1) {
      console.log(`Trying next path for image ${photo.id}:`, nextPath);
      img.src = nextPath;
      img.dataset.pathIndex = String(pathIndex + 1);
    } else {
      console.error(`Failed to load image ${photo.id} after trying all paths`);
      img.style.opacity = '0.3';
      img.style.background = 'rgba(0,0,0,0.1)';
    }
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

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No photos found in this category</p>
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
              ease: [0.34, 1.56, 0.64, 1]
            }}
            onClick={() => {
              setSelectedPhoto(photo);
              setSelectedIndex(index);
              setScrollPosition(window.scrollY);
            }}
            className="relative overflow-hidden rounded-lg cursor-pointer group"
            data-photo-id={photo.id}
          >
            <AspectRatio ratio={4/3}>
              <div className="relative w-full h-full">
                <div className="absolute inset-0 animate-pulse bg-muted/10" />
                <img
                  src={getImagePath(photo)[0]}
                  alt={photo.title || ""}
                  className="relative w-full h-full transition-all duration-500 group-hover:scale-110 object-cover"
                  loading={index < 8 ? "eager" : "lazy"}
                  decoding={index < 8 ? "sync" : "async"}
                  data-path-index="0"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    const pathIndex = Number(img.dataset.pathIndex || 0);
                    handleImageError(img, photo, pathIndex);
                  }}
                  style={{
                    opacity: '0',
                    transition: 'opacity 0.3s ease-in-out'
                  }}
                  onLoad={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.opacity = '1';
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
                src={getImagePath(selectedPhoto)[0]}
                alt={selectedPhoto.title || ""}
                className="w-full h-full object-contain"
                loading="eager"
                data-path-index="0"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  const pathIndex = Number(img.dataset.pathIndex || 0);
                  handleImageError(img, selectedPhoto, pathIndex);
                }}
                onLoad={() => setIsFullImageLoaded(true)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}