import { useLayoutEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Layout from "./layouts/MainLayout";
import Authentication from "./pages/Authentication";
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import Devices from "./pages/Devices";
import AddDevice from "./pages/AddDevice";
import Settings from "./pages/Settings";
import UserManual from "./pages/UserManual";
import ChangePassword from "./pages/ChangePassword";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Authentication />} />
        <Route path="change-password" element={<ChangePassword />} />
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="devices" element={<Devices />} />
          <Route path="add-device" element={<AddDevice />} />
          <Route path="manual" element={<UserManual />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;