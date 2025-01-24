
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
        <p className={`text-lg text-muted-foreground mb-12 ${language === 'he' ? 'text-right' : ''}`}>
          {language === 'he' ? translations.reflection.description.he : translations.reflection.description.en}
        </p>

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
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF9500]">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <div className="text-xl font-light tracking-wider text-[#FF9500]">{comparison.oldAge}</div>
                </div>
                <h3 className="text-lg font-medium tracking-wide text-center">{comparison.name}</h3>
                <div className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF9500]">
                    <path d="M3 12c0-2.1 1.7-3.8 3.8-3.8h.2c2 0 3.7-1.4 4-3.4.3-2 2-3.6 4-3.8h.2c2.2 0 4 1.8 4 4 0-.5-.7.9-.8 1-.2.2-.3.4-.3.7v.2c0 .3.1.5.3.7l.8 1c0 2.2-1.8 4-4 4h-.2c-2 0-3.7 1.4-4 3.4-.3 2-2 3.6-4 3.8h-.2c-2.1 0-3.8-1.7-3.8-3.8"/>
                  </svg>
                  <div className="text-xl font-light tracking-wider text-[#FF9500]">{comparison.youngAge}</div>
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
