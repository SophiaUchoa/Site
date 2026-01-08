"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ShoppingCart, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import BottomNav from "../components/bottomnav/BottomNav";
import s from "./Carrinho.module.css";

type Profile = { phone: string; name: string };

type CartItem = {
  /** id do produto (ex.: "pizza-g", etc.) */
  id: string;
  /** id ÚNICO da linha no carrinho (estável) */
  lineId: string;
  name: string;
  size: string;
  flavors: string[];
  extras: string[];
  notes: string;
  qty: number;
  unitPrice: number;
  total: number;
};

function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function safeUUID() {
  // usa crypto.randomUUID quando disponível; fallback com timestamp+rand
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyGlobal = globalThis as any;
  return anyGlobal?.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function CarrinhoPage() {
  const router = useRouter();

  const [identified, setIdentified] = useState<boolean | null>(null);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  const [cart, setCart] = useState<CartItem[]>([]);

  // ===== identificação =====
  useEffect(() => {
    try {
      const saved = localStorage.getItem("userProfile");
      setIdentified(!!saved);
      if (saved) {
        const p: Profile = JSON.parse(saved);
        setPhone(p.phone || "");
        setName(p.name || "");
      }
    } catch {
      setIdentified(false);
    }
  }, []);

  // ===== leitura do carrinho + normalização de lineId =====
  const normalizeCart = (arr: CartItem[]): CartItem[] => {
    let changed = false;
    const normalized = arr.map((it) => {
      if (!it.lineId) {
        changed = true;
        return { ...it, lineId: safeUUID() };
      }
      return it;
    });
    if (changed) {
      localStorage.setItem("cart", JSON.stringify(normalized));
      // notifica outras partes da app
      window.dispatchEvent(new Event("cartUpdated"));
    }
    return normalized;
  };

  const readCart = () => {
    try {
      const raw = localStorage.getItem("cart");
      const c: CartItem[] = raw ? JSON.parse(raw) : [];
      setCart(normalizeCart(c));
    } catch {
      setCart([]);
    }
  };

  useEffect(() => {
    readCart();
    const onCustom = () => readCart();
    window.addEventListener("cartUpdated", onCustom as EventListener);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "cart") readCart();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("cartUpdated", onCustom as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // ===== helpers =====
  const persist = (next: CartItem[]) => {
    localStorage.setItem("cart", JSON.stringify(next));
    setCart(next);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const inc = (lineId: string) => {
    const next = cart.map((it) =>
      it.lineId === lineId ? { ...it, qty: it.qty + 1, total: it.unitPrice * (it.qty + 1) } : it
    );
    persist(next);
  };

  const dec = (lineId: string) => {
    const next = cart.map((it) => {
      if (it.lineId !== lineId) return it;
      const newQty = Math.max(1, it.qty - 1);
      return { ...it, qty: newQty, total: it.unitPrice * newQty };
    });
    persist(next);
  };

  const removeItem = (lineId: string) => {
    const next = cart.filter((it) => it.lineId !== lineId);
    persist(next);
  };

  const clearCart = () => persist([]);

  const subTotal = useMemo(() => cart.reduce((n, it) => n + (it.total || 0), 0), [cart]);
  const delivery = 0;
  const grandTotal = subTotal + delivery;

  // ===== identificação simples =====
  function formatBRPhone(raw: string) {
    const d = raw.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  const digits = phone.replace(/\D/g, "");
  const phoneValid = digits.length === 11;
  const nameValid = name.trim().length >= 2;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneValid || !nameValid) return;
    const profile: Profile = { phone, name: name.trim() };
    localStorage.setItem("userProfile", JSON.stringify(profile));
    setIdentified(true);
  }

  if (identified === null) return null;

  return (
    <main className={s.wrap}>
      <div className={s.inner}>
        {/* Topbar */}
        <header className={s.topbar}>
          <button className={s.backBtn} onClick={() => router.back()} aria-label="Voltar">
            <ChevronLeft size={20} />
          </button>
          <h1 className={s.title}>Carrinho</h1>
        </header>

        {!identified ? (
          <form className={s.form} onSubmit={handleSubmit}>
            <label className={s.label} htmlFor="phone">Seu número de WhatsApp é:</label>
            <input
              id="phone"
              className={`${s.input} ${s.inputPhone}`}
              inputMode="tel"
              placeholder="(  ) _____-____"
              value={phone}
              onChange={(e) => setPhone(formatBRPhone(e.target.value))}
              autoFocus
            />

            <label className={s.label} htmlFor="name">Seu nome e sobrenome:</label>
            <input
              id="name"
              className={s.input}
              placeholder="Nome e sobrenome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!phoneValid}
            />

            <button
              type="submit"
              className={`${s.btn} ${phoneValid && nameValid ? s.btnOk : s.btnDisabled}`}
              disabled={!(phoneValid && nameValid)}
            >
              Avançar
            </button>

            <p className={s.note}>
              Para realizar seu pedido vamos precisar de suas informações,
              este é um ambiente protegido.
            </p>
          </form>
        ) : cart.length === 0 ? (
          <section className={s.empty}>
            <ShoppingCart className={s.emptyIcon} />
            <h2 className={s.emptyTitle}>Seu carrinho está vazio</h2>
            <p className={s.emptySub}>Adicione produtos ao carrinho e faça o pedido</p>
            <button className={s.linkBtn} onClick={() => router.push("/")}>
              Ir para o cardápio
            </button>
          </section>
        ) : (
          <>
            <section className={s.list}>
              {cart.map((it) => (
                <article key={it.lineId} className={s.card}>
                  <div className={s.cardHead}>
                    <div className={s.cardTitleWrap}>
                      <h2 className={s.cardTitle}>{it.name}</h2>
                      {it.size && <span className={s.cardMeta}>Tamanho: {it.size}</span>}
                      {it.flavors?.length > 0 && (
                        <span className={s.cardMeta}>Sabores: {it.flavors.join(" + ")}</span>
                      )}
                      {it.extras?.length > 0 && (
                        <span className={s.cardMeta}>Adicionais: {it.extras.join(", ")}</span>
                      )}
                      {it.notes && <span className={s.cardMeta}>Obs.: {it.notes}</span>}
                    </div>

                    <button
                      className={s.trashBtn}
                      aria-label="Remover item"
                      onClick={() => removeItem(it.lineId)}
                      title="Remover"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className={s.row}>
                    <div className={s.qtyBox}>
                      <button className={s.qtyBtn} onClick={() => dec(it.lineId)} aria-label="Diminuir">
                        −
                      </button>
                      <div className={s.qtyValue}>{it.qty}</div>
                      <button className={s.qtyBtn} onClick={() => inc(it.lineId)} aria-label="Aumentar">
                        +
                      </button>
                    </div>

                    <div className={s.priceCol}>
                      <div className={s.unit}>Unidade: {brl(it.unitPrice)}</div>
                      <div className={s.total}>Total: {brl(it.total)}</div>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <section className={s.summary}>
              <div className={s.sumRow}>
                <span>Subtotal</span>
                <strong>{brl(subTotal)}</strong>
              </div>
              <div className={s.sumRow}>
                <span>Entrega</span>
                <strong>{delivery === 0 ? "Grátis" : brl(delivery)}</strong>
              </div>
              <div className={`${s.sumRow} ${s.sumRowTotal}`}>
                <span>Total</span>
                <strong>{brl(grandTotal)}</strong>
              </div>

              <div className={s.actions}>
                <button className={s.clearBtn} onClick={clearCart}>
                  Esvaziar carrinho
                </button>
                <button
                  className={s.checkoutBtn}
                  onClick={() => alert("Continuar para o endereço/pagamento…")}
                >
                  Finalizar pedido
                </button>
              </div>
            </section>
            <div style={{ height: 90 }} />
          </>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
