import "@/styles.css";
import { Providers } from "./providers";

export const metadata = {
  title: "HopeSocial Marketplace — Premium Social Growth & Accounts",
  description: "HopeSocial Marketplace: buy social media services, aged accounts, fund your wallet, track orders, and integrate our API — fast, secure and premium.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
