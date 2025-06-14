import { useState } from "react";
import PanelUsuarios from "@/components/admin/UsersPanel";
import PanelImportarCSV from "@/components/admin/CSVImportPanel";

export default function ControlAdmin() {
  const [tab, setTab] = useState("usuarios");

  return (
    <div className="main-content">
      <div className="main">
        <div className="admin-container">
          <h1 className="title">Panel de Administración</h1>
          <PanelUsuarios />
        </div>
      </div>
      <div className="sidebar">
        <PanelImportarCSV />
      </div>
    </div>
  );
}
