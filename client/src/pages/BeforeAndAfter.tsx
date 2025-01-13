import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import ImageCompare from "../components/ImageCompare";

interface ComparisonSet {
  id: number;
  beforeImage: string;
  afterImage: string;
  title: string;
}

export default function BeforeAndAfter() {
  const { t } = useTranslation();
  const { data: comparisons, isLoading } = useQuery<ComparisonSet[]>({
    queryKey: ["/api/before-after"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16">
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

  if (!comparisons?.length) {
    return (
      <div className="min-h-screen pt-16">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-3xl font-bold mb-8">{t("beforeAfter.title")}</h1>
          <p className="text-lg text-muted-foreground">
            {t("beforeAfter.noImages")}
          </p>
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
        <p className="text-lg text-muted-foreground mb-12">
          {t("beforeAfter.description")}
        </p>

        <div className="space-y-16">
          {comparisons.map((comparison) => (
            <motion.div
              key={comparison.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold">{comparison.title}</h2>
              <ImageCompare
                beforeImage={comparison.beforeImage}
                afterImage={comparison.afterImage}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}