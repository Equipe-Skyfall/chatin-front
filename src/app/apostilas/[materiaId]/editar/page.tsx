import ApostilaEditarPage from "./apostila_editar_page";

export default async function ApostilaEditarRoute({ params }: { params: Promise<{ materiaId: string }> }) {
  const { materiaId } = await params;
  return <ApostilaEditarPage materiaId={materiaId} />;
}
