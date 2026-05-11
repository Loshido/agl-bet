import { JSX, QRL } from "@builder.io/qwik";

interface Props {
    children: JSX.Element,
    onClick: QRL,
    options: {
        text: string,
        active: boolean
    }[]
}

export const Toggle = ({ children, options, onClick }: Props) => <div class="text-xl font-bold px-4 py-2 hover:bg-white/25 rounded-md
    cursor-pointer font-sobi transition-colors select-none
    flex flex-row items-center gap-4"
    onClick$={onClick}>
    { children }
    <div class="text-sm flex flex-row h-full items-center rounded-sm border border-white/10">
        {
            options.map(option => <div class={["px-2 py-1 transition-colors",
                    "last:rounded-r-sm first:rounded-l-sm",
                    option.active ? 'bg-pink' : 'bg-midnight/25']}>
                {option.text}
            </div>)
        }
    </div>
</div>