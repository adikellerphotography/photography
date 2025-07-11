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
import { Camera, Aperture, SplitSquareVertical, ArrowUp, FlipHorizontal } from "lucide-react";

export default function Home() {
  const { language } = useLanguage();
  const { data: categories, isLoading: categoriesLoading } = useQuery<
    Category[]
  >({
    queryKey: ["/attached_assets/categories.json"],
    queryFn: async () => {
      const response = await fetch("/attached_assets/categories.json");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  const { t } = useTranslation();

  const excludedCategories = ["before_and_after", "facebook_posts_image"];
  const categoryOrder = [
    "Bat Mitzvah",
    "Horses",
    "Family",
    "Kids",
    "Femininity",
    "Yoga",
    "Modeling",
    "Intimate",
  ];
  const allowedCategories = categoryOrder.filter(
    (cat) => !excludedCategories.includes(cat.toLowerCase()),
  );

  // Override the firstPhoto for specific categories
  // Category image configuration with ranges
  // Fixed images for each category from galleries folder
  const customImages: Record<string, { img: string; thumb: string }> = {
    "Bat Mitzvah": {
      img: `/attached_assets/galleries/Bat_Mitzvah/001.jpeg`,
      thumb: `/attached_assets/galleries/Bat_Mitzvah/001-thumb.jpeg`,
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
    "Intimate": {
      img: `/attached_assets/galleries/Intimate/023.jpeg`,
      thumb: `/attached_assets/galleries/Intimate/023-thumb.jpeg`,
    },
  };

  // Fallback paths for images
  const getFallbackPaths = (categoryPath: string) => {
    return [
      `/attached_assets/galleries/${categoryPath}/016.jpeg`,
      `/assets/galleries/${categoryPath}/016.jpeg`,
      `/attached_assets/galleries/${categoryPath}/001.jpeg`,
    ];
  };

  const processedCategories = categories?.map((category) => {
    const categoryPath = category.name.replace(/\s+/g, "_");
    const defaultImage = `/attached_assets/galleries/${encodeURIComponent(categoryPath)}/001.jpeg`;
    const defaultThumb = `/attached_assets/galleries/${encodeURIComponent(categoryPath)}/001-thumb.jpeg`;

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
    <motion.div
      className="min-h-screen pt-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative container mx-auto px-4 pt-4 pb-8 flex flex-col justify-center items-center"
          >
            <div className="flex justify-center gap-12 mb-4">
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
                <Link href="/gallery?category=Bat%20Mitzvah">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
              {processedCategories?.map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{
                    duration: 0.2,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                >
                  <Link
                    href={`/gallery?category=${encodeURIComponent(category.name)}`}
                  >
                    <Card className="overflow-hidden cursor-pointer transition-shadow hover:shadow-lg dark:hover:shadow-zinc-800">
                      <CardContent className="p-0">
                        <div className="relative">
                          <AspectRatio ratio={4 / 3}>
                            <img
                              src={category.firstPhoto?.imageUrl}
                              alt={t(`categories.${category.name}`)}
                              className="w-full h-full object-cover"
                            />
                          </AspectRatio>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-lg font-semibold text-white">
                              {language === "he"
                                ? t(`categories.${category.name}`)
                                : category.name}
                            </h3>
                          </div>
                        </div>
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
    </motion.div>
  );
}