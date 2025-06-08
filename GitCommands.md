# Git Commands - Sistema de control de versiones

## Flujo de trabajo

- Rama principal: main
- Rama de integración: dev
- Ramas de funcionalidad: feature/test, feature/usuarios, feature/roles, feature/dashboard.

## Comandos utilizados

git init
git branch
git checkout -b feature/test
git add .
git commit -m "feat: pruebas"
git push origin feature/test
...

## Recuperación de versiones

git log --oneline
git checkout [commit_id]
git revert [commit_id]
git reset --hard [commit_id]
