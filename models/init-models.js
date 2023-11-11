var DataTypes = require("sequelize").DataTypes;
var _DailyInventoryChange = require("./DailyInventoryChange");
var _SequelizeMeta = require("./SequelizeMeta");
var _charge_log = require("./charge_log");
var _dumy_receipt = require("./dumy_receipt");
var _inventory = require("./inventory");
var _inventoryStock = require("./inventoryStock");
var _items = require("./items");
var _pay_log = require("./pay_log");
var _receipt = require("./receipt");
var _temp_receipt = require("./temp_receipt");
var _users = require("./users");

function initModels(sequelize) {
  var DailyInventoryChange = _DailyInventoryChange(sequelize, DataTypes);
  var SequelizeMeta = _SequelizeMeta(sequelize, DataTypes);
  var ChargeLog = _charge_log(sequelize, DataTypes);
  var DumyReceipt = _dumy_receipt(sequelize, DataTypes);
  var Inventory = _inventory(sequelize, DataTypes);
  var InventoryStock = _inventoryStock(sequelize, DataTypes);
  var Items = _items(sequelize, DataTypes);
  var PayLog = _pay_log(sequelize, DataTypes);
  var Receipt = _receipt(sequelize, DataTypes);
  var TempReceipt = _temp_receipt(sequelize, DataTypes);
  var Users = _users(sequelize, DataTypes);


  return {
    DailyInventoryChange,
    SequelizeMeta,
    ChargeLog,
    DumyReceipt,
    Inventory,
    InventoryStock,
    Items,
    PayLog,
    Receipt,
    TempReceipt,
    Users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
