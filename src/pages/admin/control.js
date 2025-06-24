import { useState } from "react";
import PanelUsuarios from "@/components/admin/UsersPanel";
import PanelImportarCSV from "@/components/admin/CSVImportPanel";
import ResumenUsuariosCard from "@/components/admin/ResumenUsuarios";
import { FaUserCog, FaTachometerAlt } from "react-icons/fa";

export default function ControlAdmin() {
  const [tab, setTab] = useState("usuarios");

  return (
    <div className="main-content">
      <div className="title-bar">
        <h1 className="control-title">
          <FaUserCog className="title-icon" />
          Administrador
          <span className="title-extra">
            <FaTachometerAlt className="extra-icon" />
            Panel de Control
          </span>
        </h1>
      </div>
      <div className="content-wrapper">
        <div className="main">
          <div className="admin-container">
            <PanelUsuarios />
          </div>
        </div>
        <div className="sidebar">
          <ResumenUsuariosCard />
          <PanelImportarCSV />
        </div>
      </div>
    </div>
  );
}
