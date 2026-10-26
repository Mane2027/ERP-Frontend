import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./layout/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RoleRoute from "./components/RoleRoute.jsx";
import { PERMISOS } from "./config/permisos.js";
import Login from "./pages/Login/Login.jsx";
import ForgotPassword from "./pages/Auth/ForgotPassword.jsx";
import ResetPassword from "./pages/Auth/ResetPassword.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import UsersList from "./pages/Users/UsersList.jsx";
import ProductsList from "./pages/Products/ProductsList.jsx";
import InventoryList from "./pages/Inventory/InventoryList.jsx";
import ProvidersList from "./pages/Providers/ProvidersList.jsx";
import PurchasesList from "./pages/Purchases/PurchasesList.jsx";
import SalesList from "./pages/Sales/SalesList.jsx";
import Categories from "./pages/Categories/Categories.jsx";
import ReportsPage from "./pages/Reports/ReportsPage.jsx";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/olvide-contrasena" element={<ForgotPassword />} />
      <Route path="/restablecer" element={<ResetPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* Sin restricción de rol: cualquier usuario con sesión */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Con restricción de rol */}
          <Route element={<RoleRoute roles={PERMISOS["/users"]} />}>
            <Route path="/users" element={<UsersList />} />
          </Route>
          <Route element={<RoleRoute roles={PERMISOS["/reports"]} />}>
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
          <Route element={<RoleRoute roles={PERMISOS["/products"]} />}>
            <Route path="/products" element={<ProductsList />} />
          </Route>
          <Route element={<RoleRoute roles={PERMISOS["/inventory"]} />}>
            <Route path="/inventory" element={<InventoryList />} />
          </Route>
          <Route element={<RoleRoute roles={PERMISOS["/providers"]} />}>
            <Route path="/providers" element={<ProvidersList />} />
          </Route>
          <Route element={<RoleRoute roles={PERMISOS["/purchases"]} />}>
            <Route path="/purchases" element={<PurchasesList />} />
          </Route>
          <Route element={<RoleRoute roles={PERMISOS["/sales"]} />}>
            <Route path="/sales" element={<SalesList />} />
          </Route>
          <Route element={<RoleRoute roles={PERMISOS["/categories"]} />}>
            <Route path="/categories" element={<Categories />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
);