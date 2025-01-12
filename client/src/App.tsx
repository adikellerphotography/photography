import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/hooks/use-theme";
import { LanguageProvider, useLanguage } from "@/hooks/use-language";
import Navbar from "@/components/Navbar";
import BackgroundPattern from "@/components/BackgroundPattern";
import Home from "@/pages/home";
import Gallery from "@/pages/Gallery";
import About from "@/pages/About";
import Pricing from "@/pages/Pricing";
import NotFound from "@/pages/not-found";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from 'react';

function Layout({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  const [location] = useLocation();

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Prevent default behavior if we have internal state to handle
      if (event.state) {
        event.preventDefault();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update history state when route changes
  useEffect(() => {
    // Don't push state if it's the initial load
    if (window.history.state === null) {
      window.history.replaceState({ path: location }, '', location);
    } else {
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