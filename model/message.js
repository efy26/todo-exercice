import { getDB } from "../db/db.js";

// recupérer tous les messages d'une salle
export async function getMessage() {
    const messages = await db.all(`
        SELECT * FROM messages
        `)
    return messages;
}

// ajouter un message

export async function addMessage(contenu, nomUtilisateur, nomSalle) {
    const db = getDB();
    const salle = await db.get(`
        SELECT id FROM salles
        WHERE nom = ?`,
        [nomSalle]
    );
    if (!salle) throw new Error(`Salle "${nomSalle}" introuvable`);

    const utilisateur = await db.get(`
        SELECT id FROM utilisateurs
        WHERE nom = ?`,
        [nomUtilisateur]
    );
    if (!utilisateur) throw new Error(`Utilisateur "${nomUtilisateur}" introuvable`);
        console.log("Salle trouvée :", salle);
console.log("Utilisateur trouvé :", utilisateur);
    const addMessageRequest = await db.run(`
        INSERT INTO messages (contenu, utilisateur_id, salle_id)
        VALUES (?, ?, ?)`,
        [contenu, utilisateur.id, salle.id]
    );
    return addMessageRequest.lastID;
}

//modifier un message
export async function updateMessage(index, contenu) {
    const db = getDB();
    const updateMessageRequest = await db.run(`
        UPDATE messages
        SET contenu = ?
        WHERE id = ?`,
        [contenu, index]
    )
    return updateMessageRequest.changes;
}

// Fonction pour supprimer une salle
export async function deleteMessage(index) {
    const db = getDB();
    const deleteMessageRequest = db.run(`
        DELETE FROM messages
        WHERE id = ?`,
        [index]
    )
    return deleteMessageRequest.changes
}

