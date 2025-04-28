import { createStorage } from "unstorage";
import memoryDriver from "unstorage/drivers/memory";

export const users = createStorage<{
    agl: number,
    badges: [],
    reset?: true,
    credit?: 'en attente' | 'remboursement'
}>({
    driver: memoryDriver()
});

export const credits = createStorage<{
    du: number,
    interets: number,
    credit: number,
    status: string
}>({
    driver: memoryDriver()
})

type Caching<T> = () => Promise<
    // Renvoie les données du cache
    ['ok', T] | 
    // Cache vide, callback pour mettre en cache
    ['no', (fresh: T) => Promise<void>] 
>
type Refetch<T> = () => Promise<T>
export default async <T>(caching: Caching<T>, refetch: Refetch<T>): Promise<T> => {
    // On essaie de prendre dans le cache
    const cache = await caching();
    if(cache[0] === 'ok') return cache[1]

    // Sinon on recherche la valeur depuis la source
    const refreshed = await refetch()

    // on remet dans le cache
    await cache[1](refreshed)
    return refreshed
}