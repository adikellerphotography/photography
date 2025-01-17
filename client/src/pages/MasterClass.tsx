
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/hooks/use-language";
import { LuCamera, LuLightbulb, LuImage, LuWand } from "react-icons/lu";

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
    price: "450 NIS",
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
    price: "450 NIS",
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
    price: "450 NIS",
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

export default function MasterClass() {
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <div className="min-h-screen pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`container mx-auto px-4 py-16 ${language === 'he' ? 'rtl text-right' : 'ltr text-left'}`}
      >
        <h1 className="text-3xl font-bold mb-8 text-[#FF9500]">
          {t("Photography") || "Photography & Image Editing Classes"}
        </h1>

        <div className="bg-card p-6 rounded-lg shadow-md mb-8 border border-white/30">
          <h2 className="text-xl font-semibold mb-4">{t("General") || "General Information"}</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>• All classes are one-on-one</li>
            <li>• Instructions include examples and demonstrations on photos</li>
            <li>• Available for questions even after classes</li>
            <li>• Recommended to bring a laptop and notebook</li>
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
    </div>
  );
}
