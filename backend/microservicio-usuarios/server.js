const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect('mongodb://mongodb:27017/gestor_proyectos')
  .then(() => console.log('✅ Usuarios-Conectado a MongoDB'))
  .catch(err => console.error('❌ Usuarios - Error al conectar a MongoDB', err));

// Importar modelo
const Usuario = require('./models/Usuario');

// Rutas
app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ mensaje: "Error al obtener usuarios", error: err });
  }
});

app.post('/api/usuarios', async (req, res) => {
  try {
    const nuevoUsuario = new Usuario({
      nombre: req.body.nombre,
      password: req.body.password
    });
    await nuevoUsuario.save();
    res.json({ mensaje: "Usuario creado", usuario: { nombre: nuevoUsuario.nombre, _id: nuevoUsuario._id } });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al crear usuario", error: err });
  }
});

app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Usuario eliminado" });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al eliminar usuario", error: err });
  }
});

app.post('/api/login', async (req, res) => {
  const { nombre, password } = req.body;
  try {
    const usuario = await Usuario.findOne({ nombre });
    if (!usuario) return res.status(400).json({ mensaje: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) return res.status(401).json({ mensaje: "Contraseña incorrecta" });

    res.json({ mensaje: "Login exitoso", usuario: { nombre: usuario.nombre, _id: usuario._id } });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al verificar login", error: err });
  }
});

// Levantar servidor
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🟢 Microservicio Usuarios corriendo en http://localhost:${PORT}`);
});
