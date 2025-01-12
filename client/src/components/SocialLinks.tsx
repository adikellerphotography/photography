import { SiFacebook, SiInstagram, SiPinterest } from "react-icons/si";
import { MdEmail } from "react-icons/md";
import PhoneDialog from "./PhoneDialog";

export default function SocialLinks() {
  const socialLinks = [
    {
      icon: SiFacebook,
      href: "https://www.facebook.com/adi.keller.16",
      label: "Facebook"
    },
    {
      icon: SiInstagram,
      href: "https://instagram.com/adi.keller.photography",
      label: "Instagram"
    },
    {
      icon: SiPinterest,
      href: "https://pin.it/6JpMIdk",
      label: "Pinterest"
    },
    {
      icon: MdEmail,
      href: "mailto:adi.keller.photography@gmail.com",
      label: "Email"
    }
  ];

  return (
    <div className="flex space-x-4 rtl:space-x-reverse">
      {socialLinks.map(({ icon: Icon, href, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors [dir='rtl']:[&:not(:first-child)]:mr-4"
          aria-label={label}
        >
          <Icon className="w-6 h-6" />
        </a>
      ))}
      <PhoneDialog />
    </div>
  );
}