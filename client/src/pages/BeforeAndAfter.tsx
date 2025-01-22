
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/hooks/use-language";
import ImageCompare from "../components/ImageCompare";

interface ComparisonSet {
  id: number;
  beforeImage: string;
  afterImage: string;
  title: string;
}

const mockData: ComparisonSet[] = Array.from({ length: 28 }, (_, i) => ({
  id: i + 1,
  beforeImage: `/api/photos/before_and_after/${i}-1 Large.jpeg`,
  afterImage: `/api/photos/before_and_after/${i}-2 Large.jpeg`,
  title: `Before & After ${i + 1}`
}));

export default function BeforeAndAfter() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [isIntersecting, setIsIntersecting] = useState<{[key: number]: boolean}>({});
  const { data: comparisons = mockData, isLoading, error } = useQuery<ComparisonSet[]>({
    queryKey: ["/api/before-after"],
    initialData: mockData,
    retry: false
  });

  useEffect(() => {
    // Preload first comparison set images
    if (comparisons[0]) {
      const preloadImages = [comparisons[0].beforeImage, comparisons[0].afterImage];
      preloadImages.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [comparisons]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-8">
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[16/9] bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Error loading before/after images:", error);
    return (
      <div className="min-h-screen pt-8">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-3xl font-bold mb-8">{t("beforeAfter.title")}</h1>
          <p className="text-lg text-muted-foreground">{t("beforeAfter.noImages")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-16"
      >
        <h1 className={`text-3xl font-bold mb-8 text-[#FF9500] ${language === 'he' ? 'text-right' : ''}`}>
          {t("beforeAfter.title")}
        </h1>
        <p className={`text-lg text-muted-foreground mb-12 ${language === 'he' ? 'text-right' : ''}`}>
          {t("beforeAfter.description")}
        </p>

        <div className="hidden md:grid grid-cols-2 gap-8 container mx-auto">
          {comparisons.map((comparison, index) => (
            <motion.div
              key={comparison.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "100px" }}
              onViewportEnter={() => setIsIntersecting(prev => ({...prev, [comparison.id]: true}))}
              className="w-full aspect-[3/4]"
            >
              <ImageCompare
                beforeImage={comparison.beforeImage}
                afterImage={comparison.afterImage}
                priority={index === 0}
                loading={index < 2 ? "eager" : "lazy"}
                shouldLoad={index < 4 || isIntersecting[comparison.id]}
              />
            </motion.div>
          ))}
        </div>
        <div className="md:hidden portrait:space-y-8 landscape:grid landscape:grid-cols-2 landscape:gap-8 max-w-4xl mx-auto">
          {comparisons.map((comparison, index) => (
            <motion.div
              key={comparison.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "100px" }}
              onViewportEnter={() => setIsIntersecting(prev => ({...prev, [comparison.id]: true}))}
              className="w-full h-full"
            >
              <div className="relative h-full">
                <ImageCompare
                  beforeImage={comparison.beforeImage}
                  afterImage={comparison.afterImage}
                  priority={index === 0}
                  loading={index < 2 ? "eager" : "lazy"}
                  shouldLoad={index < 4 || isIntersecting[comparison.id]}
                  className="!absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
