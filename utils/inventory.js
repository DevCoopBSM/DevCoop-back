const {
  sequelize,
  Inventory,
  Items,
  InventorySnapshots,
  Receipt,
} = require("@models");
const { Op } = require("sequelize");
const {
  convertKSTtoUTC,
  addEndTimeAndConvertToUTC,
  subtractOneDayAndConvertToUTC,
  getPreviousMonday,
} = require("@date");

class InventoryService {
  async getItemList() {
    // items 테이블 조회
    const ItemList = await Items.findAll({
      attributes: ["item_id", "item_name", "barcode", "item_price"],
    });

    return ItemList;
  }

  async getInventoryChanges(start_date, end_date) {
    const startDate = await subtractOneDayAndConvertToUTC(start_date);
    const endDate = await addEndTimeAndConvertToUTC(end_date);
    // items 테이블 조회
    const InventoryList = await Inventory.findAll({
      where: {
        last_updated: {
          [Op.between]: [startDate, endDate], // 'last_updated'가 'startDate'와 'endDate' 사이인 데이터만 조회
        },
      },
      order: [["last_updated", "DESC"]],
    });

    return InventoryList;
  }

  async getReceiptChanges(start_date, end_date) {
    const startDate = subtractOneDayAndConvertToUTC(start_date);
    const endDate = addEndTimeAndConvertToUTC(end_date);
    // items 테이블 조회
    const ReceiptList = await Receipt.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate], // 'date'가 'startDate'와 'endDate' 사이인 데이터만 조회
        },
      },
      order: [["date", "DESC"]],
    });

    return ReceiptList;
  }

  //기간별 변동내용 조회 함수[들어온 개수, 나간개수, 총합], 하루만 입력시 그날 00시부터 24시까지 조회
  // Receipt 테이블에서 주어진 날짜 범위 내의 영수증 변화를 조회하는 함수
  async sumReceiptChangesByDay(startUTCDate, endUTCDate) {
    console.log(startUTCDate, endUTCDate);
    // 영수증 데이터 조회
    const receiptChanges = await Receipt.findAll({
      attributes: [
        "item_id",
        [
          sequelize.fn("SUM", sequelize.col("sale_qty")),
          "total_negative_change",
        ], // 아이템 개수 합산 (음수로)
        [sequelize.fn("MAX", sequelize.col("date")), "last_updated"], // 가장 최근 업데이트 날짜
      ],
      where: {
        date: {
          [Op.between]: [startUTCDate, endUTCDate], // 주어진 날짜 범위 내
        },
      },
      group: ["item_id"],
      include: [{ model: Items, as: "item" }], // 아이템 정보 가져오기
    });

    return receiptChanges;
  }

  async sumInventoryChangesByDay(startUTCDate, endUTCDate) {
    if (!endUTCDate) {
      endUTCDate = startUTCDate; // endDate가 주어지지 않은 경우, endDate를 startDate와 동일하게 설정
    }

    try {
      // 재고 변화 조회
      const inventoryChanges = await Inventory.findAll({
        attributes: [
          "item_id",
          "item_name",
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN quantity > 0 THEN quantity ELSE 0 END",
              ),
            ),
            "total_positive_change",
          ],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal(
                "CASE WHEN quantity < 0 THEN quantity ELSE 0 END",
              ),
            ),
            "total_negative_change",
          ],
          [sequelize.fn("SUM", sequelize.col("quantity")), "total_change"],
          [sequelize.fn("MAX", sequelize.col("last_updated")), "last_updated"], // 가장 최근 업데이트 날짜
        ],
        where: {
          last_updated: {
            [Op.between]: [startUTCDate, endUTCDate], // 주어진 날짜 범위 내
          },
        },
        group: ["item_id", "item_name"], // 아이템별 그룹화
      });

      return inventoryChanges;
    } catch (error) {
      console.error("Error in sumInventoryChangesByDay:", error);
      throw new Error("Error fetching inventory changes");
    }
  }
  // 주어진 날짜 범위 내의 재고 변화를 조회하는 함수
  async getCombinedChanges(start_date, end_date) {
    const startDate = subtractOneDayAndConvertToUTC(start_date);
    const endDate = addEndTimeAndConvertToUTC(end_date);
    const receiptChanges = await this.sumReceiptChangesByDay(
      startDate,
      endDate,
    );
    const inventoryChanges = await this.sumInventoryChangesByDay(
      startDate,
      endDate,
    );

    // inventoryChanges와 receiptChanges 합치기
    for (const receiptChange of receiptChanges) {
      const itemId = receiptChange.item_id;
      const negativeChangeTotal = parseInt(
        receiptChange.dataValues.total_negative_change,
        10,
      );
      const existingItem = inventoryChanges.find(
        (item) => item.item_id === itemId,
      );

      if (existingItem) {
        existingItem.total_negative_change += negativeChangeTotal;
        existingItem.total_change -= negativeChangeTotal;
      } else {
        // console.log(receiptChange);
        // inventoryChanges에 아이템이 없는 경우 새로 추가
        inventoryChanges.push({
          item_id: itemId,
          item_name: receiptChange.item.item_name,
          total_negative_change: negativeChangeTotal,
          total_positive_change: 0,
          total_change: -negativeChangeTotal,
          last_updated: receiptChange.dataValues.last_updated,
        });
      }
    }

    // 결과를 last_updated 기준으로 내림차순 정렬
    inventoryChanges.sort((a, b) => {
      if (a.last_updated < b.last_updated) return 1;
      if (a.last_updated > b.last_updated) return -1;
      return 0;
    });

    return inventoryChanges;
  }

  async getInventoryByDate(date) {
    date = addEndTimeAndConvertToUTC(date);

    // 가장 날짜와 가까운 스냅샷 조회
    const finalSnapshot = await this.findClosestSnapshotsByItem(date);

    const finalInventory = [];

    // 아이템 별로 인벤토리 변화량을 계산
    for (const itemId in finalSnapshot) {
      if (finalSnapshot.hasOwnProperty(itemId)) {
        const closestSnapshot = finalSnapshot[itemId];

        if (!closestSnapshot) {
          // 이전 스냅샷이 없는 경우, 로그를 남기고 함수를 패스합니다.
          console.log(
            `No inventory snapshot found for itemID ${itemId} around ${date}. Skipping inventory calculation.`,
          );
          continue;
        }

        // 아이템별로 가장 가까운 스냅샷 이후와 입력받은 날짜 사이의 인벤토리 변화량 계산
        const inventoryChange = await Inventory.findOne({
          attributes: [
            [sequelize.fn("SUM", sequelize.col("quantity")), "total_change"],
            [
              sequelize.fn("MAX", sequelize.col("last_updated")),
              "last_updated",
            ],
          ],
          where: {
            item_id: itemId,
            last_updated: {
              [Op.gt]: closestSnapshot.snapshotDate, // 가장 가까운 스냅샷 이후
              [Op.lte]: date, // 입력받은 날짜까지
            },
          },
          include: [{ model: Items, as: "item" }],
          group: "item.item_id",
        });
        console.log(inventoryChange);
        if (inventoryChange) {
          const totalChange = parseInt(
            inventoryChange.dataValues.total_change,
            10,
          );
          finalInventory.push({
            item_id: itemId,
            item_name: inventoryChange.item.item_name,
            quantity: closestSnapshot.quantity + totalChange,
            last_updated: inventoryChange.last_updated,
          });
        } else {
          // 인벤토리 변화가 없는 경우, 스냅샷을 그대로 사용
          finalInventory.push({
            item_id: itemId,
            item_name: closestSnapshot.itemName, // item_name을 가져오거나 필요한 값을 여기서 설정
            quantity: closestSnapshot.quantity,
            last_updated: closestSnapshot.snapshotDate,
          });
        }
      }
    }
    return finalInventory;
  }

  async findClosestSnapshotsByItem(date) {
    // 아이템별로 가장 가까운 스냅샷을 조회
    const closestSnapshots = {};

    const allSnapshots = await InventorySnapshots.findAll({
      where: {
        snapshotDate: {
          [Op.lte]: date,
        },
      },
      include: [{ model: Items, as: "item" }],
    });
    // 아이템 별로 가장 가까운 스냅샷을 찾음
    for (const snapshot of allSnapshots) {
      const itemId = snapshot.itemId;
      const snapshotDate = snapshot.snapshotDate;
      // console.log(snapshot);
      if (
        !closestSnapshots[itemId] ||
        snapshotDate > closestSnapshots[itemId].snapshotDate
      ) {
        closestSnapshots[itemId] = {
          snapshotDate: snapshotDate,
          itemName: snapshot.item.item_name,
          quantity: snapshot.dataValues.quantity,
        };
      }
    }

    return closestSnapshots;
  }

  async createSnapshotForItem(itemId, quantity, writer_id) {
    try {
      const currentTimestamp = new Date().getTime(); // 현재 타임스탬프를 얻습니다.
      console.log(currentTimestamp);
      // 스냅샷 생성
      await InventorySnapshots.create({
        snapshotDate: currentTimestamp,
        itemId: itemId,
        quantity: quantity,
        writer_id: writer_id,
      });

      console.log(
        `Snapshot created for Item ID ${itemId} at timestamp ${currentTimestamp}`,
      );
    } catch (error) {
      console.error(`Error creating snapshot: ${error.message}`);
      throw error;
    }
  }
  async createMondaySnapshot(itemID, date) {
    date = convertKSTtoUTC(date);

    // date 이후의 스냅샷 조회
    const nextSnapshot = await InventorySnapshots.findOne({
      where: {
        itemId: itemID,
        snapshotDate: {
          [Op.gt]: date,
        },
      },
      order: [["snapshotDate", "ASC"]], // 오래된 스냅샷부터 가져옴
    });

    if (!nextSnapshot) {
      // 이전 날짜의 스냅샷과 date 이후의 스냅샷이 모두 없을 경우, 로그를 남기고 함수를 패스합니다.
      console.log(
        `No inventory snapshots found for itemID ${itemID} around ${date}. Skipping snapshot creation.`,
      );
      return;
    } else {
      // 이전 날짜의 스냅샷이 없을 경우, 주초(월요일) 스냅샷을 생성
      const monday = getPreviousMonday(date); // 주초(월요일) 계산 함수 필요
      const endDay = nextSnapshot.dataValues.snapshotDate;

      // 해당 itemID에 대해, date부터 endDay까지의 영수증 내용을 합산합니다.
      const currentReceipt = await Receipt.findAll({
        where: {
          item_id: itemID,
          date: {
            [Op.gte]: monday,
            [Op.lte]: endDay,
          },
        },
        attributes: [
          "item_id",
          [sequelize.fn("SUM", sequelize.col("sale_qty")), "total_negative"],
        ],
        group: ["item_id"],
        having: sequelize.literal("total_negative > 0"), // 개수의 총합이 0보다 큰 경우만 선택
      });
      console.log(currentReceipt);
      // 해당 itemID에 대해, date부터 endDay까지의 재고량의 총합을 구합니다.
      const currentInventory = await Inventory.findAll({
        where: {
          item_id: itemID,
          last_updated: {
            [Op.gte]: monday,
            [Op.lte]: endDay,
          },
        },
        attributes: [
          "item_id",
          [sequelize.fn("SUM", sequelize.col("quantity")), "total_quantity"],
        ],
        group: ["item_id"],
        having: sequelize.literal("total_quantity > 0"), // 개수의 총합이 0보다 큰 경우만 선택
      });

      // currentInventory에서 총합을 가져온 후, 월요일 스냅샷을 생성합니다.
      let totalQuantity = 0;
      if (currentInventory.length > 0) {
        totalQuantity += currentInventory[0].dataValues.total_quantity;
      }
      if (currentReceipt.length > 0) {
        totalQuantity -= currentReceipt[0].dataValues.total_negative;
      }

      await InventorySnapshots.create({
        snapshotDate: monday,
        itemId: itemID,
        quantity: totalQuantity,
      });
    }
  }

  // 시작부터 끝까지 재고 변동 내용 출력
  async calculateInventory(startDate, endDate) {
    startDate = convertKSTtoUTC(startDate);
    const beforeStartDate = subtractOneDayAndConvertToUTC(startDate);
    endDate = addEndTimeAndConvertToUTC(endDate);

    // 1. 시작일전일 과 종료일의 재고량을 가져옴
    const startInventory = await this.getInventoryByDate(beforeStartDate);
    const endInventory = await this.getInventoryByDate(endDate);

    // 2. 시작일부터 종료일까지 날짜별 재고 변동을 가져옴
    const inventoryChanges = await this.sumInventoryChangesByDay(
      startDate,
      endDate,
    );
    const receiptChanges = await this.sumReceiptChangesByDay(
      startDate,
      endDate,
    );

    // 3. 결과를 구성할 객체 초기화
    const result = {};

    // 4. 시작일 전일의 재고를 결과에 추가
    Object.keys(startInventory).forEach((itemId) => {
      if (!result[itemId]) {
        result[itemId] = {};
      }
      result[itemId].item_name = startInventory[itemId].item_name;
      result[itemId].start_quantity = startInventory[itemId].quantity;
    });

    // 5. 종료일의 재고를 결과에 추가
    Object.keys(endInventory).forEach((itemId) => {
      if (!result[itemId]) {
        result[itemId] = {};
      }
      result[itemId].item_name = endInventory[itemId].item_name;
      result[itemId].end_quantity = endInventory[itemId].quantity;
    });

    // 6. 시작일부터 종료일까지 날짜별 재고 변동을 결과에 추가
    const currentDate = new Date(startDate);
    const finalDate = new Date(endDate);

    while (currentDate <= finalDate) {
      const dateStr = currentDate.toDateString();
      // console.log(currentDate)
      inventoryChanges.forEach((change) => {
        console.log(change);
        const itemId = change.item_id;
        const positive_change = change.total_positive_change;
        const negative_change = change.total_negative_change;
        const total_change = change.total_change;
        // console.log(negative_change)
        if (!result[itemId]) {
          result[itemId] = {};
        }
        // 날짜를 키로 사용하여 변동 내용 추가
        result[itemId][dateStr] = {
          positive_change: positive_change,
          negative_change: negative_change,
          total_change: total_change,
        };

        // 해당 날짜의 영수증 내용 처리
        receiptChanges.forEach((receiptChange) => {
          const receiptDate =
            receiptChange.dataValues.last_updated.toDateString();
          if (dateStr === receiptDate) {
            const totalNegativeChangeReceipt = parseInt(
              receiptChange.dataValues.total_negative_change,
              10,
            );
            if (!result[itemId][dateStr]) {
              result[itemId][dateStr] = {};
            }
            // 영수증 내용을 뺄셈하여 결과에 추가
            result[itemId][dateStr].negative_change +=
              totalNegativeChangeReceipt;
            result[itemId][dateStr].total_change -= totalNegativeChangeReceipt;
          }
        });
      });

      // 다음 날짜로 이동
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }
}

module.exports = new InventoryService();
