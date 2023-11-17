const moment = require("moment-timezone");

function convertKSTtoUTC(kstDate) {
  // KST 날짜 문자열을 받아서 UTC로 변환한 Moment 객체를 반환합니다.
  return moment.tz(kstDate, "Asia/Seoul").utc().format();
}

function addEndTimeAndConvertToUTC(kstDate) {
  // KST 기준으로 하루의 끝에 해당하는 시간을 설정합니다.
  const kstEndDate = moment.tz(kstDate, "Asia/Seoul").endOf("day");
  // 그리고 UTC로 변환합니다.
  return kstEndDate.utc().format();
}

function subtractOneDayAndConvertToUTC(kstDate) {
  // KST 날짜 문자열을 받아서 UTC로 변환한 후 하루를 빼고 반환합니다.
  const BeforeDay = moment
    .tz(kstDate, "Asia/Seoul")
    .endOf("day")
    .subtract(1, "day");
  return BeforeDay.utc().format();
}

function getPreviousMonday(kstDate) {
  // 주어진 KST 날짜로부터 이전 주의 월요일을 찾음
  const kstMoment = moment.tz(kstDate, "Asia/Seoul");
  const dayOfWeek = kstMoment.day(); // 주어진 날짜의 요일 (0: 일요일, 1: 월요일, ..., 6: 토요일)

  // 월요일(1)에서 현재 요일을 뺀 만큼 이전 주의 월요일로 이동
  const daysToPreviousMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const previousMonday = kstMoment.subtract(daysToPreviousMonday, "days");

  // 이전 주의 월요일을 UTC로 변환하여 반환
  return previousMonday.utc().format();
}

module.exports = {
  convertKSTtoUTC,
  addEndTimeAndConvertToUTC,
  subtractOneDayAndConvertToUTC,
  getPreviousMonday,
};
