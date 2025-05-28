const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MongoDB local
mongoose.connect('mongodb://localhost:27017/gestor_proyectos')
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error al conectar a MongoDB', err));

// Modelos
const Proyecto = require('./models/Proyecto');
const Usuario = require('./models/Usuario');

// Obtener todos los proyectos
app.get('/api/proyectos', async (req, res) => {
  try {
    const proyectos = await Proyecto.find();
    res.json(proyectos);
  } catch (err) {
    res.status(500).json({ mensaje: "Error al obtener proyectos", error: err });
  }
});

// Crear nuevo proyecto
app.post('/api/proyectos', async (req, res) => {
  try {
    const nuevoProyecto = new Proyecto({
      nombre: req.body.nombre,
      tareas: []
    });
    await nuevoProyecto.save();
    console.log("Proyecto guardado en MongoDB:", nuevoProyecto);
    res.json({ mensaje: "Proyecto creado", proyecto: nuevoProyecto });
  } catch (err) {
    console.error("❌ Error al crear proyecto:", err);
    res.status(500).json({ mensaje: "Error al crear proyecto", error: err });
  }
});

// Agregar tarea a un proyecto
app.post('/api/proyectos/:id/tareas', async (req, res) => {
  try {
    const proyecto = await Proyecto.findById(req.params.id);
    if (!proyecto) return res.status(404).json({ mensaje: "Proyecto no encontrado" });

    proyecto.tareas.push(req.body);
    await proyecto.save();
    console.log(`Tarea agregada al proyecto ${proyecto.nombre}:`, req.body);
    res.json({ mensaje: "Tarea agregada", tarea: req.body });
  } catch (err) {
    console.error("❌ Error al agregar tarea:", err);
    res.status(500).json({ mensaje: "Error al agregar tarea", error: err });
  }
});

// Actualizar una tarea específica
app.put('/api/proyectos/:id/tareas/:tareaId', async (req, res) => {
  try {
    const proyecto = await Proyecto.findById(req.params.id);
    if (!proyecto) return res.status(404).json({ mensaje: "Proyecto no encontrado" });

    const tarea = proyecto.tareas.id(req.params.tareaId);
    if (!tarea) return res.status(404).json({ mensaje: "Tarea no encontrada" });

    tarea.set(req.body);
    await proyecto.save();
    console.log(`Tarea actualizada en proyecto ${proyecto.nombre}:`, tarea);
    res.json({ mensaje: "Tarea actualizada", tarea });
  } catch (err) {
    console.error("❌ Error al actualizar tarea:", err);
    res.status(500).json({ mensaje: "Error al actualizar tarea", error: err });
  }
});

// Obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ mensaje: "Error al obtener usuarios", error: err });
  }
});

// Crear nuevo usuario
app.post('/api/usuarios', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const nuevoUsuario = new Usuario({
      nombre: req.body.nombre,
      password: hashedPassword
    });
    await nuevoUsuario.save();
    console.log("Usuario guardado:", nuevoUsuario);
    res.json({ mensaje: "Usuario creado", usuario: { nombre: nuevoUsuario.nombre, _id: nuevoUsuario._id } });
  } catch (err) {
    console.error("❌ Error al crear usuario:", err);
    res.status(500).json({ mensaje: "Error al crear usuario", error: err });
  }
});

// Eliminar usuario
app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Usuario eliminado" });
  } catch (err) {
    console.error("❌ Error al eliminar usuario:", err);
    res.status(500).json({ mensaje: "Error al eliminar usuario", error: err });
  }
});

// Verificar login
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

// Iniciar servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
