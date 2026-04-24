import { db } from "./db";
import { helper } from "../helper";
import { saveHistorical } from "../libs/historical";
import { getAccessToken, sendNotification } from "../libs/notifications";
import { EventModel } from "../models/event";
import { InventoryAvailabilityModel } from "../models/inventoryAvailability";
import { PaymentModel } from "../models/payment";
import { sequelizeMain } from "./sequelize";
import { perfLog } from "../libs/perfLog";

const designDraftStore = new Map<string, any>();

/** Rolling window for calendar dots (months). Override with CALENDAR_EVENTS_MONTHS. */
const calendarEventsMonths = (): number => {
  const n = Number(process.env.CALENDAR_EVENTS_MONTHS || 18);
  return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), 120) : 18;
};

async function getEvents(id: number) {
  const startedAt = Date.now();
  let code = 200;
  const months = calendarEventsMonths();

  const rows = await db.query(
    `SELECT nombre_evento, fecha_envio_evento, COUNT(fecha_envio_evento) AS total
     FROM evento_mob
     WHERE id_empresa = ?
       AND fecha_envio_evento >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
     GROUP BY fecha_envio_evento`,
    [id, months]
  );

  let data = helper.emptyOrRows(rows);
  if (data.length === 0) {
    code = 404;
    perfLog("events.getEvents", startedAt);
    return {
      data,
      code,
    };
  }

  perfLog("events.getEvents", startedAt);
  return {
    data,
    code,
  };
}

async function getDetails(id: number) {
  let code = 200;
  try {
    const idNum = Number(id);
    let rows = await db.query(
      `SELECT e.*, rep.nombre_comp AS repartidor_nombre
       FROM evento_mob e
       LEFT JOIN usuarios_mobiliaria rep ON e.id_repartidor = rep.id_usuario
       WHERE e.id_evento = ?`,
      [idNum]
    );

    let event = helper.emptyOrRows(rows);
    if (event.length === 0) {
      code = 404;
      return {
        details: "No se encontró el evento",
        event,
        code,
      };
    }

    const [itemsRows, packagesRows] = await Promise.all([
      db.query(
        `select a.nombre_mob, b.costo, b.id_mob, b.ocupados, b.id_evento, b.id_fecha,
      b.fecha_evento, b.package
      from inventario_mob a, inventario_disponibilidad_mob b where b.id_mob = a.id_mob and id_evento=? AND  b.package IS NULL`,
        [idNum]
      ),
      db.query(
        `select a.nombre, b.costo, b.id_mob, b.ocupados, b.id_evento, b.id_fecha,
      b.fecha_evento, b.package
      from paquetes a, inventario_disponibilidad_mob b where b.id_mob = a.id and id_evento=? AND  b.package = 1`,
        [idNum]
      ),
    ]);

    let items = helper.emptyOrRows(itemsRows);
    let packages = helper.emptyOrRows(packagesRows);

    items = [...items, ...packages];
    rows = await db.query(
      `SELECT P.* 
        FROM pagos_mob P
        LEFT JOIN evento_mob E
        ON P.id_evento = E.id_evento
        WHERE P.id_evento = ?`,
      [idNum]
    );

    let payments = helper.emptyOrRows(rows);
    if (payments.length === 0) {
      code = 404;
      return {
        details: "No se encontraron los pagos",
        payments,
        code,
      };
    }

    const historial = await db.query(
      `SELECT 
          h.id, 
          h.date, 
          h.description, 
          h.obs, 
          h.fkid_user,
          u.nombre_comp
      FROM 
          historical h
      JOIN 
          usuarios_mobiliaria u ON h.fkid_user = u.id_usuario AND h.fkid_event = ?`,
      [idNum]
    );

    return {
      event: {
        event: event[0],
        payments,
        items,
        historial
      },
      code,
    };
  } catch (error) {
    console.log(error);
    return {
      code: 500,
    };
  }
}

