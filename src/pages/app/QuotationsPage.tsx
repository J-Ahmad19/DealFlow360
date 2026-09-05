import { Routes, Route, useLocation } from 'react-router-dom';
import QuotationsList from './QuotationsList';
import QuotationBuilder from './QuotationBuilder';
import QuotationDetail from './QuotationDetail';

export default function QuotationsPage() {
  const location = useLocation();
  const action = new URLSearchParams(location.search).get('action');

  if (location.pathname === '/app/quotations' && action === 'new') {
    return <QuotationBuilder />;
  }

  return (
    <Routes>
      {/* The Kanban Board */}
      <Route index element={<QuotationsList />} />

      {/* The Create/Edit Builder */}
      <Route path="new" element={<QuotationBuilder />} />

      {/* The quote detail view opened when clicking a Kanban card */}
      <Route path=":id" element={<QuotationDetail />} />
    </Routes>
  );
}