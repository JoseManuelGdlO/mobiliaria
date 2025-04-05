"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ftpSend = ftpSend;
const fs = require("fs");
const ftp = require("ftp");
// Configura las credenciales FTP
const ftpConfig = {
    host: "82.180.152.206",
    user: "u427127638.durangueneidad",
    password: "Duranguenei1dad",
    port: '21'
};
function ftpSend(filename, file) {
    // Conecta con el servidor FTP
    const client = new ftp();
    client.connect(ftpConfig);
    // Cuando se conecta exitosamente
    client.on('ready', () => {
        console.log('Conexión FTP establecida');
        fs.readFile(file.path, (err, data) => {
            if (err) {
                console.error('Error al leer el archivo:', err);
                return;
            }
            // Sube el archivo al servidor FTP
            client.put(data, filename, (err) => {
                if (err) {
                    console.error('Error al transferir el archivo:', err);
                }
                else {
                    console.log('Archivo transferido exitosamente');
                    fs.unlink(file.path, (err) => {
                        if (err) {
                            console.error('Error al eliminar el archivo:', err);
                            return;
                        }
                        console.log('Archivo eliminado exitosamente');
                    });
                }
                // Cierra la conexión FTP después de la transferencia
                client.end();
            });
        });
    });
    // Maneja errores de conexión
    client.on('error', (err) => {
        console.error('Error de conexión FTP:', err);
    });
}
