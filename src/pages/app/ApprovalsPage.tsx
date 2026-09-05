import { Routes, Route } from 'react-router-dom';
import ApprovalsList from './ApprovalsList';
import ApprovalDetail from './ApprovalDetail';

export default function ApprovalsPage() {
  return (
    <Routes>
      <Route index element={<ApprovalsList />} />
      <Route path=":id" element={<ApprovalDetail />} />
    </Routes>
  );
}