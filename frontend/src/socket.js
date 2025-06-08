// src/socket.js
import { io } from 'socket.io-client';
import { WS_NOTIFICACIONES } from './config';

const socket = io(WS_NOTIFICACIONES);

export default socket;
