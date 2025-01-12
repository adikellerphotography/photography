import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { Photo } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface PhotoGalleryProps {
  category?: string;
}

export default function PhotoGallery({ category }: PhotoGalleryProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: photos, isLoading } = useQuery<Photo[]>({
    queryKey: ["/api/photos", category, page],
  });

  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="w-full bg-muted animate-pulse h-64 rounded-lg" />
      ))}
    </div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos?.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-lg"
          >
            <AspectRatio ratio={4/3}>
              <img
                src={photo.imageUrl}
                alt={photo.title}
                className="object-cover w-full h-full"
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
    </div>
  );
}
