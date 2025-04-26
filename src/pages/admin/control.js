import { useState } from 'react';
import PanelUsuarios from '@/components/admin/UsersPanel';
import PanelImportarCSV from '@/components/admin/CSVImportPanel';

export default function ControlAdmin() {
  const [tab, setTab] = useState('usuarios');

  return (
    <div className="admin-container">
      <h1 className="title">Panel de Administración</h1>

      <div className="admin-tabs">
        <button onClick={() => setTab('usuarios')} className={tab === 'usuarios' ? 'activo' : ''}>Usuarios</button>
        <button onClick={() => setTab('importar')} className={tab === 'importar' ? 'activo' : ''}>Importar CSV</button>
      </div>

      {tab === 'usuarios' && <PanelUsuarios />}
      {tab === 'importar' && <PanelImportarCSV />}
    </div>
  );
}
