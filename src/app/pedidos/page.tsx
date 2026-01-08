"use client";

import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import BottomNav from "../components/bottomnav/BottomNav";
import s from "./Pedidos.module.css";

type Profile = { phone: string; name: string };
type Order = {
  id: number;
  date: string;  // ISO
  items: string[]; // ex.: ["1x Item A", "1x Item B"]
  total: string; // "R$ 42,00" (apenas exibição)
  status: "cancelado" | "finalizado" | "andamento";
};

const ALL_ORDERS: Order[] = [
  { id: 14, date: "2025-07-12T19:17:00", items: ["1x Item A", "1x Item B"], total: "R$ 42,00", status: "cancelado" },
  { id: 52, date: "2025-04-06T20:14:00", items: ["1x Item C + 1x Item D + 1x Item E"], total: "R$ 30,00", status: "finalizado" },
  { id: 53, date: "2025-03-19T19:10:00", items: ["1x Item F"], total: "R$ 28,00", status: "finalizado" },
  { id: 54, date: "2025-03-10T21:02:00", items: ["2x Item G"], total: "R$ 65,00", status: "finalizado" },
  { id: 55, date: "2025-02-18T18:40:00", items: ["1x Item H + 1x Item I"], total: "R$ 52,00", status: "finalizado" },
  { id: 56, date: "2025-02-01T22:05:00", items: ["1x Item J"], total: "R$ 19,90", status: "finalizado" },
  { id: 57, date: "2025-01-15T18:20:00", items: ["1x Item K"], total: "R$ 24,00", status: "finalizado" },
  { id: 58, date: "2024-12-22T20:00:00", items: ["1x Item L"], total: "R$ 39,90", status: "andamento" },
];

/** opcional: tabela de preços/dados mínimos (use seus próprios produtos se quiser)
 * Se um item não existir aqui, ele entra com preço 0 (a UI ainda mostra e permite editar qtd).
 */
const PRICE_TABLE: Record<string, { unitPrice: number; id?: string }> = {
  "Item A": { unitPrice: 21, id: "A" },
  "Item B": { unitPrice: 21, id: "B" },
  "Item C": { unitPrice: 10, id: "C" },
  "Item D": { unitPrice: 10, id: "D" },
  "Item E": { unitPrice: 10, id: "E" },
  "Item F": { unitPrice: 28, id: "F" },
  "Item G": { unitPrice: 32, id: "G" },
  "Item H": { unitPrice: 26, id: "H" },
  "Item I": { unitPrice: 26, id: "I" },
  "Item J": { unitPrice: 19.9, id: "J" },
  "Item K": { unitPrice: 24, id: "K" },
  "Item L": { unitPrice: 39.9, id: "L" },
};

type CartItem = {
  id: string;           // id do produto (pode ser simbólico)
  name: string;
  size: string;         // vazio por padrão
  flavors: string[];    // vazio por padrão
  extras: string[];     // vazio por padrão
  notes: string;        // vazio por padrão
  qty: number;
  unitPrice: number;
  total: number;
};

function parseOrderLine(line: string): { qty: number; name: string }[] {
  // "1x Item C + 1x Item D + 1x Item E"  -> múltiplos
  // "2x Item G"                          -> único com quantidade
  const parts = line.split("+").map(p => p.trim());
  const out: { qty: number; name: string }[] = [];

  const re = /^(\d+)\s*x\s*(.+)$/i;
  for (const p of parts) {
    const m = p.match(re);
    if (m) {
      const qty = parseInt(m[1], 10) || 1;
      const name = m[2].trim();
      out.push({ qty, name });
    } else {
      // fallback: se não bater, considera 1x nome inteiro
      out.push({ qty: 1, name: p });
    }
  }
  return out;
}

