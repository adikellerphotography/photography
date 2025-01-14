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
      console.log(
        "Categories loaded:",
        categories.map((c) => ({
          name: c.name,
          firstPhoto: c.firstPhoto,
        })),
      );
    }
  }, [categories]);

  const getCategoryImage = (categoryName: string) => {
    const imageMap: Record<string, string> = {
      Bat_Mitsva: "/assets/Bat_Mitsva/IMG_8613-Edit Large.jpeg",
      Family: "/assets/Family/IMG_3472-Edit Large.jpeg",
      Events: "/assets/Events/events-coverage.jpg",
      Portraits: "/assets/Portraits/portrait-session.jpg",
      Nature: "/assets/Nature/nature-photography.jpg",
      Wedding: "/assets/Wedding/wedding-photography.jpg",
      Modeling: "/assets/Modeling/M68A0065-Edit Large.jpeg",
      Feminine: "/assets/Feminine/IMG_0095-Edit-Edit Large.jpeg",
      Yoga: "/assets/Yoga/IMG_1350-Edit-Edit Large.jpeg",
      Kids: "/assets/kids/kids-1.jpg",
      Horses: "/assets/Horses/horse-1.jpg",
    };

    const fallbackImage = "/assets/placeholder-category.jpg";
    console.log(
      "Getting image for category:",
      categoryName,
      imageMap[categoryName] || fallbackImage,
    );
    return imageMap[categoryName] || fallbackImage;
  };

  const filteredCategories = categories?.filter((category) => {
    const excludedCategories = ["before and after"];
    if (excludedCategories.includes(category.name.toLowerCase())) {
      return false;
    }

    try {
      return !!t(`categories.${category.name}`);
    } catch {
      console.log(`No translation found for category: ${category.name}`);
      return false;
    }
  });

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
            <p className="text-lg">{t("home.subtitle")}</p>
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
          <h2 className="text-2xl font-semibold mb-6">
            {t("home.galleryTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories?.map((category, index) => {
              const imageUrl =
                category.firstPhoto?.imageUrl ||
                getCategoryImage(category.name);
              console.log(`Category ${category.name} image:`, imageUrl);

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Link
                    href={`/gallery?category=${encodeURIComponent(category.name)}`}
                  >
                    <Card className="cursor-pointer overflow-hidden">
                      <CardContent className="p-0">
                        <AspectRatio ratio={4 / 3} className="bg-muted">
                          <div className="relative w-full h-full">
                            <img
                              src={imageUrl}
                              alt={t(`categories.${category.name}`)}
                              className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                              style={{
                                objectPosition: "center center",
                              }}
                              onLoad={(e) => {
                                const img = e.target as HTMLImageElement;
                                if (img.naturalHeight > img.naturalWidth) {
                                  img.style.objectPosition = "center 20%";
                                }
                              }}
                              onError={(e) => {
                                console.error(
                                  "Failed to load image:",
                                  imageUrl,
                                );
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = "/assets/placeholder-category.jpg";
                              }}
                              loading="lazy"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
