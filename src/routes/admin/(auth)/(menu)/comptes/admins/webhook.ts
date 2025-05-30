const webhook = process.env.WEBHOOK
if(!webhook) throw new Error('WEBHOOK introuvable')

export default async (token: string, name: string) => {
    const domaine = process.env.DOMAIN || 'agl.isenengineering.fr'
    await fetch(webhook, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "content": `Accès pour \`${name}\`\n`
            + `\`https://${domaine}/admin/auth/${token}\``,
            "embeds": null,
            "username": "AGL - Bet",
            "avatar_url": "https://media.discordapp.net/attachments/1364694537020375140/1366514186775035945/icon.png?ex=68113902&is=680fe782&hm=8cd4a8a14c2ea532999c7ce251e7f3daaa23e1f767e833ba3adeb6f327148459&=&width=256&height=256",
            "attachments": []
        })
    })
}