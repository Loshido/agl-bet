import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [qwikCity(), qwikVite(), tsconfigPaths(), tailwindcss()],
    server: {
        headers: {
            "Cache-Control": "public, max-age=0",
        },
    },
    preview: {
        headers: {
            "Cache-Control": "public, max-age=600",
        },
    },
    build: {
        rollupOptions: {
            external: [
                '@node-rs/argon2-wasm32-wasi'
            ]
        }
    }
})
