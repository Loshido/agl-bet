import { bunServerAdapter } from "@builder.io/qwik-city/adapters/bun-server/vite";
import { extendConfig } from "@builder.io/qwik-city/vite";
import baseConfig from "../vite.config";

export default extendConfig(baseConfig, {
    build: {
        ssr: true,
        rollupOptions: {
            input: ["src/entry.bun.ts", "@qwik-city-plan"],
        },
        minify: false,
    },
    plugins: [
        bunServerAdapter({
            ssg: {
                include: ["/*"],
                origin: "https://agl.isenengineering.fr/",
                maxWorkers: 1
            },
        }),
    ],
});
