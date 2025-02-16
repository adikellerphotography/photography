import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { SiFacebook, SiWhatsapp, SiPinterest } from "react-icons/si";
import { MdEmail } from "react-icons/md";
import { useTranslation } from "@/hooks/use-translation";
import { useState, useEffect } from 'react';

function useHistoryState(key, onClose) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      if (window.history.state && window.history.state.key === key) {
        onClose();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [key, onClose]);

  const pushState = () => {
    setIsOpen(true);
    window.history.pushState({ key }, '');
  };

  return pushState;
}


interface ShareDialogProps {
  imageUrl: string;
  title?: string;
}

export default function ShareDialog({ imageUrl, title }: ShareDialogProps) {
  const { t } = useTranslation();
  const currentUrl = window.location.href;
  const websiteUrl = window.location.origin;
  const fullImageUrl = `${websiteUrl}${imageUrl}`;
  const [open, setOpen] = useState(false);
  const pushHistoryState = useHistoryState('share-dialog', () => setOpen(false));

  const handleOpen = () => {
    setOpen(true);
    pushHistoryState();
  };

  const shareLinks = [
    {
      name: "Facebook",
      icon: SiFacebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    },
    {
      name: "WhatsApp",
      icon: SiWhatsapp,
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title || ''} ${currentUrl}`)}`,
    },
    {
      name: "Pinterest",
      icon: SiPinterest,
      url: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(currentUrl)}&media=${encodeURIComponent(fullImageUrl)}&description=${encodeURIComponent(title || '')}`,
    },
    {
      name: "Email",
      icon: MdEmail,
      url: `mailto:?subject=${encodeURIComponent(title || '')}&body=${encodeURIComponent(`${title || ''}\n${currentUrl}`)}`,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={handleOpen}>
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 left-4 z-20 bg-background/80 backdrop-blur-sm"
        >
          <Share2 className="w-5 h-5" />
          <span className="sr-only">{t("share.sharePhoto")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center justify-center space-y-6 py-6">
          <Share2 className="w-12 h-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-foreground">
            {t("share.shareVia")}
          </h2>

          <div className="flex flex-wrap gap-4 justify-center w-full max-w-xs">
            {shareLinks.map((platform) => {
              const Icon = platform.icon;
              return (
                <a
                  key={platform.name}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                  >
                    <Icon className="w-5 h-5" />
                    {platform.name}
                  </Button>
                </a>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}