"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { googleLoginUser } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

export function GoogleButton({ text = "Continue with Google", onSuccessRedirect = "/" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showChooser, setShowChooser] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const googleBtnContainerRef = useRef(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Mock sample accounts for instant demo fallback if needed
  const sampleAccounts = [
    {
      name: "Alex Johnson",
      email: "alex.johnson@gmail.com",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    },
    {
      name: "Sarah Williams",
      email: "sarah.williams@gmail.com",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    },
    {
      name: "David Miller",
      email: "david.miller@gmail.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    },
  ];

  const handleGoogleAuth = async (credentialResponse) => {
    setLoading(true);
    try {
      await googleLoginUser({
        credential: credentialResponse.credential,
      });
      toast.success("Successfully signed in with Google!");
      router.push(onSuccessRedirect);
    } catch (err) {
      toast.error(err.message || "Google authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!clientId || typeof window === "undefined") return;

    const initGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleAuth,
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
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      script.onerror = () => setGsiError(true);
      document.head.appendChild(script);
    }
  }, [clientId, text]);

  const handleSelectAccount = async (account) => {
    setShowChooser(false);
    setLoading(true);
    try {
      await googleLoginUser({
        email: account.email,
        name: account.name,
        given_name: account.name.split(" ")[0],
        family_name: account.name.split(" ")[1] || "",
      });
      toast.success(`Signed in as ${account.email}`);
      router.push(onSuccessRedirect);
    } catch (err) {
      toast.error(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes("@")) {
      toast.error("Please enter a valid Gmail address.");
      return;
    }
    await handleSelectAccount({
      name: customEmail.split("@")[0],
      email: customEmail.toLowerCase(),
    });
  };

  const handleClick = () => {
    if (typeof window === "undefined") return;

    if (clientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If One-tap prompt isn't displayed, trigger hidden rendered button click
          const iframeBtn = googleBtnContainerRef.current?.querySelector('div[role="button"]');
          if (iframeBtn) {
            iframeBtn.click();
          } else {
            setShowChooser(true);
          }
        }
      });
    } else {
      setShowChooser(true);
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Official Google GSI Rendered Button Container */}
      {clientId ? (
        <div className="w-full flex justify-center overflow-hidden rounded-md min-h-[40px]">
          <div ref={googleBtnContainerRef} className="w-full flex justify-center" />
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full relative flex items-center justify-center gap-3 bg-background hover:bg-muted/60 border-input py-5 text-sm font-medium transition-all shadow-xs cursor-pointer"
          onClick={handleClick}
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
      )}

      {/* Fallback Account Chooser Modal */}
      {showChooser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-background border border-border rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center space-y-2">
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
              <h2 className="text-xl font-semibold tracking-tight">Choose an account</h2>
              <p className="text-xs text-muted-foreground">to continue to HopeSocial Marketplace</p>
            </div>

            {/* Account List */}
            <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-card">
              {sampleAccounts.map((acc, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectAccount(acc)}
                  className="w-full flex items-center gap-3 p-3.5 hover:bg-muted/70 transition-colors text-left group cursor-pointer"
                >
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    className="h-10 w-10 rounded-full object-cover border border-border flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {acc.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{acc.email}</p>
                  </div>
                </button>
              ))}

              {/* Custom Email Input Toggle */}
              {showCustomInput ? (
                <form onSubmit={handleCustomSubmit} className="p-3.5 space-y-2 bg-muted/30">
                  <p className="text-xs font-medium text-foreground">Enter custom Gmail account:</p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder="your.name@gmail.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                    />
                    <Button type="submit" size="xs" className="px-3">
                      Sign in
                    </Button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="w-full flex items-center gap-3 p-3.5 hover:bg-muted/70 transition-colors text-left cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border border-dashed border-muted-foreground/40 text-muted-foreground flex-shrink-0">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Use another account</p>
                    <p className="text-xs text-muted-foreground">Sign in with a different Gmail address</p>
                  </div>
                </button>
              )}
            </div>

            {/* Cancel Button */}
            <div className="pt-1 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowChooser(false);
                  setShowCustomInput(false);
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
