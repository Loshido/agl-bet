// Client-side storage using localstorage

export default class ClientStore<T> {
    key: string
    expiration: number
    constructor(key: string, expiration: number = 1000 * 60) {
        this.key = key
        this.expiration = expiration
    }

    async get(callback: () => Promise<T>): Promise<T> {
        const local = localStorage.getItem(this.key)
        const parsed: null | [T, number] = local ? JSON.parse(local) : null
        if(parsed && Date.now() < parsed[1]) 
            return parsed[0]
        
        const data = await callback()
        const t = Date.now() + this.expiration
        localStorage.setItem(this.key, JSON.stringify([data, t]))

        return data
    }
}