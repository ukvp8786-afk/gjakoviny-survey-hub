import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, Newspaper, ArrowLeft, Eye, EyeOff } from "lucide-react";

const ADMIN_PASSWORD = "gjak1234oviny";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem("gjak_admin_auth", "true");
        toast.success("Přihlášení úspěšné!");
        navigate("/admin/dashboard");
      } else {
        toast.error("Nesprávné heslo");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Zpět na průzkum
        </Button>

        <Card className="shadow-card border-0 animate-scale-in">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center">
                <Lock className="w-8 h-8 text-accent-foreground" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                <Newspaper className="w-4 h-4" />
                <span className="font-body text-xs uppercase tracking-wider">GJAKoviny</span>
              </div>
              <CardTitle className="font-display text-2xl">Přístup pro redakci</CardTitle>
              <CardDescription className="font-body">
                Zadej heslo pro přístup k výsledkům průzkumu
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Heslo"
                  className="pr-10 font-body"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={loading || !password}>
                {loading ? "Ověřuji..." : "Přihlásit se"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
