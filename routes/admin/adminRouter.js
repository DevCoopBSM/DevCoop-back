const express = require("express");
const router = express.Router();
const { checkAdminTokens } = require("@token");

// add, remove를 insert로 통합
const insertInventoryRouter = require("./inventory/insertInventory");
const createSnapshotsRouter = require("./inventory/createSnapshots");
const stockVarianceRouter = require("./inventory/stockVariance");
const itemCheckRouter = require("./inventory/itemCheck");
const inventoryCheckRouter = require("./inventory/inventoryCheck");
const inventoryByDayRouter = require("./inventory/inventoryByDay");
const receiptCheckRouter = require("./inventory/receiptCheck");
const inventoryExcelRouter = require("./inventory/excel");

const pointLogRouter = require("./pointmanage/pointlogs");

const barcodeRouter = require("./auth/barcode");

const adminChargeUserLogRouter = require("./transaction/adminChargeUserLog");
const adminPayUserLogRouter = require("./transaction/adminPayUserLog");
const chargeRouter = require("./transaction/charge");
const payRouter = require("./transaction/pay");
const chargeLogRouter = require("./transaction/chargelog");
const payLogRouter = require("./transaction/paylog");

const userListRouter = require("./auth/userList");
const userCreateRouter = require("./auth/userCreate");
const userDeleteRouter = require("./auth/userDelete");
const allChargeRouter = require("./all/allCharge");

const pwChangeRouter = require("./auth/pwChange");

// 아래 모든 요청에 대해 AdminToken 검증을 실시함
router.use(checkAdminTokens);

router.use("/charge", chargeRouter);
router.use("/pay", payRouter);
router.use("/allcharge", allChargeRouter);
router.use("/barcode", barcodeRouter);

router.use("/chargeuserlog", adminChargeUserLogRouter);
router.use("/payuserlog", adminPayUserLogRouter);
router.use("/chargelog", chargeLogRouter);
router.use("/paylog", payLogRouter);

router.use("/pointlog", pointLogRouter);

router.use("/userList", userListRouter);
router.use("/userCreate", userCreateRouter);
router.use("/userDelete", userDeleteRouter);
router.use("/pwChange", pwChangeRouter);

router.use("/insertinventory", insertInventoryRouter);
router.use("/createsnapshots", createSnapshotsRouter);
router.use("/stockVariance", stockVarianceRouter);
router.use("/itemCheck", itemCheckRouter);
router.use("/inventoryCheck", inventoryCheckRouter);
router.use("/inventoryByDay", inventoryByDayRouter);
router.use("/receiptCheck", receiptCheckRouter);
router.use("/excelDownload", inventoryExcelRouter);
// router.use("/removedItemBarcode", removedItemBarcode);

module.exports = router;
