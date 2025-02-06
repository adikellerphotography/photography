import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/hooks/use-language";
import { LuCamera, LuLightbulb, LuImage, LuWand } from "react-icons/lu";
import { ArrowUp } from "lucide-react";
import { useState, useEffect } from "react";

const classes = [
  {
    id: 1,
    icon: LuCamera,
    title: "Practical Field Workshop",
    duration: "1-2 hours",
    price: "1 hour - 250 NIS | 2 hours - 450 NIS",
    topics: [
      "Location selection",
      "Shooting in light, shade, and backlight",
      "Working with shallow/narrow depth of field",
      "Using different lenses",
      "Creating emotion and interest in photos",
      "Solid background work",
      "Motion photography",
      "Using reflectors"
    ],
    bonus: "Rich set of Overlays including clouds, autumn leaves, water effects, butterflies, and more"
  },
  {
    id: 2,
    icon: LuLightbulb,
    title: "Lightroom",
    duration: "2 hours",
    price: "1 hour - 250 NIS | 2 hours - 450 NIS",
    topics: [
      "Importing RAW images",
      "Learning essential tools in Lightroom",
      "Complete photo editing process",
      "Subject/Sky detection (new feature)",
      "Copying edit settings between photos",
      "Structured photo workflow"
    ]
  },
  {
    id: 3,
    icon: LuImage,
    title: "Basic Photoshop",
    duration: "2 hours",
    price: "1 hour - 250 NIS | 2 hours - 450 NIS",
    topics: [
      "Transferring photos from Lightroom to Photoshop",
      "Learning key tools in Photoshop",
      "Working with layers",
      "Essential keyboard shortcuts",
      "Adding elements (Overlay and Brush)",
      "Structured photo workflow"
    ]
  },
  {
    id: 4,
    icon: LuWand,
    title: "Advanced Photoshop",
    duration: "2 hours",
    price: "1 hour - 250 NIS | 2 hours - 450 NIS",
    topics: [
      "Adding and editing clouds",
      "Body and face correction using Liquify",
      "Background detail removal techniques",
      "Professional face retouching",
      "Mirror effect technique",
      "Advanced lighting techniques",
      "Dodge and Burn technique",
      "Working with warm tones",
      "Creating water effects and reflections"
    ]
  }
];

export default function GuidingAndMentoring() {
  const { t } = useTranslation();
  const { language } = useLanguage();
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
    <div className="min-h-screen pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`container mx-auto px-4 py-16 ${language === 'he' ? 'rtl text-right !font-heebo' : 'ltr text-left'}`}
      >
        <h1 className="text-2xl font-bold mb-8 text-[#FF9500] text-center">
          {t("Photography") || "Photography & Image Editing Classes"}
        </h1>

        <div className="bg-card p-6 rounded-lg shadow-md mb-8 border border-white/30">
          <h2 className="text-xl font-semibold mb-4">{t("General") || "General Information"}</h2>
          <ul className="space-y-2 text-muted-foreground" dir={language === 'he' ? 'rtl' : 'ltr'}>
            <li>• {language === 'he' ? 'כל השיעורים הינם אחד על אחד' : 'All classes are one-on-one'}</li>
            <li>• {language === 'he' ? 'ההסברים מלווים בדוגמאות והדמיה על תמונות' : 'Instructions include examples and demonstrations on photos'}</li>
            <li>• {language === 'he' ? 'זמין לשאלות גם לאחר השיעורים' : 'Available for questions even after classes'}</li>
            <li>• {language === 'he' ? 'מומלץ להגיע עם מחשב נייד ומחברת' : 'Recommended to bring a laptop and notebook'}</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {classes.map((classItem) => (
            <motion.div
              key={classItem.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-white/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <classItem.icon className="w-8 h-8 text-[#FF9500]" />
                <div>
                  <h3 className="text-xl font-semibold">{t(`Class${classItem.id}`) || classItem.title}</h3>
                  <p className="text-sm text-muted-foreground">{classItem.duration}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-[#FF9500] font-semibold mb-1">{t("Price") || "Price"}</div>
                <p className="text-muted-foreground">{classItem.price}</p>
              </div>

              <div>
                <div className="text-[#FF9500] font-semibold mb-2">{t("Topics") || "Topics covered"}</div>
                <ul className="space-y-1">
                  {classItem.topics.map((topic, index) => (
                    <li key={index} className="text-sm text-muted-foreground">• {topic}</li>
                  ))}
                </ul>
              </div>

              {classItem.bonus && (
                <div className="mt-4">
                  <div className="text-[#FF9500] font-semibold mb-1">{t("Bonus") || "Bonus"}</div>
                  <p className="text-sm text-muted-foreground">{classItem.bonus}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
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