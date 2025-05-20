// pages/paciente.js
import { useState, useEffect } from 'react'
import { agregarCita, getCitas } from '../lib/citasData'
import { v4 as uuidv4 } from 'uuid'
import { useAuth } from '@/context/AuthContext'
import CitaForm from '../components/CitaForm'
import ConsultaCita from '../components/ConsultaCita'
import EstadoConsulta from '@/components/EstadoConsulta'
import Modal from 'react-modal'

Modal.setAppElement('#__next')

export default function Home() {
  const { user } = useAuth()
  const [citas, setCitas] = useState([])
  const [miCita, setMiCita] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false) 
  const [mensaje, setMensaje] = useState('')
  const [tipoMensaje, setTipoMensaje] = useState('') // exito / error

  useEffect(() => {
    const fetchCitas = async () => {
      const citasData = await getCitas()
      setCitas(Array.isArray(citasData) ? citasData : [])
    }
  
    fetchCitas()
  }, [])

  const handleNuevaCita = (nombre, motivo, idSAPInt, urgente, isss) => {
    try {
      const nuevaCita = {
        id: uuidv4(),
        nombre,
        motivo,
        idSAP: idSAPInt,
        estado: 'pendiente',
        orden_llegada: null,
        emergency: urgente,
        isss: isss,
      }

      agregarCita(nuevaCita)
      setCitas(getCitas())
      setMiCita(nuevaCita)

      // Mensaje de éxito
      setTipoMensaje('exito')
      setMensaje('✅ Cita creada exitosamente.')

      closeModal()
    } catch (error) {
      console.error('Error al crear la cita:', error)
      setTipoMensaje('error')
      setMensaje('❌ Ocurrió un error al crear la cita.')
    }

    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
      setMensaje('')
      setTipoMensaje('')
    }, 3000)
  }

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  return (
    <div className="paciente-container">
      <h1 className="paciente-title">Solicitud de Cita Médica</h1>

      <div className="pac-card">
          {/* eslint-disable @next/next/no-img-element */}
          <img src="/banner01.jpg" alt="banner" className='pac-card-banner' loading='eager' decoding='sync'/>
          <div className="floating-status-paciente">
            <EstadoConsulta />
          </div>
          <button onClick={openModal} className='pac-card-button'>Solicitar Cita</button>
      </div>

      {/* Aviso visual */}
      {mensaje && (
        <div className={`mensaje-alerta ${tipoMensaje}`}>
          {mensaje}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onRequestClose={closeModal} 
        contentLabel="Formulario de cita"
        className="pac-modal"
        overlayClassName="pac-modal-overlay"
        >
        <CitaForm onSubmit={handleNuevaCita} user={user} />
      </Modal>

      <ConsultaCita citas={citas} miCita={miCita} setMiCita={setMiCita} user={user} />
    </div>
  )
}