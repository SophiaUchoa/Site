import type { Metadata } from "next";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Minha Loja",
  description: "Delivery online",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={poppins.variable}>
      <body
        style={{
          margin: 0,            // << remove as “bordas” brancas
          padding: 0,
          background: "#fff",
          color: "#111",
          fontFamily: "var(--font-poppins), system-ui, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
