import { isCourrielValide, isMotDePasseValide } from './validation.js';

const inputCourriel = document.getElementById('email-auth');
const inputMotDePasse = document.getElementById('password-auth');
const formAuth = document.getElementById('form-auth');
const erreurs = document.getElementById('erreur-auth');

async function inscription(event) {
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
    if (!isCourrielValide(data.nom)) {
        erreurs.innerText = 'Le courriel n\'est pas valide.';
        return;
    }

    if (!isMotDePasseValide(data.motDePasse)) {
        erreurs.innerText = 'Le mot de passe doit contenir au moins 8 caractères.';
        return;
    }
console.log(JSON.stringify({ nom: data.nom, mot_de_passe: data.motDePasse }));
     // Envoyer la requête au serveur
     const response = await fetch('/api/utilisateurs', {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({nom: data.nom, mot_de_passe: data.motDePasse})
     })

     // Traitement de la réponse
     if (response.ok) {
        window.location.replace('/connexion');
     }else if (response.status === 409) {
        erreurs.innerText = 'Ce courriel est déjà utilisé.';
     }
}

formAuth.addEventListener('submit', inscription);