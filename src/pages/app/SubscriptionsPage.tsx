import { Routes, Route } from 'react-router-dom';
import SubscriptionsList from './SubscriptionsList';
import SubscriptionDetail from './SubscriptionDetail';

export default function SubscriptionsPage() {
  return (
    <Routes>
      <Route index element={<SubscriptionsList />} />
      <Route path=":id" element={<SubscriptionDetail />} />
    </Routes>
  );
}