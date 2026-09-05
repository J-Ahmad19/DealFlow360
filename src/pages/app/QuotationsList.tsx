import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from '../../components/app/KanbanColumn';
import { KanbanCard } from '../../components/app/KanbanCard';

const COLUMNS = [
  { id: 'draft', title: 'Draft' },
  { id: 'pending_approval', title: 'Pending Approval' },
  { id: 'under_negotiation', title: 'Under Negotiation' },
  { id: 'confirmed', title: 'Confirmed' }
];

// Maps backend database enum statuses into the 4 visual Kanban columns
const STATUS_MAP: Record<string, string> = {
  'draft': 'draft',
  'pending_approval': 'pending_approval',
  'revision_required': 'pending_approval',
  'under_negotiation': 'under_negotiation',
  'confirmed': 'confirmed',
  'approved': 'confirmed',
  'fulfillment': 'confirmed',
};

// Maps a visual column drop back into a strict backend database enum
const BOARD_TO_BACKEND_STATUS: Record<string, string> = {
  'draft': 'draft',
  'pending_approval': 'pending_approval',
  'under_negotiation': 'under_negotiation',
  'confirmed': 'confirmed',
};

export default function QuotationsList() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const normalizeQuotations = (data: any[]) =>
    data.map((q: any) => ({
      ...q,
      status: q.status || 'draft',
      kanbanStatus: STATUS_MAP[q.status] || q.kanbanStatus || 'draft',
    }));

  const loadQuotations = async () => {
    try {
      const response = await apiFetch('/quotations');
      const payload = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      setQuotations(normalizeQuotations(payload));
    } catch (err) {
      console.error('Failed to load quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotations();
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveQuotation = active.data.current?.type !== 'Column';
    const isOverQuotation = over.data.current?.type !== 'Column';

    if (!isActiveQuotation) return;

    // Dropping a quote over another quote
    if (isActiveQuotation && isOverQuotation) {
      setQuotations((items) => {
        const activeIndex = items.findIndex((q) => q.id === activeId);
        const overIndex = items.findIndex((q) => q.id === overId);

        if (items[activeIndex].kanbanStatus !== items[overIndex].kanbanStatus) {
          const newItems = [...items];
          newItems[activeIndex].kanbanStatus = items[overIndex].kanbanStatus;
          return arrayMove(newItems, activeIndex, overIndex);
        }
        return arrayMove(items, activeIndex, overIndex);
      });
    }

    // Dropping a quote over a column
    const isOverAColumn = COLUMNS.some(col => col.id === overId);
    if (isActiveQuotation && isOverAColumn) {
      setQuotations((items) => {
        const activeIndex = items.findIndex((q) => q.id === activeId);
        if (items[activeIndex].kanbanStatus !== overId) {
          const newItems = [...items];
          newItems[activeIndex].kanbanStatus = overId as string;
          return arrayMove(newItems, activeIndex, activeIndex);
        }
        return items;
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeQuote = quotations.find((q) => q.id === active.id);
    if (!activeQuote) return;

    const targetBoardStatus = String(over.id);
    const nextBackendStatus = BOARD_TO_BACKEND_STATUS[targetBoardStatus] || BOARD_TO_BACKEND_STATUS[activeQuote.kanbanStatus];

    if (!nextBackendStatus) return;

    const previousDbStatus = activeQuote.status;
    const previousBoardStatus = STATUS_MAP[previousDbStatus] || 'draft';

    setQuotations((prev) =>
      prev.map((q) =>
        q.id === activeQuote.id
          ? { ...q, kanbanStatus: targetBoardStatus, status: nextBackendStatus }
          : q
      )
    );

    try {
      const response = await apiFetch(`/quotations/${activeQuote.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextBackendStatus }),
      });

      const updatedQuote = response?.data || response;
      if (updatedQuote?.status) {
        const refreshedStatus = updatedQuote.status;
        setQuotations((prev) =>
          prev.map((q) =>
            q.id === activeQuote.id
              ? {
                  ...q,
                  ...updatedQuote,
                  status: refreshedStatus,
                  kanbanStatus: STATUS_MAP[refreshedStatus] || targetBoardStatus,
                }
              : q
          )
        );
      } else {
        await loadQuotations();
      }
    } catch (err: any) {
      console.error('Failed to update quotation status:', err?.message ?? err);
      setQuotations((prev) =>
        prev.map((q) =>
          q.id === activeQuote.id
            ? { ...q, kanbanStatus: previousBoardStatus, status: previousDbStatus }
            : q
        )
      );
    }
  };

  const activeQuote = quotations.find(q => q.id === activeId);

  return (
    <div className="space-y-6 max-w-full pb-8 min-h-screen bg-[#141211] rounded-3xl p-6 sm:p-8 border-4 border-slate-900 shadow-inner">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight">
            Quotations Board
          </h1>
          <p className="text-slate-500 font-bold text-sm mt-1">
            Drag and drop quotations to update their status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/app/quotations/new"
            className="btn-tactile btn-primary px-5 py-2.5 text-xs flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white rounded-xl shadow-lg shadow-brand-500/20"
          >
            <Plus size={16} />
            New Quotation
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-24 h-[60vh]">
          <Loader2 className="animate-spin text-brand-500" size={48} />
        </div>
      ) : (
        <div className="flex items-start gap-6 min-w-max pb-4 h-[calc(100vh-220px)] overflow-x-auto overflow-y-hidden custom-scrollbar">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                title={col.title}
                items={quotations.filter((q) => q.kanbanStatus === col.id)}
              />
            ))}
            
            <DragOverlay>
              {activeQuote ? <KanbanCard quote={activeQuote} /> : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}
    </div>
  );
}