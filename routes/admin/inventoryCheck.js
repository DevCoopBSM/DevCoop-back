const { executeQueryPromise } = require("../../utils/query");
const express = require("express");
const { checkAdminTokens } = require("../../middlewares/users");
const router = express.Router();

router.use(express.json());
router.use(checkAdminTokens);

router.get('/', async(req, res) => {
    const selecItemQuary = "select inventory_id, item_name, quantity, last_updated from inventory";      
    try{
        const result = await executeQueryPromise(selecItemQuary); 
        console.log(result);
        return res.status(200).send(result);
    }catch(err){
        console.error('Error', err);
        return res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = router;
