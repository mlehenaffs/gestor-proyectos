@echo off
echo Iniciando microservicios y frontend...
timeout /t 1
start cmd /k "cd backend\microservicio-usuarios && npm start"
start cmd /k "cd backend\microservicio-proyectos && npm start"
start cmd /k "cd backend\microservicio-notificaciones && npm start"
start cmd /k "cd frontend && npm start"

echo Todos los servicios han sido lanzados en ventanas separadas.
pause
