import MateriaLeituraPage from "./materia_leitura_page";

export default async function MateriaLeituraRoute({
  params,
  searchParams,
}: {
  params: Promise<{ materiaId: string }>;
  searchParams: Promise<{ modulo?: string }>;
}) {
  const { materiaId } = await params;
  const { modulo } = await searchParams;
  return <MateriaLeituraPage materiaId={materiaId} moduloInicialId={modulo ?? null} />;
}