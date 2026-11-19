import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { CartDrawer } from "@/components/store/cart-drawer";

export const metadata: Metadata = {
  title: {
    default: "Vendas Black",
    template: "%s | Vendas Black",
  },
  description:
    "Lojas independentes, produtos selecionados e pedidos simples em um só lugar.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
