import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/hooks/use-theme";
import { LanguageProvider } from "@/hooks/use-language";
import Navbar from "@/components/Navbar";
import Home from "@/pages/home";
import Gallery from "@/pages/Gallery";
import About from "@/pages/About";
import Pricing from "@/pages/Pricing";
import NotFound from "@/pages/not-found";
import { Toaster } from "@/components/ui/toaster";

function Router() {
  return (
    <>
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/about" component={About} />
        <Route path="/pricing" component={Pricing} />
        <Route component={NotFound} />
      </Switch>
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