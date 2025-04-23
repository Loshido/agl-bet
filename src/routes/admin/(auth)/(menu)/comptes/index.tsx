import { component$ } from "@builder.io/qwik";

const fake_users = [
    "gilbert",
    "françois",
    "renault",
    "francisse",
    "saucisse"
]

const Utilisateur = ({ pseudo, agl }: { pseudo: string, agl: number }) => <div 
    class="grid grid-cols-4 gap-2 *:transition-colors items-center">
    <p class="col-span-2">
        {pseudo} 
    </p>
    <p class="font-sobi">
        {agl} <span class="text-xs text-pink">agl</span>
    </p>
    <div class="py-1.5 font-bold text-center hover:bg-white/50
        bg-white/25 cursor-pointer select-none rounded-sm">
        Voir
    </div>
</div>

export default component$(() => {
    return <>
        {
            fake_users.map(user => <Utilisateur
                pseudo={user}
                agl={10000}/>)
        }
    </>
})