const mongoose = require('mongoose');

const TareaSchema = new mongoose.Schema({
  nombre: String,
  responsable: String,
  inicio: String,
  fin: String,
  avanceReal: Number
});

const ProyectoSchema = new mongoose.Schema({
  nombre: String,
  tareas: [TareaSchema]
});

module.exports = mongoose.model('Proyecto', ProyectoSchema);

