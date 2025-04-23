// Cookie qui donne accès à la partie administration de la plateforme
export const admin = process.env.ROOT_TOKEN
if(!admin) throw new Error('ROOT_TOKEN introuvable')

// Clé = Jeton, Valeur = Nom de l'organisateur
export const tokens = new Map<string, { name: string, claimed: boolean }>()
export const root_token = admin
console.log(`[admin] root:token \`${root_token}\``);

export default (token: string): boolean => token === admin || tokens.has(token)