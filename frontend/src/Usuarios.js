import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import './App.css';

function Usuarios() {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const obtenerUsuarios = () => {
    axios.get('http://localhost:3001/api/usuarios')
      .then(res => setUsuarios(res.data))
      .catch(err => console.error('❌ Error al obtener usuarios:', err));
  };

  const validarCampos = () => {
    if (!nombre || !password) {
      setMensaje('⚠️ Todos los campos son obligatorios');
      return false;
    }
    if (nombre.length < 3) {
      setMensaje('⚠️ El nombre debe tener al menos 3 caracteres');
      return false;
    }
    if (password.length < 6) {
      setMensaje('⚠️ La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    return true;
  };

  const registrarUsuario = () => {
    if (!validarCampos()) return;

    axios.post('http://localhost:3001/api/usuarios', { nombre, password })
      .then(res => {
        setMensaje("✅ Usuario registrado correctamente");
        setUsuarios([...usuarios, res.data.usuario]);
        setNombre('');
        setPassword('');
      })
      .catch(err => {
        console.error("❌ Error al registrar usuario:", err);
        setMensaje("❌ Ocurrió un error. Verifica los campos.");
      });
  };

  const eliminarUsuario = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      axios.delete(`http://localhost:3001/api/usuarios/${id}`)
        .then(() => {
          setUsuarios(usuarios.filter(u => u._id !== id));
          setMensaje("🗑️ Usuario eliminado correctamente");
        })
        .catch(err => {
          console.error("❌ Error al eliminar usuario:", err);
          setMensaje("❌ No se pudo eliminar el usuario.");
        });
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>Gestión de Usuarios</h2>

        <h3>Registrar nuevo usuario</h3>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={registrarUsuario}>Agregar Usuario</button>
        {mensaje && <div className="mensaje">{mensaje}</div>}

        <h3>Usuarios registrados:</h3>
        <ul>
          {usuarios.map((u) => (
            <li key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{u.nombre}</span>
              <button style={{ backgroundColor: '#ef4444' }} onClick={() => eliminarUsuario(u._id)}>Eliminar</button>
            </li>
          ))}
        </ul>

        <Link to="/"><button>Volver al inicio</button></Link>
      </div>
    </>
  );
}

export default Usuarios;
