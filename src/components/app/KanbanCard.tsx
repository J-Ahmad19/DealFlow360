import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface KanbanCardProps {
  quote: any;
}

export function KanbanCard({ quote }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: quote.id, data: { ...quote } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-slate-800/50 border-2 border-brand-500/50 rounded-2xl p-4 shadow-xl opacity-50 cursor-grabbing relative h-[104px]"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-slate-800 border border-slate-700/50 rounded-2xl p-4 shadow-sm hover:border-slate-600 transition-colors cursor-grab active:cursor-grabbing group"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-bold text-slate-100 group-hover:text-brand-400 transition-colors">
          {quote.title || 'Untitled Quotation'}
        </h4>
        <div className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-bold text-slate-300">
          ${quote.amount?.toLocaleString() || '0'}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-slate-400 mt-4">
        <span className="font-medium truncate max-w-[140px]">
          {quote.customerName || 'Unknown Customer'}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
          ID: {quote.id.substring(0, 6)}
        </span>
      </div>
    </div>
  );
}
