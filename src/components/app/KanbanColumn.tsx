import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  id: string;
  title: string;
  items: any[];
}

export function KanbanColumn({ id, title, items }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div className="w-80 shrink-0 flex flex-col h-full bg-[#1c1a19]/50 border-2 border-slate-800 rounded-3xl overflow-hidden">
      {/* Column Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <h3 className="font-display font-black text-sm text-slate-300">{title}</h3>
        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-400">
          {items.length}
        </span>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar transition-colors ${
          isOver ? 'bg-slate-800/30' : ''
        }`}
      >
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((quote) => (
            <KanbanCard key={quote.id} quote={quote} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
