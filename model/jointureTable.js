import { getDB } from "../db/db.js";

export async function getTableByJointure() {
    const db = getDB();
    const allTable = await db.all(`
        SELECT 
        messages.id,
        messages.contenu,
        utilisateurs.nom AS utilisateur,
        salles.nom AS salle

        FROM messages JOIN utilisateurs ON
        messages.utilisateur_id = utilisateurs.id
        JOIN salles ON
        messages.salle_id = salles.id`
    )
    return allTable
}