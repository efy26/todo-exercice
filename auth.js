import bcrypt from 'bcrypt'
import passport from 'passport'
import { Strategy } from 'passport-local'
import { getUtilisateurById, getUtilisateurByName } from './model/utilisateur.js'

// Configuration générale de la stratégie.
// On indique ici qu'on s'attends à ce que le client
// envoit un variable "nom" et "motDePasse" au
// serveur pour l'authentification.
const config = {
    usernameField: 'nom',
    passwordField: 'mot_de_passe',
}

// Configuration de la stratégie d'authentification locale
passport.use(new Strategy(config, async(nom, motDePasse, done) => {
    // S'il y a une erreur avec la base de données,
    // on retourne l'erreur au serveur

    try{
        // On va chercher l'utilisateur dans la base
        // de données avec son identifiantle et son nom ici

        const utilisateur = await getUtilisateurByName(nom)

        // Si on ne trouve pas l'utilisateur, on
        // retourne que l'authentification a échoué
        // avec un code d'erreur

        if(!utilisateur) {
            return done(null, false, {message: 'Utilisateur non trouvé'})
        }

        // Si on a trouvé l'utilisateur, on compare
        // son mot de passe dans la base de données
        // avec celui envoyé au serveur. On utilise
        // une fonction de bcrypt pour le faire
        const isValide = await bcrypt.compare(motDePasse, utilisateur.mot_de_passe)

        // Si les mot de passe ne concorde pas, on
        // retourne que l'authentification a échoué
        // avec un code d'erreur
        if(!isValide) {
            return done(null, false, {message: 'Mot de passe incorrect'})
        }

        // Si les mot de passe concorde, on retourne
        // l'information de l'utilisateur au serveur
        return done(null, utilisateur);
    }catch{
        return done(error);
    }
}))

//la serialisation
passport.serializeUser((utilisateur, done) => {
    done(null, utilisateur.id);
}) 

//la deserialisation
passport.deserializeUser(async(idUtilisateur, done) =>{
    // S'il y a une erreur de base de donnée, on
    // retourne l'erreur au serveur

    try{
        // Puisqu'on a juste l'identifiant dans la 
        // session, on doit être capable d'aller chercher 
        // l'utilisateur avec celle-ci dans la base de 
        // données.
        const utilisateur = await getUtilisateurById(idUtilisateur);
        done(null, utilisateur);
    }catch {
        done(error);
    }
})