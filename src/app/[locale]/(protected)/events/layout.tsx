import { Calendar, LayoutDashboard, List } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Sidebar, { type SidebarLink } from "@/component/UI/Sidebar";

export default async function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("EventsSidebar");

  const links: SidebarLink[] = [
    {
      href: "/events",
      label: t("overview"),
      icon: <LayoutDashboard size={16} />,
    },
    {
      href: "/events/list",
      label: t("list"),
      icon: <List size={16} />,
    },
    {
      href: "/events/calendar",
      label: t("viewCalendar"),
      icon: <Calendar size={16} />,
    },
  ];

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <Sidebar sectionLabel={t("sectionLabel")} links={links} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
