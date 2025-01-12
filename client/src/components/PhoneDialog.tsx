import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Phone } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";

export default function PhoneDialog() {
  const { t } = useTranslation();
  const phoneNumber = "054-5667827";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-accent"
        >
          <Phone className="w-5 h-5" />
          <span className="sr-only">{t("contact.phone")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <Phone className="w-12 h-12 text-primary" />
          <h2 className="text-xl font-semibold">{t("contact.callMe")}</h2>
          <a
            href={`tel:${phoneNumber}`}
            className="text-2xl font-bold text-primary hover:underline"
          >
            {phoneNumber}
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
