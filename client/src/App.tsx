import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/hooks/use-theme";
import { LanguageProvider } from "@/hooks/use-language";
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
import React, { useEffect } from 'react';
import Sessions from "./pages/Sessions";
import Contact from "@/pages/Contact";
import GuidingAndMentoring from "./pages/GuidingAndMentoring";
import ReflectionProject from "@/pages/ReflectionProject";


function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

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
        <Route path="/sessions" component={Sessions} />
<Route path="/reflection" component={ReflectionProject} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/pricing/:category" component={Pricing} />
        <Route path="/info" component={Info} />
        <Route path="/workshop" component={GuidingAndMentoring} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
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