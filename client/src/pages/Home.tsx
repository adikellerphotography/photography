import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { Category } from "@/lib/types";
import SocialLinks from "@/components/SocialLinks";
import { useTranslation } from "@/hooks/use-translation";
import { useEffect } from "react";

export default function Home() {
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { t } = useTranslation();

  useEffect(() => {
    if (categories) {
      console.log('Categories loaded:', categories.map(c => ({
        name: c.name,
        thumbnailImage: c.thumbnailImage
      })));
    }
  }, [categories]);

  const getCategoryImage = (category: Category) => {
    // Replace spaces with underscores for the folder name
    const folderName = category.name.replace(/\s+/g, '_');
    // Use the thumbnailImage if available, otherwise fallback to default
    return category.thumbnailImage ? 
      `/assets/${folderName}/${category.thumbnailImage}` : 
      `/assets/${folderName}/1.jpeg`;
  };

  // Filter out the "before and after" category
  const displayCategories = categories?.filter(category => 
    category.name.toLowerCase() !== 'before and after'
  );

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative container mx-auto px-4 pt-16 pb-8 flex flex-col justify-center items-center"
        >
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold font-cormorant">
              {t("home.title")}
            </h1>
            <p className="text-lg">
              {t("home.subtitle")}
            </p>
            <SocialLinks />
          </div>
        </motion.div>
      </section>

      {/* Gallery Categories Section */}
      <section className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-semibold mb-6">{t("home.galleryTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayCategories?.map((category, index) => {
              const imageUrl = getCategoryImage(category);
              console.log(`Category ${category.name} image:`, imageUrl);

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Link href={`/gallery?category=${encodeURIComponent(category.name)}`}>
                    <Card className="cursor-pointer overflow-hidden">
                      <CardContent className="p-0">
                        <AspectRatio ratio={4/3}>
                          <div className="relative w-full h-full">
                            <img
                              src={imageUrl}
                              alt={t(`categories.${category.name}`)}
                              className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                              onError={(e) => {
                                console.error('Failed to load image:', imageUrl);
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = '/assets/placeholder-category.jpg';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent">
                              <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h3 className="text-xl font-semibold text-white">
                                  {t(`categories.${category.name}`)}
                                </h3>
                                {category.description && (
                                  <p className="text-sm text-white/80">
                                    {category.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </AspectRatio>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>
    </div>
  );
}