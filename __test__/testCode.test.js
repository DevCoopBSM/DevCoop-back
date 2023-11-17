const InventoryService = require("../utils/inventory");

const startDate = "2023-11-01";
const endDate = "2023-11-14";
// 엑셀생성 자료 테스트
it("1", async () => {
  // await InventoryService.createSnapshotForItem(115, 11);
  // await InventoryService.createSnapshotForItem(407, 15);
  const test = await InventoryService.getCombinedChanges(startDate, endDate);
  console.log(test);
});

// it("2", async () => {
//   const test = await InventoryService.getReceiptChanges(startDate, endDate);
//   console.log(test);
// });