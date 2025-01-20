import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/hooks/use-language";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import type { Photo } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import ShareDialog from "./ShareDialog";

interface PhotoGalleryProps {
  category?: string;
}

export default function PhotoGallery({ category }: PhotoGalleryProps) {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isFullImageLoaded, setIsFullImageLoaded] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const galleryRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 20;

  const { data: photos = [], isLoading } = useQuery<Photo[]>({
    queryKey: ["/api/photos", category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      const response = await fetch(`/api/photos?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch photos");
      return response.json();
    },
  });

  // Log the category prop for debugging
  useEffect(() => {
    console.log('PhotoGallery mounted with category:', category);
  }, [category]);


  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error: infiniteError
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
      return lastPage.length > 0 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    maxPages: Math.ceil(71 / 20),
    staleTime: 0,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    if (infiniteError) {
      console.error('Error in PhotoGallery:', infiniteError);
    }
  }, [infiniteError]);

  const allPhotos = data?.pages.flat() || [];
  const filteredPhotos = allPhotos.filter(photo => 
    photo.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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


  const handleLike = async (photo: Photo) => {
    //Removed like functionality
  };

  // Removed favorites filter
  const displayPhotos = filteredPhotos;

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

    setIsFullImageLoaded(false);
    setTransitionDirection(direction);

    const newIndex = direction === "next" 
      ? (selectedIndex + 1) % photos.length 
      : selectedIndex === 0 ? photos.length - 1 : selectedIndex - 1;

    // Preload next/prev images
    const preloadIndex = direction === "next" 
      ? (newIndex + 1) % photos.length 
      : newIndex === 0 ? photos.length - 1 : newIndex - 1;

    new Image().src = photos[preloadIndex].imageUrl;

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
    //Removed double click like functionality
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

  const [transitionDirection, setTransitionDirection] = useState<"next" | "prev" | null>(null);
  const [isNextImageLoaded, setIsNextImageLoaded] = useState(false);

  const handleImageError = (imageUrl: string) => {
    setFailedImages(prev => new Set(prev).add(imageUrl));
    console.error(`Failed to load image after retries:`, imageUrl);
  };

  const getImagePath = (photo: Photo) => {
    // Handle special case for Bat Mitsva category
    const categoryPath = photo.category === 'Bat Mitsva' ? 'Bat_Mitsva' : photo.category;
    return `/assets/${categoryPath}/${String(photo.id).padStart(3, '0')}.jpeg`;
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
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"> {/* Changed grid to columns */}
        {displayPhotos?.map((photo, index) => (
          <motion.div
            key={`${photo.id}-${photo.imageUrl}`}
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
            <AspectRatio ratio={photo.imageUrl.includes("vertical") ? 2/3 : 4/3}>
              <div className="relative w-full h-full overflow-hidden bg-muted">

                <img
                  key={`${photo.id}-${photo.imageUrl}`}
                  src={getImagePath(photo)}
                  alt={photo.title || ""}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    console.error('Image load error:', img.src);
                    handleImageError(img.src);
                  }}
                  style={{
                    backgroundColor: '#f3f4f6',
                    minHeight: '200px'
                  }}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

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
        <DialogContent 
          className="max-w-[90vw] max-h-[90vh] w-full h-full p-0"
          onTouchStart={(e) => {
            e.stopPropagation();
            handleTouchStart(e);
          }}
          onTouchMove={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleTouchMove(e);
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            handleTouchEnd();
          }}
        >
          {selectedPhoto && (
            <div 
              className="relative w-full h-full"
              onDoubleClick={() => handleDoubleClick(selectedPhoto)}
            >
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


              <Button
                variant="outline"
                size="icon"
                className="absolute top-4 left-16 z-20 bg-background/80 backdrop-blur-sm"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = selectedPhoto.imageUrl;
                  link.download = 'photo.jpg';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </Button>
              <ShareDialog 
                imageUrl={selectedPhoto.imageUrl} 
                title={selectedPhoto.title}
              />

              <div className="relative w-full h-full overflow-hidden">
                <motion.div
                  key={selectedPhoto.id}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <img
                    src={getImagePath(selectedPhoto)}
                    alt=""
                    className="w-full h-full object-contain"
                    loading="eager"
                    onLoad={() => {
                      setIsFullImageLoaded(true);
                      setTransitionDirection(null);
                    }}
                  />
                </motion.div>
              </div>


            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}