import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { SiWhatsapp } from "react-icons/si";
import { useTranslation } from "@/hooks/use-translation";

export default function PhoneDialog() {
  const { t } = useTranslation();
  const phoneNumber = "054-5667827";

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
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <SiWhatsapp className="w-12 h-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-foreground">{t("contact.callMe")}</h2>
          <a
            href={`tel:${phoneNumber}`}
            className="text-2xl font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            {phoneNumber}
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}