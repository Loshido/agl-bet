import type { EnvGetter } from "@builder.io/qwik-city/middleware/request-handler";
import { type JWTPayload, jwtVerify, SignJWT, decodeJwt } from "jose";

export interface Payload {
    pseudo: string
}

const ALG = 'HS256';
const ISSUER = 'alg-bet-qwik';
const AUDIENCE = 'alg-bet-users';
const ADMINS = 'alg-bet-admins';

export const verify = async (jwt: string, ctx: EnvGetter, options?: { admin?: boolean }): Promise<null | Payload> => {
    const secret = ctx.get('JWT_SECRET')
    if(!secret) {
        console.error("[jwt] JWT_SECRET introuvable")
        return null
    }
    const key = new TextEncoder().encode(secret)

    try {
        const { payload } = await jwtVerify<Payload>(jwt, key, {
            issuer: ISSUER,
            audience: options?.admin ? ADMINS : AUDIENCE
        })
    
        return payload
    } catch {
        return null
    }
}

export const sign = async (payload: Payload & JWTPayload, ctx: EnvGetter, options?: { admin?: boolean }): Promise<string | null> => {
    const secret = ctx.get('JWT_SECRET')
    if(!secret) {
        console.error("[jwt] JWT_SECRET introuvable")
        return null
    }

    const key = new TextEncoder().encode(secret)
      
    const jwt = await new SignJWT(payload)
        .setProtectedHeader({ alg: ALG })
        .setIssuedAt()
        .setIssuer(ISSUER)
        .setAudience(options?.admin ? ADMINS : AUDIENCE)
        .setExpirationTime('12h')
        .sign(key)

    return jwt
}

export const decode = (jwt: string) => {
    try {
        return decodeJwt<Payload>(jwt)
    } catch(e) {
        return null
    }
}