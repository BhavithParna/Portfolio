"use client";

import { motion } from "framer-motion";

type Props = {
  label: string;
  onClick: () => void;
  className?: string;
};

const spring = { type: "spring" as const, stiffness: 60, damping: 14 };

/* ── Paper airplane — flies Home ⇄ Library ── */
export function PaperPlane({ label, onClick, className, back = false }: Props & { back?: boolean }) {
  return (
    <motion.button
      type="button"
      className={`nav-char ${className ?? ""}`}
      onClick={onClick}
      aria-label={label}
      initial={{ x: back ? 180 : -180, y: -90, opacity: 0, rotate: back ? 22 : -22 }}
      animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
      exit={{ x: back ? -260 : 260, y: -130, opacity: 0, rotate: back ? -16 : 16 }}
      transition={spring}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
    >
      <span className="nav-char-label">{label}</span>
      <span className="plane-float" data-dir={back ? "left" : "right"}>
        <svg viewBox="0 0 96 66" width="92" aria-hidden="true">
          {/* dashed flight trail */}
          <path d="M2 62 C 26 58, 30 40, 48 36" fill="none"
            stroke="#BC5A3C" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 7" />
          {/* top wing */}
          <path d="M90 14 L8 32 L40 38 Z" fill="#F6EFDD" stroke="#33271C" strokeWidth="2.5" strokeLinejoin="round" />
          {/* bottom wing */}
          <path d="M90 14 L40 38 L30 60 Z" fill="#DCCDAC" stroke="#33271C" strokeWidth="2.5" strokeLinejoin="round" />
          {/* center crease */}
          <path d="M90 14 L40 38" fill="none" stroke="#33271C" strokeWidth="1.5" />
        </svg>
      </span>
    </motion.button>
  );
}

/* ── Mailman walking — Home → Contact ── */
export function Mailman({ label, onClick, className }: Props) {
  return (
    <motion.button
      type="button"
      className={`nav-char ${className ?? ""}`}
      onClick={onClick}
      aria-label={label}
      initial={{ x: -140, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -140, opacity: 0 }}
      transition={spring}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
    >
      <span className="nav-char-label">{label}</span>
      <span className="walk-bob">
        <svg viewBox="0 0 70 104" width="64" aria-hidden="true">
          {/* legs */}
          <rect x="26" y="72" width="9" height="24" rx="3" fill="#33271C" />
          <rect className="leg-front" x="36" y="72" width="9" height="24" rx="3" fill="#4A3B2C" />
          {/* body / uniform */}
          <rect x="19" y="40" width="30" height="36" rx="8" fill="#2F6E66" stroke="#1C3A36" strokeWidth="2" />
          {/* bag strap */}
          <line x1="22" y1="44" x2="50" y2="66" stroke="#5A3A1E" strokeWidth="4" />
          {/* mail bag */}
          <rect x="42" y="58" width="20" height="17" rx="3" fill="#6E3414" stroke="#33271C" strokeWidth="2" />
          {/* arm */}
          <rect x="12" y="48" width="9" height="17" rx="4" fill="#2F6E66" stroke="#1C3A36" strokeWidth="1.5" />
          {/* envelope in hand */}
          <rect x="5" y="58" width="14" height="10" fill="#F6EFDD" stroke="#33271C" strokeWidth="1.5" />
          <path d="M5 58 L12 64 L19 58" fill="none" stroke="#33271C" strokeWidth="1.2" />
          {/* head */}
          <circle cx="34" cy="29" r="11" fill="#E8B894" stroke="#9A6A44" strokeWidth="1.5" />
          {/* cap */}
          <path d="M22 27 Q34 11 46 27 Z" fill="#2F6E66" stroke="#1C3A36" strokeWidth="2" />
          <rect x="19" y="26" width="24" height="4" rx="2" fill="#1C4A44" />
        </svg>
      </span>
    </motion.button>
  );
}

/* ── Mail truck — Library → Contact ── */
export function MailTruck({ label, onClick, className }: Props) {
  return (
    <motion.button
      type="button"
      className={`nav-char ${className ?? ""}`}
      onClick={onClick}
      aria-label={label}
      initial={{ x: 220, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 260, opacity: 0 }}
      transition={spring}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="nav-char-label">{label}</span>
      <span className="truck-bob">
        <svg viewBox="0 0 128 80" width="118" aria-hidden="true">
          {/* body */}
          <rect x="8" y="22" width="86" height="38" rx="4" fill="#F6EFDD" stroke="#33271C" strokeWidth="2.5" />
          {/* cab */}
          <path d="M94 60 L94 34 L116 46 L116 60 Z" fill="#E0D3B6" stroke="#33271C" strokeWidth="2.5" strokeLinejoin="round" />
          {/* lower stripe */}
          <rect x="9" y="50" width="85" height="9" fill="#2F6E66" />
          {/* window */}
          <rect x="98" y="38" width="11" height="9" rx="1.5" fill="#9CC0C8" stroke="#33271C" strokeWidth="1.5" />
          {/* mail emblem */}
          <rect x="34" y="30" width="22" height="15" rx="2" fill="#BC5A3C" stroke="#33271C" strokeWidth="1.5" />
          <path d="M34 31 L45 39 L56 31" fill="none" stroke="#F6EFDD" strokeWidth="1.6" />
          {/* wheels */}
          <g className="wheel" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
            <circle cx="34" cy="64" r="11" fill="#2A2A2A" stroke="#111" strokeWidth="2" />
            <circle cx="34" cy="64" r="3.5" fill="#888" />
            <path d="M34 56 V72 M26 64 H42" stroke="#555" strokeWidth="2" />
          </g>
          <g className="wheel" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
            <circle cx="100" cy="64" r="11" fill="#2A2A2A" stroke="#111" strokeWidth="2" />
            <circle cx="100" cy="64" r="3.5" fill="#888" />
            <path d="M100 56 V72 M92 64 H108" stroke="#555" strokeWidth="2" />
          </g>
        </svg>
      </span>
    </motion.button>
  );
}
