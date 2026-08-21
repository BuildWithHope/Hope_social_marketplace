import { platformIcons as authenticPlatformIcons, getPlatformIcon } from "@/components/icons/platform-icons";

export { getPlatformIcon };
export const platformIcons = authenticPlatformIcons;

export const platforms = [
  "Instagram","Facebook","TikTok","Twitter/X","Telegram",
  "Discord","YouTube","LinkedIn","Pinterest","Snapchat",
];

const svcTitles = [
  "Followers – High Quality","Likes – Instant","Views – Real Users",
  "Comments – Custom","Subscribers – Global","Members – Targeted",
  "Shares – Organic","Reactions – Mixed",
];

function rand(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

export const recentOrders = Array.from({ length: 12 }).map((_, i) => ({
  id: `HS-${(48219 - i).toString()}`,
  service: `${rand(platforms)} ${rand(svcTitles)}`,
  platform: rand(platforms),
  status: rand(["Completed","Completed","Pending","Failed","In Progress","Completed"]),
  amount: +(Math.random() * 25000 + 1500).toFixed(2),
  date: new Date(Date.now() - i * 86400000 * (1 + Math.random())).toISOString(),
}));

const categories = ["Followers","Likes","Views","Subscribers","Members","Comments","Shares"];

export const services = Array.from({ length: 36 }).map((_, i) => {
  const platform = platforms[i % platforms.length];
  const category = categories[i % categories.length];
  return {
    id: `SVC-${1000 + i}`,
    name: `${platform} ${category} — ${i % 2 ? "Premium" : "Standard"}`,
    platform,
    category,
    description: `High retention ${category.toLowerCase()} delivered from real, region-mixed profiles with drip-feed pacing.`,
    price: +((i % 9) * 450 + 1200).toFixed(2),
    delivery: rand(["0–1h","1–6h","6–24h","24–48h"]),
    min: [50,100,250,500][i % 4],
    max: [10000,50000,100000,250000][i % 4],
    inStock: i % 7 !== 0,
  };
});

const countries = ["USA","UK","Germany","Brazil","Nigeria","India","Canada","France","Japan","UAE"];

export const accounts = Array.from({ length: 24 }).map((_, i) => ({
  id: `ACC-${2000 + i}`,
  platform: platforms[i % platforms.length],
  country: countries[i % countries.length],
  followers: [120, 850, 2400, 9800, 34500, 128000][i % 6],
  emailIncluded: i % 2 === 0,
  phoneVerified: i % 3 !== 0,
  ageMonths: (i % 36) + 3,
  price: +((i % 12) * 5500 + 15000).toFixed(2),
  available: i % 5 !== 0,
}));

export const transactions = Array.from({ length: 40 }).map((_, i) => ({
  id: `TX-${90000 - i}`,
  type: rand(["Deposit","Order","Withdrawal","Order","Order","Refund"]),
  amount: +(Math.random() * 50000 + 2500).toFixed(2),
  status: rand(["Completed","Completed","Pending","Failed"]),
  method: rand(["Bank Transfer","Flutterwave","Paystack","Crypto (USDT)","Wallet"]),
  reference: `REF-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
  date: new Date(Date.now() - i * 3600 * 1000 * 12).toISOString(),
}));

export const monthlySpending = [
  { m: "Jan", v: 42000 }, { m: "Feb", v: 58000 }, { m: "Mar", v: 69000 },
  { m: "Apr", v: 54000 }, { m: "May", v: 82000 }, { m: "Jun", v: 97000 },
  { m: "Jul", v: 112000 }, { m: "Aug", v: 98000 }, { m: "Sep", v: 134000 },
  { m: "Oct", v: 148000 }, { m: "Nov", v: 162000 }, { m: "Dec", v: 189000 },
];

export const monthlyOrders = monthlySpending.map(({ m, v }) => ({ m, v: Math.round(v / 600) }));

export const topServices = [
  { name: "IG Followers", v: 42 },
  { name: "TikTok Views", v: 28 },
  { name: "YT Subscribers", v: 17 },
  { name: "Telegram Members", v: 13 },
];

export const notifications = [
  { title: "Order HS-48219 completed", time: "2m ago", tone: "success" },
  { title: "Wallet funded via Flutterwave", time: "1h ago", tone: "info" },
  { title: "New API key generated", time: "5h ago", tone: "info" },
  { title: "Order HS-48210 failed — refunded", time: "Yesterday", tone: "warning" },
  { title: "Referral bonus earned: ₦12,400.00", time: "2d ago", tone: "success" },
];
