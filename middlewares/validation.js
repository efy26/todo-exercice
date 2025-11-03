import { isNomSalleAndMssgValid } from "../public/js/validation.js";
import { isCourrielValide, isMotDePasseValide } from "../public/js/validation.js";

//middlewares de route qui utilisent les fonctions
//  de validation pour valider les données des requêtes
export async function nomSalleAndMssgValid(request, response, next) {
    if(isNomSalleAndMssgValid(request.body.nom, request.body.contenu)) {
        return next();
    }
    response.status(400).end();
}

export async function courrielValide(request, response, next) {
    if(isCourrielValide(request.body.nom)) {
        return next();
    }
    response.status(400).json({ error: 'mauvais_utilisateur' });
}

export async function motDePasseValide(request, response, next) {
    if(isMotDePasseValide(request.body.mot_de_passe)) {
        return next();
    }
    response.status(400).json({ error: 'mauvais_mot_de_passe' });
}