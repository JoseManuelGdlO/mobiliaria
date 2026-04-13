# Sequelize forward-only policy

## Punto de corte

- Fecha de adopcion: `2026-04-13`.
- Desde esta fecha, toda nueva funcionalidad debe usar `Sequelize`.
- No se recrean migraciones historicas de tablas legacy existentes.

## Reglas obligatorias

1. Nueva tabla o columna => migration nueva en `sequelize/migrations`.
2. Nuevos inserts/updates en modulos nuevos => modelos Sequelize.
3. SQL raw solo para casos excepcionales (reportes complejos), siempre parametrizado.
4. Cada cambio de schema debe tener rollback (`down`) funcional.

## Esquemas de base de datos

- Base principal (`base`) usa entorno `development_main`.
- Base Durangeneidad (`dgo`) usa entorno `development_dgo`.

## Scripts

- `npm run db:migrate:main`
- `npm run db:migrate:dgo`
- `npm run db:migrate:all`
- `npm run db:migrate:undo:main`
- `npm run db:migrate:undo:dgo`
