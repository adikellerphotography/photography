import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useInfiniteQuery } from "@tanstack/react-query";
import type { Photo } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, ChevronLeft, ChevronRight, Heart, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import ShareDialog from "./ShareDialog";

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
  const [watermarkOptions] = useState({
    enabled: true,
    quality: 90
  });

  useEffect(() => {
    console.log('PhotoGallery mounted with category:', category);
  }, [category]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery({
    queryKey: ["/api/photos", { category }],
    queryFn: async ({ pageParam = 1 }) => {
      console.log('Fetching photos for category:', category, 'page:', pageParam);
      const response = await fetch(`/api/photos?category=${encodeURIComponent(category || '')}&page=${pageParam}&pageSize=${pageSize}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching photos:', errorText);
        throw new Error(`Failed to fetch photos: ${errorText}`);
      }
      const data: Photo[] = await response.json();
      console.log('Received photos:', data.length, 'First photo:', data[0]);
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === pageSize ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1
  });

  useEffect(() => {
    if (error) {
      console.error('Error in PhotoGallery:', error);
    }
  }, [error]);

  const photos = data?.pages.flat() || [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    const imageElements = document.querySelectorAll('img[data-src]');
    imageElements.forEach(img => observer.observe(img));

    return () => observer.disconnect();
  }, [photos]);

  useEffect(() => {
    const loaderObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      loaderObserver.observe(loaderRef.current);
    }

    return () => loaderObserver.disconnect();
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

  useEffect(() => {
    if (selectedPhoto) {
      const state = { photo: selectedPhoto, index: selectedIndex };
      window.history.pushState(state, '', window.location.pathname + window.location.search);
    }
  }, [selectedPhoto, selectedIndex]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.photo) {
        setSelectedPhoto(event.state.photo);
        setSelectedIndex(event.state.index);
      } else {
        setSelectedPhoto(null);
        setSelectedIndex(0);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    setIsFullImageLoaded(false);
    setShowHeart(false);
  }, [selectedPhoto]);

  useEffect(() => {
    if (!selectedPhoto && scrollPosition > 0) {
      window.scrollTo(0, scrollPosition);
    }
  }, [selectedPhoto, scrollPosition]);

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

    setTransitionDirection(direction);
    setIsFullImageLoaded(false);
    setIsNextImageLoaded(false);

    let newIndex = direction === "next" ? selectedIndex + 1 : selectedIndex - 1;

    if (newIndex < 0) {
      newIndex = photos.length - 1;
    } else if (newIndex >= photos.length) {
      newIndex = 0;
    }

    const newPhoto = photos[newIndex];
    setSelectedIndex(newIndex);
    setSelectedPhoto(newPhoto);

    const state = { photo: newPhoto, index: newIndex };
    window.history.pushState(state, '', window.location.pathname + window.location.search);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !photos) return;

    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;

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

  useEffect(() => {
    if (selectedPhoto && photos) {
      const nextIndex = (selectedIndex + 1) % photos.length;
      const prevIndex = selectedIndex === 0 ? photos.length - 1 : selectedIndex - 1;

      const nextImage = new Image();
      nextImage.src = photos[nextIndex].imageUrl;

      const prevImage = new Image();
      prevImage.src = photos[prevIndex].imageUrl;
    }
  }, [selectedPhoto, photos, selectedIndex]);

  let setTransitionDirection = (direction: "next" | "prev" | null) => {};
  let setIsNextImageLoaded = (loaded: boolean) => {};

  const handleDownload = async (photo: Photo) => {
    try {
      const response = await fetch(
        `/api/photos/${photo.id}/download?watermark=${watermarkOptions.enabled}&quality=${watermarkOptions.quality}`,
        { method: 'GET' }
      );

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${photo.title}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading photo:', error);
    }
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
            onClick={() => {
              setSelectedPhoto(photo);
              setSelectedIndex(index);
              setScrollPosition(window.scrollY);
            }}
            className="relative overflow-hidden rounded-lg cursor-pointer group"
          >
            <AspectRatio ratio={photo.imageUrl.includes("vertical") ? 2 / 3 : 4 / 3}>
              <div className="relative w-full h-full overflow-hidden bg-muted">
                <img
                  src={photo.thumbnailUrl || '/placeholder.jpg'}
                  data-src={photo.imageUrl}
                  alt=""
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  onError={(e) => {
                    console.error('Failed to load image:', photo.imageUrl);
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/placeholder.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
                  <p className="text-white text-sm font-medium truncate">
                    {photo.title}
                  </p>
                </div>
              </div>
            </AspectRatio>
          </motion.div>
        ))}
      </div>

      {(hasNextPage || isFetchingNextPage) && (
        <div
          ref={loaderRef}
          className="flex justify-center py-8"
        >
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] w-full h-full p-0" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
          {selectedPhoto && (
            <div className="relative w-full h-full" onDoubleClick={() => handleDoubleClick(selectedPhoto)}>
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

              <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                <ShareDialog
                  imageUrl={selectedPhoto.imageUrl}
                  title={selectedPhoto.title}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/50 hover:bg-black/70"
                  onClick={() => handleDownload(selectedPhoto)}
                >
                  <Download className="h-4 w-4 text-white" />
                </Button>
              </div>

              <AnimatePresence>
                {showHeart && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.3 }}
                    animate={{
                      opacity: [0, 0.8, 0.8, 0],
                      scale: [0.3, 1.2, 1, 0.3]
                    }}
                    transition={{
                      duration: 1,
                      times: [0, 0.2, 0.8, 1],
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                  >
                    <motion.div
                      animate={{
                        rotate: [0, -10, 10, 0],
                      }}
                      transition={{
                        duration: 0.5,
                        times: [0, 0.2, 0.8, 1],
                        ease: "easeInOut"
                      }}
                    >
                      <Heart className="w-12 h-12 text-white/90 stroke-[2] filter drop-shadow-lg" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {selectedPhoto.isLiked && (
                <div className="absolute top-4 right-4 z-20">
                  <Heart className="w-5 h-5 text-white fill-white stroke-[2]" />
                </div>
              )}


              <div className="relative w-full h-full overflow-hidden">
                <img
                  src={selectedPhoto.thumbnailUrl || selectedPhoto.imageUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{
                    opacity: isFullImageLoaded ? 0 : 1,
                    transition: 'opacity 0.3s ease-in-out'
                  }}
                />

                <img
                  src={selectedPhoto.imageUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{
                    opacity: isFullImageLoaded ? 1 : 0,
                    transition: 'opacity 0.3s ease-in-out'
                  }}
                  onLoad={() => {
                    setIsFullImageLoaded(true);
                    setTransitionDirection(null);
                  }}
                />
              </div>

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