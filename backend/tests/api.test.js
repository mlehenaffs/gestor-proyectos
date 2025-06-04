const request = require('supertest');
const baseURL = 'http://localhost:3001';

describe('Pruebas de API - Proyectos', () => {
  let proyectoId = '';
  let tareaId = '';

  test('Crear registro (POST /api/proyectos)', async () => {
    const res = await request(baseURL)
      .post('/api/proyectos')
      .send({
        nombre: 'Proyecto de prueba automatizada'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('proyecto');
    expect(res.body.proyecto).toHaveProperty('_id');

    proyectoId = res.body.proyecto._id;
    console.log('Proyecto creado con ID:', proyectoId);
  });

  test('Consultar registros (GET /api/proyectos)', async () => {
    const res = await request(baseURL).get('/api/proyectos');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    console.log('📋 Total proyectos encontrados:', res.body.length);
  });

  test('Actualizar registro (PUT /api/proyectos/:id/tareas/:tareaId)', async () => {
    const addTarea = await request(baseURL)
      .post(`/api/proyectos/${proyectoId}/tareas`)
      .send({
        titulo: 'Tarea de prueba',
        descripcion: 'Descripción inicial'
      });

    expect(addTarea.statusCode).toBe(200);
    expect(addTarea.body).toHaveProperty('tarea');

    const proyecto = await request(baseURL).get('/api/proyectos');
    const encontrado = proyecto.body.find(p => p._id === proyectoId);

    if (!encontrado || !encontrado.tareas || !encontrado.tareas.length) {
      throw new Error('No se encontró una tarea válida para actualizar.');
    }

    tareaId = encontrado.tareas[0]._id;
    console.log('Tarea encontrada con ID:', tareaId);

    const res = await request(baseURL)
      .put(`/api/proyectos/${proyectoId}/tareas/${tareaId}`)
      .send({
        titulo: 'Tarea actualizada',
        descripcion: 'Descripción modificada'
      });

    console.log('RESPUESTA DE ACTUALIZACIÓN:', res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('tarea');
    expect(res.body.tarea).toHaveProperty('titulo');
    expect(res.body.tarea.titulo).toBe('Tarea actualizada');
  });
});
