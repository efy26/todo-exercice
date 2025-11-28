import { isNomSalleAndMssgValid } from './validation.js';


const formAddSalle = document.getElementById('form-add-salle');
const inputnom = document.getElementById('nouvelle-salle');
const inputMssg = document.getElementById("nouveau-mssg");
const messageErreur = document.getElementById('erreur-tache');
const sallesList = document.getElementById('salles-list');
const classSallesList = '.salles-list-li';
const btnDelete = document.querySelectorAll('.btn-delete');
const btnUpdate = document.querySelectorAll('.btn-update');

function addSalleAndMssgClient(nom, message, utilisateur) {
    
    const li = document.createElement('li');
    li.innerHTML = `
    <input type="text" style="width: 5rem ;" value="${nom}" disabled /> -
    <input type="text" style="width: 6rem ;" value="${message}" disabled /> -
    <input type="text" style="width: 6rem ;" value="${ utilisateur}" disabled />
    `
    
    // nom + ' - ' + message;
    sallesList.appendChild(li);
}

async function getUserNom() {
    const response = await fetch('/api/utilisateur-connecte');
    if (!response.ok) {
        throw new Error("Utilisateur non connecté");
    }
    const data = await response.json();
    return data.nom;
}

async function addNomAndMssg(event) {
    event.preventDefault();

    const userNom = await getUserNom(); // ← récupère le nom proprement
    console.log("Utilisateur connecté :", userNom);
     // Préparation des données
    const data = {
        nom: inputnom.value,
        contenu: inputMssg.value,
    }
    
    
    // Validation
    messageErreur.textContent = '';
    if (!isNomSalleAndMssgValid(data.nom, data.contenu)) {
        messageErreur.style.color = 'red';
        messageErreur.textContent = 'Veillez entrer un nom ou un message valide';
        return;
    } else {
        messageErreur.style.color = 'green';
        messageErreur.textContent = 'Ajout réussi !';
    }

    // Envoyer de la requête
    const response = await fetch('/api/salles', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: data.nom, contenu: data.contenu })
    })

    const responseMss = await fetch(`/api/messages/${userNom}/${data.nom}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenu: data.contenu, nom: data.nom})
    })
    // Traitement de la réponse
    if (response.ok && responseMss.ok) {
        // Ajouter la tâche dans l'interface graphique
        addSalleAndMssgClient(data.nom, data.contenu, userNom);

        // Vider le formulaire et remettre le focus sur le champ de texte
        inputnom.value = '';
        inputnom.focus();
        inputMssg.value = "";
        inputMssg.focus()

    } else {
        console.error('Erreur lors de l\'envoi', response.status, responseMss.status);
    }

}

async function deleteSalle(event) {
    event.preventDefault();

    // Trouver l'élément <li> parent du bouton cliqué
    const li = event.target.closest(classSallesList);
    
    const salleId = li.dataset.id;

    const response = await fetch(`/api/salles/${salleId}`, {
        method: 'DELETE'
    })

    if (response.ok) {
        li.remove();
        messageErreur.style = 'color: green'
        messageErreur.innerHTML = "La suppression a reussi"
        
    }
    
}

async function updateSalle(event) {
    event.preventDefault()

    const li = event.target.closest(classSallesList)
    const salleId = li.dataset.id
    const inputList = li.querySelectorAll('input[type="text"]')
    
    const data = {
        nom:inputList[0].value,
        contenu: inputList[1].value
    }

    const response = await fetch(`/api/salles/${salleId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({nom: data.nom})
    })

    const responseMss = await fetch(`/api/messages/${salleId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({contenu: data.contenu,})
    })

    if (responseMss.ok || response.ok) {
        messageErreur.style = 'color: green'
        messageErreur.innerHTML = "La modification a reussi"
        console.log(data.contenu);
    }
    console.log(inputList[1]);
    

    
    
    
}

btnUpdate.forEach(btn => {
    btn.addEventListener('click', updateSalle);
})
btnDelete.forEach(btn => {
    btn.addEventListener('click', deleteSalle);
});
formAddSalle.addEventListener('submit', addNomAndMssg);




