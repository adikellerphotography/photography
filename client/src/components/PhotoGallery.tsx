import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useInfiniteQuery } from "@tanstack/react-query";
import type { Photo } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoGalleryProps {
  category?: string;
}

export default function PhotoGallery({ category }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isFullImageLoaded, setIsFullImageLoaded] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const pageSize = 20;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ["/api/photos", { category }],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(`/api/photos?category=${category}&page=${pageParam}&pageSize=${pageSize}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === pageSize ? allPages.length + 1 : undefined;
    },
  });

  // Combine all photos from all pages
  const photos = data?.pages.flat() || [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const likeMutation = useMutation({
    mutationFn: async (photoId: number) => {
      const response = await fetch(`/api/photos/${photoId}/like`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to like photo');
      }
      return response.json();
    },
  });

  // Save scroll position when opening a photo
  useEffect(() => {
    if (selectedPhoto && galleryRef.current) {
      setScrollPosition(window.scrollY);
    }
  }, [selectedPhoto]);

  // Reset states when selected photo changes
  useEffect(() => {
    setIsFullImageLoaded(false);
    setShowHeart(false);
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
        navigatePhotos("next");
      } else {
        navigatePhotos("prev");
      }
      setTouchStart(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  const handleDoubleClick = async (photo: Photo) => {
    setShowHeart(true);
    likeMutation.mutate(photo.id);
    setTimeout(() => setShowHeart(false), 1000);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: pageSize }).map((_, i) => (
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

      {/* Infinite scroll loader */}
      {(hasNextPage || isFetchingNextPage) && (
        <div 
          ref={loaderRef}
          className="flex justify-center py-8"
        >
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
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
            <div 
              className="relative w-full h-full"
              onDoubleClick={() => handleDoubleClick(selectedPhoto)}
            >
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

              {/* Heart animation on double click */}
              <AnimatePresence>
                {showHeart && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1.5 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
                  >
                    <Heart className={cn(
                      "w-16 h-16",
                      selectedPhoto.isLiked ? "text-white fill-current" : "text-white/50"
                    )} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Permanent heart indicator */}
              {selectedPhoto.isLiked && (
                <div className="absolute top-4 right-4 z-20">
                  <Heart className="w-6 h-6 text-white fill-current" />
                </div>
              )}

              {/* Loading state for full-size image */}
              {!isFullImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}

              {/* Thumbnail (shown immediately) */}
              <img
                src={selectedPhoto.thumbnailUrl || selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className={cn(
                  "object-contain w-full h-full transition-opacity duration-300",
                  isFullImageLoaded ? 'opacity-0' : 'opacity-100'
                )}
                style={{ position: isFullImageLoaded ? 'absolute' : 'relative' }}
              />

              {/* Full resolution image (loads in background) */}
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className={cn(
                  "object-contain w-full h-full transition-opacity duration-300",
                  isFullImageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                style={{ position: 'absolute', top: 0, left: 0 }}
                onLoad={() => setIsFullImageLoaded(true)}
              />

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