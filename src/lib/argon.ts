import argon from "@node-rs/argon2";

const secret = process.env.HASH_SECRET
if(!secret) throw new Error('HASH_SECRET introuvable')

const key = new TextEncoder().encode(secret)

export const hash = async (pass: string): Promise<string> => {
    return await argon.hash(pass, {
        secret: key
    })
}

export const compare = async (pass: string, hash: string): Promise<boolean> => {
    return await argon.verify(hash, pass, {
        secret: key
    })
}