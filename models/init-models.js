var DataTypes = require("sequelize").DataTypes;
var _DailyInventoryChange = require("./DailyInventoryChange");
var _SequelizeMeta = require("./SequelizeMeta");
var _charge_log = require("./charge_log");
var _dumy_receipt = require("./dumy_receipt");
var _inventory = require("./inventory");
var _inventoryStock = require("./inventoryStock");
var _inventorySnapshot = require("./inventorySnapshot");
var _items = require("./items");
var _pay_log = require("./pay_log");
var _receipt = require("./receipt");
var _temp_receipt = require("./temp_receipt");
var _users = require("./users");

function initModels(sequelize) {
  var DailyInventoryChange = _DailyInventoryChange(sequelize, DataTypes);
  var SequelizeMeta = _SequelizeMeta(sequelize, DataTypes);
  var charge_log = _charge_log(sequelize, DataTypes);
  var dumy_receipt = _dumy_receipt(sequelize, DataTypes);
  var inventory = _inventory(sequelize, DataTypes);
  var inventoryStock = _inventoryStock(sequelize, DataTypes);
  var inventorySnapshot = _inventorySnapshot(sequelize, DataTypes);
  var items = _items(sequelize, DataTypes);
  var pay_log = _pay_log(sequelize, DataTypes);
  var receipt = _receipt(sequelize, DataTypes);
  var temp_receipt = _temp_receipt(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);

  return {
    DailyInventoryChange,
    SequelizeMeta,
    charge_log,
    dumy_receipt,
    inventory,
    inventoryStock,
    inventorySnapshot,
    items,
    pay_log,
    receipt,
    temp_receipt,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
