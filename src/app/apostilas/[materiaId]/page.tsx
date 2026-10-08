import MateriaLeituraPage from "./materia_leitura_page";

export default async function MateriaLeituraRoute({ params }: { params: Promise<{ materiaId: string }> }) {
  const { materiaId } = await params;
  return <MateriaLeituraPage materiaId={materiaId} />;
}