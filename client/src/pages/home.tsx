import { useQuery } from "@tanstack/react-query";
import CategoryCard from "@/components/CategoryCard";
import SocialLinks from "@/components/SocialLinks";

interface Category {
  id: number;
  name: string;
  description?: string;
  displayOrder: number;
  firstPhoto?: {
    imageUrl: string;
    thumbnailUrl?: string;
  };
}

export default function Home() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories-with-photos"],
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-background py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Capturing Life's Precious Moments
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Professional photography services specializing in family portraits, events, 
            and personal photography sessions that tell your unique story.
          </p>
          <SocialLinks />
        </div>
      </div>

      {/* Categories Section */}
      <div className="container mx-auto px-4 pb-16">
        <h2 className="text-3xl font-bold mb-8">Photo Galleries</h2>
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