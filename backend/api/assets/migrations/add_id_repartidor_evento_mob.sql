-- Asignación de repartidor por pedido (evento). Ejecutar en la base de producción si no usas sequelize-cli.
-- MySQL / MariaDB

ALTER TABLE `evento_mob`
  ADD COLUMN `id_repartidor` int(11) NULL DEFAULT NULL,
  ADD KEY `idx_evento_mob_id_repartidor` (`id_repartidor`);

ALTER TABLE `evento_mob`
  ADD CONSTRAINT `evento_mob_ibfk_repartidor`
  FOREIGN KEY (`id_repartidor`) REFERENCES `usuarios_mobiliaria` (`id_usuario`)
  ON DELETE SET NULL ON UPDATE CASCADE;
