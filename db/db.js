import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { existsSync } from "node:fs";

const FILE_DB = './database.sqlite';

export async function initDB() {
  const isNewDB = !existsSync(FILE_DB);

  const db = await open({
    filename: FILE_DB,
    driver: sqlite3.Database
  });

  if (isNewDB) {
    await db.exec(`PRAGMA foreign_keys = ON;`);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS salles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL UNIQUE
      );
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS utilisateurs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL UNIQUE,
        mot_de_passe TEXT NOT NULL,
        niveau_acces INTEGER DEFAULT 1
      );
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contenu TEXT NOT NULL,
        utilisateur_id INTEGER,
        salle_id INTEGER,
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
        FOREIGN KEY (salle_id) REFERENCES salles(id) ON DELETE CASCADE
      );
    `);

    console.log("Base de données initialisée avec succès !");
  }

  return db;
}
