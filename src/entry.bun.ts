import { createQwikCity } from "@builder.io/qwik-city/middleware/bun";
import qwikCityPlan from "@qwik-city-plan";
import { manifest } from "@qwik-client-manifest";
import render from "./entry.ssr";

const port = Number(Bun.env.PORT ?? 80);
const { router, notFound, staticFile } = createQwikCity({
    render,
    qwikCityPlan,
    manifest,
});

console.log(`[runtime] server started at http://localhost:${port}/`);

process.addListener('SIGTERM', () => server.stop())
process.addListener('SIGKILL', () => server.stop())
process.addListener('SIGABRT', () => server.stop())
process.addListener('SIGQUIT', () => server.stop())
process.addListener('exit', () => server.stop())

const server = Bun.serve({
    reusePort: true,
    hostname: '0.0.0.0',
    async fetch(request: Request) {
        const staticResponse = await staticFile(request);
        if (staticResponse) return staticResponse;

        const qwikCityResponse = await router(request);
        if (qwikCityResponse) return qwikCityResponse;

        return notFound(request)
    },
    port,
});