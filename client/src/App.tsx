import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/hooks/use-theme";
import { LanguageProvider, useLanguage } from "@/hooks/use-language";
import Navbar from "@/components/Navbar";
import BackgroundPattern from "@/components/BackgroundPattern";
import Home from "@/pages/Home";
import Gallery from "@/pages/Gallery";
import BeforeAndAfter from "@/pages/BeforeAndAfter";
import About from "@/pages/About";
import Info from "@/pages/Info";
import Pricing from "@/pages/Pricing";
import NotFound from "@/pages/not-found";
import { Toaster } from "@/components/ui/toaster";
import React from 'react';
import Sessions from "./pages/Sessions"; // Added import for Sessions page

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
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
        <Route path="/before-and-after" component={BeforeAndAfter} />
        <Route path="/sessions" component={Sessions} /> {/* Added Sessions route */}
        <Route path="/pricing" component={Pricing} />
        <Route path="/info" component={Info} />
        <Route path="/about" component={About} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const { language } = useLanguage();
  return (
    <ThemeProvider defaultTheme="dark">
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <div className={`min-h-screen bg-background ${language === 'he' ? 'rtl' : ''}`}>
            <Router />
            <Toaster />
          </div>
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;