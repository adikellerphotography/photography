import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import type { Photo } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import ShareDialog from "./ShareDialog";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface PhotoGalleryProps {
  category?: string;
}

export default function PhotoGallery({ category }: PhotoGalleryProps) {
  const queryClient = useQueryClient();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isFullImageLoaded, setIsFullImageLoaded] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const pageSize = 20;

  // Load liked photos from localStorage
  const [likedPhotos, setLikedPhotos] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('likedPhotos');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["/api/photos", { category }],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(`/api/photos?category=${encodeURIComponent(category || '')}&page=${pageParam}&pageSize=${pageSize}`);
      if (!response.ok) throw new Error('Failed to fetch photos');
      return response.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === pageSize ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1
  });

  // Get all photos from all pages
  const allPhotos = data?.pages.flat() || [];

  // Filter photos for favorites if needed
  const displayPhotos = category === "Favorites" 
    ? allPhotos.filter(photo => likedPhotos.has(photo.id))
    : allPhotos;

  // Like/unlike mutation
  const likeMutation = useMutation({
    mutationFn: async (photoId: number) => {
      const response = await fetch(`/api/photos/${photoId}/like`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to toggle like');
      return response.json();
    },
    onSuccess: (_, photoId) => {
      setLikedPhotos(prev => {
        const newSet = new Set(prev);
        if (newSet.has(photoId)) {
          newSet.delete(photoId);
        } else {
          newSet.add(photoId);
        }
        localStorage.setItem('likedPhotos', JSON.stringify(Array.from(newSet)));
        return newSet;
      });
      queryClient.invalidateQueries({ queryKey: ["/api/photos"] });
    }
  });

  const handleDoubleClick = async (photo: Photo) => {
    try {
      await likeMutation.mutateAsync(photo.id);
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 1000);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

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
      { rootMargin: '50px', threshold: 0.1 }
    );

    const imageElements = document.querySelectorAll('img[data-src]');
    imageElements.forEach(img => observer.observe(img));

    return () => observer.disconnect();
  }, [displayPhotos]);

  useEffect(() => {
    if (loaderRef.current && hasNextPage && !isFetchingNextPage) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            fetchNextPage();
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(loaderRef.current);
      return () => observer.disconnect();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const navigatePhotos = (direction: "next" | "prev") => {
    if (!displayPhotos.length) return;

    let newIndex = direction === "next" ? selectedIndex + 1 : selectedIndex - 1;

    if (newIndex < 0) {
      newIndex = displayPhotos.length - 1;
    } else if (newIndex >= displayPhotos.length) {
      newIndex = 0;
    }

    setSelectedIndex(newIndex);
    setSelectedPhoto(displayPhotos[newIndex]);
    setIsFullImageLoaded(false);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: pageSize }).map((_, i) => (
          <AspectRatio key={i} ratio={4/3}>
            <Skeleton className="w-full h-full" />
          </AspectRatio>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8" ref={galleryRef}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayPhotos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative group cursor-pointer"
            onClick={() => {
              setSelectedPhoto(photo);
              setSelectedIndex(index);
              setScrollPosition(window.scrollY);
            }}
          >
            <AspectRatio ratio={photo.imageUrl.includes("vertical") ? 2/3 : 4/3}>
              <div className="relative w-full h-full overflow-hidden bg-muted rounded-lg">
                {likedPhotos.has(photo.id) && (
                  <div className="absolute top-2 right-2 z-10">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  </div>
                )}
                <img
                  src={photo.thumbnailUrl || '/placeholder.jpg'}
                  data-src={photo.imageUrl}
                  alt={photo.title}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </AspectRatio>
          </motion.div>
        ))}
      </div>

      {(hasNextPage || isFetchingNextPage) && (
        <div ref={loaderRef} className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}

      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
          <DialogTitle className="sr-only">Photo View</DialogTitle>
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
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigatePhotos("next");
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>

              <AnimatePresence>
                {showHeart && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.3 }}
                    animate={{ opacity: [0, 1, 1, 0], scale: [0.3, 1.2, 1, 0.3] }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                  >
                    <Heart className="w-16 h-16 text-red-500 fill-red-500" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative w-full h-full">
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.title}
                  className="w-full h-full object-contain"
                  onLoad={() => setIsFullImageLoaded(true)}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}