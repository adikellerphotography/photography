import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { IL } from 'country-flag-icons/react/3x2';
import { SiWhatsapp } from "react-icons/si";

export default function Contact() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const whatsappText = encodeURIComponent(
      `Name: ${formData.name}\nPhone: ${formData.phone}\nMessage: ${formData.message}`
    );
    const whatsappUrl = `https://wa.me/972545667827?text=${whatsappText}`;
    window.open(whatsappUrl, '_blank');

    const mailtoUrl = `mailto:adi.keller.photography@gmail.com?subject=Photography Inquiry&body=${encodeURIComponent(
      `Name: ${formData.name}\nPhone: ${formData.phone}\nMessage: ${formData.message}`
    )}`;
    window.location.href = mailtoUrl;
  };

  const isRTL = language === 'he';
  const dir = isRTL ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen pt-8" dir={dir}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-16"
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-3xl font-bold mb-6 text-[#FF9500]">{isRTL ? "צרו קשר" : "Contact Me"}</h1>
            <div className="w-64 bg-muted/70">
              <img 
                src="assets/AK_white_line.jpg" 
                alt="Adi Keller Photography"
                className="transition-opacity duration-700 ease-in-out opacity-0 mix-blend-plus-lighter"
                onLoad={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.classList.remove('opacity-0');
                  img.classList.add('opacity-100');
                }}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = 'assets/my_logo.png';
                }}
                style={{
                  WebkitBackfaceVisibility: 'hidden',
                  WebkitTransform: 'translate3d(0, 0, 0)'
                }}
              />
            </div>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${isRTL ? 'text-right' : ''}`}>
            <Card className="bg-muted/50">
              <CardContent className="pt-6 space-y-4">
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                  <span className="text-xl font-semibold">{isRTL ? 'עדי קלר' : 'Adi Keller'}</span>
                </div>

                <a href="tel:054-5667827" className={`flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                  <Phone className="w-5 h-5" />
                  <span>054-5667827</span>
                </a>

                <a href="mailto:adi.keller.photography@gmail.com" className={`flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                  <Mail className="w-5 h-5" />
                  <span>adi.keller.photography@gmail.com</span>
                </a>

                <div className={`flex items-center gap-3 text-muted-foreground ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                  <MapPin className="w-5 h-5" />
                  <span>{isRTL ? 'נתניה, ישראל' : 'Netanya, Israel'}</span>
                  <IL className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    placeholder={isRTL ? "שם מלא" : "Your Name"}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className={`${isRTL ? 'text-right placeholder:text-right' : ''}`}
                  />
                  <Input
                    placeholder={isRTL ? "מספר טלפון" : "Your Phone Number"}
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    className={`${isRTL ? 'text-right placeholder:text-right' : ''}`}
                  />
                  <Textarea
                    placeholder={isRTL ? "הודעה" : "Message"}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                    className={`min-h-[120px] ${isRTL ? 'text-right placeholder:text-right' : ''}`}
                  />
                  <Button type="submit" className={`w-full bg-gray-100 hover:bg-gray-200 text-gray-800 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Send className="w-4 h-4 mx-2" />
                    {isRTL ? "שלח הודעה" : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}