async function getEventsOfDay(id: number, date: string) {
  const startedAt = Date.now();
  let code = 200;

  // Validar que date no esté vacío
  if (!date || date.trim() === '') {
    code = 400;
    perfLog("events.getEventsOfDay", startedAt);
    return {
      data: [],
      code,
    };
  }

  const rows = await db.query(
    `SELECT
        e.*,
        p.id_pago,
        p.costo_total,
        rep.nombre_comp AS repartidor_nombre
     FROM evento_mob e
     LEFT JOIN usuarios_mobiliaria rep ON e.id_repartidor = rep.id_usuario
     INNER JOIN (
       SELECT id_evento, MAX(id_pago) AS max_id_pago
       FROM pagos_mob
       GROUP BY id_evento
     ) latest ON latest.id_evento = e.id_evento
     INNER JOIN pagos_mob p
       ON p.id_evento = latest.id_evento AND p.id_pago = latest.max_id_pago
     WHERE e.id_empresa = ?
       AND e.fecha_envio_evento = ?`,
    [id, date]
  );

  let data = helper.emptyOrRows(rows);

  if (data.length === 0) {
    code = 404;
    perfLog("events.getEventsOfDay", startedAt);
    return {
      data,
      code,
    };
  }

  let total = 0;
  for (const event of data) {
    total += Number(event.costo_total ?? 0);
  }

  perfLog("events.getEventsOfDay", startedAt);
  return {
    data,
    total,
    code,
  };
}

async function assignRepartidor(
  idEmpresa: number,
  idUsuarioToken: number,
  body: { id_evento?: unknown; id_repartidor?: unknown }
) {
  const idEvent = Number(body?.id_evento);
  if (!Number.isFinite(idEvent) || idEvent <= 0) {
    return { code: 400, data: { error: "id_evento invalido" } };
  }

  const evRows = await db.query(
    `SELECT id_evento, id_empresa FROM evento_mob WHERE id_evento = ?`,
    [idEvent]
  );
  const events = helper.emptyOrRows(evRows) as any[];
  if (events.length === 0 || Number(events[0].id_empresa) !== idEmpresa) {
    return { code: 404, data: { error: "Evento no encontrado" } };
  }

  const rawRep = body?.id_repartidor;
  let repId: number | null = null;
  if (rawRep != null && rawRep !== "") {
    const rid = Number(rawRep);
    if (!Number.isFinite(rid) || rid <= 0) {
      return { code: 400, data: { error: "id_repartidor invalido" } };
    }
    const uRows = await db.query(
      `SELECT id_usuario, id_empresa, admin, delete_usuario FROM usuarios_mobiliaria WHERE id_usuario = ?`,
      [rid]
    );
    const users = helper.emptyOrRows(uRows) as any[];
    if (users.length === 0 || Number(users[0].id_empresa) !== idEmpresa) {
      return { code: 400, data: { error: "Usuario no valido para la empresa" } };
    }
    if (users[0].admin != null || users[0].delete_usuario != null) {
      return { code: 400, data: { error: "Usuario no valido" } };
    }
    repId = rid;
  }

  await db.query(
    `UPDATE evento_mob SET id_repartidor = ? WHERE id_evento = ? AND id_empresa = ?`,
    [repId, idEvent, idEmpresa]
  );

  saveHistorical(
    idEvent,
    idUsuarioToken,
    "Modificación",
    repId != null ? `Asignacion de ruta: repartidor id ${repId}` : "Asignacion de ruta: sin asignar"
  );

  return { code: 200, data: { id_evento: idEvent, id_repartidor: repId } };
}

async function editEvent(body: any, idUser: number) {
  let code = 200;
  try {
    const event = await db.query(
      `SELECT * FROM evento_mob WHERE id_evento = ${body.id}`
    );

    if(event[0].length !== 0) {
      let change = ''
      
      if(event[0].nombre_titular_evento !== body.titular) {
        change = `titular: ${event[0].nombre_titular_evento} a ${body.titular}, `
      }

      if(event[0].telefono_titular_evento !== body.telefono) {
        change = change + `telefono: ${event[0].telefono_titular_evento} a ${body.telefono}, `
      }
      
      if(body.url && event[0].url !== body.url) {
        change = change + `url = ${body.url}, `
      }

      if(event[0].direccion_evento !== body.direccion) {
        change = change + `direccion: ${event[0].direccion_evento} a ${body.direccion}, `
      }

      if(change !== '') {
        change = change.slice(0, -2)
        saveHistorical(body.id, idUser, `Modificación`, change)
      }
    }

    const rows = await db.query(
      `UPDATE evento_mob SET telefono_titular_evento = '${body.telefono}', direccion_evento = '${body.direccion}', nombre_titular_evento = '${body.titular}' WHERE id_evento = ${body.id}`
    );

    let data = helper.emptyOrRows(rows);
    if (data.length === 0) {
      code = 404;
      return {
        data,
        code,
      };
    }

    return {
      data,
      code,
    };
  } catch (error) {
    console.error(error);
    return {
      code: 500,
      error: error,
    };
  }
}

