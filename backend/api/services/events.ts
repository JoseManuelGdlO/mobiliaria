import { db } from "./db";
import { helper } from "../helper";
const { google } = require("googleapis");
const SCOPES = "https://www.googleapis.com/auth/firebase.messaging";
const axios = require("axios");

async function getEvents(id: number) {
  let code = 200;

  const rows = await db.query(
    `SELECT nombre_evento, fecha_envio_evento, COUNT(fecha_envio_evento) as total from evento_mob where id_empresa = "${id}" AND fecha_envio_evento LIKE "%202%" GROUP BY fecha_envio_evento`
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

async function getDetails(id: number) {
  let code = 200;
  try {
    let rows = await db.query(
      `select * from evento_mob where id_evento = '${id}'`
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

    rows = await db.query(
      `select a.nombre_mob, a.costo_mob, b.id_mob, b.ocupados, b.id_evento, b.id_fecha,
		b.fecha_evento
		from inventario_mob a, inventario_disponibilidad_mob b where b.id_mob = a.id_mob and id_evento='${id}'`
    );

    let items = helper.emptyOrRows(rows);

    rows = await db.query(
      `SELECT P.* 
        FROM pagos_mob P
        LEFT JOIN evento_mob E
        ON P.id_evento = E.id_evento
        WHERE P.id_evento ='${id}'`
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

    return {
      event: {
        event: event[0],
        payments,
        items,
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
  let code = 200;

  const rows = await db.query(
    `SELECT * FROM evento_mob WHERE id_empresa = ${id} AND fecha_envio_evento='${date}'`
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

async function editEvent(body: any) {
  let code = 200;
  try {
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
    let up = 99999;
    for (let product of pkt.products) {
      const prd = data.find(
        (item: any) => item.id_mob === product.fkid_inventario
      );
      if (prd) {
        const total = Math.trunc(prd.cantidad_mob / product.cantidad);
        up = total < up ? total : up;
      }

      product.nombre_mob = prd.nombre_mob;
      product.cantidad_mob = prd.cantidad_mob;
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
    `SELECT * FROM paquetes WHERE fkid_empresa = ${id} AND eliminado = 0`
  );

  let data = helper.emptyOrRows(rows);
  if (data.length === 0) {
    return [];
  }

  for (const pkt of data) {
    const products = await db.query(
      `SELECT * FROM paquete_inventario WHERE fkid_paquete = ${pkt.id}`
    );

    pkt.products = products;
  }

  return data;
}

async function addEvent(body: any, id: number, idUsuario: number) {
  const connection = await db.connection();
  await connection.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");

  await connection.beginTransaction();

  let dateEnv = body.evento.fecha_envio_evento.split("-");
  if (dateEnv[0].length === 2) {
    body.evento.fecha_envio_evento = `${dateEnv[2]}-${dateEnv[1]}-${dateEnv[0]}`;
  }

  let dateRec = body.evento.fecha_recoleccion_evento.split("-");
  if (dateRec[0].length === 2) {
    body.evento.fecha_recoleccion_evento = `${dateRec[2]}-${dateRec[1]}-${dateRec[0]}`;
  }

  try {
    const [event] = await connection.execute(
      `INSERT INTO evento_mob (nombre_evento, id_empresa, tipo_evento, fecha_envio_evento, hora_envio_evento, fecha_recoleccion_evento, hora_recoleccion_evento, pagado_evento, nombre_titular_evento, direccion_evento ,telefono_titular_evento, descuento, iva, flete, lat, lng, url, id_creador)
            VALUES ('${body.evento.nombre_evento}',${id}, '${body.evento.tipo_evento}', '${body.evento.fecha_envio_evento}',
                 	'${body.evento.hora_envio_evento}', '${body.evento.fecha_recoleccion_evento}', '${body.evento.hora_recoleccion_evento}',
                 		'${body.evento.pagado_evento}', '${body.evento.nombre_titular_evento}', '${body.evento.direccion_evento}', '${body.evento.telefono_titular_evento}',
                 		${body.evento.descuento}, ${body.evento.ivavalor}, ${body.evento.fletevalor}, '${body.evento.maps.lat}', '${body.evento.maps.lng}', '${body.evento.maps.url}', ${idUsuario})`
    );

    for (const mobiliario of body.mobiliario) {
      await connection.execute(
        `INSERT INTO inventario_disponibilidad_mob (fecha_evento, hora_evento, id_mob, ocupados, id_evento, hora_recoleccion, costo)
                VALUES ('${mobiliario.fecha_evento}', '${mobiliario.hora_evento}', ${mobiliario.id_mob}, ${mobiliario.ocupados},${event.insertId}, '${mobiliario.hora_recoleccion}', ${mobiliario.costo})`
      );
    }

    const [paymenth] = await connection.execute(
      `INSERT INTO pagos_mob (id_evento, costo_total, saldo, anticipo)
            VALUES (${event.insertId},${body.costo.costo_total},${body.costo.saldo},${body.costo.anticipo})`
    );
    sendNotification(`el dia ${body.evento.fecha_envio_evento}, ${body.mobiliario.length} items rentados`, "Nuevo evento", id, idUsuario);
    await connection.commit();
    return 201;
  } catch (error) {
    console.error(error);
    connection.rollback();
    console.info("Rollback successful");
    return 405;
  }
}

async function getAccessToken(): Promise<string> {
  return new Promise(function (resolve, reject) {
    const key = require("../assets/eventivakey.json");
    
    const jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      SCOPES,
      null
    );

    jwtClient.authorize(function (err: any, tokens: any) {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens.access_token);
    });
  });
};


async function AxiosConfig(token: string, notification: any) {
  
  
  try {
    let config = {
      method: "post",
      url: "https://fcm.googleapis.com/v1/projects/eventivapp/messages:send",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: notification,
    };

    const response = await axios(config);

    return response;
  } catch (error: any) {
    console.error("Error sending notification:", error);
    throw error;
  }
};


async function sendNotification(message: string, title: string, idCompany: number, idUsuario: number) {
  

  try {
    const rows = await db.query(
      `SELECT token FROM usuarios_mobiliaria WHERE id_empresa = ${idCompany} AND token IS NOT NULL`
    );

    const rowsUser = await db.query(
      `SELECT nombre_comp FROM usuarios_mobiliaria WHERE id_usuario = ${idUsuario}`
    );

    if (rows.length === 0) {
      return 404;
    }

    const access_token = await getAccessToken();
    if (!access_token) {
      return 404;
    }

    helper.emptyOrRows(rows).forEach((element: any) => {
      const notification = JSON.stringify({
        message: {
          token: element.token, // this is the fcm token of user which you want to send notification
          notification: {
            body: message,
            title: title,
          },
          apns: {
            headers: {
              "apns-priority": "10",
            },
            payload: {
              aps: {
                sound: "default",
              },
            },
          },
          data: {
            nombre: rowsUser[0].nombre_comp, // here you can send addition data along with notification 
          },
        },
      });
      AxiosConfig(access_token, notification);
    });

    return {code: 201, message: "Notificaciónes enviada"};
  } catch (error: any) {
    console.log("error", error.message);
    return {code: 201, message: error.message};
  }

}

// Función para enviar notificaciones push
async function send(message: string, title: string, idCompany: number) {
  const axios = require('axios');
  var admin = require("firebase-admin");

  var serviceAccount = require("assets/eventivakey.json");

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


async function addUrltoEvent(body: any, id: number) {
  const connection = await db.connection();
  await connection.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");

  await connection.beginTransaction();


  try {
    const [event] = await connection.execute(
      ` UPDATE evento_mob SET url = '${body.url}', lat = '${body.lat}', lng = '${body.lng}' WHERE id_evento = ${id}`
    );


    await connection.commit();
    return 201;
  } catch (error) {
    console.error(error);
    connection.rollback();
    console.info("Rollback successful");
    return 405;
  }
}

async function addFlete(body: any, id: number) {
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

    const [payment] = await connection.execute(
      `SELECT * FROM pagos_mob WHERE id_evento = ${id}`
    );

    const costoTotal = payment[payment.length - 1].costo_total + body.flete;
    const saldo = payment[payment.length - 1].saldo + body.flete;

    await connection.execute(
      `INSERT INTO pagos_mob (id_evento, costo_total, saldo, anticipo)
            VALUES (${id},${costoTotal},${saldo},${payment[payment.length - 1].anticipo})`
    );


    await connection.commit();
    return 201;
  } catch (error) {
    console.error(error);
    connection.rollback();
    console.info("Rollback successful");
    return 405;
  }
}

async function addItems(body: any) {
  const connection = await db.connection();
  await connection.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");

  await connection.beginTransaction();
  try {
    let [event] = await connection.execute(
      `SELECT * FROM evento_mob WHERE id_evento = ${body.id}`
    );
    event = event[0];

    let sumTotal = 0;

    for (const mobiliario of body.items) {
      sumTotal += mobiliario.cantidad * mobiliario.costo_mob;

      const mobEvent = await connection.execute(
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
      } else {
        await connection.execute(
          `UPDATE inventario_disponibilidad_mob SET ocupados = ${mobEvent[0][0].ocupados + mobiliario.cantidad
          } WHERE id_evento = ${body.id} AND id_mob = ${mobiliario.id_mob}`
        );
        continue;
      }
    }

    let [payment] = await connection.execute(
      `SELECT * FROM pagos_mob WHERE id_evento = ${body.id}`
    );
    payment = payment[payment.length - 1];

    let discount = event.descuento;

    if (discount > 0) {
      sumTotal = sumTotal - (sumTotal * discount) / 100;
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

async function changeStatus(id: number, delivered: number, recolected: number) {
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
  }
}

async function removeItem(id: number, id_mob: number) {
  const connection = await db.connection();
  await connection.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");

  await connection.beginTransaction();
  try {
    let item = await connection.execute(
      `SELECT * FROM inventario_disponibilidad_mob WHERE id_evento = ${id} AND id_mob = ${id_mob}`
    );

    item = item[0][0];

    let priceRemove = item.costo * item.ocupados;

    let removePayment = await connection.execute(
      `SELECT * FROM pagos_mob WHERE id_evento = ${id}`
    );

    removePayment = removePayment[0][removePayment[0].length - 1];

    removePayment.costo_total -= priceRemove;

    await connection.execute(
      `INSERT INTO pagos_mob (id_evento, costo_total, saldo, anticipo)
            VALUES (${id},${removePayment.costo_total},${removePayment.saldo},${removePayment.anticipo})`
    );

    let [event] = await connection.execute(
      `DELETE FROM inventario_disponibilidad_mob WHERE id_evento = ${id} AND id_mob = ${id_mob}`
    );

    connection.commit();
    return 201;
  } catch (error) {
    console.error(error);
    connection.rollback();
    console.info("Rollback successful");
    return 405;
  }
}

module.exports = {
  getEvents,
  getEventsOfDay,
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
  sendNotification
};
