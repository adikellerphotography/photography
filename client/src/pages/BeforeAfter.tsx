import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import ImageComparison from "@/components/ImageComparison";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/use-translation";

interface BeforeAfterImage {
  id: number;
  rawImage: string;
  editedImage: string;
  title: string;
}

export default function BeforeAfter() {
  const { t } = useTranslation();
  const [currentPosition, setCurrentPosition] = useState(50);

  const { data: images, isLoading } = useQuery<BeforeAfterImage[]>({
    queryKey: ["/api/before-after-images"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16">
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse space-y-8">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <Skeleton className="h-[60vh] w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-16"
      >
        <h1 className="text-3xl font-bold mb-8">
          {t("beforeAfter.title")}
        </h1>

        <div className="space-y-16">
          {images?.map((image) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <Card>
                <CardContent className="p-0">
                  <ImageComparison
                    beforeImage={image.rawImage}
                    afterImage={image.editedImage}
                    position={currentPosition}
                    onPositionChange={setCurrentPosition}
                  />
                </CardContent>
              </Card>
              {image.title && (
                <p className="text-lg text-center font-medium">
                  {image.title}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}