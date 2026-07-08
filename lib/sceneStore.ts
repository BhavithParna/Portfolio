"use client";

import { useSyncExternalStore } from "react";

/*
  Tiny global store for the home-page stage scene, so the dock (mounted in
  the root layout) can switch scenes on "/" and queue a scene when navigating
  home from an inner page. Module state survives client-side navigation.
*/

export type Scene = "home" | "library" | "contact";

let scene: Scene = "home";
const listeners = new Set<() => void>();

export function setScene(s: Scene) {
  scene = s;
  listeners.forEach((l) => l());
}

export function useScene(): Scene {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => scene,
    () => "home",
  );
}
