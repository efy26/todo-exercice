const btnDeconnexion = document.getElementById('btn-deconnexion');

async function deconnexion() {

    const response = await fetch('/api/deconnexion', {
        method: 'POST',
    })

    if (response.ok) {
        // Si la déconnexion est réussie, on redirige 
        // vers une autre page
        window.location.replace('/');
    }
}

if (btnDeconnexion) {
    btnDeconnexion.addEventListener('click', deconnexion);
}