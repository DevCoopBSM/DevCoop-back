const express = require("express");
const router = express.Router();
const { checkAdminTokens } = require("@token");


// add, remove를 insert로 통합
const insertInventoryRouter = require("./inventory/insertInventory");
const inventoryCheckRouter = require("./inventory/inventoryCheck");
const inventoryExcelRouter = require("./inventory/excel");
// const removedItemBarcode = require("./inventory/removeItemBarcode");

const barcodeRouter = require("./auth/barcode");


const adminChargeUserLogRouter = require("./transaction/adminChargeUserLog");
const adminPayUserLogRouter = require("./transaction/adminPayUserLog");
const chargeRouter = require("./transaction/charge");
const payRouter = require("./transaction/pay");
const chargeLogRouter = require("./transaction/chargelog");
const payLogRouter = require("./transaction/paylog");

const allUserRouter = require("./all/alluser");
const allChargeRouter = require("./all/allCharge");

const pwChangeRouter = require("./auth/pwchange");


// 아래 모든 요청에 대해 AdminToken 검증을 실시함
router.use(checkAdminTokens)

router.use("/charge", chargeRouter);
router.use("/pay", payRouter);
router.use("/allcharge", allChargeRouter);
router.use("/barcode", barcodeRouter);

router.use("/chargeuserlog", adminChargeUserLogRouter);
router.use("/payuserlog", adminPayUserLogRouter);
router.use("/chargelog", chargeLogRouter);
router.use("/paylog", payLogRouter);

router.use("/alluser", allUserRouter);
router.use("/pwchange", pwChangeRouter);

router.use("/insertinventory", insertInventoryRouter);
router.use("/inventoryCheck", inventoryCheckRouter);
router.use("/excelDownload", inventoryExcelRouter);
// router.use("/removedItemBarcode", removedItemBarcode);


module.exports = router;
