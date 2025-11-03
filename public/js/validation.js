//une fonction de validation réutilisable pour la validation des noms de salle
export const isNomSalleAndMssgValid = (nom, message) => {
    if (typeof nom !== 'string' || typeof message !== 'string' ) return false;
    const trimNom = nom.trim();
    const trimMssg = message.trim();
    return trimNom.length > 0 && trimMssg.length > 0 && trimNom.length <= 30;
}
export function isCourrielValide(courriel) {
    return (typeof courriel === 'string' &&
    courriel.match(/^(?:[a-z0-9!#$%&'*+\x2f=?^_`\x7b-\x7d~\x2d]+(?:.[a-z0-9!#$%&'*+\x2f=?^_`\x7b-\x7d~\x2d]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9\x2d]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9\x2d]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9\x2d]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\[\x01-\x09\x0b\x0c\x0e-\x7f])+)])$/i)
    )
        }

export function isMotDePasseValide(motDePasse) {
    return (typeof motDePasse === 'string' &&
    motDePasse.length >= 8
    )
}