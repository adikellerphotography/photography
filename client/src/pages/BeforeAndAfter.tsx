import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/hooks/use-language";
import { useIsMobile } from "@/hooks/use-mobile";
import ImageCompare from "../components/ImageCompare";

interface ComparisonSet {
  id: number;
  beforeImage: string;
  afterImage: string;
  title: string;
}

const mockData: ComparisonSet[] = Array.from({ length: 28 }, (_, i) => ({
  id: i + 1,
  beforeImage: `/assets/before_and_after/${i}-1 Large.jpeg`,
  afterImage: `/assets/before_and_after/${i}-2 Large.jpeg`,
  title: `Before & After ${i + 1}`
}));

export default function BeforeAndAfter() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const [visibleItems, setVisibleItems] = useState(6);

  const { data: comparisons = mockData, isLoading, error } = useQuery<ComparisonSet[]>({
    queryKey: ["/api/before-after"],
    initialData: mockData,
    retry: false
  });

  const loadMore = () => {
    setVisibleItems(prev => Math.min(prev + 6, comparisons.length));
  };

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

  const displayedComparisons = comparisons.slice(0, visibleItems);

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 container mx-auto">
          {displayedComparisons.map((comparison, index) => (
            <motion.div
              key={comparison.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              className="w-full aspect-[3/4]"
            >
              <ImageCompare
                beforeImage={comparison.beforeImage}
                afterImage={comparison.afterImage}
                priority={index === 0}
                isMobile={isMobile}
              />
            </motion.div>
          ))}
        </div>

        {visibleItems < comparisons.length && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMore}
              className="px-6 py-2 bg-[#FF9500] text-white rounded-lg hover:bg-[#FF9500]/90 transition-colors"
            >
              {t("common.loadMore")}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}