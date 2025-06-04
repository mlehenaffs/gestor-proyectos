const request = require('supertest');
const app = 'http://localhost:3001';

let proyectoId;
let tareaId;

describe('Pruebas de API - Proyectos', () => {
  test('Crear registro (POST /api/proyectos)', async () => {
    const res = await request(app).post('/api/proyectos').send({
      nombre: 'Proyecto de prueba automatizada'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('proyecto');
    expect(res.body.proyecto).toHaveProperty('_id');

    proyectoId = res.body.proyecto._id;
    console.log('Proyecto creado con ID:', proyectoId);
  });

  test('Consultar registros (GET /api/proyectos)', async () => {
    const res = await request(app).get('/api/proyectos');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    console.log('📋 Total proyectos encontrados:', res.body.length);
  });

  test('Actualizar registro (PUT /api/proyectos/:id/tareas/:tareaId)', async () => {
    // 1. Agregar una tarea primero
    const resTarea = await request(app)
      .post(`/api/proyectos/${proyectoId}/tareas`)
      .send({
        nombre: 'Tarea inicial',
        estado: 'pendiente'
      });

    tareaId = resTarea.body.tarea._id;
    console.log('Tarea encontrada con ID:', tareaId);

    // 2. Actualizar esa tarea
    const res = await request(app)
      .put(`/api/proyectos/${proyectoId}/tareas/${tareaId}`)
      .send({
        nombre: 'Tarea actualizada',
        estado: 'completado'
      });

    console.log('RESPUESTA DE ACTUALIZACIÓN:', res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('tarea');
    expect(res.body.tarea).toHaveProperty('nombre');
    expect(res.body.tarea.nombre).toBe('Tarea actualizada');
  });
});
