import { SiFacebook, SiInstagram } from "react-icons/si";

export default function SocialLinks() {
  const socialLinks = [
    {
      icon: SiFacebook,
      href: "https://facebook.com",
      label: "Facebook"
    },
    {
      icon: SiInstagram,
      href: "https://instagram.com",
      label: "Instagram"
    }
  ];

  return (
    <div className="flex space-x-4">
      {socialLinks.map(({ icon: Icon, href, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label={label}
        >
          <Icon className="w-6 h-6" />
        </a>
      ))}
    </div>
  );
}