async function availiable(id: number, dateArrive: string) {
  let code = 200;

  let date = dateArrive.split("-");

  if (date[0].length === 2) {
    dateArrive = `${date[2]}-${date[1]}-${date[0]}`;
  }

  const rows = await db.query(
    `
        SELECT 
            inv.id_mob,
            inv.nombre_mob,
            inv.cantidad_mob - COALESCE(SUM(dis.cantidad_rentada), 0) AS cantidad_mob,
            inv.costo_mob as costo_mob,
            inv.extra_mob as extra_mob,
            inv.extra_mob_costo as extra_mob_costo
        FROM 
            inventario_mob inv
        LEFT JOIN 
            (
                SELECT 
                    id_mob,
                    SUM(ocupados) AS cantidad_rentada
                FROM 
                    inventario_disponibilidad_mob
                WHERE 
                    DATE(fecha_evento) = '${dateArrive}'
                GROUP BY 
                    id_mob
            ) dis ON inv.id_mob = dis.id_mob
            WHERE inv.id_empresa = ${id} AND inv.eliminado = 0
        GROUP BY 
            inv.id_mob, inv.nombre_mob
        ORDER BY 
            inv.id_mob;`
  );

  let data = helper.emptyOrRows(rows);
  if (data.length === 0) {
    code = 404;
    return {
      data,
      code,
    };
  }

  const packages = await getPackages(id);

  for (const pkt of packages) {
    let up = Number.MAX_SAFE_INTEGER;
    let hasInvalidProduct = false;
    const packetProducts = Array.isArray(pkt.products) ? pkt.products : [];

    if (packetProducts.length === 0) {
      pkt.availiable = 0;
      continue;
    }

    for (const product of packetProducts) {
      const prd = data.find(
        (item: any) => Number(item.id_mob) === Number(product.fkid_inventario)
      );

      if (!prd) {
        hasInvalidProduct = true;
        product.nombre_mob = "Producto no disponible";
        product.cantidad_mob = 0;
        continue;
      }

      product.nombre_mob = prd.nombre_mob;
      product.cantidad_mob = prd.cantidad_mob;

      const quantityPerPackage = Number(product.cantidad || 0);
      if (quantityPerPackage <= 0) {
        hasInvalidProduct = true;
        continue;
      }

      const total = Math.trunc(Number(prd.cantidad_mob) / quantityPerPackage);
      up = total < up ? total : up;
    }

    if (hasInvalidProduct || up === Number.MAX_SAFE_INTEGER || up < 0) {
      pkt.availiable = 0;
      continue;
    }

    pkt.availiable = up;
  }

  return {
    data: {
      inventary: data,
      packages,
    },
    code,
  };
}

async function getPackages(id: number) {
  const rows = await db.query(
    `SELECT * FROM paquetes WHERE fkid_empresa = ? AND eliminado = 0`,
    [id]
  );

  let data = helper.emptyOrRows(rows);
  if (data.length === 0) {
    return [];
  }

  const ids = data.map((p: any) => p.id);
  const placeholders = ids.map(() => "?").join(",");
  const allProducts: any = await db.query(
    `SELECT * FROM paquete_inventario WHERE fkid_paquete IN (${placeholders})`,
    ids
  );
  const rowsList = helper.emptyOrRows(allProducts);
  const byPaquete = new Map<number, any[]>();
  for (const row of rowsList) {
    const pid = Number((row as any).fkid_paquete);
    const list = byPaquete.get(pid);
    if (list) {
      list.push(row);
    } else {
      byPaquete.set(pid, [row]);
    }
  }
  for (const pkt of data) {
    pkt.products = byPaquete.get(Number(pkt.id)) ?? [];
  }

  return data;
}

