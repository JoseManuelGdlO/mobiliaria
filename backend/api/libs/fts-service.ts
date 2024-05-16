const fs = require("fs");
const ftp = require("ftp");

// Configura las credenciales FTP
const ftpConfig = {
  host: "82.180.152.206",
  user: "u427127638.durangueneidad",
  password: "Duranguenei1dad",
  port: '21'
};

export function ftpSend(filename: string, file: any) {
  // Conecta con el servidor FTP
const client = new ftp();
client.connect(ftpConfig);

// Cuando se conecta exitosamente
client.on('ready', () => {
  console.log('Conexión FTP establecida');
  fs.readFile(file.path, (err: any, data: any) => {
    if (err) {
      console.error('Error al leer el archivo:', err);
      return;
    }

    // Sube el archivo al servidor FTP
    client.put(data, filename, (err: any) => {
      if (err) {
        console.error('Error al transferir el archivo:', err);
      } else {
        console.log('Archivo transferido exitosamente');
        fs.unlink(file.path, (err: any) => {
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
client.on('error', (err: any) => {
  console.error('Error de conexión FTP:', err);
});
}
