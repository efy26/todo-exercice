// Chargement des configurations
import 'dotenv/config'

// Importation de Express et de plusieurs middlewares
import express, { json, request, response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

//importation de handlerbars
import { engine } from "express-handlebars";

// importation de session et memorystore
import session from 'express-session';
import memorystore from 'memorystore';

//importation de passport
import passport from 'passport';

// import des fonctions du modèle
import { addSalle, getSalles, deleteSalle, updateSalle } from './model/salle.js';
import { getMessage, addMessage, updateMessage, deleteMessage } from './model/message.js';
import { getTableByJointure } from './model/jointureTable.js';

import { createUtilisateur } from './model/utilisateur.js';
import './auth.js';

// import des middlewares de validation
import { nomSalleAndMssgValid } from './middlewares/validation.js';
import { courrielValide, motDePasseValide } from './middlewares/validation.js';
import { userAuth, userAuthRedirect, userNotAuth, userAdmin } from './middlewares/auth.js';


// Création du serveur
const app = express();

// Configuration de la gestion de session
const MemoryStore = memorystore(session)

// Ajout de middlewares
app.use(express.json());
app.use(json());
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(session({
    cookie: { maxAge: 3600000, sameSite: 'lax' },
    name: process.env.npm_package_name,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    secret: process.env.SESSION_SECRET
}))
app.use(passport.initialize());
app.use(passport.session());
// app.use((req, res, next) => {
//   console.log("Session actuelle :", req.session);
//   console.log("Utilisateur connecté :", req.user);
//   next();
// });

// Autre middlewares
app.use(express.static('public'));

// Configuration de handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

// Ajout des routes
// Les routes pour le GET
app.get('/api/salles', async (request, response) => {
    // Récupération des salles
    const salles = await getSalles()

    // On retourne les salles au client
    response.status(200).json(salles);
});

app.get('/api/messages', async (request, response) => {
    // Récupération des messages
    const messages = await getMessage()

    // On retourne les messages au client
    response.status(200).json(messages);
})
app.get('/api/utilisateur-connecte', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        res.json({ nom: req.user.nom });
    } else {
        res.status(401).json({ message: 'Utilisateur non connecté' });
    }
});
app.get('/api/all-tables/', async (request, response) => {
    try {
        const allTable = await getMessage()
        response.status(200).json(allTable)
    } catch (error) {
        console.error('Erreur dans GET /api/messages/ :', error);
        res.status(500).json({ error: error.message });
    }
})


// Les routes pour le POST
app.post('/api/salles', nomSalleAndMssgValid, userAuth, async (request, response) => {
    // On ajoute le nom de la nouvelle salle avec la fonction du modèle
    const addSalleRequest = await request.body;
    await addSalle(addSalleRequest.nom);

    // On retourne une réponse vide au client lui indiquant 
    // que la création a réussi dans son statut
    response.status(201).end();
});
app.post('/api/messages/:nomUtilisateur/:nomSalle', nomSalleAndMssgValid, userAuth, async (request, response) => {
    try {
        // On ajoute le message avec la fonction du modèle
        const recupNomSalleRequest = request.params.nomSalle;
        const recupNomUtilisateurRequest = request.params.nomUtilisateur;
        const addMessageRequest = request.body;
        await addMessage(addMessageRequest.contenu, recupNomUtilisateurRequest, recupNomSalleRequest);

        response.status(201).end()
    } catch (error) {
        console.error("Erreur dans POST /api/messages :", error)
        response.status(400).end()
    }
})
app.post('/api/utilisateurs', courrielValide, motDePasseValide, userNotAuth, async (request, response, next) => {
    try {
        // Si la validation passe, on crée l'utilisateur
        const createUtilisateurRequest = request.body;
        await createUtilisateur(createUtilisateurRequest.nom, createUtilisateurRequest.mot_de_passe);

        response.status(201).end()
    } catch (error) {
        // S'il y a une erreur de SQL, on regarde
        // si c'est parce qu'il y a conflit
        // d'identifiant
        if (error.code === 'SQLITE_CONSTRAINT') {
            response.status(409).end();
        } else {
            next(error);
        }
    }
})
app.post('/api/connexion', courrielValide, motDePasseValide, (request, response, next) => {
    // On lance l'authentification avec passport.js
    passport.authenticate('local', (error, user, info) => {
        if (error) {
            // S'il y a une erreur, on laisse Express la 
            // gérer
            next(error);
        } else if (!user) {
            // Si la connexion échoue, on envoit
            // l'information au client avec un code
            // 401 (Unauthorized)
            response.status(401).json(info)
        } else {
            // Si tout fonctionne, on ajoute
            // l'utilisateur dans la session et on 
            // retourne un code 200 (OK)
            request.logIn(user, (error) => {
                if (error) {
                    // On laisse Express gérer l'erreur
                    next(error);
                }
                response.sendStatus(200);
            })
        }
    })(request, response, next);
})
app.post('/api/deconnexion', userAuth, async (request, response, next) => {
    // Déconnecter l'utilisateur
    request.logOut((error) => {
        if (error) {
            // On laisse Express gérer l'erreur
            next(error);
        } else {
            // Indiquer que la déconnexion a réussi
            response.status(200).end();
        }
    })
})

// Les routes pour le DELETE
app.delete('/api/salles/:index', userAdmin, async (request, response) => {
    const deleteSalleRequest = parseInt(request.params.index, 10)
    await deleteSalle(deleteSalleRequest)

    response.status(200).end();
});

// Les routes pour le PATCH
app.patch('/api/salles/:index', async (request, response) => {
    const updateSalleRequestParams = parseInt(request.params.index, 10)
    const updateSalleRequestBody = request.body
    updateSalle(updateSalleRequestParams, updateSalleRequestBody.nom)

    response.status(200).end();

});
app.patch('/api/messages/:index', async (request, response) => {
    const updateMessageRequestParams = parseInt(request.params.index, 10)
    const updateMessageRequestBody = await request.body
    updateMessage(updateMessageRequestParams, updateMessageRequestBody.contenu)

    response.status(200).end();
})

// Ajout des routes pour les pages HTML
app.get('/', async (request, response) => {
    let salles = await getTableByJointure()
    // let salles = await getSalles()
    response.status(200).render('home', {
        title: 'Accueil',
        salles: salles,
        script: ["/js/nomSalle.js", "/model/utilisateur.js", "/model/jointureTable.js"],
        user: request.user,
        isAdmin: request.user && request.user.niveau_acces === 2


    })
})

app.get('/connexion', async (request, response) => {
    response.status(200).render('auth', {
        title: 'connexion - salle',
        type: 'connexion',
        script: ["/js/connexion.js"],
        user: request.user
    })
});

app.get('/inscription', async (request, response) => {
    response.status(200).render('auth', {
        title: 'inscription - salle',
        type: 'inscription',
        script: ["/js/inscription.js"],
        user: request.user,
    })
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Serveur actif sur " + PORT));

