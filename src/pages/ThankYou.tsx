import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Newspaper, Home } from "lucide-react";

export default function ThankYou() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 gradient-hero opacity-20 blur-3xl rounded-full" />
          <div className="relative flex justify-center">
            <div className="w-24 h-24 rounded-full gradient-hero flex items-center justify-center shadow-glow animate-scale-in">
              <CheckCircle className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Newspaper className="w-5 h-5" />
            <span className="font-body text-sm uppercase tracking-wider">GJAKoviny</span>
          </div>
          
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Děkujeme!
          </h1>
          
          <p className="font-body text-muted-foreground text-lg">
            Tvé odpovědi nám pomohou vytvořit ještě lepší časopis. 
            Sleduj nás pro nové vydání!
          </p>
        </div>

        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <Home className="w-4 h-4" />
          Zpět na úvodní stránku
        </Button>
      </div>
    </div>
  );
}
