"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import s from "./Produto.module.css";

type Extra = { id: string; label: string; price: number };
type Size = { id: string; label: string; delta: number };

type Product = {
  id: string;
  name: string;
  img: string;
  desc: string;
  basePrice: number;
  maxFlavors?: number;
  flavors?: string[];
  sizes: Size[];
  extras: Extra[];
};

// --- catálogo de exemplo ---
const CATALOG: Record<string, Product> = {
  "1": {
    id: "1",
    name: "Nome do Item",
    img: "https://via.placeholder.com/1200x800?text=Pizza",
    desc: "Descrição do item: ingredientes, etc.",
    basePrice: 14.0,
    maxFlavors: 2,
    flavors: ["Sabor 1", "Sabor 2", "Sabor 3", "Sabor 4"],
    sizes: [
      { id: "p", label: "Tam 1", delta: 0 },
      { id: "m", label: "Tam 2", delta: 7 },
      { id: "g", label: "Tam 3", delta: 12 },
    ],
    extras: [
      { id: "borda", label: "Adicional 1", price: 6 },
      { id: "catupiry", label: "Adicional 2", price: 4 },
      { id: "bacon", label: "Adicional 3", price: 5 },
    ],
  },
  "2": {
    id: "2",
    name: "X-Salada",
    img: "https://via.placeholder.com/1200x800?text=X-Salada",
    desc: "Pão, hambúrguer, queijo, alface, tomate e molho.",
    basePrice: 10.0,
    maxFlavors: 1,
    flavors: ["Tradicional"],
    sizes: [{ id: "u", label: "Único", delta: 0 }],
    extras: [
      { id: "ovo", label: "Ovo", price: 2 },
      { id: "cheddar", label: "Cheddar", price: 3 },
    ],
  },
};

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

function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function saveToCart(item: CartItem) {
  try {
    const raw = localStorage.getItem("cart");
    const cart: CartItem[] = raw ? JSON.parse(raw) : [];
    cart.push(item);
    localStorage.setItem("cart", JSON.stringify(cart));

    // avisa o app (mesma aba) que o carrinho mudou
    window.dispatchEvent(new Event("cartUpdated"));
  } catch (err) {
    console.error("Erro ao salvar no carrinho:", err);
  }
}

