import { db } from "../services/db";

export async function saveHistorical(idEvent: number, idUser: number, description: string, obs?: string) {
    const connection = await db.connection();
    await connection.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
  
    await connection.beginTransaction();
  
    try {
      
      await connection.execute(
        `INSERT INTO historical (date, description, obs, fkid_user, fkid_event)
              VALUES ('${new Date().toISOString()}', '${description}', '${obs}', ${idUser}, ${idEvent})`
      );
  
      connection.commit();
    } catch (error) {
      console.error(error);
      connection.rollback();
      console.info("Rollback successful");
    }
  }