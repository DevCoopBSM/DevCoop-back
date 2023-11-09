const express = require("express");
const router = express.Router();




const adminloginRouter = require("./auth/adminlogin");

const addItemBarcodeRouter = require("./inventory/addItemBarcode");
const inventoryCheckRouter = require("./inventory/inventoryCheck");
const inventoryExcelRouter = require("./inventory/excel");
const removedItemBarcode = require("./inventory/removeItemBarcode");

const barcodeRouter = require("./auth/barcode");


const adminChargeUserLogRouter = require("./transaction/adminChargeUserLog");
const adminPayUserLogRouter = require("./transaction/adminPayUserLog");
const chargeRouter = require("./transaction/charge");
const payRouter = require("./transaction/pay");
const chargeLogRouter = require("./transaction/chargelog");
const payLogRouter = require("./transaction/paylog");

const allUserRouter = require("./all/alluser");
const allChargeRouter = require("./all/allcharge");

const pwChangeRouter = require("./auth/pwchange");

const receiptCrawlingRouter = require("./crawl/receipt");
const itemsCrawlingRouter = require("./crawl/items");




router.use("/crawl/receipt", receiptCrawlingRouter);
router.use("/crawl/items", itemsCrawlingRouter);


router.use("/login", adminloginRouter);
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

router.use("/addItemBarcode", addItemBarcodeRouter);
router.use("/inventoryCheck", inventoryCheckRouter);
router.use("/excelDownload", inventoryExcelRouter);
router.use("/removedItemBarcode", removedItemBarcode);


module.exports = router;
