"use client";
import { findPiece } from "@/lib/catalog";
import { garmentSVG } from "@/lib/garments";
import { useShop } from "@/store/shop";

function bumpBag() {
  document.querySelector<HTMLElement>(".bagcount")?.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.45)" }, { transform: "scale(1)" }],
    { duration: 450, easing: "cubic-bezier(.22,1,.36,1)" },
  );
}

export function flyToBag(pieceId: string) {
  if (!useShop.getState().motion) return;
  const piece = findPiece(pieceId);
  const card = document.querySelector<HTMLElement>(`.piece[data-id="${pieceId}"] .card`);
  const bag = document.querySelector<HTMLElement>(".bagcount");
  if (!piece || !card || !bag) return bumpBag();

  const from = card.getBoundingClientRect();
  const to = bag.getBoundingClientRect();
  const size = Math.min(from.width, 180);
  const ghost = document.createElement("div");
  ghost.className = "fly-ghost";
  ghost.innerHTML = garmentSVG(piece, "front", `fly${Date.now()}`);
  Object.assign(ghost.style, {
    left: `${from.left + from.width / 2 - size / 2}px`,
    top: `${from.top + from.height / 2 - (size * 1.55) / 2}px`,
    width: `${size}px`,
    height: `${size * 1.55}px`,
  });
  document.body.appendChild(ghost);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const flight = ghost.animate(
    [
      { transform: "translate(0, 0) scale(1) rotate(0deg)", opacity: 1 },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 90}px) scale(.55) rotate(-10deg)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(.06) rotate(8deg)`, opacity: 0.3 },
    ],
    { duration: 720, easing: "cubic-bezier(.45,0,.25,1)" },
  );
  flight.onfinish = () => { ghost.remove(); bumpBag(); };
}
