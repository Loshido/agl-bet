import type { EnvGetter } from "@builder.io/qwik-city/middleware/request-handler";
import { type JWTPayload, jwtVerify, SignJWT, decodeJwt } from "jose";

export interface Payload {
    pseudo: string,
    roles: string[]
}

const ALG = 'HS256';
const ISSUER = 'alg-bet-qwik';
const AUDIENCE = 'alg-bet-users';

export const verify = async (jwt: string, ctx: EnvGetter): Promise<null | Payload> => {
    const secret = ctx.get('JWT_SECRET')
    if(!secret) console.warn("JWT_SECRET not set!")
    const key = new TextEncoder().encode(secret || 'the-very-long-jwt-secret-you-should-have-set')

    try {
        const { payload, protectedHeader } = await jwtVerify<Payload>(jwt, key, {
            issuer: ISSUER,
            audience: AUDIENCE
        })

        if(protectedHeader.alg !== 'HS256') return null

        return payload
    } catch {
        return null
    }
}

export const sign = async (payload: Payload & JWTPayload, ctx: EnvGetter): Promise<string | null> => {
	const secret = ctx.get('JWT_SECRET')
    if(!secret) console.warn("JWT_SECRET not set!")
    const key = new TextEncoder().encode(secret || 'the-very-long-jwt-secret-you-should-have-set')

    const jwt = await new SignJWT(payload)
        .setProtectedHeader({ alg: ALG })
        .setIssuedAt()
        .setIssuer(ISSUER)
        .setAudience(AUDIENCE)
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
