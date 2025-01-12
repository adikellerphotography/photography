import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/hooks/use-theme";
import { LanguageProvider, useLanguage } from "@/hooks/use-language";
import Navbar from "@/components/Navbar";
import BackgroundPattern from "@/components/BackgroundPattern";
import Home from "@/pages/Home";
import Gallery from "@/pages/Gallery";
import About from "@/pages/About";
import Pricing from "@/pages/Pricing";
import NotFound from "@/pages/not-found";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from 'react';

function Layout({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  const [location] = useLocation();
  const [navigationStack, setNavigationStack] = useState<string[]>([location]);

  // Handle mobile back button
  useEffect(() => {
    const handleBackButton = (e: PopStateEvent) => {
      e.preventDefault();

      // Get previous location from our stack
      const newStack = [...navigationStack];
      if (newStack.length > 1) {
        newStack.pop(); // Remove current location
        const previousLocation = newStack[newStack.length - 1];
        setNavigationStack(newStack);
        window.history.pushState({ path: previousLocation }, '', previousLocation);
      }

      return false;
    };

    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, [navigationStack]);

  // Update navigation stack when route changes
  useEffect(() => {
    // Only add to stack if it's a new location
    if (navigationStack[navigationStack.length - 1] !== location) {
      setNavigationStack(prev => [...prev, location]);
      window.history.pushState({ path: location }, '', location);
    }
  }, [location]);

  return (
    <div dir={language === "he" ? "rtl" : "ltr"}>
      <BackgroundPattern />
      <Navbar />
      {children}
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/about" component={About} />
        <Route path="/pricing" component={Pricing} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <Router />
          <Toaster />
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;