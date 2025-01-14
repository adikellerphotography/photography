import { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";

interface SessionGroup {
  name: string;
  links: { title: string; url: string }[];
}

interface Preview {
  image: string;
  link: string;
}

const sessionGroups: SessionGroup[] = [
  {
    name: "Bat Mitzva",
    links: [
      { title: "Bat Mitzva Session 1", url: "/assets/Bat_Mitsva/M68A0288-Edit Large.jpeg" },
      { title: "Bat Mitzva Session 2", url: "/assets/Bat_Mitsva/M68A0460-Edit-2 Large.jpeg" },
      { title: "Bat Mitzva Session 3", url: "/assets/Bat_Mitsva/M68A0544-Edit Large.jpeg" },
      { title: "Bat Mitzva Session 4", url: "/assets/Bat_Mitsva/M68A0863-Edit Large.jpeg" },
      { title: "Bat Mitzva Session 5", url: "/assets/Bat_Mitsva/M68A1113-Edit Large.jpeg" },
    ]
  },
  {
    name: "Women",
    links: [
      { title: "Women Session 1", url: "/assets/Women/IMG_0095-Edit-Edit Large.jpeg" },
      { title: "Women Session 2", url: "/assets/Women/IMG_0858-Edit-Edit-2 Large.jpeg" },
      { title: "Women Session 3", url: "/assets/Women/IMG_5246-Edit Large.jpeg" },
      { title: "Women Session 4", url: "/assets/Women/IMG_5444-Edit Large.jpeg" },
      { title: "Women Session 5", url: "/assets/Women/IMG_5605-Edit Large.jpeg" },
    ]
  },
  {
    name: "Yoga",
    links: [
      { title: "Yoga Session 1", url: "/assets/Yoga/IMG_1350-Edit-Edit Large.jpeg" },
      { title: "Yoga Session 2", url: "/assets/Yoga/IMG_1482-Edit Large.jpeg" },
      { title: "Yoga Session 3", url: "/assets/Yoga/IMG_1573-Edit Large.jpeg" },
      { title: "Yoga Session 4", url: "/assets/Yoga/IMG_1731-Edit Large.jpeg" },
      { title: "Yoga Session 5", url: "/assets/Yoga/IMG_5185-Edit Large.jpeg" },
    ]
  }
];

export default function Sessions() {
  const { t } = useTranslation();
  const [previews, setPreviews] = useState<Record<string, Preview[]>>({});

  useEffect(() => {
    const loadPreviews = async () => {
      const newPreviews: Record<string, Preview[]> = {};

      sessionGroups.forEach(group => {
        newPreviews[group.name] = group.links.map(link => ({
          image: link.url,
          link: link.url
        }));
      });

      setPreviews(newPreviews);
    };

    loadPreviews();
  }, []);

  return (
    <div className="min-h-screen pt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-16"
      >
        <h1 className="text-3xl font-bold mb-8">
          {t("sessions.title")}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sessionGroups.map((group) => (
            <div key={group.name} className="bg-card p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">{group.name}</h2>
              <div className="space-y-4">
                {previews[group.name]?.map((preview, index) => (
                  <div key={index} className="relative overflow-hidden rounded-lg">
                    <img
                      src={preview.image}
                      alt={`${group.name} preview ${index + 1}`}
                      className="w-full h-48 object-cover rounded"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}