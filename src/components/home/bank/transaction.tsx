interface TransactionProps {
    agl: number,
    raison: string,
    date: number
}
export const Transaction = (transaction: TransactionProps) => <div 
    class="grid grid-cols-6 w-full h-auto p-1 sm:px-2 py-1 items-center">
    <div class="font-sobi text-2xl text-center col-span-2">
        { 
            transaction.agl > 0 
            ? <span class="text-pink">+{ transaction.agl }</span>
            : <span class="text-white">{ transaction.agl }</span> 
        }
    </div>
    <div class="text-xs font-bold text-center"
        title={transaction.date.toLocaleString()}>
        { 
            new Date(transaction.date).toLocaleTimeString(undefined, {
                timeStyle: 'short'
            }) 
        }
    </div>
    <div class="col-span-3">
        { transaction.raison }
    </div>
</div>