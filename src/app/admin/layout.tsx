import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NOXAR PARFUM — Boshqaruv Paneli (Admin)',
  description: 'NOXAR PARFUM ma’muriy boshqaruv tizimi',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-0 text-text-main flex flex-col font-sans transition-colors">
      {children}
    </div>
  );
}
