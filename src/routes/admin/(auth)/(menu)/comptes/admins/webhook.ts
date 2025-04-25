const WEBHOOK = `https://discord.com/api/webhooks/1364694557010300928/jPnDBnCJO4gQ7pzzMVmJI2Gzz2F2uTLX2wL2wciVbWnMOf05zHIUJkvj4J6drm3a7o78`

export default async (token: string, name: string) => {
    await fetch(WEBHOOK, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "content": `Accès pour \`${name}\`\n`
            + `\`http://localhost:5173/admin/auth/${token}\``,
            "embeds": null,
            "username": "AGL - Bet",
            "attachments": []
        })
    })
}