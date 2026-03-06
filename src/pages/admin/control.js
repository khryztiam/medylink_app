// pages/admin/control.js
import { useState } from "react";
import PanelUsuarios from "@/components/admin/UsersPanel";
import PanelImportarCSV from "@/components/admin/CSVImportPanel";
import ResumenUsuariosCard from "@/components/admin/ResumenUsuarios";
import UsuariosRecientes from "@/components/admin/UserRecents";
import styles from "@/styles/Admin.module.css";

export default function ControlAdmin() {
  // Estado compartido: usuario seleccionado desde "Recientes"
  const [selectedFromRecent, setSelectedFromRecent] = useState(null);

  return (
    <div className={styles.page}>

      {/* ── Columna principal: tabla de usuarios ─────────────────── */}
      <div className={styles.main}>
        <PanelUsuarios externalSelected={selectedFromRecent} />
      </div>

      {/* ── Sidebar derecho: widgets ──────────────────────────────── */}
      <aside className={styles.aside}>
        <ResumenUsuariosCard />
        <UsuariosRecientes onUserSelect={setSelectedFromRecent} />
        <PanelImportarCSV />
      </aside>

    </div>
  );
}