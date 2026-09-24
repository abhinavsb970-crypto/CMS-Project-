import { useState } from "react";

import PharmacistDashboard from "../../pages/pharmacist/PharmacistDashboard";
import MedicineInventory from "../../pages/pharmacist/MedicineInventory";
import MedicineAllotment from "../../pages/pharmacist/MedicineAllotment";
import PharmacyBilling from "../../pages/pharmacist/PharmacyBilling";
import SalesReports from "../../pages/pharmacist/SalesReports";
import StockHistory from "../../pages/pharmacist/StockHistory";

import PharmacistSidebar from "./PharmacistSidebar";

function PharmacistLayout() {
  const [activePage, setActivePage] = useState("dashboard");

  const [medicines, setMedicines] = useState([]);
  const [issuedPrescriptions, setIssuedPrescriptions] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);
  const [bills, setBills] = useState([]);

  return (
    <div className="app-layout">

      <PharmacistSidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="main-content">

        {activePage === "dashboard" && (
          <PharmacistDashboard
            medicines={medicines}
            issuedPrescriptions={issuedPrescriptions}
            bills={bills}
          />
        )}

        {activePage === "inventory" && (
          <MedicineInventory
            medicines={medicines}
            setMedicines={setMedicines}
            stockHistory={stockHistory}
            setStockHistory={setStockHistory}
          />
        )}

        {activePage === "allotment" && (
          <MedicineAllotment
            medicines={medicines}
            setMedicines={setMedicines}
            issuedPrescriptions={issuedPrescriptions}
            setIssuedPrescriptions={setIssuedPrescriptions}
            stockHistory={stockHistory}
            setStockHistory={setStockHistory}
          />
        )}

        {activePage === "billing" && (
          <PharmacyBilling
            issuedPrescriptions={issuedPrescriptions}
            medicines={medicines}
            bills={bills}
            setBills={setBills}
          />
        )}

        {activePage === "reports" && (
          <SalesReports bills={bills} />
        )}

        {activePage === "stock-history" && (
          <StockHistory />
        )}

      </main>
    </div>
  );
}

export default PharmacistLayout;