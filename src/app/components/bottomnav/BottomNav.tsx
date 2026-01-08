"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, ShoppingBag, Gift, ShoppingCart } from "lucide-react";
import s from "./BottomNav.module.css";

type CartItem = {
  id: string;
  name: string;
  size: string;
  flavors: string[];
  extras: string[];
  notes: string;
  qty: number;
  unitPrice: number;
  total: number;
};

const navItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/carrinho", label: "Carrinho", icon: ShoppingCart },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  // lê carrinho e escuta mudanças
  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem("cart");
        const cart: CartItem[] = raw ? JSON.parse(raw) : [];
        // soma quantidades
        const totalQty = cart.reduce((n, it) => n + (Number(it.qty) || 0), 0);
        setCount(totalQty);
      } catch {
        setCount(0);
      }
    };
    read();

    // atualiza quando o storage mudar (outra aba) e quando dispararmos 'cartUpdated' (mesma aba)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "cart") read();
    };
    const onCustom = () => read();

    window.addEventListener("storage", onStorage);
    window.addEventListener("cartUpdated", onCustom as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cartUpdated", onCustom as EventListener);
    };
  }, []);

  return (
    <nav className={s.nav}>
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        const isCart = href === "/carrinho";

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`${s.link} ${active ? s.linkActive : ""}`}
          >
            <div className={`${s.underline} ${active ? s.underlineActive : ""}`} />

            <div className={s.iconWrap}>
              <Icon className={s.icon} />
              {isCart && count > 0 && <span className={s.badge}>{count}</span>}
            </div>

            <span className={s.label}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
