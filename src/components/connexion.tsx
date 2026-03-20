import Logo from "~/assets/logo.png?jsx"

interface Props {
    onSubmit: () => void,
    message: string
}

export default ({ onSubmit, message }: Props) => <section
    class="w-screen h-svh flex flex-col items-center justify-center gap-32">
    <Logo loading="lazy" decoding="async" fetchPriority="low"
        alt="logo" class="max-h-48 w-auto"/>
    <div class="flex flex-col gap-4 font-sobi *:outline-none">
        <input type="text" placeholder="Pseudo" name="pseudo"
            class="bg-white/25 placeholder:text-white/50 
            p-4 rounded-md text-xl" required={true} />
        <input type="password" placeholder="Mots de passe"
            class="bg-white/25 placeholder:text-white/50 
            p-4 rounded-md text-xl" name="pass" min={4} required={true}/>
        <input type="submit" value="Connexion / Inscription"
            class="bg-pink hover:bg-pink/75 text-white 
            p-4 rounded-md text-2xl cursor-pointer
            transition-colors" required={true}
            onClick$={onSubmit} />
        <pre class="font-avenir font-light text-center">
            { message }
        </pre>
    </div>
</section>