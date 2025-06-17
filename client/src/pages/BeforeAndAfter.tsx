import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/hooks/use-language";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowUp } from "lucide-react";
import ImageCompare from "../components/ImageCompare";

interface ComparisonSet {
  id: number;
  beforeImage: string;
  afterImage: string;
  title: string;
}

const mockData: ComparisonSet[] = Array.from({ length: 28 }, (_, i) => ({
  id: i + 1,
  beforeImage: `/photography/attached_assets/before_and_after/${i}-1 Large.jpeg`,
  afterImage: `/photography/attached_assets/before_and_after/${i}-2 Large.jpeg`,
  title: `Before & After ${i + 1}`
}));

export default function BeforeAndAfter() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const [visibleItems, setVisibleItems] = useState(6);
  const [scrollY, setScrollY] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const { data: comparisons = mockData, isLoading, error } = useQuery<ComparisonSet[]>({
    queryKey: ["/photography/attached_assets/before-after.json"],
    queryFn: async () => {
      const response = await fetch("/photography/attached_assets/before-after.json");
      if (!response.ok) throw new Error("Failed to fetch before-after data");
      return response.json();
    },
    initialData: mockData,
    retry: false
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleItems < comparisons.length) {
          setVisibleItems(prev => Math.min(prev + 6, comparisons.length));
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [visibleItems, comparisons.length]);

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

  const sortedComparisons = [...comparisons].sort((a, b) => {
    const aImg = new Image();
    const bImg = new Image();
    aImg.src = a.beforeImage;
    bImg.src = b.beforeImage;
    const aIsHorizontal = aImg.naturalWidth > aImg.naturalHeight;
    const bIsHorizontal = bImg.naturalWidth > bImg.naturalHeight;
    return aIsHorizontal === bIsHorizontal ? 0 : aIsHorizontal ? 1 : -1;
  });

  const displayedComparisons = sortedComparisons.slice(0, visibleItems);

  return (
    <div className="min-h-screen pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-16"
      >
        <h1 className={`text-2xl font-bold mb-8 text-[#FF9500] text-center`}>
          {t("beforeAfter.title")}
        </h1>
        <p className={`text-lg text-muted-foreground mb-12 ${language === 'he' ? 'text-right' : ''}`}>
          {t("beforeAfter.description")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 container mx-auto">
          {displayedComparisons.map((comparison, index) => (
            <motion.div
              key={comparison.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              className="w-full aspect-[4/3]"
            >
              <ImageCompare
                beforeImage={comparison.beforeImage}
                afterImage={comparison.afterImage}
                priority={index < (isMobile ? 2 : 6)}
                isMobile={isMobile}
              />
            </motion.div>
          ))}
        </div>
        <div ref={observerTarget} className="h-10 w-full" />
      </motion.div>
      
      <motion.button
        className={`fixed bottom-6 right-6 p-3 rounded-full bg-[#FF9500] text-black shadow-lg transition-all ${
          scrollY > 200 ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
        onClick={scrollToTop}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ArrowUp className="h-5 w-5" />
      </motion.button>
    </div>
  );
}