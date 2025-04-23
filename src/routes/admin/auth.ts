// Cookie qui donne accès à la partie administration de la plateforme
export const admin = process.env.ROOT_TOKEN
if(!admin) throw new Error('ROOT_TOKEN introuvable')

// Clé = Jeton, Valeur = Nom de l'organisateur
export const tokens = new Map<string, { name: string, claimed: boolean }>()
export const root_token = admin
console.log(`[admin] root:token \`${root_token}\``);

tokens.set('aahhhh le token ça mere', { name: 'staff 1', claimed: false })
tokens.set('aahhhh le token ça mere1', { name: 'staff 2', claimed: true })
tokens.set('aahhhh le token ça mere2', { name: 'staff 3', claimed: true })
tokens.set('aahhhh le token ça mere3', { name: 'staff 4', claimed: false })

export default (token: string): boolean => token === admin || tokens.has(token)