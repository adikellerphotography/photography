import { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import FB from 'fb';

interface SessionGroup {
  name: string;
  links: { title: string; url: string }[];
}

interface FacebookPreview {
  images: string[];
  link: string;
}

// Remove Facebook SDK integration temporarily
const fbConfig = {
  appId: process.env.FACEBOOK_APP_ID,
  appSecret: process.env.FACEBOOK_APP_SECRET
};

const sessionGroups: SessionGroup[] = [
  {
    name: "Bat Mitzva",
    links: [
      { title: "Bat Mitzva Session 1", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
      { title: "Bat Mitzva Session 2", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
      { title: "Bat Mitzva Session 3", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
      { title: "Bat Mitzva Session 4", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
      { title: "Bat Mitzva Session 5", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
    ]
  },
  {
    name: "Women",
    links: [
      { title: "Women Session 1", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
      { title: "Women Session 2", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
      { title: "Women Session 3", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
      { title: "Women Session 4", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
      { title: "Women Session 5", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
    ]
  },
  {
    name: "Sea",
    links: [
      { title: "Sea Session 1", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
      { title: "Sea Session 2", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
      { title: "Sea Session 3", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
      { title: "Sea Session 4", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
      { title: "Sea Session 5", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
    ]
  },
  {
    name: "Nature",
    links: [
      { title: "Nature Session 1", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
      { title: "Nature Session 2", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
      { title: "Nature Session 3", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
      { title: "Nature Session 4", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
      { title: "Nature Session 5", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
    ]
  },
  {
    name: "Yoga",
    links: [
      { title: "Yoga Session 1", url:"https://www.facebook.com/share/p/18V42a9Ynv/" },
      { title: "Yoga Session 2", url: "https://www.facebook.com/share/p/157jBdjzuv/" },
      { title: "Yoga Session 3", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
      { title: "Yoga Session 4", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
      { title: "Yoga Session 5", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
    ]
  },
  {
    name: "Horses",
    links: [
      { title: "Horse Session 1", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
      { title: "Horse Session 2", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
      { title: "Horse Session 3", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
      { title: "Horse Session 4", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
      { title: "Horse Session 5", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
    ]
  }
];

export default function Sessions() {
  const { t } = useTranslation();
  const [previews, setPreviews] = useState<Record<string, FacebookPreview[]>>({});

  useEffect(() => {
    // Simplified preview logic without FB SDK
    const mockPreviews: Record<string, FacebookPreview[]> = {};
    
    sessionGroups.forEach(group => {
      mockPreviews[group.name] = group.links.map(link => ({
        images: ['/assets/placeholder-category.jpg'],
        link: link.url
      }));
    });
    
    setPreviews(mockPreviews);
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
              <h2 className="text-2xl font-semibold mb-4">{t(`sessions.${group.name.toLowerCase()}`)}</h2>
              <div className="space-y-4">
                {previews[group.name]?.map((preview, index) => (
                  <a
                    key={index}
                    href={preview.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:opacity-90 transition-opacity"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      {preview.images.map((image, imgIndex) => (
                        <img
                          key={imgIndex}
                          src={image}
                          alt={`${group.name} preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded"
                        />
                      ))}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}