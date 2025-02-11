import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import type { Category } from "@/lib/types";
import SocialLinks from "@/components/SocialLinks";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/hooks/use-language";
import { Camera, Aperture, SplitSquareVertical, ArrowUp } from "lucide-react";

export default function Home() {
  const { language } = useLanguage();
  const { data: categories, isLoading: categoriesLoading } = useQuery<
    Category[]
  >({
    queryKey: ["/api/categories"],
  });

  const { t } = useTranslation();

  const excludedCategories = ["before_and_after", "facebook_posts_image"];
  const categoryOrder = [
    "Bat Mitsva",
    "Horses",
    "Family",
    "Kids",
    "Femininity",
    "Yoga",
    "Modeling",
    "Artful Nude",
  ];
  const allowedCategories = categoryOrder.filter(
    (cat) => !excludedCategories.includes(cat.toLowerCase()),
  );

  // Override the firstPhoto for specific categories
  // Category image configuration with ranges
  // Fixed images for each category with multiple path fallbacks
  const customImages: Record<string, { img: string; thumb: string }> = {
    "Bat Mitsva": {
      img: `/attached_assets/galleries/Bat_Mitsva/001.jpeg`,
      thumb: `/attached_assets/galleries/Bat_Mitsva/001-thumb.jpeg`,
    },
    Horses: {
      img: `/attached_assets/galleries/Horses/058.jpeg`,
      thumb: `/attached_assets/galleries/Horses/058-thumb.jpeg`,
    },
    Kids: {
      img: `/attached_assets/galleries/Kids/021.jpeg`,
      thumb: `/attached_assets/galleries/Kids/021-thumb.jpeg`,
    },
    Family: {
      img: `/attached_assets/galleries/Family/016.jpeg`,
      thumb: `/attached_assets/galleries/Family/016-thumb.jpeg`,
    },
    Femininity: {
      img: `/attached_assets/galleries/Femininity/014.jpeg`,
      thumb: `/attached_assets/galleries/Femininity/014-thumb.jpeg`,
    },
    Yoga: {
      img: `/attached_assets/galleries/Yoga/064.jpeg`,
      thumb: `/attached_assets/galleries/Yoga/064-thumb.jpeg`,
    },
    Modeling: {
      img: `/attached_assets/galleries/Modeling/010.jpeg`,
      thumb: `/attached_assets/galleries/Modeling/010-thumb.jpeg`,
    },
    "Artful Nude": {
      img: `/attached_assets/galleries/Artful_Nude/023.jpeg`,
      thumb: `/attached_assets/galleries/Artful_Nude/023-thumb.jpeg`,
    },
  };

  const customImagePaths = {
    "Bat Mitsva": {
      img: `/attached_assets/galleries/Bat_Mitsva/001.jpeg`,
      thumb: `/attached_assets/galleries/Bat_Mitsva/001-thumb.jpeg`,
    },
    Horses: {
      img: `/attached_assets/galleries/Horses/030.jpeg`,
      thumb: `/attached_assets/galleries/Horses/030-thumb.jpeg`,
    },
    Family: {
      img: `/attached_assets/galleries/Family/016.jpeg`,
      thumb: `/attached_assets/galleries/Family/016-thumb.jpeg`,
    },
    Kids: {
      img: `/attached_assets/galleries/Kids/014.jpeg`,
      thumb: `/attached_assets/galleries/Kids/014-thumb.jpeg`,
    },
    Femininity: {
      img: `/attached_assets/galleries/Femininity/001.jpeg`,
      thumb: `/attached_assets/galleries/Femininity/001-thumb.jpeg`,
    },
    Yoga: {
      img: `/attached_assets/galleries/Yoga/041.jpeg`,
      thumb: `/attached_assets/galleries/Yoga/041-thumb.jpeg`,
    },
    Modeling: {
      img: `/attached_assets/galleries/Modeling/001.jpeg`,
      thumb: `/attached_assets/galleries/Modeling/001-thumb.jpeg`,
    },
    "Artful Nude": {
      img: `/attached_assets/galleries/Artful_Nude/001.jpeg`,
      thumb: `/attached_assets/galleries/Artful_Nude/001-thumb.jpeg`,
    },
  };

  const getFallbackPaths = (categoryPath: string) => {
    return [
      `/attached_assets/galleries/${categoryPath}/016.jpeg`,
      `/assets/galleries/${categoryPath}/016.jpeg`,
      `/attached_assets/facebook_posts_image/${categoryPath}/1.jpg`,
    ];
  };

  const processedCategories = categories?.map((category) => {
    const categoryPath = category.name.replace(/\s+/g, "_");
    const defaultImage = `/api/photos/${encodeURIComponent(categoryPath)}/001.jpeg`;
    const defaultThumb = `/api/photos/${encodeURIComponent(categoryPath)}/001-thumb.jpeg`;

    const imageConfig = customImages[category.name] || {
      img: defaultImage,
      thumb: defaultThumb,
    };

    return {
      ...category,
      firstPhoto: {
        ...category.firstPhoto,
        imageUrl: imageConfig.img,
        thumbnailUrl: imageConfig.thumb,
      },
    };
  });

  const filteredCategories =
    processedCategories
      ?.filter((category) => categoryOrder.includes(category.name))
      .sort(
        (a, b) => categoryOrder.indexOf(a.name) - categoryOrder.indexOf(b.name),
      ) || [];

  useEffect(() => {
    // Preload the first category image
    if (filteredCategories?.[0]?.firstPhoto?.imageUrl) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = filteredCategories[0].firstPhoto.imageUrl;
      document.head.appendChild(link);
    }
  }, [filteredCategories]);

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
                  backgroundColor: ["#E67E00", "#E67E00", "#E67E00"],
                }}
                transition={{
                  duration: 0.8,
                  times: [0, 0.4, 1],
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                whileTap={{
                  scale: 0.9,
                  transition: {
                    duration: 0.3,
                    type: "spring",
                    stiffness: 400,
                    damping: 17,
                  },
                }}
                className="absolute inset-0 rounded-full -z-10 shadow-lg"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 30% 30%, rgb(255 255 255 / 0.1), transparent)",
                }}
              />
              <Link href="/before-and-after">
                <button className="p-4 rounded-full hover:bg-accent transition-colors text-white">
                  <FlipHorizontal className="w-6 h-6" />
                </button>
              </Link>
            </div>
            <div className="relative">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.05, 1],
                  opacity: [0, 0.8, 1],
                  backgroundColor: ["#E67E00", "#E67E00", "#E67E00"],
                }}
                transition={{
                  duration: 0.8,
                  times: [0, 0.4, 1],
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                whileTap={{
                  scale: 0.9,
                  transition: {
                    duration: 0.3,
                    type: "spring",
                    stiffness: 400,
                    damping: 17,
                  },
                }}
                className="absolute inset-0 rounded-full -z-10 shadow-lg"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 30% 30%, rgb(255 255 255 / 0.1), transparent)",
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
                  backgroundColor: ["#E67E00", "#E67E00", "#E67E00"],
                }}
                transition={{
                  duration: 0.8,
                  times: [0, 0.4, 1],
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                whileTap={{
                  scale: 0.9,
                  transition: {
                    duration: 0.3,
                    type: "spring",
                    stiffness: 400,
                    damping: 17,
                  },
                }}
                className="absolute inset-0 rounded-full -z-10 shadow-lg"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 30% 30%, rgb(255 255 255 / 0.1), transparent)",
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
            <h1 className="font-bold font-cormorant text-3xl md:text-5xl text-center tracking-wide">
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
      <section className="container mx-auto px-4 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
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
                            src={category.firstPhoto.imageUrl}
                            alt={category.name}
                            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                            decoding="async"
                            style={{
                              objectPosition: "center center",
                              WebkitBackfaceVisibility: "hidden",
                              WebkitTransform: "translate3d(0, 0, 0)",
                              opacity: "0",
                              background: "rgba(0,0,0,0.05)",
                              transition: "opacity 0.3s ease-in-out",
                            }}
                            onLoad={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.style.opacity = "1";
                              img.style.background = "transparent";
                              if (img.naturalHeight > img.naturalWidth) {
                                img.style.objectPosition = "center 50%";
                              }
                              // Clear retry count on successful load
                              delete img.dataset.retryCount;
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const retryCount = Number(
                                target.dataset.retryCount || "0",
                              );
                              const maxRetries = 3;
                              const categoryPath = category.name.replace(
                                /\s+/g,
                                "_",
                              );

                              if (retryCount < maxRetries) {
                                target.dataset.retryCount = String(
                                  retryCount + 1,
                                );
                                const paths = getFallbackPaths(categoryPath);
                                const nextPath = paths[retryCount];
                                if (nextPath) {
                                  setTimeout(() => {
                                    target.src = `${nextPath}?retry=${retryCount + 1}`;
                                  }, Math.min(retryCount * 1000, 3000));
                                }
                              }
                            }}
                            loading={
                              index === 0
                                ? "eager"
                                : index < 6
                                  ? "eager"
                                  : "lazy"
                            }
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            fetchpriority={index === 0 ? "high" : "auto"}
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
        <section className="container mx-auto px-4 pb-16 pt-6 text-center">
          <Link href="/contact">
            <Button className="bg-white hover:bg-gray-100 text-gray-800 text-lg px-8 py-6 border border-gray-300 shadow-sm hover:shadow-md transition-all">
              Contact Me
            </Button>
          </Link>
        </section>
      )}
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