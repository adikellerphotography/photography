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

  // Log the category prop for debugging
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
      // Shuffle the array using Fisher-Yates algorithm
      const shuffled = [...data];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      console.log('Received photos:', shuffled.length);
      return shuffled;
    },
    staleTime: 0,
    refetchOnWindowFocus: false
  });

  const filteredPhotos = photos.filter(photo => 
    photo.title?.toLowerCase().includes(searchQuery.toLowerCase())
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




  const handleLike = async (photo: Photo) => {
    //Removed like functionality
  };

  // Removed favorites filter
  const displayPhotos = filteredPhotos;

  useEffect(() => {
    if (selectedPhoto) {
      // Push the gallery state first
      window.history.pushState({ isGalleryView: true }, '', window.location.pathname + window.location.search);
      // Then push the photo state
      window.history.pushState(
        { photo: selectedPhoto, index: selectedIndex, isPhotoView: true },
        '',
        window.location.pathname + window.location.search
      );
    }
  }, [selectedPhoto]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (!event.state || event.state.isGalleryView) {
        const imageElement = document.querySelector(`[data-photo-id="${selectedPhoto?.id}"]`);
        if (imageElement) {
          imageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          imageElement.classList.add('highlight-viewed');
          setTimeout(() => {
            imageElement.classList.remove('highlight-viewed');
          }, 1000);
        }
        setSelectedPhoto(null);
        setSelectedIndex(0);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedPhoto]);

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

    // Replace the current state instead of pushing a new one
    const state = { photo: newPhoto, index: newIndex, isGalleryView: false };
    window.history.replaceState(state, '', window.location.pathname + window.location.search);
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

  const categoryMappings: Record<string, string> = {
    'Bat Mitsva': 'Bat_Mitsva',
    'Kids': 'kids',
    'Family': 'Family',
    'Horses': 'Horses',
    'Modeling': 'Modeling',
    'Women': 'Women',
    'Yoga': 'Yoga',
    'Artful Nude': 'Artful_Nude',
    'Femininity': 'Femininity'
  };

  const imageStrategies = [
    (p: Photo) => `/assets/galleries/${categoryMappings[p.category] || p.category}/${String(p.id).padStart(3, '0')}.jpeg`,
    (p: Photo) => `/assets/galleries/${categoryMappings[p.category] || p.category}/${p.id}.jpeg`,
    (p: Photo) => `/assets/galleries/${p.category.replace(/\s+/g, '_')}/${String(p.id).padStart(3, '0')}.jpeg`
  ];

  const getImagePath = (photo: Photo, attempt = 0) => {
    if (!photo || !photo.category) {
      console.error('Invalid photo object:', photo);
      return '';
    }
    return imageStrategies[attempt % imageStrategies.length](photo);
  };

  const strategies = [
    (photo: Photo) => `/assets/${photo.category}/${String(photo.id).padStart(3, '0')}.jpeg`,
    (photo: Photo) => `/assets/facebook_posts_image/${photo.category.toLowerCase()}/${photo.id}.jpg`,
    (photo: Photo) => `/assets/${photo.category.replace(/\s+/g, '_')}/${photo.id}.jpeg`,
    (photo: Photo) => `/assets/${photo.category.replace(/\s+/g, '_')}/${String(photo.id).padStart(3, '0')}.jpeg`
  ];

  const handleImageError = (photo: Photo, img: HTMLImageElement) => {
    const retryCount = Number(img.dataset.retryCount || '0');
    const maxRetries = imageStrategies.length;

    if (retryCount < maxRetries) {
      console.log(`Retrying image load (${retryCount + 1}/${maxRetries}):`, img.src);
      img.dataset.retryCount = String(retryCount + 1);

      // Progressive delay with each retry
      setTimeout(() => {
        const nextPath = getImagePath(photo, retryCount + 1);
        if (nextPath !== img.src) {
          img.src = nextPath;
        } else {
          // Skip duplicate path attempts
          handleImageError(photo, img);
        }
      }, Math.min(retryCount * 500, 2000));
    } else {
      console.error('Failed to load image after all retries:', img.src);
      img.style.opacity = '0.3';
      img.style.backgroundColor = 'rgba(0,0,0,0.1)';

      // Final fallback to thumbnails
      const thumbPaths = [
        photo.thumbnailUrl,
        img.src.replace('.jpeg', '-thumb.jpeg'),
        img.src.replace('.jpg', '-thumb.jpg')
      ];

      // Try each thumbnail path
      const tryNextThumb = (index = 0) => {
        if (index >= thumbPaths.length) return;
        const thumbPath = thumbPaths[index];
        if (!thumbPath) {
          tryNextThumb(index + 1);
          return;
        }
        img.src = thumbPath;
        img.onerror = () => tryNextThumb(index + 1);
      };

      tryNextThumb();
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
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-background/50"> {/* Changed grid to columns */}
        {displayPhotos?.map((photo, index) => (
          <motion.div
            key={`${photo.id}-${photo.imageUrl}`}
            initial={{ opacity: 0, scale: 0.97, backgroundColor: 'var(--background)' }}
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
              // Preload next few images
              const preloadCount = 3;
              for (let i = 1; i <= preloadCount; i++) {
                const nextIndex = (index + i) % displayPhotos.length;
                const nextPhoto = displayPhotos[nextIndex];
                if (nextPhoto) {
                  const img = new Image();
                  img.src = getImagePath(nextPhoto);
                }
              }
            }}
            className="relative overflow-hidden rounded-lg cursor-pointer group"
            data-photo-id={photo.id}
          >
            <AspectRatio ratio={photo.imageUrl.includes("vertical") ? 2/3 : 4/3}>
              <div className="relative w-full h-full overflow-hidden bg-background/50 backdrop-blur-sm">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background/80 to-background/40">
                  <div className="relative w-full h-full">
                    {/* Shimmer loading effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-background/5 via-background/10 to-background/5 animate-shimmer" />

                    {/* Low quality image placeholder */}
                    <img
                      src={`${getImagePath(photo).replace('.jpeg', '-thumb.jpeg')}`}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover blur-sm scale-105"
                      loading="eager"
                      decoding="async"
                    />

                    {/* Main image */}
                    <img
                        key={`${photo.id}-${photo.imageUrl}`}
                        src={getImagePath(photo)}
                        alt={photo.title || ""}
                        className="relative w-full h-full transition-all duration-500 group-hover:scale-110 object-cover"
                        loading={index < 8 ? "eager" : "lazy"}
                        decoding={index < 8 ? "sync" : "async"}
                        fetchpriority={index < 4 ? "high" : "auto"}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        onLoad={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.opacity = '1';
                          img.style.backgroundColor = 'transparent';
                        }}
                        onError={(e) => handleImageError(photo, e.target as HTMLImageElement)}
                        style={{
                          opacity: '0',
                          backgroundColor: 'transparent',
                          objectFit: 'cover',
                          objectPosition: 'center',
                          WebkitBackfaceVisibility: 'hidden',
                          WebkitTransform: 'translate3d(0, 0, 0)',
                          WebkitPerspective: '1000px',
                          WebkitTransformStyle: 'preserve-3d',
                          transition: 'opacity 0.5s ease-in-out'
                        }}
                      />
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              </div>
            </AspectRatio>
          </motion.div>
        ))}
      </div>

      <Dialog 
        open={!!selectedPhoto} 
        onOpenChange={(open) => {
          if (!open) {
            // Find the element that matches the current photo
            const imageElement = document.querySelector(`[data-photo-id="${selectedPhoto?.id}"]`);
            if (imageElement) {
              // Add highlight animation
              imageElement.classList.add('highlight-viewed');
              // Remove class after animation completes
              setTimeout(() => {
                imageElement.classList.remove('highlight-viewed');
              }, 1000);
            }
            setSelectedPhoto(null);
          }
        }}
      >
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
                    onError={(e) => handleImageError(selectedPhoto, e.target as HTMLImageElement)}
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