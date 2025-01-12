import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { Photo } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface PhotoGalleryProps {
  category?: string;
}

export default function PhotoGallery({ category }: PhotoGalleryProps) {
  const [page, setPage] = useState(1);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isFullImageLoaded, setIsFullImageLoaded] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const pageSize = 20;

  const { data: photos, isLoading } = useQuery<Photo[]>({
    queryKey: ["/api/photos", { category, page }],
  });

  // Save scroll position when opening a photo
  useEffect(() => {
    if (selectedPhoto && galleryRef.current) {
      setScrollPosition(window.scrollY);
    }
  }, [selectedPhoto]);

  // Reset full image loaded state when selected photo changes
  useEffect(() => {
    setIsFullImageLoaded(false);
  }, [selectedPhoto]);

  // Restore scroll position when closing photo
  useEffect(() => {
    if (!selectedPhoto && scrollPosition > 0) {
      window.scrollTo(0, scrollPosition);
    }
  }, [selectedPhoto, scrollPosition]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-full bg-muted animate-pulse h-64 rounded-lg" />
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedPhoto(photo)}
            className="relative overflow-hidden rounded-lg cursor-pointer"
          >
            <AspectRatio ratio={photo.imageUrl.includes("vertical") ? 2/3 : 4/3}>
              <img
                src={photo.thumbnailUrl || photo.imageUrl}
                alt={photo.title}
                className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
            </AspectRatio>
          </motion.div>
        ))}
      </div>

      {photos.length >= pageSize && (
        <div className="flex justify-center">
          <Button 
            variant="outline"
            onClick={() => setPage(p => p + 1)}
          >
            Load More
          </Button>
        </div>
      )}

      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] w-full h-full p-0">
          {selectedPhoto && (
            <div className="relative w-full h-full">
              {/* Thumbnail (shown immediately) */}
              <img
                src={selectedPhoto.thumbnailUrl || selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className={`object-contain w-full h-full transition-opacity duration-300 ${
                  isFullImageLoaded ? 'opacity-0' : 'opacity-100'
                }`}
                style={{ position: isFullImageLoaded ? 'absolute' : 'relative' }}
              />

              {/* Full resolution image (loads in background) */}
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className={`object-contain w-full h-full transition-opacity duration-300 ${
                  isFullImageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ position: 'absolute', top: 0, left: 0 }}
                onLoad={() => setIsFullImageLoaded(true)}
              />

              {/* Loading indicator */}
              {!isFullImageLoaded && (
                <div className="absolute top-4 right-4">
                  <Loader2 className="w-6 h-6 animate-spin text-white/80" />
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 to-background/0">
                <h3 className="text-lg font-semibold text-white">{selectedPhoto.title}</h3>
                {selectedPhoto.description && (
                  <p className="text-sm text-white/80">{selectedPhoto.description}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}