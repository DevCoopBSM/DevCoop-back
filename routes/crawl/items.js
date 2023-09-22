const express = require("express");
const { executeQueryPromise } = require("../../utils/query");
const router = express.Router();
router.use(express.json());
const bodyParser = require('body-parser');

router.use(bodyParser.json());
router.post("/", async (req, res) => {
    const jsonData = req.body;

    async function updateOrInsertDatabase() {
        try {
            for (const item of jsonData) {
                const { PROD_CD, PROD_NM, BAR_CD, SALE_UPRC } = item;

                // 먼저 해당 PROD_CD가 이미 존재하는지 확인
                const checkQuery = `
                    SELECT * FROM items WHERE item_id = ?
                `;
                const existingData = await executeQueryPromise(checkQuery, [PROD_CD]);

                if (existingData.length > 0) {
                    // 이미 존재하는 경우 업데이트
                    const updateQuery = `
                        UPDATE items
                        SET item_name = ?,
                            barcode = ?,
                            item_price = ?
                        WHERE item_id = ?
                    `;

                    await executeQueryPromise(updateQuery, [PROD_NM, BAR_CD, SALE_UPRC, PROD_CD]);
                } else {
                    // 존재하지 않는 경우 삽입
                    const insertQuery = `
                        INSERT INTO items (item_id, item_name, barcode, item_price)
                        VALUES (?, ?, ?, ?)
                    `;

                    await executeQueryPromise(insertQuery, [PROD_CD, PROD_NM, BAR_CD, SALE_UPRC]);
                }
            }

            console.log('데이터가 성공적으로 업데이트 또는 삽입되었습니다.');
            res.status(200).json({ message: '데이터가 성공적으로 업데이트 또는 삽입되었습니다.' });
        } catch (error) {
            console.error('데이터 업데이트 또는 삽입 오류:', error);
            res.status(500).json({ error: '데이터 업데이트 또는 삽입 중 오류가 발생했습니다.' });
        }
    }

    updateOrInsertDatabase();
});

module.exports = router;
