import { createStorage } from "unstorage";
import memoryDriver from "unstorage/drivers/memory";
import { Equipes, Match } from "./types";

export const users = createStorage<{
    agl: number,
    badges: [],
    reset?: true
}>({
    driver: memoryDriver()
});

export type FullMatch = Omit<Match,  'equipes'> & { 
    equipes: Equipes[]
}
export const matchs = createStorage<FullMatch>({
    driver: memoryDriver()
});

export const equipes = createStorage<{
    devise: string,
    image: string
}>({
    driver: memoryDriver()
})