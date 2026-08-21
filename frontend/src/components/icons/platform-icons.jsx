import React from "react";
import {
  Instagram as LucideInstagram,
  Facebook as LucideFacebook,
  Youtube as LucideYoutube,
  Linkedin as LucideLinkedin,
  Send as LucideTelegram,
  MessageCircle as LucideDiscord,
  Ghost as LucideSnapchat,
  Camera as LucidePinterest,
  Sparkles,
} from "lucide-react";

// Authentic Vector SVG Logos
export function TikTokIcon({ className = "h-4 w-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-1.39V9.08a6.34 6.34 0 0 0-3.5 1.05 6.34 6.34 0 1 0 10.39 4.77V7.97a8.28 8.28 0 0 0 4.77 1.52V6.04a4.85 4.85 0 0 1-1.55-.05z" />
    </svg>
  );
}

export function XTwitterIcon({ className = "h-4 w-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function InstagramIcon({ className = "h-4 w-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function YouTubeIcon({ className = "h-4 w-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function FacebookIcon({ className = "h-4 w-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function TelegramIcon({ className = "h-4 w-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

export function DiscordIcon({ className = "h-4 w-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export function LinkedInIcon({ className = "h-4 w-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.64a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
    </svg>
  );
}

export function PinterestIcon({ className = "h-4 w-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.6 0 12.017 0z" />
    </svg>
  );
}

export function SnapchatIcon({ className = "h-4 w-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.036 1.5c-4.22 0-7.054 2.955-7.054 6.787 0 1.258.337 2.716.892 3.826.177.355.197.472.04.75-.276.492-.985 1.16-1.77 1.436-.454.157-.748.275-.788.59-.039.315.217.57.571.748 1.477.728 3.17.65 4.35.315.236-.078.433-.02.572.158.827.984 1.83 1.554 3.187 1.554 1.357 0 2.36-.57 3.187-1.554.138-.178.335-.236.571-.158 1.18.335 2.873.413 4.35-.315.354-.178.61-.433.571-.748-.04-.315-.334-.433-.788-.59-.786-.276-1.494-.944-1.77-1.436-.157-.278-.137-.395.04-.75.555-1.11.892-2.568.892-3.826 0-3.832-2.834-6.787-7.054-6.787z" />
    </svg>
  );
}

// Master platform icon registry
export const platformIcons = {
  TikTok: TikTokIcon,
  Tiktok: TikTokIcon,
  tiktok: TikTokIcon,
  "Twitter/X": XTwitterIcon,
  Twitter: XTwitterIcon,
  X: XTwitterIcon,
  twitter: XTwitterIcon,
  x: XTwitterIcon,
  Instagram: InstagramIcon,
  instagram: InstagramIcon,
  IG: InstagramIcon,
  YouTube: YouTubeIcon,
  Youtube: YouTubeIcon,
  youtube: YouTubeIcon,
  YT: YouTubeIcon,
  Facebook: FacebookIcon,
  facebook: FacebookIcon,
  FB: FacebookIcon,
  Telegram: TelegramIcon,
  telegram: TelegramIcon,
  Discord: DiscordIcon,
  discord: DiscordIcon,
  LinkedIn: LinkedInIcon,
  Linkedin: LinkedInIcon,
  linkedin: LinkedInIcon,
  Pinterest: PinterestIcon,
  pinterest: PinterestIcon,
  Snapchat: SnapchatIcon,
  snapchat: SnapchatIcon,
};

export function getPlatformIcon(platformName) {
  if (!platformName) return Sparkles;
  const key = String(platformName).trim();
  if (platformIcons[key]) return platformIcons[key];
  
  const lower = key.toLowerCase();
  if (lower.includes("tiktok")) return TikTokIcon;
  if (lower.includes("twitter") || lower.includes("x")) return XTwitterIcon;
  if (lower.includes("instagram") || lower === "ig") return InstagramIcon;
  if (lower.includes("youtube") || lower === "yt") return YouTubeIcon;
  if (lower.includes("facebook") || lower === "fb") return FacebookIcon;
  if (lower.includes("telegram")) return TelegramIcon;
  if (lower.includes("discord")) return DiscordIcon;
  if (lower.includes("linkedin")) return LinkedInIcon;
  if (lower.includes("pinterest")) return PinterestIcon;
  if (lower.includes("snapchat")) return SnapchatIcon;
  
  return Sparkles;
}
