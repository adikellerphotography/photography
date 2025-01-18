import { Link } from "wouter";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Home, Image, User, CreditCard, Info as InfoIcon, SplitSquareVertical, Mail, FileText, Aperture, Banknote, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "@/hooks/use-language";
import { useState } from "react";

export default function Navbar() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { href: "/", label: language === "en" ? "Home" : "בית", icon: Home },
    { href: "/gallery", label: language === "en" ? "Gallery" : "גלריה", icon: Image },
    { href: "/before-and-after", label: language === "en" ? "Before & After" : "לפני ואחרי", icon: SplitSquareVertical },
    { href: "/sessions", label: language === "en" ? "My Sessions" : "גלריות", icon: Aperture },
    { href: "/info", label: language === "en" ? "Guidelines" : "מידע על הצילומים", icon: FileText },
    { href: "/pricing", label: language === "en" ? "Pricing" : "מחירים", icon: Banknote },
    { href: "/workshop", label: language === "en" ? "Workshop" : "סדנאות", icon: GraduationCap },
    { href: "/about", label: language === "en" ? "About" : "אודות", icon: InfoIcon },
    { href: "/contact", label: language === "en" ? "Contact Me" : "צור קשר", icon: Mail } // Added Master Class navigation item
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <NavigationMenu className="w-full">
        <div className="w-full flex items-center h-14">
          <div className="flex items-center">
            <Link href="/">
              <NavigationMenuLink className={cn(
                "h-14 px-4 py-2 transition-colors hover:bg-accent focus:outline-none cursor-pointer flex items-center gap-2",
                location.pathname === "/" ? "bg-accent/60" : ""
              )}>
                <Home className="h-4 w-4" />
              </NavigationMenuLink>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 ml-auto px-4">
            <NavigationMenuList>
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <Link href={item.href}>
                    <NavigationMenuLink className={cn(
                      "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                    )}>
                      {item.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
            <LanguageToggle />
            <ThemeToggle />
            <img
              src="/logo-inverted.svg"
              alt="Adi Keller Photography"
              className="h-8 w-8 opacity-80 dark:invert"
            />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center ml-auto">
            {/* Theme and Language toggles */}
            <div className="flex items-center gap-2 px-4">
              <LanguageToggle />
              <ThemeToggle />
            </div>

            {/* Menu button floating on the right with brighter background */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-14 w-14 rounded-none border-l bg-accent/60 hover:bg-accent/80 transition-colors fixed top-0 right-0"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:w-[280px]">
                <nav className="flex flex-col gap-4 mt-6">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href}>
                        <button
                          className="flex items-center gap-3 px-2 py-2 text-lg hover:text-primary transition-colors w-full text-left"
                          onClick={() => setIsOpen(false)}
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </button>
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </NavigationMenu>
    </div>
  );
}