const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    student_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    code_number: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pin: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    student_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    point: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_admin: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    is_coop: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    type: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    point_status: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ref_token: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'users',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "student_number" },
        ]
      },
    ]
  });
};
