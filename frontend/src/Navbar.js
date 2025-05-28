import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './App.css';

function Navbar() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const cerrarSesion = () => {
    localStorage.removeItem('usuario');
    navigate('/');
  };

  if (!usuario) return null;

  return (
    <div className="navbar">
      <div className="navbar-links">
        <Link to="/proyectos">Proyectos</Link>
        <Link to="/usuarios">Usuarios</Link>
      </div>
      <div className="navbar-user">
        <span>Hola, {usuario.nombre }</span>
        <button onClick={cerrarSesion}>Cerrar sesión</button>
      </div>
    </div>
  );
}

export default Navbar;

