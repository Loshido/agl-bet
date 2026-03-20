import argon from "@node-rs/argon2";


function getSecret() {
    const secret = process.env.HASH_SECRET
    if(!secret) throw new Error('HASH_SECRET introuvable')
    
    return new TextEncoder().encode(secret)
}

export const hash = (pass: string): Promise<string> => 
    argon.hash(pass, { secret: getSecret() })

export const compare = (pass: string, hash: string): Promise<boolean> => 
    argon.verify(hash, pass, { secret: getSecret() })