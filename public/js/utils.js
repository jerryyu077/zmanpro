// ==========================================
// 工具函数
// ==========================================

// 格式化日期为 YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 格式化日期为中文 YYYY年MM月DD日
function formatDateChinese(dateString) {
  // 直接从字符串解析，避免时区问题
  const parts = dateString.split('-');
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const day = parseInt(parts[2]);
  return `${year}年${month}月${day}日`;
}

// 获取星期几
function getWeekday(dateString) {
  // 从字符串解析日期，避免时区问题
  const parts = dateString.split('-');
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1; // 月份从0开始
  const day = parseInt(parts[2]);
  const date = new Date(year, month, day);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekdays[date.getDay()];
}

// 计算时间范围的工时（支持跨日）
function calculateHours(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  let startMinutes = startHour * 60 + startMinute;
  let endMinutes = endHour * 60 + endMinute;
  
  // 如果结束时间小于开始时间，说明跨日了
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }
  
  const diffMinutes = endMinutes - startMinutes;
  return Math.round((diffMinutes / 60) * 10) / 10; // 保留一位小数
}

// 格式化工时显示
function formatHours(hours) {
  return hours ? `${hours}h` : '0h';
}

// 防抖函数
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// 显示提示消息（Toast 提示）
function showMessage(message, type = 'info') {
  // 创建 Toast 元素
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 12px 24px;
    border-radius: 12px;
    font-size: 14px;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: slideDown 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  // 3秒后自动消失
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 3000);
}

// 添加动画样式
if (!document.getElementById('toast-animations')) {
  const style = document.createElement('style');
  style.id = 'toast-animations';
  style.textContent = `
    @keyframes slideDown {
      from { opacity: 0; transform: translate(-50%, -20px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }
    @keyframes slideUp {
      from { opacity: 1; transform: translate(-50%, 0); }
      to { opacity: 0; transform: translate(-50%, -20px); }
    }
  `;
  document.head.appendChild(style);
}

// 二次确认
function confirmAction(message) {
  return confirm(message);
}

// 获取本周第一天（周一）
function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

// 获取本月第一天
function getMonthStart(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// 获取某月的天数
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// 获取某月第一天是星期几
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

// 判断是否为同一天
function isSameDay(date1, date2) {
  return formatDate(date1) === formatDate(date2);
}

// 时间选择器简易实现（使用原生 input type="time"）
function showTimePicker(currentTime, callback) {
  const input = document.createElement('input');
  input.type = 'time';
  input.value = currentTime || '';
  input.style.position = 'fixed';
  input.style.left = '-9999px';
  document.body.appendChild(input);
  
  input.addEventListener('change', function() {
    callback(this.value);
    document.body.removeChild(input);
  });
  
  input.click();
}

// 获取某月的第N个星期X（如：第三个星期一）
function getNthWeekdayOfMonth(year, month, weekday, n) {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  
  // 计算第一个目标星期几的日期
  let firstOccurrence = 1 + (weekday - firstWeekday + 7) % 7;
  
  // 计算第N个
  let targetDate = firstOccurrence + (n - 1) * 7;
  
  return new Date(year, month, targetDate);
}

// 获取某月的最后一个星期X
function getLastWeekdayOfMonth(year, month, weekday) {
  const lastDay = new Date(year, month + 1, 0);
  const lastWeekday = lastDay.getDay();
  
  // 从月末往回找
  let daysBack = (lastWeekday - weekday + 7) % 7;
  return new Date(year, month, lastDay.getDate() - daysBack);
}

// 美国法定节假日配置
function getUSHolidays(year) {
  const holidays = {};
  
  // 1. 元旦 - 1月1日
  holidays[formatDate(new Date(year, 0, 1))] = {
    short: '元旦',
    full: 'New Year\'s Day — 元旦'
  };
  
  // 2. 马丁·路德·金纪念日 - 1月第三个星期一
  holidays[formatDate(getNthWeekdayOfMonth(year, 0, 1, 3))] = {
    short: '马丁·路德·金',
    full: 'Martin Luther King Jr. Day — 马丁·路德·金纪念日'
  };
  
  // 3. 总统日 - 2月第三个星期一
  holidays[formatDate(getNthWeekdayOfMonth(year, 1, 1, 3))] = {
    short: '总统日',
    full: 'Washington\'s Birthday / Presidents\' Day — 总统日'
  };
  
  // 4. 阵亡将士纪念日 - 5月最后一个星期一
  holidays[formatDate(getLastWeekdayOfMonth(year, 4, 1))] = {
    short: '阵亡将士',
    full: 'Memorial Day — 阵亡将士纪念日'
  };
  
  // 5. 解放日 - 6月19日
  holidays[formatDate(new Date(year, 5, 19))] = {
    short: '解放日',
    full: 'Juneteenth National Independence Day — 解放日'
  };
  
  // 6. 美国独立日 - 7月4日
  holidays[formatDate(new Date(year, 6, 4))] = {
    short: '独立日',
    full: 'Independence Day — 美国独立日'
  };
  
  // 7. 劳动节 - 9月第一个星期一
  holidays[formatDate(getNthWeekdayOfMonth(year, 8, 1, 1))] = {
    short: '劳动节',
    full: 'Labor Day — 劳动节'
  };
  
  // 8. 哥伦布日 - 10月第二个星期一
  holidays[formatDate(getNthWeekdayOfMonth(year, 9, 1, 2))] = {
    short: '哥伦布日',
    full: 'Columbus Day — 哥伦布日'
  };
  
  // 9. 退伍军人节 - 11月11日
  holidays[formatDate(new Date(year, 10, 11))] = {
    short: '退伍军人',
    full: 'Veterans Day — 退伍军人节'
  };
  
  // 10. 感恩节 - 11月第四个星期四
  holidays[formatDate(getNthWeekdayOfMonth(year, 10, 4, 4))] = {
    short: '感恩节',
    full: 'Thanksgiving Day — 感恩节'
  };
  
  // 11. 圣诞节 - 12月25日
  holidays[formatDate(new Date(year, 11, 25))] = {
    short: '圣诞节',
    full: 'Christmas Day — 圣诞节'
  };
  
  return holidays;
}

// 获取某个日期的节假日信息
function getHolidayInfo(dateString) {
  // 直接从字符串解析年份，避免时区问题
  const year = parseInt(dateString.split('-')[0]);
  const holidays = getUSHolidays(year);
  return holidays[dateString] || null;
}

