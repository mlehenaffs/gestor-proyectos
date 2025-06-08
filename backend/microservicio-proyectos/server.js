// microservicio-proyectos/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { io: ClientIO } = require('socket.io-client'); // Cliente WebSocket para emitir notificaciones

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// 👉 Cliente WebSocket conectado al microservicio-notificaciones
const notificacionSocket = ClientIO('http://notificaciones:4002'); // AJUSTE: nombre del servicio en docker-compose

notificacionSocket.on('connect', () => {
  console.log('📡 Proyectos conectado a microservicio-notificaciones');
});

// Hacer accesible desde rutas
app.set('socketNotificaciones', notificacionSocket);

// Conexión a MongoDB
mongoose.connect('mongodb://mongodb:27017/gestor_proyectos')
  .then(() => console.log('✅ Proyectos - Conectado a MongoDB'))
  .catch(err => console.error('❌ Proyectos - Error al conectar a MongoDB', err));

// Modelo
const Proyecto = require('./models/Proyecto');

// Rutas
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

    // Emitir notificación
    notificacionSocket.emit('notificacion', {
      tipo: 'nuevo_proyecto',
      mensaje: `Se ha creado el proyecto "${nuevoProyecto.nombre}".`
    });

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

    // Emitir notificación
    notificacionSocket.emit('notificacion', {
      tipo: 'nueva_tarea',
      mensaje: `Nueva tarea "${tareaAgregada.nombre}" añadida al proyecto "${proyecto.nombre}".`
    });

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

// 🔹 Ruta temporal para probar notificaciones manuales
app.post('/api/test-notificacion', (req, res) => {
  const socketNotificaciones = req.app.get('socketNotificaciones');

  if (socketNotificaciones && socketNotificaciones.connected) {
    socketNotificaciones.emit('notificacion', {
      mensaje: '🔔 Notificación de prueba desde /api/test-notificacion'
    });
    res.json({ ok: true, mensaje: 'Notificación emitida' });
  } else {
    res.status(500).json({ ok: false, error: 'Socket no conectado' });
  }
});

// Iniciar servidor
const PORT = 4001;
server.listen(PORT, () => {
  console.log(`🟢 Microservicio Proyectos corriendo en http://localhost:${PORT}`);
});
