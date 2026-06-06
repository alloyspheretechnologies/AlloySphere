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
  { name: "Yusuf Demir", role: "Research, DeepMind" },
].map((s, i) => ({
  ...s,
  src: `https://images.unsplash.com/photo-${[
    "1507003211169-0a1dd7228f2d",
    "1438761681033-6461ffad8d80",
    "1500648767791-00dcc994a43e",
    "1534528741775-53994a69daeb",
    "1539571696354-2457f5ae918c",
  ][i % 5]}?w=400&h=400&fit=crop&crop=faces&auto=format&q=80`,
}));

export default function ScrollPortraitWallDemo() {
  return (
    <ScrollPortraitWall
      title="The Lineup"
      hint="scroll to meet the lineup"
      date="Sep 18, 2026"
      speakers={speakers}
      showCaptions={false}
    />
  );
}
