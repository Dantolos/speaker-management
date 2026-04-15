import Sidebar from "@/component/UI/Sidebar";

type Props = {
  children: React.ReactNode;
};

export default function SpeakerListLayout({ children }: Props) {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
