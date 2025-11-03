import { db } from "../db/db.js";

// Fonction aller chercher toutes les salles
export async function getSalles() {
    const salles = db.all(`
        SELECT * FROM salles
    `);
    return salles;
}

    
// Fonction pour ajouter une nouvelle salle
export async function addSalle(nomSalle) {
    const addSalleRequest = await db.run(`
        INSERT INTO salles (nom)
        VALUES (?)`,
        [nomSalle]
    )
    return addSalleRequest.lastID;
}
    
// Fonction pour supprimer une salle
export async function deleteSalle(index) {
    const deleteSalleRequest = db.run(`
        DELETE FROM salles
        WHERE id = ?`,
        [index]
    )
    return deleteSalleRequest.changes
}


// Fonction pour modifier une salle
export async function updateSalle(index, nomSalle) {
    const updateSalleRequest = await db.run(`
        UPDATE salles
        SET nom = ?
        WHERE id = ?`,
        [nomSalle, index]
    )
    return updateSalleRequest.changes
}