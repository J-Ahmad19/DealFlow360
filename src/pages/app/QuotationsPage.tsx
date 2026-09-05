import { Routes, Route } from 'react-router-dom';
import QuotationsList from './QuotationsList';
import QuotationDetail from './QuotationDetail';

export default function QuotationsPage() {
  return (
    <Routes>
      <Route index element={<QuotationsList />} />
      <Route path=":id" element={<QuotationDetail />} />
    </Routes>
  );
}
