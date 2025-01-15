import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { Category } from "@/lib/types";
import SocialLinks from "@/components/SocialLinks";
import { useTranslation } from "@/hooks/use-translation";
import { useEffect } from "react";
import { Camera, Aperture, SplitSquareVertical } from "lucide-react";

export default function Home() {
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { t } = useTranslation();

  const allowedCategories = ["Bat Mitsva", "Family", "Women", "Kids", "Yoga", "Modeling"];

  // Override the firstPhoto for specific categories
  const processedCategories = categories?.map(category => {
    if (category.name === "Family") {
      return {
        ...category,
        firstPhoto: {
          ...category.firstPhoto,
          imageUrl: "/assets/Family/M68A9203-Edit Large.jpeg",
          thumbnailUrl: "/assets/Family/M68A9203-Edit Large-thumb.jpeg"
        }
      };
    }
    if (category.name === "Kids") {
      return {
        ...category,
        firstPhoto: {
          ...category.firstPhoto,
          imageUrl: "/assets/kids/IMG_5537-Edit-Edit Large.jpeg",
          thumbnailUrl: "/assets/kids/IMG_5537-Edit-Edit Large-thumb.jpeg"
        }
      };
    }
    if (category.name === "Women") {
      return {
        ...category,
        firstPhoto: {
          ...category.firstPhoto,
          imageUrl: "/assets/Women/IMG_5605-Edit Large.jpeg",
          thumbnailUrl: "/assets/Women/IMG_5605-Edit Large-thumb.jpeg"
        }
      };
    }
    if (category.name === "Yoga") {
      return {
        ...category,
        firstPhoto: {
          ...category.firstPhoto,
          imageUrl: "/assets/Yoga/IMG_6161-Edit Large.jpeg",
          thumbnailUrl: "/assets/Yoga/IMG_6161-Edit Large-thumb.jpeg"
        }
      };
    }
    if (category.name === "Bat Mitsva") {
      return {
        ...category,
        firstPhoto: {
          ...category.firstPhoto,
          imageUrl: "/assets/Bat_Mitsva/IMG_8705-Edit_5 Large.jpeg",
          thumbnailUrl: "/assets/Bat_Mitsva/IMG_8705-Edit_5 Large.jpeg"
        }
      };
    }
    if (category.name === "Modeling") {
      return {
        ...category,
        firstPhoto: {
          ...category.firstPhoto,
          imageUrl: "/assets/Modeling/M68A1663-Edit-2 Large.jpeg",
          thumbnailUrl: "/assets/Modeling/M68A1663-Edit-2 Large-thumb.jpeg"
        }
      };
    }
    return category;
  });

  const filteredCategories = processedCategories?.filter(category => 
    allowedCategories.includes(category.name)
  ) || [];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative container mx-auto px-4 pt-8 pb-8 flex flex-col justify-center items-center"
        >
          <div className="flex justify-center gap-12 mb-8">
            <div className="relative">
              <motion.div
                initial={{ backgroundColor: '#E67E00' }}
                animate={{ backgroundColor: ['#E67E00', '#733F00', '#E67E00'] }}
                transition={{ duration: 1.6, times: [0, 0.5, 1] }}
                className="absolute inset-0 rounded-full -z-10"
              />
              <Link href="/before-and-after">
                <button className="p-4 rounded-full hover:bg-accent transition-colors text-white">
                  <SplitSquareVertical className="w-6 h-6" />
                </button>
              </Link>
            </div>
            <div className="relative">
              <motion.div
                initial={{ backgroundColor: '#E67E00' }}
                animate={{ backgroundColor: ['#E67E00', '#733F00', '#E67E00'] }}
                transition={{ duration: 1.6, times: [0, 0.5, 1] }}
                className="absolute inset-0 rounded-full -z-10"
              />
              <Link href="/gallery">
                <button className="p-4 rounded-full hover:bg-accent transition-colors text-white">
                  <Camera className="w-6 h-6" />
                </button>
              </Link>
            </div>
            <div className="relative">
              <motion.div
                initial={{ backgroundColor: '#E67E00' }}
                animate={{ backgroundColor: ['#E67E00', '#733F00', '#E67E00'] }}
                transition={{ duration: 1.6, times: [0, 0.5, 1] }}
                className="absolute inset-0 rounded-full -z-10"
              />
              <Link href="/sessions">
                <button className="p-4 rounded-full hover:bg-accent transition-colors text-white">
                  <Aperture className="w-6 h-6" />
                </button>
              </Link>
            </div>
          </div>
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
            {filteredCategories?.map((category, index) => (
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
                            src={category.firstPhoto?.imageUrl || `/assets/${category.name}/${category.name.toLowerCase()}-1.jpg`}
                            alt={category.name}
                            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                            style={{
                              objectPosition: "center center",
                            }}
                            onLoad={(e) => {
                              const img = e.target as HTMLImageElement;
                              if (img.naturalHeight > img.naturalWidth) {
                                img.style.objectPosition = "center 80%";
                              }
                            }}
                            onError={(e) => {
                              console.error(
                                "Failed to load image:",
                                category.firstPhoto?.imageUrl
                              );
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = "/assets/placeholder-category.jpg";
                            }}
                            loading="lazy"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent">
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
    </div>
  );
}