import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/auth-context';
import ToasterProvider from '@/components/ToasterProvider';

const inter = Montserrat({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Fashion Brand | Faizah Nawawi",
  description: "Shop the latest fashion trends",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            {children}
            <ToasterProvider />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}