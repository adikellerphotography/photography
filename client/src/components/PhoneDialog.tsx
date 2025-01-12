import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { SiWhatsapp } from "react-icons/si";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

export default function PhoneDialog() {
  const { t } = useTranslation();
  const phoneNumber = "054-5667827";
  const whatsappUrl = `https://wa.me/972${phoneNumber.replace(/-/g, '')}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label={t("contact.phone")}
        >
          <SiWhatsapp className="w-6 h-6" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center justify-center space-y-6 py-6">
          <SiWhatsapp className="w-12 h-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-foreground">{t("contact.callMe")}</h2>

          <div className="flex flex-col gap-4 w-full max-w-xs">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button
                variant="outline"
                className="w-full flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <SiWhatsapp className="w-5 h-5" />
                {t("contact.messageWhatsApp")}
              </Button>
            </a>

            <a
              href={`tel:${phoneNumber}`}
              className="w-full"
            >
              <Button
                variant="outline"
                className="w-full flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Phone className="w-5 h-5" />
                {t("contact.call")}
              </Button>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}