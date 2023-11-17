"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
const db = {};

function toPascalCase(str) {
  return (
    str
      // 먼저 모든 언더스코어(_)를 공백으로 치환합니다.
      .replace(/_/g, " ")
      // 단어의 첫 글자만 대문자로 변환합니다.
      .replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1);
      })
      // 공백을 제거합니다.
      .replace(/\s/g, "")
  );
}

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config,
  );
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes,
    );
    const modelName = toPascalCase(file.replace(".js", ""));
    db[modelName] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Items 모델에 스냅샷 관계 설정
db.Items.hasMany(db.InventorySnapshots, {
  foreignKey: "itemId", // InventorySnapshots 모델의 컬럼 이름
  as: "snapshots",
});

db.Items.hasMany(db.Receipt, {
  foreignKey: "item_id", // Receipt 모델의 아이템 관련 컬럼 이름
  as: "receipts",
});

db.Items.hasMany(db.Inventory, {
  foreignKey: "item_id", // Receipt 모델의 아이템 관련 컬럼 이름
  as: "inventory",
});

// InventorySnapshots 모델에 아이템 관계 설정
db.InventorySnapshots.belongsTo(db.Items, {
  foreignKey: "itemId", // InventorySnapshots 모델의 컬럼 이름
  as: "item",
});

db.Inventory.belongsTo(db.Items, {
  foreignKey: "item_id",
  as: "item",
});

db.Receipt.belongsTo(db.Items, {
  foreignKey: "item_id",
  as: "item",
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
console.log(Object.keys(db));
module.exports = db;
