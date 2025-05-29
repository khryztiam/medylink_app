// components/CitaForm.js
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from "@/context/AuthContext";
import EstadoConsulta from './EstadoConsulta';


export default function CitaForm({ onSubmit }) {
  const { user, userName, idsap, role } = useAuth()
  const [nombre, setNombre] = useState('')
  const [motivo, setMotivo] = useState('')
  const [idSAP, setIdSAP] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [urgente, setUrgente] = useState(false)
  const [isss, setIsss] = useState(false)

    // Si el usuario es PACIENTE, autocompleta los datos
    useEffect(() => {
      if (role === 'paciente') {
        setNombre(userName || '')
        setIdSAP(idsap || '')
      }
    }, [userName, idsap, role])
  
    // Si es ENFERMERÍA, y cambia el SAP, busca el nombre
    useEffect(() => {
      const buscarNombre = async () => {
        if ((role === 'enfermeria' || role === 'admin' || role === 'supervisor') && idSAP.trim().length > 7) {
          setBuscando(true)
    
          const { data, error } = await supabase
            .from('allowed_users')
            .select('nombre')
            .eq('idsap', idSAP.trim())
            .single()
    
          console.log('🔍 [CitaForm] Resultado búsqueda:', { data, error })
    
          if (error || !data) {
            setNombre('')
            alert('El SAP ingresado no está autorizado o no se encontró en la base.')
          } else {
            setNombre(data.nombre)
          }
    
          setBuscando(false)
        }
      }
    
      buscarNombre()
    }, [idSAP, role])

  const handleSubmit = (e) => {
    e.preventDefault()
    const idSAPInt = parseInt(idSAP,10)
    if (!nombre.trim() || !motivo.trim() || isNaN(idSAPInt) ){
      alert('Completa los campos')
      return
    }
    onSubmit(nombre.trim(), motivo.trim(), idSAPInt, urgente, isss)
    setNombre('')
    setMotivo('')
    setIdSAP('')
    setUrgente(false)
    setIsss(false)
  }

  return (
    <form onSubmit={handleSubmit}>
    <div className='pac-modal-header'>
      <h2>Solicitud de cita</h2>
    </div>
    <EstadoConsulta />
    <div className='pac-modal-content'>
    <div className="pac-form-group">
    <label htmlFor="sap">SAP</label>
      <input
        type="text"
        id="sap"
        value={idSAP}
        placeholder=" "
        onChange={(e) => setIdSAP(e.target.value)}
        className='pac-form-control'
        required
        disabled={role === 'paciente'}
      />
    </div>

    <div className="pac-form-group">
    <label htmlFor="nombre">
        {buscando ? 'Buscando nombre...' : 'Nombre'}
      </label>
      <input
        type="text"
        id="nombre"
        value={nombre}
        placeholder=" "
        onChange={(e) => setNombre(e.target.value)}
        className='pac-form-control'
        required
        disabled={role === 'paciente' || role === 'enfermeria'}
      />
    </div>

    <div className="pac-toggle-container">
    <label htmlFor="urgente" className='pac-toggle-label'>Es una emergencia?</label>
    <label className="pac-toggle-switch">
      <input
        type="checkbox"
        id="urgente"
        checked={urgente}
        onChange={(e) => setUrgente(e.target.checked)}
      />
      <span className={`pac-toggle-slider ${urgente ? 'toggle-rojo' : ''}`}/>
    </label>  
    </div>

    <div className="pac-toggle-container">
      <label htmlFor="toggle-isss" className="pac-toggle-label">Consulta ISSS</label>
      <label className="pac-toggle-switch">
        <input
          type="checkbox"
          id="toggle-isss"
          checked={isss}
          onChange={(e) => setIsss(e.target.checked)}
        />
        <span className="pac-toggle-slider" />
      </label>
    </div>

    <div className="pac-form-group">
    <label htmlFor="motivo">Motivo de consulta</label>
      <textarea
        id="motivo"
        value={motivo}
        placeholder=" "
        onChange={(e) => setMotivo(e.target.value)}
        className='pac-form-control'
        required
      />
    </div>
    <div className='pac-modal-actions'>
    <button type="submit" className='pac-btn pac-btn-primary'>Solicitar cita</button>
    </div>
    </div>
  </form>
  )
}