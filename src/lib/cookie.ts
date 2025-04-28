import { isDev } from "@builder.io/qwik";

export default {
    domain: isDev ? 'localhost' : 'agl.isenengineering.fr',
    secure: !isDev
}