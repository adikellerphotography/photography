import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import type { Category } from "@/lib/types";
import SocialLinks from "@/components/SocialLinks";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/hooks/use-language";
import { useEffect } from "react";
import { Camera, Aperture, SplitSquareVertical } from "lucide-react";

export default function Home() {
  const { language } = useLanguage();
  const { data: categories, isLoading: categoriesLoading } = useQuery<
    Category[]
  >({
    queryKey: ["/api/categories"],
  });

  const { t } = useTranslation();

  const allowedCategories = [
    "Bat Mitsva",
    "Family",
    "Horses",
    "Kids",
    "Modeling",
    "Women",
    "Yoga",
  ];

  // Override the firstPhoto for specific categories
  const processedCategories = categories?.map((category) => {
    if (category.name === "Family") {
      return {
        ...category,
        firstPhoto: {
          ...category.firstPhoto,
          imageUrl: "/assets/Family/001.jpeg",
          thumbnailUrl: "/assets/Family/001-thumb.jpeg",
        },
      };
    }
    if (category.name === "Kids") {
      return {
        ...category,
        firstPhoto: {
          ...category.firstPhoto,
          imageUrl: "/assets/kids/011.jpeg",
          thumbnailUrl: "/assets/kids/011-thumb.jpeg",
        },
      };
    }
    if (category.name === "Women") {
      return {
        ...category,
        firstPhoto: {
          ...category.firstPhoto,
          imageUrl: "/assets/Women/006.jpeg",
          thumbnailUrl: "/assets/Women/006-thumb.jpeg",
        },
      };
    }
    if (category.name === "Yoga") {
      return {
        ...category,
        firstPhoto: {
          ...category.firstPhoto,
          imageUrl: "/assets/Yoga/001.jpeg",
          thumbnailUrl: "/assets/Yoga/001-thumb.jpeg",
        },
      };
    }
    if (category.name === "Bat Mitsva") {
      return {
        ...category,
        firstPhoto: {
          ...category.firstPhoto,
          imageUrl: "/assets/Bat_Mitsva/001.jpeg",
          thumbnailUrl: "/assets/Bat_Mitsva/001-thumb.jpeg",
        },
      };
    }
    if (category.name === "Modeling") {
      return {
        ...category,
        firstPhoto: {
          ...category.firstPhoto,
          imageUrl: "/assets/Modeling/004.jpeg",
          thumbnailUrl: "/assets/Modeling/004-thumb.jpeg",
        },
      };
    }
    if (category.name === "Horses") {
      return {
        ...category,
        firstPhoto: {
          ...category.firstPhoto,
          imageUrl: "/assets/Horses/015.jpeg",
          thumbnailUrl: "/assets/Horses/015-thumb.jpeg",
        },
      };
    }
    return category;
  });

  const filteredCategories =
    processedCategories?.filter((category) =>
      allowedCategories.includes(category.name),
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
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1.05, 1],
                  opacity: [0, 0.8, 1],
                  backgroundColor: ["#E67E00", "#E67E00", "#E67E00"]
                }}
                transition={{ 
                  duration: 0.8,
                  times: [0, 0.4, 1],
                  ease: [0.34, 1.56, 0.64, 1]
                }}
                whileTap={{
                  scale: 0.9,
                  transition: {
                    duration: 0.3,
                    type: "spring",
                    stiffness: 400,
                    damping: 17
                  }
                }}
                className="absolute inset-0 rounded-full -z-10 shadow-lg"
                style={{
                  backgroundImage: "radial-gradient(circle at 30% 30%, rgb(255 255 255 / 0.1), transparent)"
                }}
              />
              <Link href="/before-and-after">
                <button className="p-4 rounded-full hover:bg-accent transition-colors text-white">
                  <SplitSquareVertical className="w-6 h-6" />
                </button>
              </Link>
            </div>
            <div className="relative">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1.05, 1],
                  opacity: [0, 0.8, 1],
                  backgroundColor: ["#E67E00", "#E67E00", "#E67E00"]
                }}
                transition={{ 
                  duration: 0.8,
                  times: [0, 0.4, 1],
                  ease: [0.34, 1.56, 0.64, 1]
                }}
                whileTap={{
                  scale: 0.9,
                  transition: {
                    duration: 0.3,
                    type: "spring",
                    stiffness: 400,
                    damping: 17
                  }
                }}
                className="absolute inset-0 rounded-full -z-10 shadow-lg"
                style={{
                  backgroundImage: "radial-gradient(circle at 30% 30%, rgb(255 255 255 / 0.1), transparent)"
                }}
              />
              <Link href="/gallery">
                <button className="p-4 rounded-full hover:bg-accent transition-colors text-white">
                  <Camera className="w-6 h-6" />
                </button>
              </Link>
            </div>
            <div className="relative">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1.05, 1],
                  opacity: [0, 0.8, 1],
                  backgroundColor: ["#E67E00", "#E67E00", "#E67E00"]
                }}
                transition={{ 
                  duration: 0.8,
                  times: [0, 0.4, 1],
                  ease: [0.34, 1.56, 0.64, 1]
                }}
                whileTap={{
                  scale: 0.9,
                  transition: {
                    duration: 0.3,
                    type: "spring",
                    stiffness: 400,
                    damping: 17
                  }
                }}
                className="absolute inset-0 rounded-full -z-10 shadow-lg"
                style={{
                  backgroundImage: "radial-gradient(circle at 30% 30%, rgb(255 255 255 / 0.1), transparent)"
                }}
              />
              <Link href="/sessions">
                <button className="p-4 rounded-full hover:bg-accent transition-colors text-white">
                  <Aperture className="w-6 h-6" />
                </button>
              </Link>
            </div>
          </div>
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1
              className={`font-bold font-cormorant ${language === "he" ? "text-3xl md:text-5xl" : "text-4xl md:text-6xl"}`}
            >
              {t("home.title")}
            </h1>
            <p className="text-lg">
              <span className="text-gray-400">{t("home.subtitle")}</span>
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
          <h2 className="text-2xl font-semibold mb-6">
            {t("home.galleryTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mx-auto">
            {filteredCategories?.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    duration: 0.6,
                    delay: index * 0.15,
                    ease: "easeOut",
                  },
                }}
                viewport={{ once: true, margin: "-50px" }}
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
                            src={
                              category.firstPhoto?.imageUrl ||
                              `/assets/${category.name}/${category.name.toLowerCase()}-1.jpg`
                            }
                            alt={category.name}
                            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                            decoding="async"
                            style={{
                              objectPosition: "center center",
                              WebkitBackfaceVisibility: 'hidden',
                              WebkitTransform: 'translate3d(0, 0, 0)'
                            }}
                            onLoad={(e) => {
                              const img = e.target as HTMLImageElement;
                              if (img.naturalHeight > img.naturalWidth) {
                                img.style.objectPosition = "center 50%";
                              }
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const retryCount = Number(target.dataset.retryCount || 0);
                              const maxRetries = 3;
                              
                              if (retryCount < maxRetries) {
                                console.log(`Retrying category image load (${retryCount + 1}/${maxRetries}):`, target.src);
                                target.dataset.retryCount = String(retryCount + 1);
                                const cacheBuster = `?retry=${retryCount + 1}-${Date.now()}`;
                                target.src = target.src.split('?')[0] + cacheBuster;
                              } else {
                                console.error("Failed to load image after retries:", category.firstPhoto?.imageUrl);
                                target.onerror = null;
                                target.src = "/assets/placeholder-category.jpg";
                                target.style.opacity = '0.7';
                              }
                            }}
                            loading="lazy"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent">
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <h3 className="text-xl font-semibold text-white">
                                {category.name}
                              </h3>
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

      {/* Contact Button */}
      {!categoriesLoading && categories?.length > 0 && (
        <section className="container mx-auto px-4 pb-16 text-center">
          <Link href="/contact">
            <Button className="bg-white hover:bg-gray-100 text-gray-800 text-lg px-8 py-6 border border-gray-300 shadow-sm hover:shadow-md transition-all">
              Contact Me
            </Button>
          </Link>
        </section>
      )}
    </div>
  );
}