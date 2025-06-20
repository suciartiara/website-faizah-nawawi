import Sidebar from "@/components/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-100 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
