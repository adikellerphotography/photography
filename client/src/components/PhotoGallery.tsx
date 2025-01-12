import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { Photo } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface PhotoGalleryProps {
  category?: string;
}

export default function PhotoGallery({ category }: PhotoGalleryProps) {
  const [page, setPage] = useState(1);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isFullImageLoaded, setIsFullImageLoaded] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
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

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!photos || !selectedPhoto) return;

      if (e.key === "ArrowLeft") {
        navigatePhotos("prev");
      } else if (e.key === "ArrowRight") {
        navigatePhotos("next");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto, photos, selectedIndex]);

  const navigatePhotos = (direction: "next" | "prev") => {
    if (!photos) return;

    let newIndex = direction === "next" ? selectedIndex + 1 : selectedIndex - 1;

    // Handle wrapping
    if (newIndex < 0) {
      newIndex = photos.length - 1;
    } else if (newIndex >= photos.length) {
      newIndex = 0;
    }

    setSelectedIndex(newIndex);
    setSelectedPhoto(photos[newIndex]);
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !photos) return;

    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;

    // Threshold for swipe (50px)
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left -> next photo
        navigatePhotos("next");
      } else {
        // Swipe right -> previous photo
        navigatePhotos("prev");
      }
      setTouchStart(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

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
            onClick={() => {
              setSelectedPhoto(photo);
              setSelectedIndex(index);
            }}
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
        <DialogContent 
          className="max-w-[90vw] max-h-[90vh] w-full h-full p-0"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {selectedPhoto && (
            <div className="relative w-full h-full">
              {/* Navigation buttons */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigatePhotos("prev");
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigatePhotos("next");
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>

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