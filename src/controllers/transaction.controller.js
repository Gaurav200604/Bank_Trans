
async function createTransaction(req,res){
    const {fromAccount, toAccount, amount,idempotencyKey} = req.body;

    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({message: "Missing required fields"});
        
    }
}