function addItemsToCart(items: { qty: number; name: string }[]) {
  try {
    const raw = localStorage.getItem("cart");
    const cart: CartItem[] = raw ? JSON.parse(raw) : [];

    for (const it of items) {
      const price = PRICE_TABLE[it.name]?.unitPrice ?? 0;
      const id = PRICE_TABLE[it.name]?.id ?? it.name; // usa nome como id simbólico

      // regra simples: se já existir mesma combinação (id + size/flavors/extras/notes vazios),
      // soma quantidade. Ajuste como quiser (ex.: comparar mais campos).
      const idx = cart.findIndex(
        (c) =>
          c.id === id &&
          c.name === it.name &&
          !c.size && c.flavors.length === 0 && c.extras.length === 0 && !c.notes
      );

      if (idx >= 0) {
        cart[idx].qty += it.qty;
        cart[idx].total = cart[idx].unitPrice * cart[idx].qty;
      } else {
        cart.push({
          id,
          name: it.name,
          size: "",
          flavors: [],
          extras: [],
          notes: "",
          qty: it.qty,
          unitPrice: price,
          total: price * it.qty,
        });
      }
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    // notifica o app
    window.dispatchEvent(new Event("cartUpdated"));
  } catch (err) {
    console.error("Erro ao adicionar itens ao carrinho:", err);
  }
}

function formatBRPhone(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const dd = d.toLocaleDateString("pt-BR");
  const hh = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `Em ${dd} às ${hh}`;
}

export default function PedidosPage() {
  const router = useRouter();
  const [identified, setIdentified] = useState<boolean | null>(null);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  // lista paginada
  const INITIAL = 6;
  const STEP = 4;
  const [visibleCount, setVisibleCount] = useState(INITIAL);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("userProfile");
      setIdentified(!!saved);
    } catch {
      setIdentified(false);
    }
  }, []);

  // identificação
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

  function handleRepeat(o: Order) {
    // transforma todas as linhas do pedido em itens discretos
    const parsed: { qty: number; name: string }[] = [];
    for (const line of o.items) {
      parsed.push(...parseOrderLine(line));
    }

    // adiciona ao carrinho e vai para /carrinho
    addItemsToCart(parsed);
    router.push("/carrinho");
  }

  if (identified === null) return null;

  return (
    <main className={s.wrap}>
      <div className={s.inner}>
        <header className={s.topbar}>
          <button className={s.backBtn} onClick={() => router.back()} aria-label="Voltar">
            <ChevronLeft size={20} />
          </button>
          <h1 className={s.title}>{identified ? "Meus Pedidos" : "Identifique-se"}</h1>
        </header>

        {/* compensa a barra fixa para o conteúdo não ficar por baixo */}
        <div className={s.topbarSpacer} />

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
        ) : (
          <>
            <section className={s.ordersList}>
              {ALL_ORDERS.slice(0, visibleCount).map((o) => (
                <article key={o.id} className={s.card}>
                  <div className={s.cardHead}>
                    <div>
                      <h2 className={s.cardTitle}>Pedido #{o.id}</h2>
                      <div className={s.cardSub}>{formatDateTime(o.date)}</div>
                    </div>
                    <span
                      className={
                        o.status === "cancelado"
                          ? `${s.badge} ${s.badgeCanceled}`
                          : o.status === "finalizado"
                          ? `${s.badge} ${s.badgeDone}`
                          : `${s.badge} ${s.badgeProgress}`
                      }
                    >
                      {o.status === "cancelado" ? "Cancelado sem pagamento"
                       : o.status === "finalizado" ? "Finalizado" : "Em andamento"}
                    </span>
                  </div>

                  <div className={s.itemsBox}>
                    {o.items.map((t, i) => (
                      <div key={i}>{t}</div>
                    ))}
                  </div>

                  <div className={s.price}>{o.total}</div>

                  <div className={s.btnCol}>
                    <button className={s.btnOutline}>Detalhes do pedido</button>
                    <button className={s.btnSolid} onClick={() => handleRepeat(o)}>
                      Repetir pedido
                    </button>
                  </div>
                </article>
              ))}
            </section>

            {visibleCount < ALL_ORDERS.length && (
              <div className={s.loadMoreWrap}>
                <button
                  className={s.loadMoreBtn}
                  onClick={() =>
                    setVisibleCount((v) => Math.min(v + STEP, ALL_ORDERS.length))
                  }
                >
                  Carregar mais
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
