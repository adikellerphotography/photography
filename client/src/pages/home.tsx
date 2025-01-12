import { useQuery } from "@tanstack/react-query";
import CategoryCard from "@/components/CategoryCard";

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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-full bg-muted animate-pulse h-64 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Photo Galleries</h1>
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
    </div>
  );
}
