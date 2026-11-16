import { isDev } from "@builder.io/qwik";

export default {
    domain: isDev ? 'localhost' : process.env.DOMAIN || 'fifa.isenengineering.fr',
    secure: !isDev,
    path: '/',
    sameSite: 'strict' as 'strict'
}
