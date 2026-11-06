import type { QRL, Signal } from "@builder.io/qwik"
import Fond from "~/assets/fond.svg?jsx"
import BDS from "~/assets/bds.png?jsx"
import IE from "~/assets/ie.png?jsx"

interface Props {
    onSubmit: QRL<() => Promise<void>>,
    message: Signal<string>
}

export default ({ onSubmit, message }: Props) => <section
    class="w-screen h-svh flex flex-col items-center justify-center gap-8">
    <div class="-z-10 *:absolute *:top-0 *:left-0 *:w-full *:h-full animate-pulse
        md:opacity-25">
        <Fond/>
	</div>
	<div class="flex flex-row items-center gap-4">
		<div class="w-24 h-24 p-2">
		    <BDS/>
		</div>
		<span class="italic uppercase">x</span>
        <div class="w-24 h-24 p-2">
            <IE/>
		</div>
    </div>
	<h1 class="font-black text-3xl md:text-4xl uppercase font-sobi">
		Soirée FIFA
	</h1>
    <div class="flex flex-col gap-4 *:outline-none font-semibold pb-32">
        <input type="text" placeholder="Pseudo" name="pseudo" required={true}
            class="p-4 rounded-lg text-xl leading-0
            bg-midnight/25 placeholder:text-white/75 backdrop-blur-sm"/>
        <input type="password" placeholder="Mots de passe"
            name="pass" min={4} required={true} onKeyDown$={e => {
                if(e.key === "Enter") onSubmit()
            }}
            class="p-4 rounded-lg text-xl leading-0
            bg-midnight/25 placeholder:text-white/75 backdrop-blur-sm" />
        <input type="submit" value="Connexion / Inscription"
            class="bg-pink hover:bg-pink/50 text-white backdrop-blur-sm
            py-4 px-5 rounded-md text-xl cursor-pointer font-sobi
            transition-colors" required={true}
            onClick$={onSubmit} />
        <pre class="font-avenir font-light text-center">
            { message.value }
        </pre>
    </div>
</section>
