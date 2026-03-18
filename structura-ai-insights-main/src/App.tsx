import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "@/context/DataContext";
import LandingPage from "./pages/LandingPage";
import ConnectPage from "./pages/ConnectPage";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import BridgeDetailPage from "./pages/BridgeDetailPage";
import BridgeRegistryPage from "./pages/BridgeRegistryPage";
import CitizenPage from "./pages/CitizenPage";
import SimulatorPage from "./pages/SimulatorPage";
import IoTPage from "./pages/IoTPage";
import HeatmapPage from "./pages/HeatmapPage";
import CostCalculatorPage from "./pages/CostCalculatorPage";
import ContractorPage from "./pages/ContractorPage";
import WhatsAppPage from "./pages/WhatsAppPage";
import StructuraBotPage from "./pages/StructuraBotPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DataProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/connect" element={<ConnectPage />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/bridge/:id" element={<BridgeDetailPage />} />
              <Route path="/bridges" element={<BridgeRegistryPage />} />
              <Route path="/citizen" element={<CitizenPage />} />
              <Route path="/simulator" element={<SimulatorPage />} />
              <Route path="/iot" element={<IoTPage />} />
              <Route path="/heatmap" element={<HeatmapPage />} />
              <Route path="/cost-calculator" element={<CostCalculatorPage />} />
              <Route path="/contractors" element={<ContractorPage />} />
              <Route path="/whatsapp" element={<WhatsAppPage />} />
              <Route path="/structurabot" element={<StructuraBotPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
