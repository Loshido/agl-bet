import type { RequestHandler } from "@builder.io/qwik-city";
import { Payload } from "~/lib/jwt";

export const onRequest: RequestHandler = ctx => {
    const payload =  ctx.sharedMap.get('payload') as Payload
    if(!payload.roles.includes('root')) throw ctx.error(403, 'Forbidden')
}