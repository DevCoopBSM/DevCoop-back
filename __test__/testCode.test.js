const InventoryService = require("../utils/inventory")

const startDate = "2023-11-01"
const endDate = "2023-11-12"



it('1', async () => {
  const test = await InventoryService.calculateInventory(endDate);
  
  console.log(JSON.stringify(test, null, 2))
});



