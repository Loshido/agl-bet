import { component$, isDev } from "@builder.io/qwik";
import {
    QwikCityProvider,
    RouterOutlet,
    ServiceWorkerRegister,
} from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";
import "./global.css";

export default component$(() => <QwikCityProvider>
    <head>
        <meta charset="utf-8" />
        { !isDev && <link rel="manifest" href={`/manifest.json`} /> }
        <RouterHead />
    </head>
    <body class="bg-midnight font-avenir text-white">
        <RouterOutlet />
        { !isDev && <ServiceWorkerRegister /> }
    </body>
</QwikCityProvider>);
