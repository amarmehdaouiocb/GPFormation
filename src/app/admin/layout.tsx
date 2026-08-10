import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      data-admin-shell
      className="fixed inset-0 z-[100] overflow-y-auto bg-[#f2f3ed] text-zinc-950"
    >
      {children}
    </div>
  );
}
