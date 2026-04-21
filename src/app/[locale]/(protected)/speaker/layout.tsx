import { LayoutDashboard, List } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Sidebar, { type SidebarLink } from "@/component/UI/Sidebar";

export default async function SpeakerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("SpeakerSidebar");

  const links: SidebarLink[] = [
    {
      href: "/speaker",
      label: t("overview"),
      icon: <LayoutDashboard size={16} />,
    },
    {
      href: "/speaker/list",
      label: t("list"),
      icon: <List size={16} />,
    },
  ];

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <Sidebar sectionLabel={t("sectionLabel")} links={links} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