async function addEvent(body: any, id: number, idUsuario: number) {
  if(!body.notifications) {
    body.notifications = {
      send: 0,
      recolected: 0
    }
  }

  let dateEnv = body.evento.fecha_envio_evento.split("-");
  if (dateEnv[0].length === 2) {
    body.evento.fecha_envio_evento = `${dateEnv[2]}-${dateEnv[1]}-${dateEnv[0]}`;
  }

  let dateRec = body.evento.fecha_recoleccion_evento.split("-");
  if (dateRec[0].length === 2) {
    body.evento.fecha_recoleccion_evento = `${dateRec[2]}-${dateRec[1]}-${dateRec[0]}`;
  }

  const transaction = await sequelizeMain.transaction();

  try {
    const event = await EventModel.create(
      {
        nombre_evento: body.evento.nombre_evento,
        id_empresa: id,
        tipo_evento: body.evento.tipo_evento,
        fecha_envio_evento: body.evento.fecha_envio_evento,
        hora_envio_evento: body.evento.hora_envio_evento,
        fecha_recoleccion_evento: body.evento.fecha_recoleccion_evento,
        hora_recoleccion_evento: body.evento.hora_recoleccion_evento,
        pagado_evento: body.evento.pagado_evento,
        nombre_titular_evento: body.evento.nombre_titular_evento,
        direccion_evento: body.evento.direccion_evento,
        telefono_titular_evento: body.evento.telefono_titular_evento,
        descuento: Number(body.evento.descuento || 0),
        descuento_aplica_flete: Number(body.evento.descuento_aplica_flete || 0),
        iva: Number(body.evento.ivavalor || 0),
        flete: Number(body.evento.fletevalor || 0),
        lat: String(body.evento.maps?.lat || ""),
        lng: String(body.evento.maps?.lng || ""),
        url: String(body.evento.maps?.url || ""),
        id_creador: idUsuario,
        notificacion_envio: Number(body.notifications.send || 0),
        notificacion_recoleccion: Number(body.notifications.recolected || 0),
      },
      { transaction }
    );

    const eventId = Number(event.getDataValue("id_evento"));

    const mobRows = (body.mobiliario || []).map((mobiliario: any) => ({
      fecha_evento: mobiliario.fecha_evento,
      hora_evento: mobiliario.hora_evento,
      id_mob: Number(mobiliario.id_mob),
      ocupados: Number(mobiliario.ocupados),
      id_evento: eventId,
      hora_recoleccion: mobiliario.hora_recoleccion,
      costo: Number(mobiliario.costo),
    }));

    const pkgRows = (body.paquetes || []).map((paquete: any) => ({
      fecha_evento: body.evento.fecha_envio_evento,
      hora_evento: body.evento.hora_envio_evento,
      id_mob: Number(paquete.id),
      ocupados: Number(paquete.cantidad),
      id_evento: eventId,
      hora_recoleccion: body.evento.hora_recoleccion_evento,
      costo: Number(paquete.precio),
      package: 1,
    }));

    if (mobRows.length > 0) {
      await InventoryAvailabilityModel.bulkCreate(mobRows, { transaction });
    }
    if (pkgRows.length > 0) {
      await InventoryAvailabilityModel.bulkCreate(pkgRows, { transaction });
    }

    await PaymentModel.create(
      {
        id_evento: eventId,
        costo_total: Number(body.costo.costo_total),
        saldo: Number(body.costo.saldo),
        anticipo: Number(body.costo.anticipo),
      },
      { transaction }
    );

    saveHistorical(eventId, idUsuario, "Creación");

    if(body.rec && !body.rec) {
      
     const access_token = await getAccessToken();
     sendNotification(`el dia ${body.evento.fecha_envio_evento}, ${body.mobiliario.length} items rentados`, "Nuevo evento", id, idUsuario, access_token);
    }
    await transaction.commit();
    return 201;
  } catch (error) {
    console.error(error);
    await transaction.rollback();
    console.info("Rollback successful");
    return 405;
  }
}

