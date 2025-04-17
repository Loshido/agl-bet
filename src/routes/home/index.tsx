import { component$, useSignal, useTask$ } from "@builder.io/qwik";

export default component$(() => {
    const data = useSignal('')

    useTask$(() => {
    })
    
    return <pre>
        {
            data.value
        }
    </pre>
})