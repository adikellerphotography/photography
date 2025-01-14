
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
      { title: "Bat Mitzva Session 1", url: "#" },
      { title: "Bat Mitzva Session 2", url: "#" },
      { title: "Bat Mitzva Session 3", url: "#" },
      { title: "Bat Mitzva Session 4", url: "#" },
      { title: "Bat Mitzva Session 5", url: "#" },
    ]
  },
  {
    name: "Women",
    links: [
      { title: "Women Session 1", url: "#" },
      { title: "Women Session 2", url: "#" },
      { title: "Women Session 3", url: "#" },
      { title: "Women Session 4", url: "#" },
      { title: "Women Session 5", url: "#" },
    ]
  },
  {
    name: "Sea",
    links: [
      { title: "Sea Session 1", url: "#" },
      { title: "Sea Session 2", url: "#" },
      { title: "Sea Session 3", url: "#" },
      { title: "Sea Session 4", url: "#" },
      { title: "Sea Session 5", url: "#" },
    ]
  },
  {
    name: "Nature",
    links: [
      { title: "Nature Session 1", url: "#" },
      { title: "Nature Session 2", url: "#" },
      { title: "Nature Session 3", url: "#" },
      { title: "Nature Session 4", url: "#" },
      { title: "Nature Session 5", url: "#" },
    ]
  },
  {
    name: "Yoga",
    links: [
      { title: "Yoga Session 1", url: "#" },
      { title: "Yoga Session 2", url: "#" },
      { title: "Yoga Session 3", url: "#" },
      { title: "Yoga Session 4", url: "#" },
      { title: "Yoga Session 5", url: "#" },
    ]
  },
  {
    name: "Horses",
    links: [
      { title: "Horse Session 1", url: "#" },
      { title: "Horse Session 2", url: "#" },
      { title: "Horse Session 3", url: "#" },
      { title: "Horse Session 4", url: "#" },
      { title: "Horse Session 5", url: "#" },
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
            <div key={group.name} className="space-y-4">
              <h2 className="text-2xl font-semibold">{group.name}</h2>
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
