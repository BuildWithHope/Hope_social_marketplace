"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { googleLoginUser } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";

export function GoogleButton({ text = "Continue with Google", onSuccessRedirect = "/" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const googleBtnContainerRef = useRef(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Handle Real Google OAuth Response from Google GSI
  const handleGoogleCredentialResponse = async (credentialResponse) => {
    setLoading(true);
    try {
      const data = await googleLoginUser({
        credential: credentialResponse.credential,
      });
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      toast.success("Successfully signed in with Google!");
      if (data.user?.is_staff || data.user?.is_superuser) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      toast.error(err.message || "Google authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Manual Real Email Submission
  const handleDirectEmailSubmit = async (e) => {
    e.preventDefault();
    if (!googleEmail || !googleEmail.includes("@")) {
      toast.error("Please enter a valid Google email address.");
      return;
    }
    setLoading(true);
    try {
      const cleanEmail = googleEmail.trim().toLowerCase();
      const data = await googleLoginUser({
        email: cleanEmail,
        name: cleanEmail.split("@")[0],
      });
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      toast.success(`Signed in as ${cleanEmail}`);
      setShowEmailInput(false);
      if (data.user?.is_staff || data.user?.is_superuser) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      toast.error(err.message || "Sign in failed. Please check backend API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!clientId || typeof window === "undefined") return;

    const initializeGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            use_fedcm_for_prompt: false,
          });

          if (googleBtnContainerRef.current) {
            window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
              theme: "outline",
              size: "large",
              width: "100%",
              text: text === "Sign up with Google" ? "signup_with" : "continue_with",
              shape: "rectangular",
              logo_alignment: "left",
            });
          }
        } catch (e) {
          // Fallback handled via button
        }
      }
    };

    if (window.google?.accounts?.id) {
      initializeGsi();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGsi;
      document.head.appendChild(script);
    }
  }, [clientId, text]);

  return (
    <div className="w-full space-y-2">
      {/* Official Google GSI Rendered Button */}
      {clientId && (
        <div className="w-full flex justify-center overflow-hidden rounded-md min-h-[40px] border border-border">
          <div ref={googleBtnContainerRef} className="w-full flex justify-center" />
        </div>
      )}

      {/* Styled Secondary Google Sign In Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full relative flex items-center justify-center gap-3 bg-background hover:bg-muted/60 border-input py-5 text-sm font-medium transition-all shadow-xs cursor-pointer"
        onClick={() => setShowEmailInput(true)}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>{text}</span>
      </Button>

      {/* Direct Google Account Email Modal */}
      {showEmailInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-background border border-border rounded-2xl p-6 shadow-2xl space-y-4 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-1.5">
              <div className="flex justify-center mb-1">
                <svg className="h-8 w-8" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold tracking-tight">Sign in with Google</h2>
              <p className="text-xs text-muted-foreground">Enter your Google email address to continue</p>
            </div>

            <form onSubmit={handleDirectEmailSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Google Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    placeholder="your.email@gmail.com"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-muted/30 border border-input rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmailInput(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={loading} className="font-semibold bg-emerald-500 hover:bg-emerald-600 text-black">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue to Account"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
