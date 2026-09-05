import { Routes, Route, Navigate, Link } from 'react-router-dom';
import GlobalSideNav from '../../components/app/GlobalSideNav';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import Dashboard from '../Dashboard';
import QuotationsPage from './QuotationsPage';
import PipelinePage from './PipelinePage';
import ApprovalsPage from './ApprovalsPage';
import FulfillmentPage from './FulfillmentPage';
import BillingPage from './BillingPage';
import DealHealthPage from './DealHealthPage';
import SubscriptionsPage from './SubscriptionsPage';
import CustomersPage from './CustomersPage';
import ProductsPage from './ProductsPage';
import ReportsPage from './ReportsPage';
import SettingsPage from './SettingsPage';
import { ShieldAlert } from 'lucide-react';

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-slate-50 font-display overflow-hidden">
      {/* Global Side Navigation */}
      <GlobalSideNav />

      {/* Main Workspace */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full max-w-full">
        <Routes>
          {/* 1. Dashboard */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* 2. Quotations & Builder */}
          <Route
            path="quotations/*" 
            element={
              <PermissionGuard role={['admin', 'sales_manager', 'finance', 'sales_rep']} fallback={<AccessDenied module="Quotations" />}>
                <QuotationsPage />
              </PermissionGuard>
            }
          />

          {/* 3. Deal Pipeline */}
          <Route
            path="pipeline"
            element={
              <PermissionGuard role={['admin', 'sales_manager', 'sales_rep']} fallback={<AccessDenied module="Deal Pipeline" />}>
                <PipelinePage />
              </PermissionGuard>
            }
          />

          {/* 4. Approvals Queue */}
          <Route
            path="approvals/*"
            element={
              <PermissionGuard role={['admin', 'sales_manager', 'finance', 'sales_rep']} fallback={<AccessDenied module="Approvals Queue" />}>
                <ApprovalsPage />
              </PermissionGuard>
            }
          />

          {/* 5. Fulfillment & Stock */}
          <Route
            path="fulfillment/*"
            element={
              <PermissionGuard role={['admin', 'sales_manager', 'finance', 'sales_rep']} fallback={<AccessDenied module="Fulfillment & Stock" />}>
                <FulfillmentPage />
              </PermissionGuard>
            }
          />

          {/* 6. Invoices & Billing */}
          <Route
            path="billing/*"
            element={
              <PermissionGuard role={['admin', 'sales_manager', 'finance', 'sales_rep']} fallback={<AccessDenied module="Invoices & Billing" />}>
                <BillingPage />
              </PermissionGuard>
            }
          />

          {/* 7. Deal Health */}
          <Route
            path="deal-health"
            element={
              <PermissionGuard role={['admin', 'sales_manager', 'finance', 'sales_rep']} fallback={<AccessDenied module="Deal Health" />}>
                <DealHealthPage />
              </PermissionGuard>
            }
          />

         {/* 8. Subscriptions */}
          <Route
            path="subscriptions/*"
            element={
              <PermissionGuard role={['admin', 'finance', 'sales_rep']} fallback={<AccessDenied module="Subscriptions" />}>
                <SubscriptionsPage />
              </PermissionGuard>
            }
          />

          {/* 9. Customers */}
          <Route
            path="customers"
            element={
              <PermissionGuard role={['admin', 'sales_manager', 'sales_rep']} fallback={<AccessDenied module="Customers & Accounts" />}>
                <CustomersPage />
              </PermissionGuard>
            }
          />

          {/* 10. Products & Catalog */}
          <Route
            path="products"
            element={
              <PermissionGuard role={['admin', 'sales_manager', 'sales_rep']} fallback={<AccessDenied module="Product Catalog" />}>
                <ProductsPage />
              </PermissionGuard>
            }
          />

          {/* 11. Commercial Reports */}
          <Route
            path="reports"
            element={
              <PermissionGuard role={['admin', 'sales_manager', 'finance', 'sales_rep']} fallback={<AccessDenied module="Commercial Reports" />}>
                <ReportsPage />
              </PermissionGuard>
            }
          />

          {/* 11. Settings & Users */}
          <Route
            path="settings"
            element={
              <PermissionGuard role={['admin']} fallback={<AccessDenied module="System Settings" />}>
                <SettingsPage />
              </PermissionGuard>
            }
          />

          {/* Fallback to Dashboard */}
          <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function AccessDenied({ module }: { module: string }) {
  return (
    <div className="card-tactile bg-white rounded-3xl p-8 border-2 border-red-200/80 shadow-sm text-center py-16 max-w-xl mx-auto mt-12">
      <div className="w-16 h-16 rounded-2xl bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto mb-4 text-red-600">
        <ShieldAlert size={32} />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">Access Restricted</h2>
      <p className="text-slate-500 font-bold text-sm max-w-md mx-auto mb-6">
        Your active role does not have permission to view <strong className="text-slate-900">{module}</strong>. Use the Role Switcher in the top right user menu to simulate other roles.
      </p>
      <Link to="/app/dashboard" className="btn-tactile btn-primary px-6 py-3 text-sm inline-flex items-center gap-2">
        Return to Dashboard
      </Link>
    </div>
  );
}