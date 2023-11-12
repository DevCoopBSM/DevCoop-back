const { sequelize, Inventory , Items, InventorySnapshots} = require("@models");
const { Op } = require('sequelize');

class InventoryService {
  //시작일부터 끝날때까지 재고 변화 조회
  async getInventoryChanges(startDate, endDate) {
    let inventoryChanges;
    if (startDate && endDate) {
      inventoryChanges = await Inventory.findAll({
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
    } else {
      inventoryChanges = await Inventory.findAll({
      attributes: [
        'item_id',
        'item_name',
        [sequelize.fn('sum', sequelize.col('quantity')), 'quantity'],
        [sequelize.fn('max', sequelize.col('last_updated')), 'last_updated']
      ],
      group: ['item_id', 'item_name'],
      order: [['last_updated', 'DESC']]
      });
    }
    return inventoryChanges;
    }
  
  

    async getInventoryByDate(date) {
      // 해당 날짜 이전의 가장 최근 스냅샷을 조회합니다.
      const snapshot = await InventorySnapshots.findOne({
        where: {
          snapshotDate: {
            [Op.lte]: date
          }
        },
        order: [['snapshotDate', 'DESC']]
      });
    
      let finalSnapshot = {};
    
      // 스냅샷이 있는 경우, 해당 스냅샷의 재고 수량을 finalSnapshot 객체에 반영합니다.
      if (snapshot) {
        // 스냅샷의 모든 아이템과 수량을 finalSnapshot에 추가합니다.
        const allSnapshotItems = await snapshot.getItems(); // 관계 설정을 통해 아이템 정보를 가져옵니다.
        allSnapshotItems.forEach(snap => {
          const itemId = snap.item.id;
          const itemName = snap.item.item_name; // item 모델의 필드로 변경
          const quantity = snap.quantity;
          finalSnapshot[itemId] = {
            item_id: itemId,
            item_name: itemName,
            quantity: quantity,
            last_updated: snapshot.snapshotDate
          };
        });
      }
    
      // 스냅샷 이후부터 현재 날짜까지의 재고 변동을 조회합니다.
      const inventoryChanges = await Inventory.findAll({
        attributes: [
          'item_id',
          [sequelize.fn('SUM', sequelize.col('quantity')), 'quantity']
        ],
        where: {
          last_updated: {
            [Op.gt]: snapshot ? new Date(snapshot.snapshotDate) : new Date(0),
            [Op.lte]: new Date(date)
          }
        },
        include: [{ model: Items, as: 'item' }] // Include를 사용하여 Items 모델과 조인
      });
    
      // 변동된 재고 데이터를 스냅샷 데이터에 합산합니다.
      inventoryChanges.forEach(change => {
        const itemId = change.item_id;
        const quantityChange = parseInt(change.quantity, 10);
        if (finalSnapshot[itemId]) {
          finalSnapshot[itemId].quantity += quantityChange;
          finalSnapshot[itemId].last_updated = date; // 가장 최근 날짜로 업데이트
        } else {
          finalSnapshot[itemId] = {
            item_id: itemId,
            item_name: change.item.item_name,
            quantity: quantityChange,
            last_updated: date
          };
        }
      });
    
      // 최종 결과를 배열 형태로 반환합니다.
      return Object.values(finalSnapshot).map(snapshotItem => ({
        item_id: snapshotItem.item_id,
        item_name: snapshotItem.item_name,
        quantity: snapshotItem.quantity,
        last_updated: snapshotItem.last_updated
      }));
    }
    
    
    
    

  // 스냅샷 생성
  async createInventorySnapshot() {
    // 조회날짜 전의 최근 스냅샷을 가져옵니다.]
    console.log("before")
    const latestSnapshot = await InventorySnapshots.findOne({
      order: [['snapshotDate', 'DESC']]
    });
    console.log("after")
    // 최근 스냅샷의 날짜를 가져옵니다.
    const latestSnapshotDate = latestSnapshot ? latestSnapshot.snapshotDate : null;
    
    // 최근 스냅샷 이후의 재고 변동을 가져옵니다.
    const currentInventory = await Inventory.findAll({
      where: latestSnapshotDate ? { last_updated: { [Op.gt]: latestSnapshotDate } } : {},
      attributes: [
      'item_id',
      [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
      ],
      group: ['item_id']
    });
    
    // 현재 날짜를 스냅샷 날짜로 설정합니다.
    const snapshotDate = new Date();
    
    // 각 재고 항목에 대해 스냅샷을 생성합니다.
    for (const item of currentInventory) {
      await InventorySnapshots.create({
      snapshotDate: snapshotDate,
      itemId: item.dataValues.item_id,
      quantity: item.dataValues.total_quantity
      });
    }
    }
  
    async createInventoryRange(startDate, endDate) {
      // 시작일 전날의 재고 스냅샷을 계산합니다.
      const startDateSnapshot = await this.getInventoryByDate(new Date(startDate).setDate(new Date(startDate).getDate() - 1));

      // 시작일부터 종료일까지의 재고 변동 내역을 조회합니다.
      const inventoryChanges = await this.getInventoryChanges(startDate, endDate);

      // 종료일의 재고 스냅샷을 계산합니다.
      const endDateSnapshot = await this.getInventoryByDate(endDate);

      // 변동 내역을 바탕으로 2차원 데이터를 생성합니다.
      let itemChangesMatrix = this.buildChangesMatrix(startDateSnapshot, inventoryChanges, endDateSnapshot, startDate, endDate);

      // 2차원 데이터를 출력합니다.
      return endDateSnapshot;
  }

  // 변동 내역을 바탕으로 2차원 데이터를 생성하는 함수입니다.
  buildChangesMatrix(startSnapshot, changes, endSnapshot, startDate, endDate) {
      // ... (여기에 로직을 구현해야 합니다.)
      // 이 로직은 시작 스냅샷의 데이터를 기반으로 각 아이템에 대해 변동된 수량을 계산하고,
      // 마지막 스냅샷의 데이터로 최종 수량을 업데이트하는 방식으로 작성해야 합니다.
  }
}

module.exports = new InventoryService();
