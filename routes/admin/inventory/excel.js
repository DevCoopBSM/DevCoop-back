const excel = require('exceljs');
const fs = require('fs');
const { executeQueryPromise } = require("@query");//db연결을 포함한 promise형태의 쿼리문
const express = require("express");
const router = express.Router();

router.use(express.json());

router.get('/', async(req, res) => {
  // 데이터베이스에서 데이터 검색
    const select_query = "SELECT item_id , item_name, sum(quantity)as quantity,max(last_updated) as last_updated FROM inventory group by item_id, item_name"
    //"SELECT * FROM inventory";
    try{
        const db_excel = await executeQueryPromise(select_query);
        // 엑셀 파일 생성
        console.log(db_excel);
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('AriySoriy_inventoryData');
        // 데이터를 엑셀에 추가
        worksheet.addRow(['inventory_id', 'item_name', 'barcode', 'quantity', 'last_updated']);
        db_excel.forEach((item) => {
            worksheet.addRow([item.inventory_id, item.item_name, item.barcode, item.quantity, item.last_updated]);
          });
        //파일 저장및 전송
        const excelFilePath = `${__dirname}/inventoryData.xlsx`;
        workbook.xlsx.writeFile(excelFilePath).then(() => {
          res.download(excelFilePath, 'inventoryData.xlsx', err => {
            if (err) {
              console.error('Error sending file: ' + err);
              res.status(500).json({ error: "Error sending file" });
            }
            fs.unlinkSync(excelFilePath); // 파일 삭제
          });
        });
    }catch(err){
        console.error('Error', err);
        return res.status(500).json({ error: "Internal server error." });
    }
});
module.exports = router;
