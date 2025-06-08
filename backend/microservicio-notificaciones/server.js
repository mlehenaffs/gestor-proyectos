// microservicio-notificaciones/server.js

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('🟢 Cliente conectado:', socket.id);

  // Escuchar notificaciones desde otros servicios
  socket.on('notificacion', (data) => {
    console.log('📨 Notificación recibida para reenviar:', data);
    io.emit('notificacion', data); // Reenviar a todos los clientes conectados
  });

  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado:', socket.id);
  });
});

const PORT = 4002;
server.listen(PORT, () => {
  console.log(`🔔 Microservicio de Notificaciones escuchando en el puerto ${PORT}`);
});
