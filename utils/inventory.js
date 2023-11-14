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
} = require("@date");

class InventoryService {
  //기간별 변동내용 조회 함수[들어온 개수, 나간개수, 총합], 하루만 입력시 그날 00시부터 24시까지 조회
  // Receipt 테이블에서 주어진 날짜 범위 내의 영수증 변화를 조회하는 함수
  async getReceiptChanges(startUTCDate, endUTCDate) {
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

  // 주어진 날짜 범위 내의 재고 변화를 조회하는 함수
  async getInventoryChanges(startDate, endDate) {
    startDate = convertKSTtoUTC(startDate);
    endDate = addEndTimeAndConvertToUTC(endDate);

    if (!endDate) {
      endDate = startDate; // endDate가 주어지지 않은 경우, endDate를 startDate와 동일하게 설정
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
            [Op.between]: [startDate, endDate], // 주어진 날짜 범위 내
          },
        },
        group: ["item_id", "item_name"], // 아이템별 그룹화
      });

      // 영수증 데이터 조회
      const receiptChanges = await this.getReceiptChanges(startDate, endDate);

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
    } catch (error) {
      console.error("Error in getInventoryChanges:", error);
      throw new Error("Error fetching inventory changes");
    }
  }

  async findClosestSnapshot(UTCdate) {
    const closestSnapshot = await InventorySnapshots.findOne({
      where: {
        snapshotDate: {
          [Op.lte]: UTCdate,
        },
      },
      order: [["snapshotDate", "DESC"]],
    });

    const finalSnapshot = {};

    if (closestSnapshot) {
      // 2. 가장 가까운 스냅샷 날짜로 스냅샷 가져오기
      const selectedSnapshots = await InventorySnapshots.findAll({
        where: {
          snapshotDate: closestSnapshot.snapshotDate,
        },
      });

      const allSnapshotItems = [];
      for (const snapshot of selectedSnapshots) {
        const snapshotItems = await snapshot.getItem();
        // snapshotItems를 배열에 추가
        allSnapshotItems.push({
          ...snapshotItems.dataValues,
          quantity: snapshot.quantity,
        });
      }

      allSnapshotItems.forEach((snap) => {
        const itemId = snap.item_id;
        const itemName = snap.item_name;
        const quantity = snap.quantity;
        finalSnapshot[itemId] = {
          item_id: itemId,
          item_name: itemName,
          quantity: quantity,
          last_updated: closestSnapshot.snapshotDate,
        };
      });
    }
    console.log(finalSnapshot);
    return [finalSnapshot, closestSnapshot.snapshotDate];
  }
  // 스냅샷을 이용하여 입력한 날까지의 재고량 계산 함수
  async getInventoryByDate(date) {
    date = addEndTimeAndConvertToUTC(date);

    // 가장 날짜와 가까운 스냅샷 조회
    const [finalSnapshot, closestSnapshotDate] =
      await this.findClosestSnapshot(date);

    // 이제 스냅샷 날짜부터 입력받은 날짜까지 inventory를 체크해서 변동을 확인함
    const inventoryChanges = await Inventory.findAll({
      attributes: [
        "item_id",
        [sequelize.fn("SUM", sequelize.col("quantity")), "sum_quantity"],
      ],
      where: {
        last_updated: {
          [Op.gt]: closestSnapshotDate ? closestSnapshotDate : new Date(0),
          [Op.lte]: new Date(date),
        },
      },
      group: ["item_id"],
      include: [{ model: Items, as: "item" }],
    });

    // Receipt 정보 취합
    const receiptChanges = await this.getReceiptChanges(
      closestSnapshotDate,
      date,
    );

    // 이제 스냅샷 내용과 변동내용을 병합함
    inventoryChanges.forEach((change) => {
      const itemId = change.item_id;
      const quantityChange = parseInt(change.dataValues.sum_quantity, 10);
      // 스냅샷이 존재하는 아이템들에 대해서
      if (finalSnapshot[itemId]) {
        // 변화를 더함
        finalSnapshot[itemId].quantity += quantityChange;
        // 변화가 있는 날짜로 변환
        finalSnapshot[itemId].last_updated = date;
      } else {
        // 스냅샷에 존재하지 않는 내용에 대해서는 변동내용 취합을 그대로 씀
        finalSnapshot[itemId] = {
          item_id: itemId,
          item_name: change.item.item_name,
          quantity: quantityChange,
          last_updated: date,
        };
      }
    });

    return finalSnapshot;
  }

  // 스냅샷 생성
  async createInventorySnapshot(date) {
    date = convertKSTtoUTC(date);

    // 해낭 날짜 이전까지의 재고량의 총합을 구합니다
    const currentInventory = await Inventory.findAll({
      where: {
        last_updated: {
          [Op.gt]: date,
        },
      },
      attributes: [
        "item_id",
        [sequelize.fn("SUM", sequelize.col("quantity")), "total_quantity"],
      ],
      group: ["item_id"],
      having: sequelize.literal("total_quantity > 0"), // 개수의 총합이 0보다 큰 경우만 선택
    });

    // 각 재고 항목에 대해 스냅샷을 생성합니다.
    for (const item of currentInventory) {
      await InventorySnapshots.create({
        snapshotDate: date,
        itemId: item.dataValues.item_id,
        quantity: item.dataValues.total_quantity,
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
    const inventoryChanges = await this.getInventoryChanges(startDate, endDate);
    const receiptChanges = await this.getReceiptChanges(startDate, endDate);

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
