
import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { IL } from 'country-flag-icons/react/3x2';
import { SiWhatsapp } from "react-icons/si";

export default function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // WhatsApp message
    const whatsappText = encodeURIComponent(
      `Name: ${formData.name}\nPhone: ${formData.phone}\nMessage: ${formData.message}`
    );
    const whatsappUrl = `https://wa.me/972545667827?text=${whatsappText}`;
    window.open(whatsappUrl, '_blank');

    // Email
    const mailtoUrl = `mailto:adi.keller.photography@gmail.com?subject=Photography Inquiry&body=${encodeURIComponent(
      `Name: ${formData.name}\nPhone: ${formData.phone}\nMessage: ${formData.message}`
    )}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="min-h-screen pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-16"
      >
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-[#FF9500]">Contact Me</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-semibold">Adi Keller</span>
                </div>
                
                <a href="tel:054-5667827" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                  <Phone className="w-5 h-5" />
                  <span>054-5667827</span>
                </a>
                
                <a href="mailto:adi.keller.photography@gmail.com" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                  <Mail className="w-5 h-5" />
                  <span>adi.keller.photography@gmail.com</span>
                </a>
                
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="w-5 h-5" />
                  <span>Netanya, Israel</span>
                  <IL className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <Input
                    placeholder="Your Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                  <Textarea
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                    className="min-h-[120px]"
                  />
                  <Button type="submit" className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Send
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
