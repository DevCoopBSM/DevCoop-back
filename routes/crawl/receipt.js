const express = require("express");
const { executeQueryPromise } = require("../../utils/query");
const router = express.Router();
const bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post("/", async (req, res) => {
    const jsonData = req.body;  // Assuming that the data is coming from the request's body

    const doesLogExistForDate = async (date) => {
        const checkQuery = `
            SELECT COUNT(*) AS count
            FROM receipt
            WHERE date = ?
        `;
        
        const result = await executeQueryPromise(checkQuery, [date]);
        return result[0].count > 0;
    };

    async function saveDataToDatabase() {
        try {
            for (const item of jsonData) {
                const { SALE_QTY, DCM_SALE_AMT, PROD_CD, SALE_YN, BILL_NO, PROD_NM, SALE_DT } = item;

                // 해당 날짜의 로그가 이미 존재하는지 확인
                if (await doesLogExistForDate(SALE_DT)) {
                    console.log(`날짜 ${SALE_DT}에 대한 로그가 이미 존재합니다.`);
                    continue; // 현재 반복을 건너뜁니다.
                }

                const query = `
                    INSERT INTO receipt (sale_qty, dcm_sale_amt, item_code, sale_yn, bill_num, item_name, date)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;

                await executeQueryPromise(query, [SALE_QTY, DCM_SALE_AMT, PROD_CD, SALE_YN, BILL_NO, PROD_NM, SALE_DT]);
            }

            console.log('데이터가 성공적으로 저장되었습니다.');
            res.status(200).json({ message: '데이터가 성공적으로 저장되었습니다.' });
        } catch (error) {
            console.error('데이터 저장 오류:', error);
            res.status(500).json({ error: '데이터 저장 중 오류가 발생했습니다.' });
        } 
    }

    // Call the function to actually save the data
    saveDataToDatabase();
});

module.exports = router;
