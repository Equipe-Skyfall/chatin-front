import { CloudUpload, MoreHorizontal } from "lucide-react";

export function SupportMaterials() {
  return (
    <aside className="hidden w-[232px] shrink-0 border-l border-line bg-white px-4 py-5 xl:block">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xs font-semibold text-charcoal">Materiais de Apoio</h2>
        <button aria-label="Mais opções de materiais" className="text-gray"><MoreHorizontal size={15} /></button>
      </div>
      <p className="mt-6 text-[10px] font-semibold text-charcoal">Adicionar arquivo</p>
      <button className="mt-2 flex h-[74px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-gray/30 text-[10px] text-gray transition-colors hover:border-orange hover:bg-orange/5">
        <CloudUpload size={19} className="mb-1 text-gray" />
        Arraste ou <span className="text-orange">selecione</span>
        <span className="mt-0.5 text-[8px] text-gray/70">PDF, DOCX, PPTX até 25MB</span>
      </button>
      <div className="mt-7 flex items-center justify-between">
        <h3 className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray">Documentos ativos</h3>
        <span className="text-[10px] text-gray">0</span>
      </div>
      <p className="mt-3 text-[10px] text-gray">Nenhum documento adicionado.</p>
      <div className="mt-7 flex items-center justify-between"><h3 className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray">Fontes consultadas</h3><button className="text-[9px] text-orange">Ver todas</button></div>
      <p className="mt-3 text-[10px] text-gray">Nenhuma fonte consultada.</p>
    </aside>
  );
}