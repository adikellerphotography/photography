
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/hooks/use-language";
import { useIsMobile } from "@/hooks/use-mobile";
import { translations } from "@/lib/translations";
import ImageCompare from "../components/ImageCompare";

interface ComparisonSet {
  id: number;
  beforeImage: string;
  afterImage: string;
  title: string;
}

const mockData: ComparisonSet[] = Array.from({ length: 3 }, (_, i) => ({
  id: i + 1,
  beforeImage: `/assets/${i + 1}-2.jpg`,
  afterImage: `/assets/${i + 1}-1.jpg`,
  title: `Reflection ${i + 1}`
}));

export default function ReflectionProject() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const [visibleItems, setVisibleItems] = useState(6);
  const observerTarget = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-16"
      >
        <h1 className={`text-3xl font-bold mb-8 text-[#FF9500] ${language === 'he' ? 'text-right' : ''}`}>
          {language === 'he' ? translations.reflection.title.he : translations.reflection.title.en}
        </h1>
        <p className={`text-lg text-muted-foreground mb-12 ${language === 'he' ? 'text-right' : ''}`}>
          {language === 'he' ? translations.reflection.description.he : translations.reflection.description.en}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 container mx-auto">
          {mockData.map((comparison, index) => (
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
    </div>
  );
}
