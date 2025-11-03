import { isCourrielValide, isMotDePasseValide } from './validation.js';

const inputCourriel = document.getElementById('email-auth');
const inputMotDePasse = document.getElementById('password-auth');
const formAuth = document.getElementById('form-auth');
const erreurs = document.getElementById('erreur-auth');

async function connexion(event) {
    event.preventDefault();

    // Les noms des variables doivent être les mêmes
    // que celles spécifié dans les configuration de
    // passport dans le fichier "auth.js"
    const data = {
        nom: inputCourriel.value,
        motDePasse: inputMotDePasse.value
    };

    // Réinitialiser les erreurs
    erreurs.innerText = '';

    // Validation cliente
    if(!isCourrielValide(data.nom)) {
        erreurs.innerText = 'Le courriel n\'est pas valide.';
        return;
    }

    if(!isMotDePasseValide(data.motDePasse)) {
        erreurs.innerText = 'Le mot de passe doit contenir au moins 8 caractères.';
        return;
    }
    // Envoyer la requête au serveur
    const response = await fetch('/api/connexion', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({nom:data.nom, mot_de_passe:data.motDePasse})
    })

    // Traitement de la réponse
    if (response.ok) {
        // Si l'authentification est réussi, on
        // redirige vers une autre page
        window.location.replace('/');
    }else if (response.status === 401) {
        // Si l'authentification ne réussi pas, on
        // a le message d'erreur dans l'objet "data"
        let data = await response.json()
        erreurs.style= 'color: red'
        

        if(data.message === 'Utilisateur non trouvé') {
            erreurs.innerText = 'Aucun compte ne correspond à ce courriel.';
        }
        else if(data.message === 'Mot de passe incorrect') {
            erreurs.innerText = 'Le mot de passe est incorrect.';
        }
    }
}

formAuth.addEventListener('submit', connexion);