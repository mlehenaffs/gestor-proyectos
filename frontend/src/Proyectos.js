import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import ListaTareas from './componentes/ListaTareas';
import './App.css';

function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [nombre, setNombre] = useState("");
  const [nuevaTarea, setNuevaTarea] = useState({
    nombre: '',
    responsable: '',
    inicio: '',
    fin: '',
    avanceReal: ""
  });
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3001/api/proyectos')
      .then(res => setProyectos(res.data));
    axios.get('http://localhost:3001/api/usuarios')
      .then(res => setUsuarios(res.data));
  }, []);

  const agregarProyecto = () => {
    const nuevo = { nombre };
    axios.post('http://localhost:3001/api/proyectos', nuevo)
      .then(res => {
        setProyectos([...proyectos, res.data.proyecto]);
        setNombre("");
      });
  };

  const agregarTarea = (proyectoId) => {
    const tarea = {
      ...nuevaTarea,
      avanceReal: nuevaTarea.avanceReal === "" ? 0 : Number(nuevaTarea.avanceReal),
    };
    axios.post(`http://localhost:3001/api/proyectos/${proyectoId}/tareas`, tarea)
      .then(res => {
        const actualizados = proyectos.map(p => {
          if (p._id === proyectoId) {
            return { ...p, tareas: [...p.tareas, res.data.tarea] };
          }
          return p;
        });
        setProyectos(actualizados);
        setNuevaTarea({ nombre: '', responsable: '', inicio: '', fin: '', avanceReal: "" });
      });
  };

  const editarTarea = (proyectoId, tareaId, campo, valor) => {
    setProyectos(prev => prev.map(p => {
      if (p._id === proyectoId) {
        const tareas = p.tareas.map(t => {
          if (t._id === tareaId) {
            return { ...t, [campo]: campo === 'avanceReal' ? Number(valor || 0) : valor };
          }
          return t;
        });
        return { ...p, tareas };
      }
      return p;
    }));
  };

  const guardarTarea = (proyectoId, tarea) => {
    axios.put(`http://localhost:3001/api/proyectos/${proyectoId}/tareas/${tarea._id}`, tarea)
      .then(res => console.log("✅ Tarea guardada:", res.data))
      .catch(err => console.error("❌ Error al guardar tarea:", err));
  };

  const calcularEstadoTarea = (t) => {
    const hoy = new Date();
    const inicio = new Date(t.inicio);
    const fin = new Date(t.fin);
    const avance = t.avanceReal;

    if (avance === 100) return "Terminada ✅";
    if (avance === 0 && hoy < inicio) return "Sin iniciar ⚪";
    if (hoy > fin && avance < 100) return "Retrasada 🔴";
    return "En tiempo 🟡";
  };

  const calcularAvanceDeseado = (inicioStr, finStr) => {
    const hoy = new Date();
    const inicio = new Date(inicioStr);
    const fin = new Date(finStr);

    if (hoy < inicio) return 0;
    if (hoy > fin) return 100;

    const total = fin - inicio;
    const transcurrido = hoy - inicio;
    return Math.round((transcurrido / total) * 100);
  };

  const calcularCumplimiento = (real, deseado) => {
    if (deseado === 0) return real === 0 ? 100 : 0;
    return Math.min(Math.round((real / deseado) * 100), 100);
  };

  const calcularCumplimientoProyecto = (tareas) => {
    if (!tareas || tareas.length === 0) return "Sin tareas";
    const totalAvance = tareas.reduce((sum, t) => sum + Number(t.avanceReal || 0), 0);
    const promedio = totalAvance / tareas.length;
    return `${promedio.toFixed(1)}% de avance`;
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>Gestión de Proyectos</h2>

        <h3>Nuevo Proyecto</h3>
        <div className="form-row">
          <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre del proyecto" />
          <button onClick={agregarProyecto}>Agregar</button>
        </div>

        <h3>Proyectos:</h3>
        {proyectos.map(p => (
          <div key={p._id} className="proyecto-card">
            <h4>{p.nombre}</h4>
            <div style={{ fontWeight: 'bold', color: '#1e3a8a' }}>
              Cumplimiento: {calcularCumplimientoProyecto(p.tareas)}
            </div>
            <button onClick={() => setProyectoSeleccionado(proyectoSeleccionado === p._id ? null : p._id)}>
              {proyectoSeleccionado === p._id ? 'Ocultar tareas' : 'Ver tareas'}
            </button>

            {proyectoSeleccionado === p._id && (
              <>
                <h5>Agregar tarea</h5>
                <div className="form-row">
                  <input value={nuevaTarea.nombre} onChange={e => setNuevaTarea({ ...nuevaTarea, nombre: e.target.value })} placeholder="Nombre tarea" />
                  <select value={nuevaTarea.responsable} onChange={e => setNuevaTarea({ ...nuevaTarea, responsable: e.target.value })}>
                    <option value="">Responsable</option>
                    {usuarios.map(u => <option key={u._id} value={u.nombre}>{u.nombre}</option>)}
                  </select>
                  <input type="date" value={nuevaTarea.inicio} onChange={e => setNuevaTarea({ ...nuevaTarea, inicio: e.target.value })} />
                  <input type="date" value={nuevaTarea.fin} onChange={e => setNuevaTarea({ ...nuevaTarea, fin: e.target.value })} />
                  <input type="number" placeholder="Avance real %" value={nuevaTarea.avanceReal} onChange={e => setNuevaTarea({ ...nuevaTarea, avanceReal: e.target.value })} />
                  <button onClick={() => agregarTarea(p._id)}>Agregar tarea</button>
                </div>

                <ListaTareas
                  tareas={p.tareas}
                  usuarios={usuarios}
                  proyectoId={p._id}
                  editarTarea={editarTarea}
                  guardarTarea={guardarTarea}
                  calcularEstadoTarea={calcularEstadoTarea}
                  calcularAvanceDeseado={calcularAvanceDeseado}
                  calcularCumplimiento={calcularCumplimiento}
                />
              </>
            )}
          </div>
        ))}

        <Link to="/"><button>Volver al inicio</button></Link>
      </div>
    </>
  );
}

export default Proyectos;


