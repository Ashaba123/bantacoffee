import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";
import { AuthLayout } from "@/components/layout/auth-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Banta Coffee - Inventory Management",
  description: "Complete inventory management system for coffee production and sales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AuthLayout>
            {children}
          </AuthLayout>
        </AuthProvider>
      </body>
    </html>
  );
}

