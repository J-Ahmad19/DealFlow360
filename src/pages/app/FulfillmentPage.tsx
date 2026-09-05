import { Routes, Route } from 'react-router-dom';
import FulfillmentList from './FulfillmentList';
import FulfillmentDetail from './FulfillmentDetail';

export default function FulfillmentPage() {
  return (
    <Routes>
      <Route index element={<FulfillmentList />} />
      <Route path=":id" element={<FulfillmentDetail />} />
    </Routes>
  );
}