import type { Metadata } from "next";
import "./globals.css";
import dynamic from "next/dynamic";

// ssr: false ensures Firebase is never imported on the server during
// static generation — prevents auth/invalid-api-key build errors.
const ClientShell = dynamic(() => import("@/components/ClientShell"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "CRM System",
  description: "Customer Relationship Management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body className="bg-gray-50 min-h-screen">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
