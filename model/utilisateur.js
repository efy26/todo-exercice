import { getDB } from "../db/db.js";

import bcrypt from 'bcrypt';





// créer un utilisateur
export async function createUtilisateur(courriel, motDePasse, niveau_acces = 1) {
    const db = getDB();
    const utilisateurRequestEnCrypte = await bcrypt.hash(motDePasse, 10);
    
    const utilisateurRequest = await db.run(`
        INSERT INTO utilisateurs (nom, mot_de_passe, niveau_acces)
        VALUES (?, ?, ?)`,
        [courriel, utilisateurRequestEnCrypte, niveau_acces]
    )
    return utilisateurRequest.lastID;       
}

// récupérer un utilisateur par son nom
export async function getUtilisateurByName(nom) {
    const db = getDB();
    const utilisateurs = await db.get(`
        SELECT id, nom, mot_de_passe, niveau_acces FROM utilisateurs
        WHERE nom = ?`,
        [nom]
    )
    return utilisateurs;
}

// récupérer un utilisateur par son id
export async function getUtilisateurById(index) {
    const db = getDB();
    const utilisateurs = await db.get(`
        SELECT id, nom, mot_de_passe, niveau_acces FROM utilisateurs
        WHERE id = ?`,
        [index]
    )
    return utilisateurs;
}