// components/CitaForm.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from "@/context/AuthContext";
//import EstadoConsulta from './EstadoConsulta';

export default function CitaForm({ onSubmit, onClose }) {
  const { userName, idsap, role } = useAuth();


// Estados del formulario
  const [nombre, setNombre] = useState('');
  const [motivo, setMotivo] = useState('');
  const [idSAP, setIdSAP] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [urgente, setUrgente] = useState(false);
  const [isss, setIsss] = useState(false);
  const [errorSAP, setErrorSAP] = useState(null);

// Inicialización para PACIENTE, los datos se autocompletan en el form
  useEffect(() => {
    if (role === 'paciente') {
      setNombre(userName || '');
      setIdSAP(idsap || '');
    }
  }, [userName, idsap, role]);
  
// Búsqueda automática por SAP (Solo para personal médico/admin)
  useEffect(() => {
    const buscarNombre = async () => {
      const sapLimpio = String(idsap || "").trim();
      
      // Solo buscar si tiene la longitud mínima y el rol lo permite
      if (['enfermeria', 'admin', 'supervisor'].includes(role) && sapLimpio.length >= 8) {
        setBuscando(true);
        setErrorSAP(null);

        const { data, error } = await supabase
          .from('allowed_users')
          .select('nombre')
          .eq('idsap', sapLimpio)
          .single();

        if (error || !data) {
          setNombre('');
          setErrorSAP('Usuario no encontrado o no autorizado');
        } else {
          setNombre(data.nombre);
          setErrorSAP(null);
        }
        setBuscando(false);
      }
    };

    const debounceTimer = setTimeout(buscarNombre, 500); // Evita peticiones excesivas
    return () => clearTimeout(debounceTimer);
  }, [idSAP, role]);

const handleSubmit = (e) => {
    e.preventDefault();
    const idSAPInt = parseInt(idSAP, 10);

    if (!nombre.trim() || !motivo.trim() || isNaN(idSAPInt)) {
      alert('Por favor, verifique los datos del formulario.');
      return;
    }

onSubmit(nombre.trim(), motivo.trim(), idSAPInt, urgente, isss);
    
    // Limpieza
    setMotivo('');
    setUrgente(false);
    setIsss(false);
    if (onClose) onClose();
  };

return (
    <form onSubmit={handleSubmit} className="pac-modal-form">
      <div className='pac-modal-header'>
        <h2>Nueva Solicitud</h2>
        <p>Complete los detalles para la atención en enfermería</p>
      </div>

      <div className='pac-modal-content'>
        {/* Campo SAP */}
        <div className={`pac-form-group ${errorSAP ? 'has-error' : ''}`}>
          <label htmlFor="sap">Número de SAP</label>
          <input
            type="text"
            id="sap"
            value={idSAP}
            placeholder="Ingrese SAP del trabajador"
            onChange={(e) => setIdSAP(e.target.value)}
            className='pac-form-control'
            required
            disabled={role === 'paciente'}
            autoFocus={role !== 'paciente'}
          />
          {errorSAP && <span className="error-text">{errorSAP}</span>}
        </div>

        {/* Campo Nombre (Dinámico) */}
        <div className="pac-form-group">
          <label htmlFor="nombre">
            {buscando ? <span className="loading-dots">Validando usuario</span> : 'Trabajador'}
          </label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            className={`pac-form-control pac-read-only ${buscando ? 'is-loading' : ''}`}
            placeholder="Nombre del paciente"
            readOnly
            tabIndex="-1"
          />
        </div>

        {/* Sección de Toggles (Emergencia / ISSS) */}
        <div className="pac-toggles-grid">
          <div className="pac-toggle-container">
            <span className="pac-toggle-label">¿Es una emergencia?</span>
            <label className="pac-toggle-switch">
              <input
                type="checkbox"
                checked={urgente}
                onChange={(e) => setUrgente(e.target.checked)}
              />
              <span className="pac-toggle-slider toggle-rojo"/>
            </label>
          </div>

          <div className="pac-toggle-container">
            <span className="pac-toggle-label">Consulta ISSS</span>
            <label className="pac-toggle-switch">
              <input
                type="checkbox"
                checked={isss}
                onChange={(e) => setIsss(e.target.checked)}
              />
              <span className="pac-toggle-slider" />
            </label>
          </div>
        </div>

        {/* Motivo de consulta */}
        <div className="pac-form-group">
          <label htmlFor="motivo">Motivo de la visita</label>
          <textarea
            id="motivo"
            value={motivo}
            placeholder="Describa brevemente el síntoma o necesidad..."
            onChange={(e) => setMotivo(e.target.value)}
            className='pac-form-control pac-textarea'
            rows="3"
            required
          />
        </div>

        <div className='pac-modal-actions'>
          <button 
            type="submit" 
            className={`pac-btn-submit ${urgente ? 'btn-urgente' : ''}`}
            disabled={buscando || !nombre}
          >
            {urgente ? '⚡ NOTIFICAR EMERGENCIA' : 'Confirmar Solicitud'}
          </button>
        </div>
      </div>
    </form>
  );
}