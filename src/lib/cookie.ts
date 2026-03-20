import { isDev } from "@builder.io/qwik";

export default {
    domain: isDev ? 'localhost' : process.env.DOMAIN || 'agl.isenengineering.fr',
    secure: !isDev
}