// Función para enviar notificaciones push
async function send(message: string, title: string, idCompany: number) {
  const axios = require('axios');
  var admin = require("firebase-admin");

  var serviceAccount = require("../assets/eventivakey.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  const rows = await db.query(
    `SELECT token FROM usuarios_mobiliaria WHERE id_empresa = ${idCompany} AND token IS NOT NULL`
  );

  let tokens: any = []
  helper.emptyOrRows(rows).forEach((element: any) => {
    tokens.push(element.token)
  });

  console.log(tokens);

  if (tokens.length === 0) {
    return;
  }

  const payload = {
    registration_ids: tokens,
    notification: {
      title: title,
      body: message
    }
  };

  axios.post('https://fcm.googleapis.com/v1/projects/eventivapp/messages:send', payload, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAccessToken()}`
    }
  });
}


async function addUrltoEvent(body: any, id: number, idUsuario: number) {
  const connection = await db.connection();
  await connection.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");

  await connection.beginTransaction();


  try {
    await connection.execute(
      ` UPDATE evento_mob SET url = ?, lat = ?, lng = ? WHERE id_evento = ?`,
      [body.url, body.lat, body.lng, id]
    );

    saveHistorical(id, idUsuario, "Modificación", `Se actualizo la url ${body.url}`);


    await connection.commit();
    return 201;
  } catch (error) {
    console.error(error);
    connection.rollback();
    console.info("Rollback successful");
    return 405;
  } finally {
    connection.release();
  }
}

async function addFlete(body: any, id: number, idUsuario: number) {
  const connection = await db.connection();
  await connection.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");

  await connection.beginTransaction();


  try {
    await connection.execute(
      `SELECT * FROM evento_mob WHERE id_evento = ${id}`
    );

    await connection.execute(
      ` UPDATE evento_mob SET flete = ${body.flete} WHERE id_evento = ${id}`
    );

    const [payment]: any = await connection.execute(
      `SELECT * FROM pagos_mob WHERE id_evento = ${id}`
    );

    const costoTotal = payment[payment.length - 1].costo_total + body.flete;
    const saldo = payment[payment.length - 1].saldo + body.flete;

    await connection.execute(
      `INSERT INTO pagos_mob (id_evento, costo_total, saldo, anticipo)
            VALUES (${id},${costoTotal},${saldo},${payment[payment.length - 1].anticipo})`
    );

    saveHistorical(id, idUsuario, "Modificación", `Se actualizo el flete a ${body.flete}`);
    await connection.commit();
    return 201;
  } catch (error) {
    console.error(error);
    connection.rollback();
    console.info("Rollback successful");
    return 405;
  } finally {
    connection.release();
  }
}

async function addItems(body: any, idUsuario: number) {
  const connection = await db.connection();
  await connection.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");

  await connection.beginTransaction();
  try {
    let [event]: any = await connection.execute(
      `SELECT * FROM evento_mob WHERE id_evento = ${body.id}`
    );
    event = event[0];

    let sumTotal = 0;

    for (const mobiliario of body.items) {
      sumTotal += mobiliario.cantidad * mobiliario.costo_mob;

      const mobEvent: any = await connection.execute(
        `SELECT * FROM inventario_disponibilidad_mob WHERE id_evento = ${body.id} AND id_mob = ${mobiliario.id_mob}`
      );

      if (mobEvent[0].length === 0) {

        await connection.execute(
          `INSERT INTO inventario_disponibilidad_mob (fecha_evento, hora_evento, id_mob, ocupados, id_evento, hora_recoleccion, costo)
                VALUES ('${event.fecha_envio_evento.toISOString().split("T")[0]
          }', '${event.hora_envio_evento}', ${mobiliario.id_mob}, ${mobiliario.cantidad
          }, ${body.id}, '${event.fecha_recoleccion_evento.toISOString().split("T")[0]
          }', ${mobiliario.costo_mob})`
        );
        saveHistorical(body.id, idUsuario, "Modificación", `Se agregó ${mobiliario.cantidad} ${mobiliario.nombre_mob}`);
      } else {
        await connection.execute(
          `UPDATE inventario_disponibilidad_mob SET ocupados = ${mobEvent[0][0].ocupados + mobiliario.cantidad
          } WHERE id_evento = ${body.id} AND id_mob = ${mobiliario.id_mob}`
        );
        saveHistorical(body.id, idUsuario, "Modificación", `Se actualizo a ${mobiliario.cantidad} ${mobiliario.nombre_mob}`);
        continue;
      }
    }

    let [payment]: any = await connection.execute(
      `SELECT * FROM pagos_mob WHERE id_evento = ${body.id}`
    );
    payment = payment[payment.length - 1];

    let discount = event.descuento;
    let ivavalor = event.iva;

    if (discount > 0) {
      sumTotal = sumTotal - (sumTotal * discount) / 100;
    }

    if(ivavalor === 1) {
      sumTotal = sumTotal + (sumTotal * 16) / 100;
    }

    payment.costo_total += sumTotal;
    payment.saldo += sumTotal;

    await connection.execute(
      `INSERT INTO pagos_mob (id_evento, costo_total, saldo, anticipo)
            VALUES (${body.id},${payment.costo_total},${payment.saldo},${payment.anticipo})`
    );

    await connection.execute(
      `UPDATE evento_mob SET pagado_evento = 0 WHERE id_evento = ${body.id}`
    );

    await connection.commit();
    return 201;
  } catch (error) {
    console.error(error);
    connection.rollback();
    console.info("Rollback successful");
    return 405;
  } finally {
    connection.release();
  }
}

