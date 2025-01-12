import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { Category } from "@/lib/types";
import SocialLinks from "@/components/SocialLinks";
import PhotoGallery from "@/components/PhotoGallery";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/hooks/use-language";

export default function Home() {
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { t } = useTranslation();
  const { language } = useLanguage();

  // Function to get category image based on category name
  const getCategoryImage = (categoryName: string) => {
    switch(categoryName.toLowerCase()) {
      case 'kids':
        return '/attached_assets/IMG_4704-Edit.jpg';
      default:
        return `/placeholder/${categoryName.toLowerCase()}.jpg`;
    }
  };

  return (
    <div className="min-h-screen" dir={language === "he" ? "rtl" : "ltr"}>
      {/* Hero Section */}
      <section className="relative min-h-screen">
        <div className="absolute inset-0">
          <img
            src="/attached_assets/M68A0863-Edit.jpg"
            alt="Bat Mitzva"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-full container mx-auto px-4 py-16 md:py-24 flex flex-col justify-center items-center text-white"
        >
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold font-cormorant">
              {t("home.title")}
            </h1>
            <p className="text-lg text-white/80">
              {t("home.subtitle")}
            </p>
            <SocialLinks />
          </div>
        </motion.div>
      </section>

      {/* Gallery Categories Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <h2 className="text-2xl font-semibold mb-8">{t("home.galleryTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories?.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Link href={`/gallery?category=${category.name}`}>
                  <Card className="cursor-pointer overflow-hidden">
                    <CardContent className="p-0">
                      <AspectRatio ratio={4/3}>
                        <div className="relative w-full h-full">
                          <img
                            src={getCategoryImage(category.name)}
                            alt={category.name}
                            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent">
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <h3 className="text-xl font-semibold text-white">
                                {category.name}
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
            ))}
          </div>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold mb-8">{t("home.featuredWork")}</h2>
        <PhotoGallery />
      </section>
    </div>
  );
}