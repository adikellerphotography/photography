import { useQuery } from "@tanstack/react-query";
import CategoryCard from "@/components/CategoryCard";
import SocialLinks from "@/components/SocialLinks";
import { useTranslation } from "@/hooks/use-translation";
import type { Category } from "@/lib/types";

export default function Home() {
  const { t } = useTranslation();
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories-with-photos"],
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-background py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {t("home.title")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("home.subtitle")}
          </p>
          <SocialLinks />
        </div>
      </div>

      {/* Categories Section */}
      <div className="container mx-auto px-4 pb-16">
        <h2 className="text-3xl font-bold mb-8">{t("home.galleryTitle")}</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-full bg-muted animate-pulse h-64 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories?.map((category) => (
              <CategoryCard
                key={category.id}
                name={category.name}
                description={category.description}
                imageUrl={category.firstPhoto?.imageUrl}
                thumbnailUrl={category.firstPhoto?.thumbnailUrl}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}