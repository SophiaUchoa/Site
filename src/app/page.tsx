"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, Share2, Store } from "lucide-react";
import Header from "./components/header/Header";
import BottomNav from "./components/bottomnav/BottomNav";
import s from "./ShopPage.module.css";

const CATS = [
  { id: "1", label: "CATEGORIA 1" }, // horizontal
  { id: "2", label: "CATEGORIA 2" }, // vertical
  { id: "3", label: "CATEGORIA 3" }, // vertical
];

const TOPBAR_H = 56;
const TABS_H = 44;
const OFFSET = TOPBAR_H + TABS_H;

const SCROLL_LOCK_MS = 450;

export default function HomePage() {
  const [active, setActive] = useState<string>(CATS[0].id);
  const [showTop, setShowTop] = useState(false);

  const isScrollingRef = useRef(false);
  const scrollTimerRef = useRef<number | null>(null);

  // Topbar aparece quando passar do header
  useEffect(() => {
    const el = document.getElementById("header-sentinel");
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const atTop = entry.isIntersecting;
        setShowTop(!atTop);
        if (atTop) setActive(CATS[0].id);
      },
      { root: null, rootMargin: "-8px 0px 0px 0px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Scrollspy (silencia durante o scroll suave)
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: `-${OFFSET + 1}px 0px -65% 0px`, threshold: 0.1 }
    );
    CATS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setActive(id);
    isScrollingRef.current = true;
    if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current);

    const y = el.getBoundingClientRect().top + window.scrollY - OFFSET;
    window.scrollTo({ top: y, behavior: "smooth" });

    scrollTimerRef.current = window.setTimeout(() => {
      isScrollingRef.current = false;
    }, SCROLL_LOCK_MS);
  };

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current);
    };
  }, []);

  return (
    <main className={s.main}>
      <Header />

      {/* sentinel: logo após o Header */}
      <div id="header-sentinel" className={s.sentinel} />

      {/* Topo fixo (título + ícones) */}
      <div className={`${s.topbar} ${showTop ? s.topbarShow : ""}`}>
        <h1 className={s.topTitle}>Nome do Lanche</h1>
<div className={s.topIcons}>
  <Link href="/buscar" aria-label="Buscar no cardápio">
    <Search className={s.topIcon} />
  </Link>

  <Link href="/sobre" aria-label="Ver mais sobre a loja">
    <Store className={s.topIcon} />
  </Link>
</div>

      </div>

      {/* Abas */}
      <nav className={`${s.tabs} ${showTop ? s.tabsShifted : ""}`} aria-label="Categorias">
        {CATS.map((c) => (
          <button
            key={c.id}
            onClick={() => go(c.id)}
            className={`${s.tab} ${active === c.id ? s.tabActive : ""}`}
            aria-current={active === c.id ? "page" : undefined}
          >
            {c.label}
          </button>
        ))}
      </nav>

      {/* ======= SEÇÕES ======= */}

      {/* 1) CATEGORIA 1 — HORIZONTAL */}
      <section id="1" className={s.section}>
        <h2 className={s.h2}>CATEGORIA 1</h2>

        <div className={s.hCarousel} role="list">
          {/* Cada card vira link para /produto/[id] */}
          <Link
            href="/produto/1"
            role="listitem"
            className={`${s.hCard} searchable`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <img className={s.hImg} src="https://via.placeholder.com/300x200" alt="Item 1" />
            <div className={s.hBody}>
              <h3 className={s.hName}>Item 1</h3>
              <p className={s.hDesc}>Descrição curta do item.</p>
              <p className={s.hPrice}>R$ XX,XX</p>
            </div>
          </Link>

          <Link
            href="/produto/2"
            role="listitem"
            className={`${s.hCard} searchable`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <img className={s.hImg} src="https://via.placeholder.com/300x200" alt="Item 2" />
            <div className={s.hBody}>
              <h3 className={s.hName}>Item 2</h3>
              <p className={s.hDesc}>Descrição curta do item.</p>
              <p className={s.hPrice}>R$ XX,XX</p>
            </div>
          </Link>

          <Link
            href="/produto/3"
            role="listitem"
            className={`${s.hCard} searchable`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <img className={s.hImg} src="https://via.placeholder.com/300x200" alt="Item 3" />
            <div className={s.hBody}>
              <h3 className={s.hName}>Item 3</h3>
              <p className={s.hDesc}>Descrição curta do item.</p>
              <p className={s.hPrice}>R$ XX,XX</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 2) CATEGORIA 2 — VERTICAL */}
      <section id="2" className={s.section}>
        <h2 className={s.h2}>CATEGORIA 2</h2>

        <ul className={s.list}>
          <li className={`${s.item} searchable`}>
            <Link
              href="/produto/4"
              className={s.info}
              style={{ textDecoration: "none", color: "inherit", display: "block" }}
            >
              <h3 className={s.name}>Item 1</h3>
              <p className={s.desc}>Descrição breve do item.</p>
              <p className={s.price}>R$ XX,XX</p>
            </Link>
            <Link href="/produto/4" style={{ display: "block" }}>
              <img className={s.thumb} src="https://via.placeholder.com/140x140" alt="Item 1" />
            </Link>
          </li>

          <li className={`${s.item} searchable`}>
            <Link
              href="/produto/5"
              className={s.info}
              style={{ textDecoration: "none", color: "inherit", display: "block" }}
            >
              <h3 className={s.name}>Item 2</h3>
              <p className={s.desc}>Descrição breve do item.</p>
              <p className={s.price}>R$ XX,XX</p>
            </Link>
            <Link href="/produto/5" style={{ display: "block" }}>
              <img className={s.thumb} src="https://via.placeholder.com/140x140" alt="Item 2" />
            </Link>
          </li>
        </ul>
      </section>

      {/* 3) CATEGORIA 3 — VERTICAL */}
      <section id="3" className={s.section}>
        <h2 className={s.h2}>CATEGORIA 3</h2>

        <ul className={s.list}>
          <li className={`${s.item} searchable`}>
            <Link
              href="/produto/6"
              className={s.info}
              style={{ textDecoration: "none", color: "inherit", display: "block" }}
            >
              <h3 className={s.name}>Item 1</h3>
              <p className={s.desc}>Descrição breve do item.</p>
              <p className={s.price}>R$ XX,XX</p>
            </Link>
            <Link href="/produto/6" style={{ display: "block" }}>
              <img className={s.thumb} src="https://via.placeholder.com/140x140" alt="Item 1" />
            </Link>
          </li>

          <li className={`${s.item} searchable`}>
            <Link
              href="/produto/7"
              className={s.info}
              style={{ textDecoration: "none", color: "inherit", display: "block" }}
            >
              <h3 className={s.name}>Item 2</h3>
              <p className={s.desc}>Descrição breve do item.</p>
              <p className={s.price}>R$ XX,XX</p>
            </Link>
            <Link href="/produto/7" style={{ display: "block" }}>
              <img className={s.thumb} src="https://via.placeholder.com/140x140" alt="Item 2" />
            </Link>
          </li>
        </ul>
      </section>

      <BottomNav />
    </main>
  );
}
