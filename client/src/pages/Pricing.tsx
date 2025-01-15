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
    <div className="min-h-screen pt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-16"
      >
        <div className={language === 'he' ? 'rtl text-right' : 'ltr text-left'}>
          <h1 className="text-3xl font-bold mb-8 text-center text-[#E67E00]">
            {t("pricing.title")}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                        <li key={feature} className="flex items-center">
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
        </div>
      </motion.div>
    </div>
  );
}