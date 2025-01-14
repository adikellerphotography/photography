
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import { useQuery } from "@tanstack/react-query";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { Photo } from "@/lib/types";

interface SessionGroup {
  name: string;
  folder: string;
}

const sessionGroups: SessionGroup[] = [
  { name: "Bat Mitzva", folder: "Bat_Mitsva" },
  { name: "Women", folder: "Women" },
  { name: "Sea", folder: "Sea" },
  { name: "Nature", folder: "Nature" },
  { name: "Yoga", folder: "Yoga" },
  { name: "Horses", folder: "Horses" }
];

export default function Sessions() {
  const { t } = useTranslation();

  const fetchPhotos = async (folder: string) => {
    const response = await fetch(`/api/photos?category=${folder}&page=1&pageSize=5`);
    if (!response.ok) {
      throw new Error('Failed to fetch photos');
    }
    return response.json();
  };

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
            <CategorySection key={group.name} group={group} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function CategorySection({ group }: { group: SessionGroup }) {
  const { t } = useTranslation();
  const { data: photos = [], isLoading } = useQuery<Photo[]>({
    queryKey: ['/api/photos', { category: group.folder }],
    queryFn: () => fetchPhotos(group.folder),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="bg-card p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-2xl font-semibold">{t(`sessions.${group.name.toLowerCase()}`)}</h2>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <AspectRatio ratio={16/9}>
                <div className="w-full h-full bg-muted rounded-md" />
              </AspectRatio>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-md space-y-4">
      <h2 className="text-2xl font-semibold">{t(`sessions.${group.name.toLowerCase()}`)}</h2>
      <div className="grid grid-cols-2 gap-2">
        {photos.slice(0, 4).map((photo, index) => (
          <a 
            key={photo.id} 
            href={photo.facebookUrl || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block group relative overflow-hidden rounded-md"
          >
            <AspectRatio ratio={1}>
              <img
                src={photo.thumbnailUrl || photo.imageUrl}
                alt=""
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </AspectRatio>
          </a>
        ))}
      </div>
    </div>
  );
}

function fetchPhotos(folder: string): Promise<Photo[]> {
  return fetch(`/api/photos?category=${folder}&page=1&pageSize=5`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch photos');
      }
      return response.json();
    });
}
