const { executeQueryPromise } = require("../../utils/query");
const express = require("express");
const { checkAdminTokens } = require("../../middlewares/users");
const router = express.Router();

router.use(express.json());
//router.use(checkAdminTokens);

router.post('/', async(req, res) => {
    const {barcode, quantity} = req.body;
    const selecItemQuary = "select item_name, item_id from items where barcode = ?";
    const insertInventoryQuary = "insert into inventory(item_id, item_name, barcode, quantity, last_updated) values(?, ?, ?, ?, CURRENT_TIMESTAMP)";
    if(!barcode | !quantity){
        console.log(barcode, quantity);
        return res.status(400).json({error:"바코드 또는 수량입력이 잘못됐습니다."});
    }       
    try{
        const result = await executeQueryPromise(selecItemQuary, barcode);
        const item_name = result[0].item_name;
        const item_id = result[0].item_id;
        console.log(item_name);
        if(item_name){
            await executeQueryPromise(insertInventoryQuary, [item_id, item_name, barcode, quantity]);
            return res.status(200).json({
               sucsess:"재고 등록 완료",
               name:item_name,
            });
        }else{
            return res.status(400).json({failed:"존재하지 않습니다."})
        }
    }catch(err){
        console.error('Error', err);
        return res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = router;
