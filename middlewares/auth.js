
// Middleware pour les routes d'API protégées
export function userAuth(request, response, next) {
    if(request.user) {
    
        return next();
    }

    response.status(401).end();
}

export function userNotAuth(request, response, next) {
    if(!request.user) {
        return next();
    }

    response.status(401).end();
}

// Middleware pour les routes de page protégées. redirige vers la page connxion si non authentifié
export function userAuthRedirect(request, response, next) {
    if(request.user) {
        return next();
    }

    response.status(401).redirect('/connexion');
}

// Middleware qui valide que l'utilisateur est administrateur
export function userAdmin(request, response, next) {
    if(request.user && request.user.niveau_acces == 2) {
        return next();
    }

    response.status(401).end();
}