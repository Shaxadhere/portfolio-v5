import type { CuriousItem } from "@/data/portfolio";

export type FloatVariant = "icon";

export type FloatLayout = {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  variant: FloatVariant;
  zIndex: number;
};

type Ellipse = { cx: number; cy: number; rx: number; ry: number };

type LayoutNode = FloatLayout & {
  hw: number;
  hh: number;
  angle: number;
  radius: number;
  ring: number;
};

const EMIT = { x: 50, y: 51 };
const Y_SCALE = 0.9;
const RINGS = 3;
const RING_DEPTH = [3, 14, 25];

/** Profile subject — face sits to the right */
const FORBIDDEN: Ellipse[] = [
  { cx: 60, cy: 39, rx: 19, ry: 20 },
  { cx: 42, cy: 47, rx: 13, ry: 15 },
  { cx: 50, cy: 56, rx: 23, ry: 26 },
];

const ICON_HALF_W = 8.2;
const ICON_HALF_H = 9.2;
const GAP = 2.4;
const MAX_RADIUS = 57;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function inEllipse(x: number, y: number, ellipse: Ellipse) {
  const dx = (x - ellipse.cx) / ellipse.rx;
  const dy = (y - ellipse.cy) / ellipse.ry;
  return dx * dx + dy * dy <= 1;
}

function isForbidden(x: number, y: number) {
  return FORBIDDEN.some((ellipse) => inEllipse(x, y, ellipse));
}

function fromPolar(angle: number, radius: number) {
  return {
    x: EMIT.x + Math.cos(angle) * radius,
    y: EMIT.y + Math.sin(angle) * radius * Y_SCALE,
  };
}

function applyPolar(node: LayoutNode, angle: number, radius: number) {
  const point = fromPolar(angle, radius);
  node.angle = angle;
  node.radius = radius;
  node.x = point.x;
  node.y = point.y;
}

function rayExitRadius(angle: number) {
  const rightBias = Math.max(0, Math.cos(angle)) * 8;

  for (let radius = 8; radius <= MAX_RADIUS; radius += 0.15) {
    const point = fromPolar(angle, radius);
    if (!isForbidden(point.x, point.y)) return radius + 2 + rightBias;
  }
  return 32;
}

function inStage(node: LayoutNode, x: number, y: number) {
  return (
    x >= node.hw + 2 &&
    x <= 100 - node.hw - 2 &&
    y >= node.hh + 4 &&
    y <= 92 - node.hh - 4
  );
}

function boxesOverlap(a: LayoutNode, b: LayoutNode) {
  return (
    Math.abs(a.x - b.x) < a.hw + b.hw + GAP &&
    Math.abs(a.y - b.y) < a.hh + b.hh + GAP
  );
}

function isValid(node: LayoutNode, angle: number, radius: number) {
  const point = fromPolar(angle, radius);
  return inStage(node, point.x, point.y) && !isForbidden(point.x, point.y);
}

function resolveAlongRays(nodes: LayoutNode[]) {
  for (let pass = 0; pass < 120; pass += 1) {
    let moved = false;

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        if (!boxesOverlap(a, b)) continue;

        const inner = a.radius <= b.radius ? a : b;
        applyPolar(inner, inner.angle, inner.radius + 1);
        moved = true;
      }
    }

    if (!moved) break;
  }
}

function settleNode(node: LayoutNode, nodes: LayoutNode[]) {
  let angle = node.angle;
  let radius = Math.max(node.radius, rayExitRadius(angle));

  for (let attempt = 0; attempt < 80; attempt += 1) {
    const point = fromPolar(angle, radius);
    const blocked = nodes.some(
      (other) => other !== node && boxesOverlap({ ...node, x: point.x, y: point.y }, other),
    );

    if (isValid(node, angle, radius) && !blocked) {
      applyPolar(node, angle, radius);
      return;
    }

    if (isForbidden(point.x, point.y) || !inStage(node, point.x, point.y) || blocked) {
      const spin = attempt % 2 === 0 ? 1 : -1;
      angle += 0.14 * spin;
      radius = rayExitRadius(angle) + RING_DEPTH[node.ring];
      continue;
    }

    radius += 0.9;
  }

  applyPolar(node, angle, Math.min(radius, MAX_RADIUS));
}

/** Staggered rings bursting outward from the subject */
export function buildFloatLayouts(items: CuriousItem[]): FloatLayout[] {
  const count = items.length;
  const slotsPerRing = Math.ceil(count / RINGS);
  const ringStagger = Math.PI / slotsPerRing;

  const nodes: LayoutNode[] = items.map((item, index) => {
    const seed = hashString(item.id);
    const ring = index % RINGS;
    const slot = Math.floor(index / RINGS);
    const sector = (Math.PI * 2) / slotsPerRing;

    const angle =
      slot * sector -
      Math.PI / 2 +
      ring * ringStagger +
      ((seed % 100) / 100 - 0.5) * sector * 0.06;

    const radius = rayExitRadius(angle) + RING_DEPTH[ring] + ((seed >> 4) % 3) * 0.35;
    const point = fromPolar(angle, radius);

    return {
      x: point.x,
      y: point.y,
      angle,
      radius,
      ring,
      rotate: (angle * 180) / Math.PI * 0.04,
      scale: 0.94 + ring * 0.035,
      variant: "icon" as const,
      zIndex: 30 + ring * 20 + slot,
      hw: ICON_HALF_W,
      hh: ICON_HALF_H,
    };
  });

  resolveAlongRays(nodes);
  nodes.forEach((node) => settleNode(node, nodes));

  return nodes.map(({ hw, hh, angle, radius, ring, ...layout }) => layout);
};
