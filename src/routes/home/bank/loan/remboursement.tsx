import { component$, Resource, useResource$ } from "@builder.io/qwik";
import { loadCreditData, useRemboursement } from ".";

export default component$(() => {

    const credit = useResource$<{
        credit: number,
        interets: number,
        status: string,
        du: number
    }>(async () => await loadCreditData())

    const remboursement = useRemboursement()
    return <Resource
        value={credit}
        onPending={() => <>
            Chargement du crédit
        </>}
        onResolved={credit => <>
            <p class="px-4 sm:px-8">
                Vous devez rembourser votre crédit avant d’en prendre un autre! 
                Ce crédit a impact sur le classement
            </p>
            <p class="px-4 sm:px-8 text-xl font-medium">
                Intérêts <span class="font-sobi">
                    { Math.round(credit.interets * 100) }% ({ 
                        Math.round(credit.credit * credit.interets)
                        } <span class="text-pink text-sm">
                        agl
                    </span>)
                </span>
            </p>
            <p class="px-4 sm:px-8 text-xl font-medium">
                Crédit <span class="font-sobi">
                    { credit.credit } <span class="text-pink text-sm">agl</span>
                </span>
            </p>
            <p class="px-4 sm:px-8 text-xl font-medium">
                Dû <span class="font-sobi">
                    { credit.du } <span class="text-pink text-sm">agl</span>
                </span>
            </p>
            <button class="mx-4 px-4 sm:px-8 py-4 bg-pink rounded-md hover:bg-pink/75
                font-sobi text-xl cursor-pointer"
                onClick$={async () => {
                    const response = await remboursement.submit()
                }}>
                Rembourser
            </button>
        </>}/>
})