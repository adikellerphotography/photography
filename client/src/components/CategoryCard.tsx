
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/hooks/use-language";
import { User, Horse, Users, Baby, Heart, Yoga, PersonStanding, Paintbrush } from "lucide-react";

interface CategoryCardProps {
  name: string;
  description?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
}

export default function CategoryCard({ name, description, imageUrl, thumbnailUrl }: CategoryCardProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const displayUrl = thumbnailUrl || imageUrl;
  const translatedName = t(`categories.${name}`);

  const getCategoryIcon = (categoryName: string) => {
    const iconProps = { className: "w-5 h-5 mr-2" };
    switch (categoryName) {
      case "Bat Mitsva":
      case "Bar Mitsva":
        return <User {...iconProps} />;
      case "Horses":
        return <Horse {...iconProps} />;
      case "Family":
        return <Users {...iconProps} />;
      case "Kids":
        return <Baby {...iconProps} />;
      case "Femininity":
        return <Heart {...iconProps} />;
      case "Yoga":
        return <Yoga {...iconProps} />;
      case "Modeling":
        return <PersonStanding {...iconProps} />;
      case "Artful Nude":
        return <Paintbrush {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <Link href={`/gallery?category=${encodeURIComponent(name)}`}>
      <Card className="group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <AspectRatio ratio={3/2} className="bg-muted overflow-hidden">
          {displayUrl ? (
            <div className="relative w-full h-full overflow-hidden bg-muted">
              <img
                src={displayUrl}
                alt={translatedName}
                loading="lazy"
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const retryCount = parseInt(target.dataset.retryCount || '0');
                  const paths = [
                    displayUrl,
                    displayUrl.replace('attached_assets/', ''),
                    displayUrl.replace('attached_assets/', 'assets/'),
                    `/api/photos/${name.replace(/\s+/g, '_')}/${displayUrl.split('/').pop()}`
                  ];
                  
                  if (retryCount < paths.length) {
                    target.dataset.retryCount = (retryCount + 1).toString();
                    setTimeout(() => {
                      target.src = paths[retryCount] + `?retry=${retryCount}`;
                    }, Math.min(1000 * Math.pow(2, retryCount), 3000));
                  } else {
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'w-full h-full flex items-center justify-center';
                      fallback.innerHTML = `<span class="text-muted-foreground">${t("common.noPreview")}</span>`;
                      parent.appendChild(fallback);
                    }
                  }
                }}
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">{t("common.noPreview")}</span>
            </div>
          )}
        </AspectRatio>
        <CardContent className={`p-4 ${language === 'he' ? 'rtl' : 'ltr'}`}>
          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors duration-300 flex items-center">
            {getCategoryIcon(name)}
            {translatedName}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
