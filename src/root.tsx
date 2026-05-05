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
        <meta property="og:title" content="All Game Long - Bet"/>
        <meta property="og:description" content={"Une plateforme de casino en ligne"+ 
        "pour All Game Long, un évènement dans lequel plusieurs tournois de jeux vidéos"+
        "sont organisés tout au long de la nuit!"}/>
        <meta property="og:url" content="https://agl.isenengineering.fr"/>
        <meta property="og:site_name" content="AGL Bet"/>
        <meta property="og:type" content="website"/>
        <meta property="og:image" content="https://agl.isenengineering.fr/og.webp"/>
        <meta name="twitter:card" content="summary_large_image"/>
    </head>
    <body class="bg-midnight font-avenir text-white">
        <RouterOutlet />
        { !isDev && <ServiceWorkerRegister /> }
    </body>
</QwikCityProvider>);
