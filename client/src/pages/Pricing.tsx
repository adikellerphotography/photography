import React from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Crown, Phone, X } from "@phosphor-icons/react";
import { Horse, Users, Baby, Heart, Camera, FlowerLotus, ProhibitInset } from "@phosphor-icons/react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/use-language";
import { useTranslation } from "@/hooks/use-translation";
import LanguageToggle from "@/components/LanguageToggle";

export default function Pricing() {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const [, params] = useRoute("/pricing/:category");
  const [scrollY, setScrollY] = React.useState(0);
  const [selectedPackage, setSelectedPackage] = React.useState<string | null>(null);
  const [showNirDialog, setShowNirDialog] = React.useState(false);
  const [showAnastasiaDialog, setShowAnastasiaDialog] = React.useState(false);

  React.useEffect(() => {
    if (params?.category) {
      setSelectedPackage(decodeURIComponent(params.category));
    }
  }, [params]);

  React.useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPackages = () => {
    const defaultFeatures = ["1.5 hours session", "1 location", "25 edited photos", "All raw material included"];

    return [
      {
        name: "Bat Mitzvah",
        price: t("pricing.packages.batMitzvah.price"),
        description: t("pricing.packages.batMitzvah.description") || "Experiential photography session",
        features: t("pricing.packages.batMitzvah.features", { returnObjects: true }) || defaultFeatures
      },
      {
        name: "Family",
        price: t("pricing.packages.family.price"),
        description: t("pricing.packages.family.description") || "Family photography session",
        features: t("pricing.packages.family.features", { returnObjects: true }) || defaultFeatures
      },
      {
        name: "Kids",
        price: t("pricing.packages.kids.price"),
        description: t("pricing.packages.kids.description") || "Kids photography session",
        features: t("pricing.packages.kids.features", { returnObjects: true }) || defaultFeatures
      },
      {
        name: "Horses",
        price: t("pricing.packages.horses.price"),
        description: t("pricing.packages.horses.description") || "Horse photography session",
        features: t("pricing.packages.horses.features", { returnObjects: true }) || defaultFeatures
      },
      {
        name: "Yoga",
        price: t("pricing.packages.yoga.price"),
        description: t("pricing.packages.yoga.description") || "Yoga photography session",
        features: t("pricing.packages.yoga.features", { returnObjects: true }) || defaultFeatures
      },
      {
        name: "Femininity",
        price: t("pricing.packages.feminine.price"),
        description: t("pricing.packages.feminine.description") || "Feminine photography session",
        features: t("pricing.packages.feminine.features", { returnObjects: true }) || defaultFeatures
      },
      {
        name: "Modeling",
        price: t("pricing.packages.modeling.price"),
        description: t("pricing.packages.modeling.description") || "Modeling photography session",
        features: t("pricing.packages.modeling.features", { returnObjects: true }) || defaultFeatures
      },
      {
        name: "Intimate",
        price: t("pricing.packages.intimate.price") || "1450₪",
        description: t("pricing.packages.intimate.description") || "Intimate photography session",
        features: t("pricing.packages.intimate.features", { returnObjects: true }) || defaultFeatures
      }
    ];
  };

  const handlePackageSelect = (packageName: string) => {
    setSelectedPackage(packageName);
    setLocation(`/pricing/${encodeURIComponent(packageName)}`);
  };

  const handleClosePackage = () => {
    setSelectedPackage(null);
    setLocation('/pricing');
  };

  React.useEffect(() => {
    if (params?.category) {
      setSelectedPackage(decodeURIComponent(params.category));
    }
  }, [params]);

  const selectedPackageDetails = getPackages().find(pkg => pkg.name === selectedPackage);
  const features = Array.isArray(selectedPackageDetails?.features) ? selectedPackageDetails.features : [];

  return (
    <div className="min-h-screen pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-16"
      >
        <div className={language === 'he' ? 'rtl text-right' : 'ltr text-left'}>
          <h1 className="text-2xl font-bold mb-8 text-center text-[#E67E00]">
            {t("pricing.title")}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-6xl mx-auto">
            {getPackages().map((pkg, index) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex"
              >
                <Button
                  variant="ghost"
                  className="group relative w-[220px] mx-auto h-12 overflow-hidden bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => handlePackageSelect(pkg.name)}
                >
                  <div className="absolute left-0 top-0 bottom-0 h-full w-[25%] bg-[#E67E00] flex items-center justify-center">
                    {pkg.name === "Bat Mitzvah" && <Crown weight="bold" className="w-9 h-9 text-white" />}
                    {pkg.name === "Horses" && <Horse weight="bold" className="w-9 h-9 text-white" />}
                    {pkg.name === "Family" && <Users weight="bold" className="w-9 h-9 text-white" />}
                    {pkg.name === "Kids" && <Baby weight="bold" className="w-9 h-9 text-white" />}
                    {pkg.name === "Femininity" && <Heart weight="bold" className="w-9 h-9 text-white" />}
                    {pkg.name === "Yoga" && <FlowerLotus weight="bold" className="w-9 h-9 text-white" />}
                    {pkg.name === "Modeling" && <Camera weight="bold" className="w-9 h-9 text-white" />}
                    {pkg.name === "Intimate" && <ProhibitInset weight="bold" className="w-9 h-9 text-white" />}
                  </div>
                  <div className="relative flex items-center justify-start w-full h-full">
                    <span className="pl-[calc(25%+1rem)] text-base font-medium text-black">{language === 'he' ? t(`categories.${pkg.name}`) : pkg.name}</span>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>

          <Dialog open={!!selectedPackage} onOpenChange={() => handleClosePackage()}>
            <DialogContent className="w-[90vw] max-h-[90vh] overflow-y-auto fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gray-100/95 dark:bg-gray-800/95 backdrop-blur-sm animate-in zoom-in-95 duration-300 ease-out">
              <DialogHeader className="flex flex-row items-center justify-between sticky top-0 bg-gray-100/95 dark:bg-gray-800/95 z-10 pb-4">
                <DialogTitle>{selectedPackageDetails?.name}</DialogTitle>
                <div className="flex items-center gap-2">
                  <LanguageToggle />
                  <Button variant="ghost" size="icon" onClick={() => handleClosePackage()}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </DialogHeader>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.3,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className={`space-y-6 overflow-y-auto ${language === 'he' ? 'text-right' : ''}`}
              >
                <div className="border-b border-[#E67E00]/20 pb-4">
                  <p className="text-xl font-semibold text-[#E67E00] mb-2">{t("pricing.price")}</p>
                  <p className="text-lg">{selectedPackageDetails?.price}</p>
                </div>

                <div className="border-b border-[#E67E00]/20 pb-4">
                  <p className="text-xl font-semibold text-[#E67E00] mb-2">{t("pricing.description")}</p>
                  <div className="space-y-2">
                    {Array.isArray(selectedPackageDetails?.description) ? 
                      selectedPackageDetails.description.map((desc: string) => (
                        <div key={desc} className="text-muted-foreground">
                          {desc}
                        </div>
                      )) : 
                      <div className="text-muted-foreground">
                        {selectedPackageDetails?.description}
                      </div>
                    }
                  </div>
                </div>

                <div>
                  <p className="text-xl font-semibold text-[#E67E00] mb-3">{t("pricing.includes")}</p>
                  <div className="space-y-2">
                    {features.map((feature: string) => (
                      <div key={feature} className={`flex items-start ${language === 'he' ? 'flex-row-reverse text-right' : ''}`}>
                        <span className={`text-[#E67E00] text-xs ${language === 'he' ? 'ml-2' : 'mr-2'}`}>◆</span>
                        <span className="font-light">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#E67E00]/20 pt-4">
                  <p className="text-xl font-semibold text-[#E67E00] mb-3">{t("pricing.serviceDetails") || "Service Details"}</p>
                  <div className="space-y-2">
                    {t("pricing.packages.additional.features", { returnObjects: true })?.map((detail) => (
                      <div key={detail} className={`flex items-start ${language === 'he' ? 'flex-row-reverse text-right' : ''}`}>
                        <span className={`text-[#E67E00] text-xs ${language === 'he' ? 'ml-2' : 'mr-2'} mt-1`}>◆</span>
                        <span className="font-light">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>

          {/* Albums Section */}
          <div className="mt-12 mb-16">
            <Card className="backdrop-blur-md bg-white/5 dark:bg-gray-950/50 border border-[#E67E00]/20 hover:border-[#E67E00]/30 transition-all shadow-lg">
              <CardHeader className="space-y-4 pb-6">
                <div className={`flex items-center gap-4 ${language === 'he' ? 'flex-row-reverse' : ''}`}>
                  <div className="h-10 w-1 bg-gradient-to-b from-[#E67E00] to-amber-300 rounded-full" />
                  <CardTitle className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#E67E00] to-amber-300">
                    {t("pricing.albums.title")}
                  </CardTitle>
                </div>
                <p className={`text-base leading-relaxed text-muted-foreground ${language === 'he' ? 'text-right' : 'text-left'}`}>
                  {t("pricing.albums.description")}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <div className="bg-gradient-to-br from-[#1A1A1A] to-[#111] rounded-3xl p-6 flex flex-col items-center space-y-4 shadow-xl">
                    <div className="space-y-2 text-center">
                      <h3 className="text-2xl font-light text-white tracking-wide">
                        {language === 'he' ? 'אנסטסיה כץ' : 'Anastasia Katsz'}
                      </h3>
                      <div className="w-12 h-[1px] mx-auto bg-gradient-to-r from-[#E67E00]/30 via-[#E67E00] to-[#E67E00]/30" />
                      <p className="text-gray-400 text-sm uppercase tracking-wider">Album Designer</p>
                    </div>

                    <a href="tel:054-633-5594" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">054-633-5594</span>
                    </a>

                    <Button
                      variant="outline"
                      className="w-full py-2 text-sm border-[#333] hover:border-[#E67E00] text-white bg-black/50 hover:bg-black transition-all backdrop-blur-sm tracking-wide group relative overflow-hidden"
                      onClick={() => setShowAnastasiaDialog(true)}
                    >
                      <span className="relative z-10">View Pricing</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#E67E00]/0 via-[#E67E00]/10 to-[#E67E00]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                    </Button>
                  </div>

                  <div className="bg-gradient-to-br from-[#1A1A1A] to-[#111] rounded-3xl p-6 flex flex-col items-center space-y-4 shadow-xl">
                    <div className="space-y-2 text-center">
                      <h3 className="text-2xl font-light text-white tracking-wide">
                        {language === 'he' ? 'ניר גיל' : 'Nir Gil'}
                      </h3>
                      <div className="w-12 h-[1px] mx-auto bg-gradient-to-r from-[#E67E00]/30 via-[#E67E00] to-[#E67E00]/30" />
                      <p className="text-gray-400 text-sm uppercase tracking-wider">Album Designer</p>
                    </div>

                    <a href="tel:054-798-2299" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">054-798-2299</span>
                    </a>

                    <Button
                      variant="outline"
                      className="w-full py-2 text-sm border-[#333] hover:border-[#E67E00] text-white bg-black/50 hover:bg-black transition-all backdrop-blur-sm tracking-wide group relative overflow-hidden"
                      onClick={() => setShowNirDialog(true)}
                    >
                      <span className="relative z-10">View Pricing</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#E67E00]/0 via-[#E67E00]/10 to-[#E67E00]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Dialog open={showNirDialog} onOpenChange={setShowNirDialog}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{language === 'he' ? 'ניר גיל - מחירון אלבומים' : 'Nir Gil - Album Pricing'}</DialogTitle>
              </DialogHeader>
              <div className="relative">
                <img src="/attached_assets/nir_gil.jpg" alt="Nir Gil Album Pricing" className="w-full" />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-4 right-4 z-20 bg-background/80 backdrop-blur-sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = "/attached_assets/nir_gil.jpg";
                    link.download = 'nir_gil_pricing.jpg';
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAnastasiaDialog} onOpenChange={setShowAnastasiaDialog}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{language === 'he' ? 'אנסטסיה כץ - מחירון אלבומים' : 'Anastasia Katsz - Album Pricing'}</DialogTitle>
              </DialogHeader>
              <div className="relative">
                <img src="/attached_assets/anastasia_katz.jpg" alt="Anastasia Album Pricing" className="w-full" />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-4 right-4 z-20 bg-background/80 backdrop-blur-sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = "/attached_assets/anastasia_katz.jpg";
                    link.download = 'anastasia_pricing.jpg';
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>
      <motion.button
        className={`fixed bottom-6 right-6 p-3 rounded-full bg-[#FF9500] text-black shadow-lg transition-all ${
          scrollY > 200 ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
        onClick={scrollToTop}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ArrowUp className="h-5 w-5" />
      </motion.button>
    </div>
  );
}