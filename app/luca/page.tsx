import type { Metadata } from "next";
import LucaWall from "@/components/LucaWall";

export const metadata: Metadata = {
  title: "Luca — Bhavith Parna",
  description: "A hundred photos of Luca, the greatest dog to ever exist.",
};

export default function LucaPage() {
  return <LucaWall />;
}
