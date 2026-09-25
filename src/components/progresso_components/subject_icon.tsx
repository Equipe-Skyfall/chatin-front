import {
  BookOpen,
  Calculator,
  ChefHat,
  Globe2,
  Landmark,
  Brain,
  FlaskConical,
  Languages,
  Music,
  Dna,
  Compass,
  Lightbulb,
  Puzzle,
  Target,
  Layers,
  Rocket,
  Palette,
  Gavel,
  Leaf,
  Coins,
  type LucideIcon,
} from "lucide-react";
import { useMemo } from "react";

const KEYWORD_ICONS: { keywords: string[]; icon: LucideIcon }[] = [
  { keywords: ["matemática", "matematica", "cálculo", "calculo", "álgebra", "algebra"], icon: Calculator },
  { keywords: ["história", "historia"], icon: Landmark },
  { keywords: ["geografia"], icon: Globe2 },
  { keywords: ["lógica", "logica", "raciocínio", "raciocinio"], icon: Brain },
  { keywords: ["culinária", "culinaria", "gastronomia"], icon: ChefHat },
  { keywords: ["química", "quimica", "física", "fisica"], icon: FlaskConical },
  { keywords: ["biologia", "genética", "genetica", "ecologia"], icon: Dna },
  { keywords: ["inglês", "ingles", "idioma", "língua", "lingua"], icon: Languages },
  { keywords: ["música", "musica"], icon: Music },
  { keywords: ["arte", "desenho", "pintura"], icon: Palette },
  { keywords: ["direito", "jurídico", "juridico", "lei"], icon: Gavel },
  { keywords: ["economia", "finanças", "financas", "contabilidade"], icon: Coins },
  { keywords: ["biologia", "sustentabilidade", "meio ambiente"], icon: Leaf },
  { keywords: ["engenharia", "tecnologia", "programação", "programacao"], icon: Rocket },
];


const FALLBACK_ICONS: LucideIcon[] = [
  BookOpen,
  Compass,
  Lightbulb,
  Puzzle,
  Target,
  Layers,
];

export const SUBJECT_COLORS = [
  "#fb7118", // laranja
  "#3b82f6", // azul
  "#22c55e", // verde
  "#ec4899", // rosa
  "#8b5cf6", // roxo
  "#f59e0b", // âmbar
  "#0ea5e9", // azul claro
  "#ef4444", // vermelho
  "#14b8a6", // teal
  "#a855f7", // violeta
  "#84cc16", // lima
  "#f43f5e", // rosa avermelhado
  "#06b6d4", // ciano
  "#eab308", // amarelo
  "#6366f1", // índigo
  "#10b981", // esmeralda
  "#d946ef", // magenta
  "#f97316", // laranja escuro
  "#0891b2", // azul petróleo
  "#65a30d", // verde oliva
];

function hashString(texto: string): number {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    hash = (hash << 5) - hash + texto.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getSubjectColor(materiaId: string): string {
  return SUBJECT_COLORS[hashString(materiaId) % SUBJECT_COLORS.length];
}

export function getSubjectIcon(nome: string, materiaId: string): LucideIcon {
  const normalizado = nome.toLowerCase();
  const porPalavraChave = KEYWORD_ICONS.find(({ keywords }) => keywords.some((k) => normalizado.includes(k)));
  if (porPalavraChave) return porPalavraChave.icon;

  return FALLBACK_ICONS[hashString(materiaId) % FALLBACK_ICONS.length];
}

interface SubjectIconBadgeProps {
  nome: string;
  materiaId: string;
  cor: string;
  size?: number;
}

export function SubjectIconBadge({ nome, materiaId, cor, size = 40 }: SubjectIconBadgeProps) {
  const Icon = useMemo(() => getSubjectIcon(nome, materiaId), [nome, materiaId]);
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-xl"
      style={{ width: size, height: size, backgroundColor: `${cor}1a` }}
    >
      {/* eslint-disable-next-line react-hooks/static-components -- Icon referencia um componente fixo do lucide-react, escolhido deterministicamente por getSubjectIcon; nenhum componente novo é criado aqui */}
      <Icon size={size * 0.5} style={{ color: cor }} />
    </div>
  );
}