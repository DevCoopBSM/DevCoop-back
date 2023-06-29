const express = require("express");
const {connection} = require("../utils/query")
const router = express.Router();
router.use(express.json());

router.get('/', (req, res)=>{
    const sql = "select `date`, inner_point, `type` from user_log order by date desc limit 10";
    connection.query(sql, (err, result)=>{
      if(err){
        throw err;
      }
      console.log(result);
      return res.status(200).send(result);
    });
});

module.exports = router;
