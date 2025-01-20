import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { useTranslation } from "@/hooks/use-translation";

export default function Pricing() {
  const { language } = useLanguage();
  const { t } = useTranslation();

  const packages = [
    {
      name: t("pricing.batMitzvah.name"),
      price: t("pricing.batMitzvah.price"),
      description: t("pricing.batMitzvah.description"),
      features: t("pricing.batMitzvah.features")
    },
    {
      name: t("pricing.family.name"),
      price: t("pricing.family.price"),
      description: t("pricing.family.description"),
      features: t("pricing.family.features")
    },
    {
      name: t("pricing.kids.name"),
      price: t("pricing.kids.price"),
      description: t("pricing.kids.description"),
      features: t("pricing.kids.features")
    },
    {
      name: t("pricing.purim.name"),
      price: t("pricing.purim.price"),
      description: t("pricing.purim.description"),
      features: t("pricing.purim.features")
    },
    {
      name: t("pricing.additional.name"),
      price: t("pricing.additional.price"),
      description: t("pricing.additional.description"),
      features: t("pricing.additional.features")
    }
  ];

  return (
    <div className="min-h-screen pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-16"
      >
        <div className={language === 'he' ? 'rtl text-right' : 'ltr text-left'}>
          <h1 className="text-3xl font-bold mb-8 text-center text-[#E67E00]">
            {t("pricing.title")}
          </h1>

          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto ${language === 'he' ? 'text-right' : ''}`}>
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>{pkg.name}</CardTitle>
                    <p className="text-2xl font-bold">{pkg.price}</p>
                    <p className="text-sm text-muted-foreground">{pkg.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {pkg.features.map((feature: string) => (
                        <li key={feature} className={`flex items-center ${language === 'he' ? 'flex-row-reverse text-right' : ''}`}>
                          <span className={`${language === 'he' ? 'ml-2' : 'mr-2'}`}>•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Albums Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6 text-center text-[#E67E00]">
              {t("pricing.albums.title") || "Albums"}
            </h2>
            <p className="text-center mb-8 max-w-2xl mx-auto">
              {t("pricing.albums.description") || "I work with two professional designers who create beautiful albums, handle printing, and deliver directly to customers."}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Anastasia Katsz</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    <a href="tel:0546335594" className="hover:text-[#E67E00]">054-633-5594</a>
                  </p>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      // Add dialog/modal to show pricing image
                      alert("Pricing image coming soon");
                    }}
                  >
                    View Pricing
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Nir Gil</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    <a href="tel:0547982299" className="hover:text-[#E67E00]">054-798-2299</a>
                  </p>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      // Add dialog/modal to show pricing image
                      alert("Pricing image coming soon");
                    }}
                  >
                    View Pricing
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}