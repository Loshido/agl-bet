import { component$ } from "@builder.io/qwik";

const fake_users = [
    "gilbert",
    "françois",
    "renault",
    "francisse",
    "saucisse"
]

const Utilisateur = ({ pseudo }: { pseudo: string }) => <div 
    class="grid grid-cols-4 gap-2 *:transition-colors">
    <p class="col-span-2">
        {pseudo} 
    </p>
    <div class="py-1.5 font-bold text-center hover:bg-white/50
        bg-white/25 cursor-pointer select-none rounded-sm">
        Accepter
    </div>
    <div class="py-1.5 font-bold text-center hover:bg-white/50
        bg-white/25 cursor-pointer select-none rounded-sm">
        Refuser
    </div>
</div>

export default component$(() => {
    return <>
        {
            fake_users.map(user => <Utilisateur
                pseudo={user}/>)
        }
    </>
})