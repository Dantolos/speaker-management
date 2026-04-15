import Link from "next/link";
//import { getTranslations } from "next-intl/server";
import { Users, Calendar, Hotel, Plus } from "lucide-react";

interface Props {
  params: Promise<{ locale: string }>;
}

const tiles = [
  {
    href: "/speaker",
    label: "Speaker",
    description: "Alle Speaker verwalten",
    icon: Users,
    color: "bg-blue-50 text-blue-600",
  },
  {
    href: "/events",
    label: "Events",
    description: "Events & Programme",
    icon: Calendar,
    color: "bg-green-50 text-green-600",
  },
  {
    href: "/partner",
    label: "Partner",
    description: "Partner verwalten",
    icon: Hotel,
    color: "bg-amber-50 text-amber-600",
  },
];

// Placeholder – später aus Airtable/Directus
const metrics = [
  { label: "Speaker", value: "–" },
  { label: "Events", value: "–" },
  { label: "Offene Aufgaben", value: "–" },
  { label: "Hotels", value: "–" },
];

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;

  return (
    <div className="p-6">
      <p className="text-sm text-foreground/50 mb-1">Willkommen zurück</p>
      <h1 className="text-2xl font-medium mb-6">Dashboard</h1>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {metrics.map(({ label, value }) => (
          <div key={label} className="bg-foreground/5 rounded-xl p-4">
            <p className="text-xs text-foreground/50 mb-1">{label}</p>
            <p className="text-2xl font-medium">{value}</p>
          </div>
        ))}
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tiles.map(({ href, label, description, icon: Icon, color }) => (
          <Link
            key={href}
            href={`/${locale}${href}`}
            className="bg-box-background border border-foreground/10 rounded-2xl p-5 hover:border-foreground/20 transition-all"
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${color}`}
            >
              <Icon size={16} />
            </div>
            <p className="font-medium mb-1">{label}</p>
            <p className="text-sm text-foreground/50">{description}</p>
          </Link>
        ))}

        {/* Placeholder */}
        <div className="border border-dashed border-foreground/20 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 text-foreground/30">
          <Plus size={16} />
          <p className="text-sm">Kachel hinzufügen</p>
        </div>
      </div>
    </div>
  );
}
