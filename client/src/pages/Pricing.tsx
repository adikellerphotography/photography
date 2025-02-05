import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/use-language";
import { useTranslation } from "@/hooks/use-translation";

export default function Pricing() {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [showNirDialog, setShowNirDialog] = React.useState(false);
  const [showAnastasiaDialog, setShowAnastasiaDialog] = React.useState(false);

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
          <h1 className="text-2xl font-bold mb-8 text-center text-[#E67E00]">
            {t("pricing.title")}
          </h1>

          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto w-[85%] md:w-full ${language === 'he' ? 'text-right' : ''}`}>
            {packages.filter(pkg => pkg.name !== t("pricing.additional.name")).map((pkg, index) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="backdrop-blur-sm bg-gray-100/5 border border-white/10 hover:border-white/20 transition-all">
                  <CardHeader className="space-y-2 pb-4">
                    <CardTitle className="text-xl font-semibold text-[#E67E00]">{pkg.name}</CardTitle>
                    <div className="flex">
                      <div className={`h-[1px] w-12 bg-gradient-to-r from-[#E67E00] to-amber-300 ${language === 'he' ? 'mr-0 ml-auto' : ''}`}></div>
                    </div>
                    <p className={`text-2xl font-light tracking-tight ${language === 'he' ? 'text-right' : ''}`}>{pkg.price}</p>
                    <p className="text-sm text-muted-foreground/80 font-light">{pkg.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5 text-sm">
                      {pkg.features.map((feature: string) => (
                        <li key={feature} className={`flex items-center ${language === 'he' ? 'flex-row-reverse text-right' : ''}`}>
                          <span className={`text-[#E67E00] text-xs ${language === 'he' ? 'ml-2' : 'mr-2'}`}>◆</span>
                          <span className="font-light">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Additional Information Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:col-span-2"
            >
              <Card className="backdrop-blur-sm bg-gray-100/5 border border-white/10 hover:border-white/20 transition-all h-full">
                <CardHeader className="space-y-2 pb-4">
                  <CardTitle className="text-xl font-semibold text-[#E67E00]">
                    {t("pricing.additional.name")}
                  </CardTitle>
                  <div className="flex">
                    <div className={`h-[1px] w-12 bg-gradient-to-r from-[#E67E00] to-amber-300 ${language === 'he' ? 'mr-0 ml-auto' : ''}`}></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {packages.find(pkg => pkg.name === t("pricing.additional.name"))?.features.map((feature: string) => (
                      <li key={feature} className={`flex items-center ${language === 'he' ? 'flex-row-reverse text-right' : ''}`}>
                        <span className={`text-[#E67E00] text-xs ${language === 'he' ? 'ml-2' : 'mr-2'}`}>◆</span>
                        <span className="font-light">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Albums Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-[#E67E00]">
              {t("pricing.albums.title") || "Albums"}
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
                  <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-amber-50/5 to-orange-50/5 backdrop-blur-sm border border-white/20">
                    <CardHeader className="text-center">
                      <CardTitle className={`text-2xl ${language === 'he' ? 'font-bold' : 'font-serif'}`}>{language === 'he' ? 'אנסטסיה כץ' : 'Anastasia Katsz'}</CardTitle>
                      <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto my-2 rounded-full"></div>
                      <p className="text-sm text-muted-foreground italic">
                        {language === 'he' ? 'מעצב גרפי' : 'Album Designer'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2 group-hover:text-[#E67E00] transition-colors">
                        <a href="tel:0546335594" className="flex items-center justify-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                          054-633-5594
                        </a>
                      </p>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <Button 
                        variant="outline" 
                        className="w-full group-hover:bg-gradient-to-r from-amber-500 to-orange-500 group-hover:text-white transition-all duration-300"
                        onClick={() => setShowAnastasiaDialog(true)}
                      >
                        {language === 'he' ? 'טבלת מחירים' : 'View Pricing'}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-amber-50/5 to-orange-50/5 backdrop-blur-sm border border-white/20">
                    <CardHeader className="text-center">
                      <CardTitle className={`text-2xl ${language === 'he' ? 'font-bold' : 'font-serif'}`}>{language === 'he' ? 'ניר גיל' : 'Nir Gil'}</CardTitle>
                      <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto my-2 rounded-full"></div>
                      <p className="text-sm text-muted-foreground italic">
                        {language === 'he' ? 'מעצב גרפי' : 'Album Designer'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2 group-hover:text-[#E67E00] transition-colors">
                        <a href="tel:0547982299" className="flex items-center justify-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                          054-798-2299
                        </a>
                      </p>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <Button 
                        variant="outline" 
                        className="w-full group-hover:bg-gradient-to-r from-amber-500 to-orange-500 group-hover:text-white transition-all duration-300"
                        onClick={() => setShowNirDialog(true)}
                      >
                        {language === 'he' ? 'טבלת מחירים' : 'View Pricing'}
                      </Button>
                    </CardContent>
                  </Card>
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
    </div>
  );
}