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