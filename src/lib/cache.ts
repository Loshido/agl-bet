import { createStorage } from "unstorage";
import memoryDriver from "unstorage/drivers/memory";

const storage = createStorage<{
    agl: number,
    badges: []
}>({
    driver: memoryDriver()
});

export default storage;
