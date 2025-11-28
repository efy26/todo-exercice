// Chargement des configurations
import 'dotenv/config'

// Importation de Express et middlewares
import express, { json } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

// Handlebars
import { engine } from "express-handlebars";

// Sessions & authentification
import session from 'express-session';
import memorystore from 'memorystore';
import passport from 'passport';

// Modèles
import { addSalle, getSalles, deleteSalle, updateSalle } from './model/salle.js';
import { getMessage, addMessage, updateMessage } from './model/message.js';
import { getTableByJointure } from './model/jointureTable.js';
import { createUtilisateur } from './model/utilisateur.js';
import './auth.js';

// Middlewares
import { nomSalleAndMssgValid, courrielValide, motDePasseValide } from './middlewares/validation.js';
import { userAuth, userNotAuth, userAdmin } from './middlewares/auth.js';

// IMPORTANT : bon chemin vers db
import { initDB } from './db/db.js';

// ===========================
// CONFIG EXPRESS
// ===========================
const app = express();
const MemoryStore = memorystore(session)

app.use(express.json());
app.use(json());
app.use(cors());
app.use(helmet());
app.use(compression());

app.use(session({
    store: new MemoryStore({ checkPeriod: 86400000 }),
    secret: process.env.SESSION_SECRET || "devsecret",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: 3600000,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    },
    name: process.env.npm_package_name || 'session_id'
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));
console.log("Static folder path:", new URL('./public/', import.meta.url).pathname);


// Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

// ===========================
// ROUTE DE SANTÉ
// ===========================
app.get("/health",(req,res)=>res.status(200).send("OK"));

// ===========================
// ROUTES API (inchangées)
// ===========================

app.get('/api/salles', async (req, res) => res.status(200).json(await getSalles()));
app.get('/api/messages', async (req, res) => res.status(200).json(await getMessage()));

app.get('/api/utilisateur-connecte', (req, res) =>
    req.isAuthenticated() && req.user
        ? res.json({ nom: req.user.nom })
        : res.status(401).json({ message: 'Utilisateur non connecté' })
);

app.post('/api/salles', nomSalleAndMssgValid, userAuth, async (req,res) => {
    await addSalle(req.body.nom);
    res.status(201).end();
});

app.post('/api/messages/:nomUtilisateur/:nomSalle', nomSalleAndMssgValid, userAuth, async (req,res) => {
    try {
        await addMessage(req.body.contenu, req.params.nomUtilisateur, req.params.nomSalle);
        res.status(201).end()
    } catch {
        res.status(400).end();
    }
});

app.post('/api/utilisateurs', courrielValide, motDePasseValide, userNotAuth, async (req,res,next) => {
    try {
        await createUtilisateur(req.body.nom, req.body.mot_de_passe);
        res.status(201).end();
    } catch(error) {
        error.code === 'SQLITE_CONSTRAINT' ? res.status(409).end() : next(error);
    }
});

app.post('/api/connexion', courrielValide, motDePasseValide, (req,res,next) =>
    passport.authenticate('local', (err,user,info)=>{
        if(err) return next(err);
        if(!user) return res.status(401).json(info);
        req.logIn(user, err => err ? next(err) : res.sendStatus(200));
    })(req,res,next)
);

app.post('/api/deconnexion', userAuth, (req,res,next) =>
    req.logOut(err => err ? next(err) : res.sendStatus(200))
);

app.delete('/api/salles/:index', userAdmin, async (req,res)=>{
    await deleteSalle(parseInt(req.params.index,10));
    res.sendStatus(200);
});

app.patch('/api/salles/:index', async (req,res)=>{
    await updateSalle(parseInt(req.params.index,10), req.body.nom);
    res.sendStatus(200);
});

app.patch('/api/messages/:index', async (req,res)=>{
    await updateMessage(parseInt(req.params.index,10), req.body.contenu);
    res.sendStatus(200);
});

// ===========================
// PAGES
// ===========================
app.get('/', async (req,res)=>{
    res.render('home', {
        title:"Accueil",
        salles: await getTableByJointure(),
        script:["/js/nomSalle.js"],
        user:req.user,
        isAdmin:req.user && req.user.niveau_acces===2
    })
});

app.get('/connexion',(req,res)=>res.render('auth',{title:'connexion',type:'connexion',script:["/js/connexion.js"],user:req.user}));
app.get('/inscription',(req,res)=>res.render('auth',{title:'inscription',type:'inscription',script:["/js/inscription.js"],user:req.user}));

// =======================================================================
// DÉMARRAGE
// =======================================================================
async function startServer() {
    try {
        await initDB();
        const PORT = process.env.PORT || 8080;
        app.listen(PORT,()=>console.log("🚀 Serveur actif sur",PORT));
    } catch(error) {
        console.error("❌ Erreur au démarrage :",error);
        process.exit(1);
    }
}
startServer();
