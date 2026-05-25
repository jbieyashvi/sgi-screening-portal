import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Screening from "./pages/Screening";
import Requisitions from "./pages/Requisitions";
import Upload from "./pages/Upload";
import Analytics from "./pages/Analytics";
import { AppProvider } from "./store";
import "./App.css";

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/screening" element={<Screening />} />
          <Route path="/requisitions" element={<Requisitions />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}
