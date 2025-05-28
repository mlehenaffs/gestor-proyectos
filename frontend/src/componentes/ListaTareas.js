// Componente para listar tareas de un proyecto
import React from 'react';

function ListaTareas({ tareas, usuarios, proyectoId, editarTarea, guardarTarea, calcularEstadoTarea, calcularAvanceDeseado, calcularCumplimiento }) {
  return (
    <ul className="tarea-lista">
      {(tareas || []).map(t => {
        const deseado = calcularAvanceDeseado(t.inicio, t.fin);
        const cumplimiento = calcularCumplimiento(t.avanceReal, deseado);

        return (
          <li key={t._id} className="tarea-item">
            <input value={t.nombre} onChange={e => editarTarea(proyectoId, t._id, 'nombre', e.target.value)} onBlur={() => guardarTarea(proyectoId, t)} />
            <select value={t.responsable} onChange={e => editarTarea(proyectoId, t._id, 'responsable', e.target.value)} onBlur={() => guardarTarea(proyectoId, t)}>
              <option value="">Responsable</option>
              {usuarios.map(u => <option key={u._id} value={u.nombre}>{u.nombre}</option>)}
            </select>
            <input type="date" value={t.inicio} onChange={e => editarTarea(proyectoId, t._id, 'inicio', e.target.value)} onBlur={() => guardarTarea(proyectoId, t)} />
            <input type="date" value={t.fin} onChange={e => editarTarea(proyectoId, t._id, 'fin', e.target.value)} onBlur={() => guardarTarea(proyectoId, t)} />
            <input type="number" value={t.avanceReal} onChange={e => editarTarea(proyectoId, t._id, 'avanceReal', e.target.value)} onBlur={() => guardarTarea(proyectoId, t)} />
            <div>Estado: {calcularEstadoTarea(t)}</div>
            <div>Avance deseado: {deseado}% | Cumplimiento: {cumplimiento}%</div>
          </li>
        );
      })}
    </ul>
  );
}

export default ListaTareas;
