import { helper } from "../helper";
import { db } from "../services/db";
import { config } from "../config";

const { google } = require("googleapis");
const SCOPES = "https://www.googleapis.com/auth/firebase.messaging";
const axios = require("axios");

function getFirebaseCredentials() {
  const serviceAccount = config.firebaseCredentials;
  if (!serviceAccount) {
    throw new Error("FIREBASE_CREDENTIALS is required");
  }
  return serviceAccount;
}

export async function getAccessToken(): Promise<string> {
  return new Promise(function (resolve, reject) {
    try {
      const serviceAccount = getFirebaseCredentials();
      const jwtClient = new google.auth.JWT(
        serviceAccount.client_email,
        undefined,
        serviceAccount.private_key,
        SCOPES
      );

      jwtClient.authorize(function (err: any, tokens: any) {
        if (err) {
          reject(err);
          return;
        }
        resolve(tokens.access_token);
      });
    } catch (error) {
      reject(error);
    }
  });
}

export async function AxiosConfig(token: string, notification: any) {
  try {
    const serviceAccount = getFirebaseCredentials();
    let configAxios = {
      method: "post",
      url: `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: notification,
    };

    const response = await axios(configAxios);

    return response;
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return null;
  }
}

export async function sendNotification(message: string, title: string, idCompany: number, idUsuario: number, access_token?: string) {
  try {
    const rows = await db.query(
      `SELECT token FROM usuarios_mobiliaria WHERE id_empresa = ${idCompany} AND token IS NOT NULL AND token != 'undefined'`
    );

    let rowsUser: any;
    if (idUsuario) {
      rowsUser = await db.query(
        `SELECT nombre_comp FROM usuarios_mobiliaria WHERE id_usuario = ${idUsuario}`
      );
    }

    if (rows.length === 0) {
      return 404;
    }

    if (!access_token) {
      return;
    }

    helper.emptyOrRows(rows).forEach((element: any) => {
      const notification = {
        message: {
          token: element.token,
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
            nombre: String(idUsuario ? rowsUser[0].nombre_comp : "0"),
          },
        },
      };
      AxiosConfig(access_token, notification);
    });

    return { code: 201, message: "Notificaciónes enviada" };
  } catch (error: any) {
    console.log("error", error.message);
    return { code: 201, message: error.message };
  }
}
