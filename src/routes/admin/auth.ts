import pg from "~/lib/pg";

// Cookie qui donne accès à la partie administration de la plateforme
export const admin = process.env.ROOT_TOKEN
if(!admin) throw new Error('ROOT_TOKEN introuvable')

// Clé = Jeton, Valeur = Nom de l'organisateur
export const tokens = new Map<string, { name: string, claimed: boolean }>()
export const root_token = admin
console.log(`[admin] root:token \`${root_token}\``);

type Token = { token: string, name: string, claimed: boolean };
pg().then(client => client.query<Token>(
    `SELECT token, name, claimed FROM administrateurs`
).then(response => {
    response.rows.forEach(row => {
        tokens.set(row.token, { name: row.name, claimed: row.claimed })
    })
    
    client.release()
}))

export const sauvegarderAdministrateurs = async () => {
    const client = await pg();
    
    const keys = [...tokens.keys()]
        .map((_, i) => `($${ 3 * i + 1 }, $${ 3 * i + 2}, $${ 3 * i + 3 })`)
        .join(',')
    const query = `INSERT INTO administrateurs (token, name, claimed)
        VALUES ${keys}
        ON CONFLICT DO NOTHING;`
    const data = [...tokens.keys()]
            .map(key => {
            const meta = tokens.get(key)!
            return [key, meta.name, meta.claimed]
        })
        .flat(1)
    
    
    client.query(
        query,
        data
    );
    
    client.release()
}