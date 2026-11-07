import { SPECIES } from "./species";

export const CATEGORIES = [
  { id: "lizard", label: "Lizards & Dragons", emoji: "🦎", desc: "Bearded Dragons, Blue-tongues, Water Dragons & more", bg: "#f5ece0", count: SPECIES.filter(s => s.type === "lizard").length },
  { id: "snake",  label: "Pythons & Snakes",  emoji: "🐍", desc: "Children's, Carpet, Woma, Green Tree & more",       bg: "#f0e8f5", count: SPECIES.filter(s => s.type === "snake").length },
  { id: "gecko",  label: "Geckos",            emoji: "🦎", desc: "Knob-tailed, Thick-tailed, Velvet, Leaf-tailed & more",       bg: "#fdf5e8", count: SPECIES.filter(s => s.type === "gecko").length },
  { id: "turtle", label: "Turtles",           emoji: "🐢", desc: "Long-necked, Murray River, Broad-shelled & more",   bg: "#e8f0f5", count: SPECIES.filter(s => s.type === "turtle").length },
  { id: "frog",   label: "Frogs",             emoji: "🐸", desc: "Green Tree Frog, Marsh Frog & more",               bg: "#e8f5ec", count: SPECIES.filter(s => s.type === "frog").length },
  { id: "monitor", label: "Monitors",          emoji: "🦎", desc: "Lace Monitor, Sand Monitor & more",                bg: "#e8ece0", count: SPECIES.filter(s => s.type === "monitor").length },
];
