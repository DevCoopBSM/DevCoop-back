const moment = require('moment-timezone');

function convertKSTtoUTC(kstDate) {
  // KST 날짜 문자열을 받아서 UTC로 변환한 Moment 객체를 반환합니다.
  return moment.tz(kstDate, 'Asia/Seoul').utc().format();
}

function addEndTimeAndConvertToUTC(kstDate) {
  // KST 기준으로 하루의 끝에 해당하는 시간을 설정합니다.
  const kstEndDate = moment.tz(kstDate, 'Asia/Seoul').endOf('day');
  // 그리고 UTC로 변환합니다.
  return kstEndDate.utc().format();
}

function subtractOneDayAndConvertToUTC(kstDate) {
  // KST 날짜 문자열을 받아서 UTC로 변환한 후 하루를 빼고 반환합니다.
  const BeforeDay =  moment.tz(kstDate, 'Asia/Seoul').endOf('day').subtract(1, 'day')
  return BeforeDay.utc().format();
}



module.exports = {
  convertKSTtoUTC,
  addEndTimeAndConvertToUTC,
  subtractOneDayAndConvertToUTC
};