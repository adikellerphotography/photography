import React from "react";
import { motion } from "framer-motion";
import { ArrowUp, Home, PartyPopper, Users, Baby, Sparkles } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/use-language";
import { useTranslation } from "@/hooks/use-translation";

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

  const packages = [
    {
      name: t("pricing.batMitzvah.name"),
      price: t("pricing.batMitzvah.price"),
      description: t("pricing.batMitzvah.description"),
      features: t("pricing.batMitzvah.features"),
      icon: PartyPopper
    },
    {
      name: t("pricing.family.name"),
      price: t("pricing.family.price"),
      description: t("pricing.family.description"),
      features: t("pricing.family.features"),
      icon: Users
    },
    {
      name: t("pricing.kids.name"),
      price: t("pricing.kids.price"),
      description: t("pricing.kids.description"),
      features: t("pricing.kids.features"),
      icon: Baby
    },
    {
      name: t("pricing.purim.name"),
      price: t("pricing.purim.price"),
      description: t("pricing.purim.description"),
      features: t("pricing.purim.features"),
      icon: Sparkles
    }
  ];

  const handlePackageSelect = (packageName: string) => {
    setSelectedPackage(packageName);
  };

  const handleClosePackage = () => {
    setSelectedPackage(null);
  };

  const selectedPackageDetails = packages.find(pkg => pkg.name === selectedPackage);

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex"
              >
                <Button
                  variant="ghost"
                  className="group w-[220px] mx-auto h-auto py-3 px-4 flex flex-col gap-2 bg-gradient-to-br from-white/5 to-white/10 hover:from-white/10 hover:to-white/20 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/10 hover:border-[#E67E00]/30"
                  onClick={() => handlePackageSelect(pkg.name)}
                >
                  <div className="relative">
                    {pkg.icon && <pkg.icon className="w-5 h-5 mb-2 text-[#E67E00] group-hover:text-amber-200 transition-all duration-500" />}
                    <h3 className="text-base font-semibold text-[#E67E00] group-hover:text-[#E67E00] transition-colors">{pkg.name}</h3>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground group-hover:text-white/90 transition-colors">{pkg.price}</p>
                </Button>
              </motion.div>
            ))}
          </div>

          <Dialog open={!!selectedPackage} onOpenChange={() => handleClosePackage()}>
            <DialogContent className="max-w-2xl fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-background/95 backdrop-blur-sm">
              <DialogHeader className="flex flex-row items-center justify-between">
                <DialogTitle>{selectedPackageDetails?.name}</DialogTitle>
                <Button variant="ghost" size="icon" onClick={() => setLocation('/')}>
                  <Home className="h-5 w-5" />
                </Button>
              </DialogHeader>
              <div className="space-y-6">
                <div className="border-b border-[#E67E00]/20 pb-4">
                  <p className="text-xl font-semibold text-[#E67E00] mb-2">{t("pricing.price")}</p>
                  <p className="text-lg">{selectedPackageDetails?.price}</p>
                </div>

                <div className="border-b border-[#E67E00]/20 pb-4">
                  <p className="text-xl font-semibold text-[#E67E00] mb-2">{t("pricing.description")}</p>
                  <p className="text-muted-foreground leading-relaxed">{selectedPackageDetails?.description}</p>
                </div>

                <div>
                  <p className="text-xl font-semibold text-[#E67E00] mb-3">{t("pricing.includes")}</p>
                  <div className="space-y-2">
                    {selectedPackageDetails?.features.map((feature: string) => (
                      <div key={feature} className={`flex items-center ${language === 'he' ? 'flex-row-reverse text-right' : ''}`}>
                        <span className={`text-[#E67E00] text-xs ${language === 'he' ? 'ml-2' : 'mr-2'}`}>◆</span>
                        <span className="font-light">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Albums Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-[#E67E00]">
              {t("pricing.albums.title")}
            </h2>
            <Card className="backdrop-blur-sm bg-gray-100/5 border border-white/10 hover:border-white/20 transition-all">
              <CardHeader className="space-y-2 pb-4">
                <CardTitle className="text-xl font-semibold text-[#E67E00]">
                  {t("pricing.albums.title")}
                </CardTitle>
                <div className="flex">
                  <div className={`h-[1px] w-12 bg-gradient-to-r from-[#E67E00] to-amber-300 ${language === 'he' ? 'mr-0 ml-auto' : ''}`}></div>
                </div>
                <p className={`text-sm text-muted-foreground/80 font-light ${language === 'he' ? 'text-right' : 'text-left'}`}>
                  {t("pricing.albums.description")}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <Button
                    variant="outline"
                    className="w-full p-6 flex flex-col gap-4 hover:bg-[#E67E00]/10"
                    onClick={() => setShowAnastasiaDialog(true)}
                  >
                    <h3 className={`text-xl ${language === 'he' ? 'font-bold' : 'font-serif'}`}>
                      {language === 'he' ? 'אנסטסיה כץ' : 'Anastasia Katsz'}
                    </h3>
                    <p className="text-sm text-muted-foreground italic">
                      {language === 'he' ? 'מעצב גרפי' : 'Album Designer'}
                    </p>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full p-6 flex flex-col gap-4 hover:bg-[#E67E00]/10"
                    onClick={() => setShowNirDialog(true)}
                  >
                    <h3 className={`text-xl ${language === 'he' ? 'font-bold' : 'font-serif'}`}>
                      {language === 'he' ? 'ניר גיל' : 'Nir Gil'}
                    </h3>
                    <p className="text-sm text-muted-foreground italic">
                      {language === 'he' ? 'מעצב גרפי' : 'Album Designer'}
                    </p>
                  </Button>
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
                <img src="/assets/nir_gil.jpg" alt="Nir Gil Album Pricing" className="w-full" />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-4 right-4 z-20 bg-background/80 backdrop-blur-sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = "/assets/nir_gil.jpg";
                    link.download = 'nir_gil_pricing.jpg';
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
                <img src="/assets/anastasia_katz.jpg" alt="Anastasia Album Pricing" className="w-full" />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-4 right-4 z-20 bg-background/80 backdrop-blur-sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = "/assets/anastasia_katz.jpg";
                    link.download = 'anastasia_pricing.jpg';
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