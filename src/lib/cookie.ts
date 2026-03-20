import { isDev } from "@builder.io/qwik";

export default {
    // domain: isDev ? '192.168.219.104' : process.env.DOMAIN || 'agl.isenengineering.fr',
    // secure: !isDev
    domain: 'localhost',
    secure: false
}