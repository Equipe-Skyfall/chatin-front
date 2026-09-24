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

// Palavras-chave conhecidas: dão um ícone mais específico quando o nome bate.
// Isso é só um "bônus" — qualquer matéria fora dessa lista ainda funciona bem
// graças ao fallback determinístico abaixo.
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

// Pool genérico para qualquer matéria que não bata com nenhuma palavra-chave acima.
// Escolhido por hash do id, então é variado e estável (não muda a cada reload).
const FALLBACK_ICONS: LucideIcon[] = [
  BookOpen,
  Compass,
  Lightbulb,
  Puzzle,
  Target,
  Layers,
];

export const SUBJECT_COLORS = [
  "#fb7118",
  "#6d5bd0",
  "#3b82f6",
  "#22c55e",
  "#ec4899",
  "#f59e0b",
  "#14b8a6",
  "#8b5cf6",
  "#ef4444",
  "#0ea5e9",
];

/** Hash simples e estável de string -> número positivo. Mesmo texto sempre gera o mesmo número. */
function hashString(texto: string): number {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    hash = (hash << 5) - hash + texto.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Cor determinística por matéria, baseada no seu id (não na posição na lista).
 * Assim a mesma matéria sempre tem a mesma cor, mesmo se a lista for reordenada,
 * paginada, ou novas matérias forem criadas antes dela.
 */
export function getSubjectColor(materiaId: string): string {
  return SUBJECT_COLORS[hashString(materiaId) % SUBJECT_COLORS.length];
}

export function getSubjectIcon(nome: string, materiaId: string): LucideIcon {
  const normalizado = nome.toLowerCase();
  const porPalavraChave = KEYWORD_ICONS.find(({ keywords }) => keywords.some((k) => normalizado.includes(k)));
  if (porPalavraChave) return porPalavraChave.icon;

  // Fallback: qualquer matéria nova, de qualquer tema, ainda recebe um ícone
  // variado e consistente em vez de sempre cair no mesmo ícone genérico.
  return FALLBACK_ICONS[hashString(materiaId) % FALLBACK_ICONS.length];
}

interface SubjectIconBadgeProps {
  nome: string;
  materiaId: string;
  cor: string;
  size?: number;
}

export function SubjectIconBadge({ nome, materiaId, cor, size = 40 }: SubjectIconBadgeProps) {
  const Icon = getSubjectIcon(nome, materiaId);
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-xl"
      style={{ width: size, height: size, backgroundColor: `${cor}1a` }}
    >
      <Icon size={size * 0.5} style={{ color: cor }} />
    </div>
  );
}