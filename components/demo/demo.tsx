import {
  ScrollPortraitWall,
  type Speaker,
} from "@/components/ui/scroll-portrait-wall";

// 5 avatars from Unsplash, cycled across the speakers.
const speakers: Speaker[] = [
  { name: "Naomi Adeyemi", role: "Keynote · Design Systems" },
  { name: "Hugo Marchetti", role: "Principal Engineer, Vercel" },
  { name: "Priya Nair", role: "Head of AI, Loomstack" },
  { name: "Sebastian Cole", role: "Creative Director" },
  { name: "Mei-Ling Zhao", role: "Staff Designer, Linear" },
  { name: "Idris Calloway", role: "Founder, Northwind" },
  { name: "Clara Boström", role: "VP Product, Figma" },
  { name: "Rafael Ortega", role: "Motion Lead" },
  { name: "Hannah Whitfield", role: "DX Engineer, Stripe" },
].map((s, i) => ({
  ...s,
  src: `https://images.unsplash.com/photo-${[
    "1522071820081-009f0129c71c", // Team working at laptop
    "1531482615713-2afd69097998", // Planning/whiteboarding
    "1517048676732-d65bc937f952", // Collaboration/screens
    "1522202176988-66273c2fd55f", // Discussing ideas
    "1552664730-d307ca884978", // Brainstorming
  ][i % 5]}?w=600&h=600&fit=crop&q=80`,
}));

export default function ScrollPortraitWallDemo() {
  return (
    <ScrollPortraitWall
      title="AlloySphere"
      hint="scroll to explore the network"
      date="March 25, 2026"
      speakers={speakers}
      showCaptions={false}
    />
  );
}
