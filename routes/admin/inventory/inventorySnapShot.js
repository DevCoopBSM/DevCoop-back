async function createInventorySnapshot() {
    // 현재 재고 상태를 가져옵니다.
    const currentInventory = await Inventory.findAll({
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
      await InventorySnapshot.create({
        snapshot_date: snapshotDate,
        item_id: item.item_id,
        quantity: item.total_quantity
      });
    }
  }