async function updateObvs(body: any) {
  let code = 200;

  const rows = await db.query(
    `UPDATE evento_mob SET observaciones = '${body.observaciones}'
                WHERE id_evento = ${body.id}`
  );

  let data = helper.emptyOrRows(rows);
  if (data.length === 0) {
    code = 404;
    return {
      data,
      code,
    };
  }

  return {
    data,
    code,
  };
}

async function changeStatus(id: number, delivered: number, recolected: number, idUsuario: number) {
  let code = 200;

  const rows = await db.query(
    `UPDATE evento_mob SET entregado = '${delivered}', recolectado = '${recolected}'
                WHERE id_evento = ${id}`
  );

  let data = helper.emptyOrRows(rows);
  if (data.length === 0) {
    code = 404;
    return {
      data,
      code,
    };
  }

  saveHistorical(id, idUsuario, "Modificación", `Se actualizó el estado a entregado: ${delivered} y recolectado: ${recolected}`);

  return {
    data,
    code,
  };
}

async function remove(id: number) {
  const connection = await db.connection();
  
  await connection.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");

  await connection.beginTransaction();
  try {
    let [event] = await connection.execute(
      `DELETE FROM evento_mob WHERE id_evento = ${id}`
    );
    

    let [disponility] = await connection.execute(
      `DELETE FROM inventario_disponibilidad_mob WHERE id_evento = ${id}`
    );
    

    await connection.commit();
    return 201;
  } catch (error) {
    console.error(error);
    connection.rollback();
    console.info("Rollback successful");
    return 405;
  } finally {
    connection.release();
  }
}

async function removeItem(id: number, id_mob: number) {
  const connection = await db.connection();
  await connection.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");

  await connection.beginTransaction();
  try {
    let item: any = await connection.execute(
      `SELECT * FROM inventario_disponibilidad_mob WHERE id_evento = ${id} AND id_mob = ${id_mob}`
    );

    ///function for obtains discont of event
    let event: any = await connection.execute(
      `SELECT descuento, iva FROM evento_mob WHERE id_evento = ${id}`
    );

    let discount = event[0][0].descuento;
    let iva = event[0][0].iva;
    item = item[0][0];

    let priceRemove = item.costo * item.ocupados;

    let removePayment: any = await connection.execute(
      `SELECT * FROM pagos_mob WHERE id_evento = ${id}`
    );

    removePayment = removePayment[0][removePayment[0].length - 1];

    if(discount > 0) {
      priceRemove = priceRemove - (priceRemove * discount) / 100;
    }
    if(iva === 1) {
      priceRemove = priceRemove + (priceRemove * 16) / 100;
    }

    removePayment.costo_total -= priceRemove;
    removePayment.saldo -= priceRemove;

    await connection.execute(
      `INSERT INTO pagos_mob (id_evento, costo_total, saldo, anticipo)
            VALUES (${id},${removePayment.costo_total},${removePayment.saldo},${removePayment.anticipo})`
    );

    await connection.execute(
      `DELETE FROM inventario_disponibilidad_mob WHERE id_evento = ${id} AND id_mob = ${id_mob}`
    );
    await saveHistorical(id, 1, "Modificación", `Se eliminó ${item.ocupados} ${item.nombre_mob ? item.nombre_mob : item.nombre}`);
    connection.commit();
    return 201;
  } catch (error) {
    console.error(error);
    connection.rollback();
    console.info("Rollback successful");
    return 405;
  } finally {
    connection.release();
  }
}

async function saveDesignDraft(
  idEvent: number,
  idEmpresa: number,
  idUsuario: number,
  draft: any
) {
  const key = `${idEmpresa}:${idEvent}`;
  const payload = {
    idEvent,
    idEmpresa,
    idUsuario,
    updatedAt: Date.now(),
    draft,
  };
  designDraftStore.set(key, payload);

  if (idEvent > 0) {
    saveHistorical(
      idEvent,
      idUsuario,
      "Modificación",
      "Actualización de borrador de diseño y cotización viva"
    );
  }

  return {
    code: 201,
    data: payload,
  };
}

module.exports = {
  getEvents,
  getEventsOfDay,
  assignRepartidor,
  availiable,
  addEvent,
  updateObvs,
  getDetails,
  changeStatus,
  remove,
  removeItem,
  editEvent,
  addItems,
  addUrltoEvent,
  addFlete,
  sendNotification,
  saveDesignDraft
};
