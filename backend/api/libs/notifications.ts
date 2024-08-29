import { helper } from "../helper";
import { db } from "../services/db";

const { google } = require("googleapis");
const SCOPES = "https://www.googleapis.com/auth/firebase.messaging";
const axios = require("axios");

export async function getAccessToken(): Promise<string> {
    return new Promise(function (resolve, reject) {
      const key = require("../assets/eventivakey.json");
      
      const jwtClient = new google.auth.JWT(
        'firebase-adminsdk-ls7d0@eventivapp.iam.gserviceaccount.com',
        "../assets/eventivakey.json",
        "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCPN8Pj1AwGe/Ok\nN7bhpuvXxY4YiQjBdRjh29MW7J24D0PyQH+x0G7Mar+c3j443GupzTUPgIqmTXNe\n1Psfi/8hJU4KgWrGIoU4mI43mTGkjbTjRfRYy3Y/jCriNmDUoxCXjsrO2BVHGXu7\nQtVAD2SRgEF17TO+y5oea8aP06JvRYYmcVn8hejQjf31VEht9FiJVhEylYVI2riZ\nxGkD0Tfi73w0deWv7KH53zDq5tmkydMGmSvicZaybzYMXmfmLaKOPXfka325Mbnn\nsIMjEqKprXQfmKAQ50EQ9Jgb0bkkuhpdMgbiCLN2lqvMKRmQ1zpsitRFLPMoKqTi\nnPRmW5/vAgMBAAECggEAETecWRtOMXQH9PSttlr20gMcngkmAFEveJeQvO9ygS90\nn6mZWwBlEYtpFawHbEEzaupnN+yKvotjv0F4ycYZbxv+Ucz/z79T/LB6Xby7ob4C\nF6slQOIqM7bfa5UrTDoo7c9rb4pn+cWFK8dRE65wt1KP4WQZaxUsUKlBlFuA6kIS\nCuAXDSLZWL9KQPDkINPjIoXipYnBqYsyquqJ8UUaW78lmypimt/6WJ1CTrpMKacM\n+OF6Anbb3XuxSzoOnY9G6VMe9PAGArTJIq3apM1hEQhlIfjhYdQSvn6fcflOg5qn\nz+KRb1HMa8frHmmzoOqn0Ys6TZDnmbvZ2NpxuKcqwQKBgQDBMtg/HMLVKnyH3P7I\ntyYIsyAbznnqlMccNTOO8bjld6lzYI+/O58SenFfc7RYiqMxNswOUJy8lKB4lEnU\nkM2vtud84KOB/gEQErdK0tgm+u6DzV1/8hVgFjWLn1aC6kJ/8OAnVk6L53NNjDeU\nKUErXHe4PbujCl3VZNZDx7a6pwKBgQC9xbxO0p3TBdYYz8BM7RcNu6na2jH8P3bm\n7XkVII2GVitYr1WFdzVYoXNxKEj7aB2qWUZI5TORlNUP0b0Ab2TqX5wRtuooF7mz\nmN98ayzRmhOF4m8BRcOQOivQowPWzMbcfvVViqtCdIa+yTWwjoDZghckwTJ/uujl\n3ebs/79BeQKBgHCuhxHIZJqPvTJA4xmOONC6KPAO7Wy0ea0qGng04/JyaJKyrySK\nUa0lXRqfEYDS23vIyhtPSRt0VGP/mVAxZMYnl7xuCO+4hkYppF4vu4KAuLyG+xG0\n0GLKkVBuDrcsiry0cQiAfi97PvTr4z63ERuJQwpidx4Q3cmolo/R2/HhAoGAFpDZ\nyIGw9LPf9olVs5AJyr9C/lwtz3H4gJNCb6m0SoIam2wV/k3jkQt5v73rl8GUrXn6\nKpben/QTtdLZ56BXXqtJ0q1ugJ/5nAqUoKXZ6X6pzaTUUFFsZM0WArQvs64cA4Ix\nSB+6J6fVkgA5GyqG1dZrTBqRF7ExGoxddlce9fkCgYAOGhsAgpvVdM6IlTxkjqI1\nKEv8ivgz02Vau90T3Ph2TcmHIHUZ14F1+UkgOqWKHEG885iqyrEtvJAAoMaDag8+\nZ02UrUQuMHNbGBeJrwEK3Fsoogool9TXKUfwkp9SvDehNT3mNgHOZ4wQtJ/+ktY3\ntjnsPUUrJwMgVnGD+7H2KA==\n-----END PRIVATE KEY-----\n",
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
  
  
  export async function AxiosConfig(token: string, notification: any) {
    
    
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
      return null;
    }
  };

  
export async function sendNotification(message: string, title: string, idCompany: number, idUsuario?: number) {
  

    try {
      const rows = await db.query(
        `SELECT token FROM usuarios_mobiliaria WHERE id_empresa = ${idCompany} AND token IS NOT NULL AND token != 'undefined'`
      );
      
  
      let rowsUser: any
      if(idUsuario) {
        rowsUser = await db.query(
            `SELECT nombre_comp FROM usuarios_mobiliaria WHERE id_usuario = ${idUsuario}`
        );
    }
  
      if (rows.length === 0) {
        return 404;
      }
  
      const access_token = await getAccessToken();
      if (!access_token) {
        return 404;
      }
  
      helper.emptyOrRows(rows).forEach((element: any) => {
        const notification ={
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
              nombre: String(idUsuario ? rowsUser[0].nombre_comp : 0), // here you can send addition data along with notification 
            },
          },
        };
        AxiosConfig(access_token, notification);
      });
  
      return {code: 201, message: "Notificaciónes enviada"};
    } catch (error: any) {
      console.log("error", error.message);
      return {code: 201, message: error.message};
    }
  
  }