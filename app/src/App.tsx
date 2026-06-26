import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { AlertsPage } from '@/pages/AlertsPage';
import { InboundPage } from '@/pages/InboundPage';
import { OutboundPage } from '@/pages/OutboundPage';
import { PurchasePage } from '@/pages/PurchasePage';
import { StocktakingPage } from '@/pages/StocktakingPage';
import { SuppliersPage } from '@/pages/SuppliersPage';
import { ReconciliationPage } from '@/pages/ReconciliationPage';

/**
 * 路由配置。
 * - /login 公开
 * - 其余页面在 AppLayout 下，需登录后访问
 */
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/inbound" element={<InboundPage />} />
        <Route path="/outbound" element={<OutboundPage />} />
        <Route path="/purchase" element={<PurchasePage />} />
        <Route path="/stocktaking" element={<StocktakingPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/reconciliation" element={<ReconciliationPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
