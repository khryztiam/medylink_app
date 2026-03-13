// components/admin/CSVImportPanel.jsx
import { useState } from "react";
import Papa from "papaparse";
import { FaFileCsv, FaUpload, FaDownload } from "react-icons/fa";
import styles from "@/styles/Admin.module.css";

export default function CSVImportPanel() {
  const [stats, setStats]       = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState(null);
  const [fileInfo, setFileInfo] = useState(null);

  const downloadTemplate = async () => {
    try {
      const response = await fetch("/api/admin/template/download");
      if (!response.ok) throw new Error("Error descargando plantilla");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "allowed_users_template.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error:", err);
      alert("No se pudo descargar la plantilla");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setStats(null);
    setFileInfo({
      name: file.name,
      size: (file.size / 1024).toFixed(2) + " KB",
    });

    try {
      await new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          encoding: "UTF-8",
          complete: async (results) => {
            try {
              const invalidRows = results.data.filter(
                (row) => !row.idsap || !row.nombre || isNaN(Number(row.idsap))
              );
              if (invalidRows.length > 0) {
                throw new Error(
                  `${invalidRows.length} filas inválidas. IDs: ` +
                  invalidRows.slice(0, 5).map((r) => r.idsap).join(", ") +
                  (invalidRows.length > 5 ? "..." : "")
                );
              }

              const processedData = results.data.map((row) => ({
                idsap:  Number(row.idsap),
                nombre: row.nombre.trim(),
                grupo:  row.grupo  ? Number(row.grupo)  : null,
                puesto: row.puesto ? row.puesto.trim()  : null,
              }));

              const response = await fetch("/api/admin/importarAllowed", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: processedData }),
              });
              const responseData = await response.json();
              if (!response.ok) throw new Error(responseData.error || `Error ${response.status}`);
              setStats(responseData);
              resolve();
            } catch (err) { reject(err); }
          },
          error: (err) => reject(new Error(`Error al leer CSV: ${err.message}`)),
        });
      });
    } catch (err) {
      setError({ title: "Error al procesar archivo", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <FaFileCsv className={styles.cardTitleIcon} />
          Importar Lista Maestro
        </h3>
        <button
          onClick={downloadTemplate}
          className={styles.downloadBtn}
          title="Descargar plantilla CSV de ejemplo"
        >
          <FaDownload /> Plantilla
        </button>
      </div>

      <div className={styles.importBody}>
        {/* Input de archivo como label estilizada */}
        <label className={styles.fileInputLabel}>
          <FaUpload />
          {isLoading ? "Procesando..." : "Seleccionar archivo CSV"}
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={isLoading}
          />
        </label>

        {/* Info del archivo seleccionado */}
        {fileInfo && (
          <div className={styles.fileInfo}>
            <span className={styles.fileInfoName}>{fileInfo.name}</span>
            <br />
            Tamaño: {fileInfo.size}
          </div>
        )}

        {/* Barra de progreso */}
        {isLoading && <div className={styles.progressBar} />}

        {/* Error */}
        {error && (
          <div className={styles.importError}>
            <strong>{error.title}</strong>
            {error.message}
          </div>
        )}

        {/* Resultados */}
        {stats && (
          <div className={styles.importStats}>
            <p className={styles.importStatsTitle}>✅ Importación completada</p>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Procesados</span>
                <span className={styles.statValue}>{stats.total}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Nuevos</span>
                <span className={styles.statValue}>{stats.added}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Actualizados</span>
                <span className={styles.statValue}>{stats.updated || 0}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Eliminados</span>
                <span className={styles.statValue}>{stats.removed}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}