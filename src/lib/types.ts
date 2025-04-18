export interface Match {
    id: number,
    titre: string,
    informations: string,
    ouverture: Date,
    fermeture: Date,
    status: 'en attente' | 'en cours' | 'fini',
    participants: number,
    agl: number,
    equipes: string[]
}

export interface Utilisateur {
    pseudo: string,
    agl: number,
    pass: string,
    createdat: Date,
    actif: boolean, 
}

export interface Equipes {
    nom: string,
    devise: string
    image: string | null,
    membres: string[] 
}