import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/hooks/use-language";

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

  // Log props for debugging
  console.log('CategoryCard props:', { name, displayUrl, translatedName });

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
                  if (!target.dataset.retryCount || parseInt(target.dataset.retryCount) < 3) {
                    target.dataset.retryCount = target.dataset.retryCount ? (parseInt(target.dataset.retryCount) + 1).toString() : "1";
                    setTimeout(() => {
                      target.src = displayUrl;
                    }, 1000);
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
          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors duration-300">
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