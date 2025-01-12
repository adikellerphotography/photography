import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { Photo } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface PhotoGalleryProps {
  category?: string;
}

export default function PhotoGallery({ category }: PhotoGalleryProps) {
  const [page, setPage] = useState(1);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const pageSize = 20;

  const { data: photos, isLoading } = useQuery<Photo[]>({
    queryKey: ["/api/photos", category, page],
  });

  // Save scroll position when opening a photo
  useEffect(() => {
    if (selectedPhoto && galleryRef.current) {
      setScrollPosition(window.scrollY);
    }
  }, [selectedPhoto]);

  // Restore scroll position when closing photo
  useEffect(() => {
    if (!selectedPhoto && scrollPosition > 0) {
      window.scrollTo(0, scrollPosition);
    }
  }, [selectedPhoto, scrollPosition]);

  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="w-full bg-muted animate-pulse h-64 rounded-lg" />
      ))}
    </div>;
  }

  return (
    <div className="space-y-8" ref={galleryRef}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos?.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedPhoto(photo)}
            className="relative overflow-hidden rounded-lg cursor-pointer"
          >
            <AspectRatio ratio={4/3}>
              <img
                src={photo.imageUrl}
                alt={photo.title}
                className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
            </AspectRatio>
          </motion.div>
        ))}
      </div>

      {photos && photos.length >= pageSize && (
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
        <DialogContent className="max-w-4xl w-full h-[80vh]">
          {selectedPhoto && (
            <div className="relative w-full h-full">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className="object-contain w-full h-full"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 to-background/0">
                <h3 className="text-lg font-semibold">{selectedPhoto.title}</h3>
                {selectedPhoto.description && (
                  <p className="text-sm text-muted-foreground">{selectedPhoto.description}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}