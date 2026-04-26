"use client";

import { useEffect, useState } from "react";

interface Petal {
  id: number;
  left: string;
  animationDuration: string;
  animationDelay: string;
  size: number;
  rotation: string;
}

export default function FallingBlossoms() {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    // Generate petals only on client to avoid hydration mismatch
    const newPetals = Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}vw`,
      animationDuration: `${Math.random() * 5 + 5}s`, // 5 to 10 seconds
      animationDelay: `-${Math.random() * 10}s`, // Negative delay so they are already falling
      size: Math.random() * 10 + 10, // 10px to 20px
      rotation: `${Math.random() * 360}deg`,
    }));
    setPetals(newPetals);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute top-[-10%] rounded-full bg-pink-400 shadow-[0_0_12px_rgba(244,114,182,0.9)] opacity-90"
          style={{
            left: petal.left,
            width: `${petal.size}px`,
            height: `${petal.size * 1.2}px`,
            borderRadius: "50% 0 50% 50%",
            transform: `rotate(${petal.rotation})`,
            animation: `fall ${petal.animationDuration} linear ${petal.animationDelay} infinite, sway ${petal.animationDuration} ease-in-out ${petal.animationDelay} infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}
