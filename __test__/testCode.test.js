const {Inventory, InventorySnapshot, sequelize} = require('../models');
const { Op } = require('sequelize');

const startDate = "2022-01-01"
const endDate = "2023-11-15"


it('should do something', async () => {
  const test = await InventorySnapshot.findAll({
    attributes: [
        'item_id',
        'item_name',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'quantity'],
        [sequelize.fn('MAX', sequelize.col('last_updated')), 'last_updated']
    ],
    where: sequelize.where(sequelize.fn('DATE_FORMAT', sequelize.col('last_updated'), '%Y-%m-%d'), {
        [Op.between]: [startDate, endDate]
    }),
    group: ['item_id', 'item_name'],
    order: [['last_updated', 'DESC']]
  });
});



console.log(test);