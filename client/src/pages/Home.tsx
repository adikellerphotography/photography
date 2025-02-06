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
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  const { t } = useTranslation();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const excludedCategories = ["before_and_after", "facebook_posts_image"];
  const categoryOrder = [
    "Bat Mitsva",
    "Horses",
    "Kids",
    "Femininity",
    "Yoga",
    "Modeling",
    "Artful Nude",
  ];

  const filteredCategories = categories
    ?.filter((category) => !excludedCategories.includes(category.name.toLowerCase()))
    .sort((a, b) => categoryOrder.indexOf(a.name) - categoryOrder.indexOf(b.name)) || [];

  return (
    <div className="min-h-screen">
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background/95 to-background/90">
        <div className="absolute inset-0 bg-[url('/attached_assets/black_background2.jpeg')] bg-cover bg-center opacity-20" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 container mx-auto px-4 text-center"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-cormorant mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#FF9500] to-[#FF5A00]"
          >
            {t("home.title")}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            {t("home.subtitle")}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center gap-6 mb-12"
          >
            <Link href="/before-and-after">
              <Button variant="ghost" size="lg" className="group relative overflow-hidden rounded-full bg-[#FF9500]/10 hover:bg-[#FF9500]/20">
                <span className="absolute inset-0 bg-gradient-to-r from-[#FF9500]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <SplitSquareVertical className="mr-2 h-5 w-5" />
                {language === 'he' ? 'לפני ואחרי' : 'Before & After'}
              </Button>
            </Link>

            <Link href="/gallery">
              <Button variant="ghost" size="lg" className="group relative overflow-hidden rounded-full bg-[#FF9500]/10 hover:bg-[#FF9500]/20">
                <span className="absolute inset-0 bg-gradient-to-r from-[#FF9500]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Camera className="mr-2 h-5 w-5" />
                {language === 'he' ? 'גלריה' : 'Gallery'}
              </Button>
            </Link>

            <Link href="/sessions">
              <Button variant="ghost" size="lg" className="group relative overflow-hidden rounded-full bg-[#FF9500]/10 hover:bg-[#FF9500]/20">
                <span className="absolute inset-0 bg-gradient-to-r from-[#FF9500]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Aperture className="mr-2 h-5 w-5" />
                {language === 'he' ? 'סדנאות' : 'Sessions'}
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <SocialLinks />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="animate-bounce">
            <ArrowUp className="h-6 w-6 text-muted-foreground" />
          </div>
        </motion.div>
      </section>

      <section className="py-20 bg-gradient-to-b from-background to-background/80">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                  transition: { delay: index * 0.1, duration: 0.5 }
                }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ scale: 1.02 }}
              >
                <Link href={`/gallery?category=${encodeURIComponent(category.name)}`}>
                  <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border border-white/10">
                    <CardContent className="p-0">
                      <AspectRatio ratio={4/3}>
                        <div className="relative w-full h-full group">
                          <img
                            src={category.firstPhoto?.imageUrl}
                            alt={category.name}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-100 group-hover:opacity-90 transition-opacity" />
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                          </div>
                        </div>
                      </AspectRatio>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <motion.button
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-[#FF9500] text-black shadow-lg transition-all ${
          scrollY > 200 ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
        onClick={scrollToTop}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          backgroundImage: "radial-gradient(circle at 30% 30%, rgb(255 255 255 / 0.1), transparent)"
        }}
      >
        <ArrowUp className="h-6 w-6" />
      </motion.button>
    </div>
  );
}