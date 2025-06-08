const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/gestor_proyectos')
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error al conectar a MongoDB', err));

const Proyecto = require('./models_respaldo/Proyecto');
const Usuario = require('./models_respaldo/Usuario');

app.get('/api/proyectos', async (req, res) => {
  try {
    const proyectos = await Proyecto.find();
    res.json(proyectos);
  } catch (err) {
    res.status(500).json({ mensaje: "Error al obtener proyectos", error: err });
  }
});

app.post('/api/proyectos', async (req, res) => {
  try {
    const nuevoProyecto = new Proyecto({
      nombre: req.body.nombre,
      tareas: []
    });
    await nuevoProyecto.save();
    res.json({ mensaje: "Proyecto creado", proyecto: nuevoProyecto });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al crear proyecto", error: err });
  }
});

app.post('/api/proyectos/:id/tareas', async (req, res) => {
  try {
    const proyecto = await Proyecto.findById(req.params.id);
    if (!proyecto) return res.status(404).json({ mensaje: "Proyecto no encontrado" });

    const nuevaTarea = req.body;
    proyecto.tareas.push(nuevaTarea);
    await proyecto.save();

    const tareaAgregada = proyecto.tareas[proyecto.tareas.length - 1];
    res.json({ mensaje: "Tarea agregada", tarea: tareaAgregada });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al agregar tarea", error: err });
  }
});

app.put('/api/proyectos/:id/tareas/:tareaId', async (req, res) => {
  try {
    const proyecto = await Proyecto.findById(req.params.id);
    if (!proyecto) return res.status(404).json({ mensaje: "Proyecto no encontrado" });

    const tarea = proyecto.tareas.id(req.params.tareaId);
    if (!tarea) return res.status(404).json({ mensaje: "Tarea no encontrada" });

    tarea.set(req.body);
    await proyecto.save();

    res.json({
      mensaje: "Tarea actualizada",
      tarea: {
        _id: tarea._id,
        nombre: tarea.nombre,
        responsable: tarea.responsable,
        inicio: tarea.inicio,
        fin: tarea.fin,
        avanceReal: tarea.avanceReal
      }
    });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al actualizar tarea", error: err });
  }
});

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
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const nuevoUsuario = new Usuario({
      nombre: req.body.nombre,
      password: hashedPassword
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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
