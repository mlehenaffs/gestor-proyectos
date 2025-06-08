import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { API_USUARIOS } from './config';

function Login() {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const iniciarSesion = () => {
    axios.post(`${API_USUARIOS}/login`, { nombre, password })
      .then(res => {
        setMensaje("✅ Bienvenido/a, " + res.data.usuario.nombre);
        localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
        setTimeout(() => navigate('/proyectos'), 1500);
      })
      .catch(err => {
        console.error("❌ Error en login:", err);
        setMensaje("❌ Usuario o contraseña incorrectos");
      });
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial' }}>
      <h2>Iniciar Sesión</h2>

      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={iniciarSesion}>Entrar</button>

      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}

export default Login;
