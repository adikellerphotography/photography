
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";

interface SessionGroup {
  name: string;
  links: { title: string; url: string }[];
}

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
      { title: "Yoga Session 1", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
      { title: "Yoga Session 2", url: "https://www.facebook.com/photo/?fbid=122112673657543" },
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
              <ul className="space-y-2">
                {group.links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
