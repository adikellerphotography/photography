import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/hooks/use-theme";
import { LanguageProvider } from "@/hooks/use-language";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Home from "@/pages/home";
import Gallery from "@/pages/Gallery";
import About from "@/pages/About";
import Pricing from "@/pages/Pricing";
import NotFound from "@/pages/not-found";
import { Toaster } from "@/components/ui/toaster";
import PageTransition from "@/components/PageTransition";

function Router() {
  const [location] = useLocation();

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <Switch key={location}>
          <Route path="/">
            <PageTransition>
              <Home />
            </PageTransition>
          </Route>
          <Route path="/gallery">
            <PageTransition>
              <Gallery />
            </PageTransition>
          </Route>
          <Route path="/about">
            <PageTransition>
              <About />
            </PageTransition>
          </Route>
          <Route path="/pricing">
            <PageTransition>
              <Pricing />
            </PageTransition>
          </Route>
          <Route>
            <PageTransition>
              <NotFound />
            </PageTransition>
          </Route>
        </Switch>
      </AnimatePresence>
    </>
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