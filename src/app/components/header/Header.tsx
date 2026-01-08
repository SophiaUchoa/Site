"use client";

import { Search, Store } from "lucide-react";
import s from "./Header.module.css";
import Link from "next/link";

export default function Header() {
  return (
    <div className={s.container}>
      <div className={s.cover} />

      <div className={s.card}>
        <div className={s.row}>
          <div className={s.left}>
            <div className={s.logo}>X</div>
            <h1 className={s.title}>Nome do Lanche</h1>
          </div>

          <div className={s.icons}>
            <Link href="/buscar" aria-label="Buscar no cardápio">
              <Search className={s.icon} />
            </Link>

            <Link href="/sobre" aria-label="Ver mais sobre a loja">
              <Store className={s.icon} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
