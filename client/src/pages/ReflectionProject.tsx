
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/hooks/use-language";
import { useIsMobile } from "@/hooks/use-mobile";
import { translations } from "@/lib/translations";
import ImageCompare from "../components/ImageCompare";

interface ComparisonSet {
  id: number;
  name: string;
  oldAge: number;
  youngAge: number;
  beforeImage: string;
  afterImage: string;
  title: string;
}

const mockData: ComparisonSet[] = [
  {
    id: 1,
    name: "Effi",
    oldAge: 75,
    youngAge: 25,
    beforeImage: `/assets/1-2.jpg`,
    afterImage: `/assets/1-1.jpg`,
    title: "Effi's Reflection"
  },
  {
    id: 2,
    name: "George",
    oldAge: 75,
    youngAge: 21,
    beforeImage: `/assets/2-2.jpg`,
    afterImage: `/assets/2-1.jpg`,
    title: "George's Reflection"
  },
  {
    id: 3,
    name: "Shmarya",
    oldAge: 80,
    youngAge: 20,
    beforeImage: `/assets/3-2.jpg`,
    afterImage: `/assets/3-1.jpg`,
    title: "Shmarya's Reflection"
  }
];

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
        <div className={`text-lg text-muted-foreground mb-12 ${language === 'he' ? 'text-right' : ''}`}>
          <p>
            {language === 'he' ? translations.reflection.description.he : translations.reflection.description.en}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 container mx-auto">
          {mockData.map((comparison, index) => (
            <motion.div
              key={comparison.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              className="w-full"
            >
              <div className="mb-1 flex items-center justify-between px-6 py-2.5 bg-background/30 backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <div className="relative w-8 h-8">
                    <svg width="32" height="32" viewBox="0 0 32 32" className="text-muted-foreground">
                      <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2.5"/>
                      <path
                        d="M16 2 A 14 14 0 1 1 16 30 A 14 14 0 1 1 16 2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeDasharray="66"
                        strokeDashoffset="16.5"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-muted-foreground">
                      {comparison.oldAge}
                    </div>
                  </div>
                </div>
                <h3 className="text-lg tracking-wide text-center text-[#FF9500]">{comparison.name}</h3>
                <div className="flex items-center gap-1.5">
                  <div className="relative w-8 h-8">
                    <svg width="32" height="32" viewBox="0 0 32 32" className="text-muted-foreground">
                      <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2.5"/>
                      <path
                        d="M16 2 A 14 14 0 1 1 16 30 A 14 14 0 1 1 16 2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeDasharray="66"
                        strokeDashoffset="49.5"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-muted-foreground">
                      {comparison.youngAge}
                    </div>
                  </div>
                </div>
              </div>
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
