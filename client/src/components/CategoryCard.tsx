import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

interface CategoryCardProps {
  name: string;
  description?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
}

export default function CategoryCard({ name, description, imageUrl, thumbnailUrl }: CategoryCardProps) {
  return (
    <Link href={`/gallery?category=${encodeURIComponent(name)}`}>
      <Card className="group cursor-pointer overflow-hidden">
        <AspectRatio ratio={3/2}>
          <img
            src={thumbnailUrl || imageUrl || '/placeholder.jpg'}
            alt={name}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        </AspectRatio>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold">{name}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}