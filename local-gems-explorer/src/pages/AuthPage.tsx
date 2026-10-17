import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";

const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(signupEmail, signupPassword, signupName);
      toast.success("Account created! Welcome aboard.");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container flex items-center justify-center py-16">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <Compass className="mx-auto h-10 w-10 text-primary" />
            <h1 className="mt-3 font-heading text-2xl font-bold">Welcome to Agra LocTour</h1>
            <p className="mt-1 text-muted-foreground">Sign in to discover and share hidden places</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 rounded-lg border p-6">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@example.com" className="mt-1" required />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" className="mt-1" required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 rounded-lg border p-6">
                <div>
                  <Label htmlFor="signup-name">Display Name</Label>
                  <Input id="signup-name" value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="Jane Explorer" className="mt-1" required />
                </div>
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="you@example.com" className="mt-1" required />
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="Min 6 characters" className="mt-1" required minLength={6} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AuthPage;
