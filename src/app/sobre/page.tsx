"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, MapPin, Phone } from "lucide-react";
import BottomNav from "../components/bottomnav/BottomNav";
import s from "./Sobre.module.css";

export default function SobrePage() {
  const router = useRouter();

  // === Horário: deixa só o dia de hoje em negrito ===
  const days = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
  const today = new Date().getDay(); // 0=DOM .. 6=SÁB
  const hours = ["17:00 às 23:50","17:00 às 23:50","17:00 às 23:50","17:00 às 23:50","17:00 às 23:50","17:00 às 23:50","17:00 às 23:50"];

  return (
    <main className={s.wrap}>
      <div className={s.inner}>
        {/* Topo */}
<header className={s.topbar}>
  <button className={s.backBtn} onClick={() => router.back()} aria-label="Voltar">
    <ChevronLeft size={20} />
  </button>
  <h1 className={s.title}>Sobre o Estabelecimento</h1>
</header>

{/* spacer para compensar a barra fixa */}
<div className={s.topbarSpacer} />

        {/* Card da loja */}
        {/* <section className={s.profileCard}>
          <div className={s.avatar}>X</div>
          <div className={s.profileInfo}>
            <h2 className={s.name}>Nome do Lanche</h2>
            <p className={s.sub}>Abre hoje às 17h · Sem pedido mínimo</p>
          </div>
        </section> */}

        {/* Localização */}
        <section className={s.block}>
          <h3 className={s.blockTitle}>Localização</h3>

          <div className={s.photoBox}>
            <img
              className={s.photoImg}
              src="https://via.placeholder.com/900x500?text=Foto+do+local"
              alt="Foto do estabelecimento"
            />
          </div>

          <div className={s.infoRow}>
            <MapPin className={s.rowIcon} />
            <span className={s.rowText}>
              Canopus, 13 – Lirio do Vale, Manaus – AM, 69038-000
            </span>
          </div>

          <hr className={s.divider} />

          <div className={s.infoRow}>
            <Phone className={s.rowIcon} />
            <a href="tel:+5592984076278" className={s.rowLink}>(92) 98407-6278</a>
          </div>
        </section>

        {/* Horário de funcionamento (só HOJE em negrito) */}
        <section className={s.block}>
          <div className={s.blockTitleRow}>
            <h3 className={s.blockTitle}>Horário de Funcionamento</h3>
            <span className={s.badgeClosed}>Fechado</span>
          </div>

          <ul className={s.hours}>
{days.map((d, i) => (
  <li key={d}>
    {i === today ? (
      <strong className={s.dayBold}>{d}</strong>
    ) : (
      <span className={s.dayLabel}>{d}</span>
    )}
    <span className={s.time}>{hours[i]}</span>
  </li>
))}

          </ul>
        </section>

        {/* Formas de Pagamento */}
        <section className={s.block}>
          <h3 className={s.blockTitle}>Formas de Pagamento</h3>
          <p className={s.muted}>Na entrega:</p>

          <div className={s.payRow}>
            <span className={s.payTag}>Dinheiro</span>
            <span className={s.payTag}>Cartão de Crédito</span>
            <span className={s.payTag}>Cartão de Débito</span>
          </div>

          <div className={s.payTag}>
            PIX (CPF): 022.206.075-75 - ENCAMINHAR O COMPROVANTE!
          </div>
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