export default function ProdutoPage() {
  const router = useRouter();

  // id do caminho /produto/[id]
  const id =
    typeof window !== "undefined"
      ? window.location.pathname.split("/").filter(Boolean).pop() || "1"
      : "1";

  const product = CATALOG[id] ?? CATALOG["1"];

  // Estado
  const [sizeId, setSizeId] = useState(product.sizes[0].id);
  const [extras, setExtras] = useState<string[]>([]);
  const [flavors, setFlavors] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");

  const sizeDelta = useMemo(
    () => product.sizes.find((s) => s.id === sizeId)?.delta ?? 0,
    [sizeId, product.sizes]
  );
  const extrasTotal = useMemo(
    () =>
      extras.reduce((sum, e) => {
        const ex = product.extras.find((x) => x.id === e);
        return sum + (ex?.price ?? 0);
      }, 0),
    [extras, product.extras]
  );

  const unitPrice = product.basePrice + sizeDelta + extrasTotal;
  const total = unitPrice * qty;

  // toggles
  const toggleExtra = (extraId: string) =>
    setExtras((prev) => (prev.includes(extraId) ? prev.filter((x) => x !== extraId) : [...prev, extraId]));

  function toggleFlavor(f: string) {
    if (flavors.includes(f)) {
      setFlavors((prev) => prev.filter((x) => x !== f));
    } else {
      const limit = product.maxFlavors ?? 1;
      if (flavors.length < limit) setFlavors((prev) => [...prev, f]);
      else alert(`Você pode escolher no máximo ${limit} sabor${limit > 1 ? "es" : ""}.`);
    }
  }

  // validação sabores
  const needsFlavor = (product.flavors?.length ?? 0) > 0;
  const minFlavorOk = !needsFlavor || flavors.length >= 1;
  const flavorLimit = product.maxFlavors ?? 1;

  function addToCart() {
    if (!minFlavorOk) {
      alert("Escolha pelo menos 1 sabor.");
      return;
    }
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      size: product.sizes.find((s) => s.id === sizeId)?.label ?? "",
      flavors,
      extras,
      notes: notes.trim(),
      qty,
      unitPrice,
      total,
    };
    saveToCart(cartItem);
    alert("Produto adicionado ao carrinho!");
    router.back();
  }

  return (
    <main className={s.wrap}>
      <div className={s.inner}>
        {/* Topbar fixa + spacer */}
        <header className={s.topbar}>
          <button className={s.backBtn} onClick={() => router.back()} aria-label="Voltar">
            <ChevronLeft size={20} />
          </button>
          <h1 className={s.title}>{product.name}</h1>
        </header>
        <div className={s.topbarSpacer} />

        {/* Imagem */}
        <div className={s.media}>
          <img src={product.img} alt={product.name} className={s.mediaImg} />
        </div>

        {/* Info básica */}
        <section className={s.block}>
          <div className={s.headerRow}>
            <h2 className={s.name}>{product.name}</h2>
            <div className={s.price}>{brl(unitPrice)}</div>
          </div>
          <p className={s.desc}>{product.desc}</p>
        </section>

        {/* Tamanho */}
        <section className={s.block}>
          <h3 className={s.blockTitle}>Tamanho</h3>
          <div className={s.choices}>
            {product.sizes.map((sz) => (
              <label
                key={sz.id}
                className={`${s.choice} ${sizeId === sz.id ? s.choiceActive : ""}`}
              >
                <input
                  type="radio"
                  name="size"
                  value={sz.id}
                  checked={sizeId === sz.id}
                  onChange={() => setSizeId(sz.id)}
                  className={s.choiceInput}
                />
                <span className={s.choiceLabel}>
                  {sz.label}
                  {sz.delta ? ` (+${brl(sz.delta)})` : ""}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Sabores */}
        {!!product.flavors?.length && (
          <section className={s.block}>
            <h3 className={s.blockTitle}>
              Escolha até {flavorLimit} sabor{flavorLimit > 1 ? "es" : ""}{" "}
              <span style={{ color: "#6b7280", fontWeight: 600, marginLeft: 6 }}>
                ({flavors.length}/{flavorLimit} selecionado{flavors.length === 1 ? "" : "s"})
              </span>
            </h3>

            <div className={s.extras}>
              {product.flavors.map((f) => {
                const checked = flavors.includes(f);
                return (
                  <label key={f} className={`${s.extra} ${checked ? s.extraOn : ""}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFlavor(f)}
                      className={s.extraInput}
                    />
                    <span className={s.extraLabel}>{f}</span>
                  </label>
                );
              })}
            </div>

            {!minFlavorOk && (
              <div style={{ color: "#b91c1c", fontSize: 12, marginTop: 6, fontWeight: 700 }}>
                Escolha pelo menos 1 sabor.
              </div>
            )}
          </section>
        )}

        {/* Adicionais */}
        {!!product.extras.length && (
          <section className={s.block}>
            <h3 className={s.blockTitle}>Adicionais</h3>
            <div className={s.extras}>
              {product.extras.map((ex) => {
                const checked = extras.includes(ex.id);
                return (
                  <label key={ex.id} className={`${s.extra} ${checked ? s.extraOn : ""}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleExtra(ex.id)}
                      className={s.extraInput}
                    />
                    <span className={s.extraLabel}>
                      {ex.label} <em className={s.extraPrice}>+ {brl(ex.price)}</em>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>
        )}

        {/* Observações */}
        <section className={s.block}>
          <h3 className={s.blockTitle}>Observações</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex.: tirar cebola, enviar maionese à parte…"
            className={s.textarea}
            rows={3}
          />
        </section>

        <div className={s.footerSpace} />
      </div>

      {/* Barra inferior: quantidade + total + CTA */}
      <div className={s.footerBar}>
        <div className={s.qtyBox}>
          <button
            className={s.qtyBtn}
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Diminuir"
          >
            −
          </button>
          <div className={s.qtyValue}>{qty}</div>
          <button
            className={s.qtyBtn}
            onClick={() => setQty((q) => q + 1)}
            aria-label="Aumentar"
          >
            +
          </button>
        </div>

        <button
          className={s.addBtn}
          onClick={addToCart}
          disabled={!minFlavorOk}
          style={{ opacity: minFlavorOk ? 1 : 0.6, cursor: minFlavorOk ? "pointer" : "not-allowed" }}
        >
          Adicionar • {brl(total)}
        </button>
      </div>
    </main>
  );
}
