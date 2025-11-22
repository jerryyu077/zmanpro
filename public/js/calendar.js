// ==========================================
// 员工日历页逻辑 (calendar.html)
// ==========================================

// 全局变量
let currentEmployee = null;
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let selectedDate = null;
let multiSelectMode = false;
let selectedDates = new Set();
let workRecords = {};

// 初始化
document.addEventListener('DOMContentLoaded', async function() {
  console.log('员工日历页已加载');
  
  // 获取员工ID
  const urlParams = new URLSearchParams(window.location.search);
  const employeeId = urlParams.get('id');
  
  if (!employeeId) {
    showMessage('未找到员工信息');
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
    return;
  }
  
  // 绑定事件
  bindEvents();
  
  // 加载员工信息
  await loadEmployee(employeeId);
  
  // 加载工时记录
  await loadWorkRecords(employeeId);
  
  // 渲染日历
  renderCalendar();
});

// 加载员工信息
async function loadEmployee(id) {
  try {
    const response = await getEmployee(id);
    if (response.success) {
      currentEmployee = response.data;
      
      // 更新页面显示
      document.getElementById('employeeName').textContent = currentEmployee.name;
      document.getElementById('employeeRate').textContent = 
        `默认时薪: ¥${currentEmployee.default_hourly_rate}/小时`;
    } else {
      showMessage('员工不存在');
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    }
  } catch (error) {
    console.error('加载员工失败:', error);
    showMessage('无法连接到服务器');
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  }
}

// 加载工时记录
async function loadWorkRecords(employeeId) {
  try {
    const response = await getWorkRecords(employeeId, currentYear, currentMonth + 1);
    if (response.success) {
      // 转换为 Map 方便查询
      workRecords = {};
      response.data.records.forEach(record => {
        workRecords[record.date] = record;
      });
    }
  } catch (error) {
    console.error('加载工时记录失败:', error);
    workRecords = {};
  }
}

// 绑定事件
function bindEvents() {
  // 返回按钮
  document.getElementById('backBtn').addEventListener('click', function() {
    window.location.href = '/';
  });
  
  // 批量输入按钮
  document.getElementById('batchInputBtn').addEventListener('click', openBatchModal);
  
  // 多选按钮
  document.getElementById('multiSelectBtn').addEventListener('click', toggleMultiSelectMode);
  
  // 月份切换
  document.getElementById('prevMonthBtn').addEventListener('click', function() {
    changeMonth(-1);
  });
  
  document.getElementById('nextMonthBtn').addEventListener('click', function() {
    changeMonth(1);
  });
  
  // 清除选择
  document.getElementById('clearSelection').addEventListener('click', clearSelection);
  document.getElementById('clearMultiSelection').addEventListener('click', clearMultiSelection);
  
  // 输入方式切换
  document.querySelectorAll('input[name="inputMethod"]').forEach(radio => {
    radio.addEventListener('change', function() {
      toggleInputMode(this.value);
    });
  });
  
  // 单日时间输入变化
  document.getElementById('startTimeInput').addEventListener('change', updateCalculatedHours);
  document.getElementById('endTimeInput').addEventListener('change', updateCalculatedHours);
  
  // 批量输入方式切换
  document.querySelectorAll('input[name="batchInputMethod"]').forEach(radio => {
    radio.addEventListener('change', function() {
      toggleBatchInputMode(this.value);
    });
  });
  
  // 批量输入时间变化
  document.getElementById('batchStartTime').addEventListener('change', updateBatchCalculatedHours);
  document.getElementById('batchEndTime').addEventListener('change', updateBatchCalculatedHours);
  
  // 保存按钮
  document.getElementById('saveBtn').addEventListener('click', saveSingleDayRecord);
  document.getElementById('updateBtn').addEventListener('click', saveSingleDayRecord);
  
  // 删除按钮
  document.getElementById('deleteBtn').addEventListener('click', deleteRecord);
  
  // 批量输入 Modal
  document.getElementById('closeBatchModal').addEventListener('click', closeBatchModal);
  document.getElementById('batchModal').addEventListener('click', function(e) {
    if (e.target === this) closeBatchModal();
  });
  
  // 批量保存
  document.getElementById('batchSaveBtn').addEventListener('click', saveBatchRecords);
}

// 渲染日历
function renderCalendar() {
  // 更新月份显示
  document.getElementById('currentMonth').textContent = 
    `${currentYear}年${currentMonth + 1}月`;
  
  const daysContainer = document.getElementById('calendarDays');
  daysContainer.innerHTML = '';
  
  // 获取当月第一天是星期几
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  
  // 获取当月天数
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // 获取上个月天数
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
  
  // 渲染上个月的日期
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const dayElement = createDayElement(day, true, -1);
    daysContainer.appendChild(dayElement);
  }
  
  // 渲染当月日期
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = createDayElement(day, false, 0);
    daysContainer.appendChild(dayElement);
  }
  
  // 渲染下个月的日期（填充剩余格子）
  const totalCells = daysContainer.children.length;
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let day = 1; day <= remainingCells; day++) {
    const dayElement = createDayElement(day, true, 1);
    daysContainer.appendChild(dayElement);
  }
}

// 创建日期元素
function createDayElement(day, isOtherMonth, monthOffset) {
  const button = document.createElement('button');
  button.className = 'day';
  
  // 计算实际日期
  let year = currentYear;
  let month = currentMonth + monthOffset;
  
  if (month < 0) {
    month = 11;
    year--;
  } else if (month > 11) {
    month = 0;
    year++;
  }
  
  const dateString = formatDate(new Date(year, month, day));
  button.dataset.date = dateString;
  
  // 检查是否为节假日
  const holidayInfo = getHolidayInfo(dateString);
  if (holidayInfo && !isOtherMonth) {
    const holidayLabel = document.createElement('div');
    holidayLabel.className = 'day-holiday';
    holidayLabel.textContent = holidayInfo.short;
    button.appendChild(holidayLabel);
    button.classList.add('is-holiday');
  }
  
  // 日期数字
  const dayNumber = document.createElement('div');
  dayNumber.className = 'day-number';
  dayNumber.textContent = day;
  button.appendChild(dayNumber);
  
  // 其他月份的日期
  if (isOtherMonth) {
    button.classList.add('other-month');
  }
  
  // 检查是否有工时记录
  if (workRecords[dateString]) {
    button.classList.add('has-hours');
    const hoursLabel = document.createElement('div');
    hoursLabel.className = 'day-hours';
    hoursLabel.textContent = `${workRecords[dateString].hours}h`;
    button.appendChild(hoursLabel);
  }
  
  // 绑定点击事件
  button.addEventListener('click', function() {
    handleDayClick(dateString, button);
  });
  
  return button;
}

// 处理日期点击
function handleDayClick(dateString, element) {
  if (multiSelectMode) {
    // 多选模式
    if (selectedDates.has(dateString)) {
      selectedDates.delete(dateString);
      element.classList.remove('multi-selected');
    } else {
      selectedDates.add(dateString);
      element.classList.add('multi-selected');
    }
    
    // 更新统计
    if (selectedDates.size > 0) {
      updateStatistics();
      showStatistics();
    } else {
      hideStatistics();
    }
  } else {
    // 单选模式
    // 移除之前的选中状态
    document.querySelectorAll('.day.selected').forEach(el => {
      el.classList.remove('selected');
    });
    
    // 选中当前日期
    element.classList.add('selected');
    selectedDate = dateString;
    
    // 显示表单
    showSingleDayForm(dateString);
  }
}

// 显示单日表单
function showSingleDayForm(dateString) {
  // 隐藏其他区域
  document.getElementById('placeholderSection').classList.add('hidden');
  document.getElementById('statisticsCard').classList.add('hidden');
  
  // 显示表单
  const form = document.getElementById('singleDayForm');
  form.classList.remove('hidden');
  
  // 更新日期显示（包含节假日信息）
  const holidayInfo = getHolidayInfo(dateString);
  let dateText = formatDateChinese(dateString);
  if (holidayInfo) {
    dateText += ` ${holidayInfo.full}`;
  }
  document.getElementById('selectedDate').textContent = dateText;
  
  // 检查是否已有记录
  const record = workRecords[dateString];
  
  if (record) {
    // 编辑模式
    document.getElementById('formActions').classList.add('hidden');
    document.getElementById('editActions').classList.remove('hidden');
    
    // 填充数据
    if (record.start_time && record.end_time) {
      document.getElementById('inputRange').checked = true;
      toggleInputMode('range');
      document.getElementById('startTimeInput').value = record.start_time;
      document.getElementById('endTimeInput').value = record.end_time;
      updateCalculatedHours();
    } else {
      document.getElementById('inputDirect').checked = true;
      toggleInputMode('direct');
      document.getElementById('workHours').value = record.hours;
    }
    
    document.getElementById('dailyRate').value = record.hourly_rate;
    document.getElementById('workNotes').value = record.notes || '';
  } else {
    // 新增模式
    document.getElementById('formActions').classList.remove('hidden');
    document.getElementById('editActions').classList.add('hidden');
    
    // 重置表单
    document.getElementById('inputDirect').checked = true;
    toggleInputMode('direct');
    document.getElementById('workHours').value = '';
    document.getElementById('dailyRate').value = currentEmployee.default_hourly_rate;
    document.getElementById('workNotes').value = '';
    document.getElementById('startTimeInput').value = '';
    document.getElementById('endTimeInput').value = '';
  }
}

// 切换输入模式
function toggleInputMode(mode) {
  if (mode === 'direct') {
    document.getElementById('directInputMode').classList.remove('hidden');
    document.getElementById('rangeInputMode').classList.add('hidden');
  } else {
    document.getElementById('directInputMode').classList.add('hidden');
    document.getElementById('rangeInputMode').classList.remove('hidden');
  }
}

// 更新计算工时
function updateCalculatedHours() {
  const startTime = document.getElementById('startTimeInput').value;
  const endTime = document.getElementById('endTimeInput').value;
  
  if (startTime && endTime) {
    const hours = calculateHours(startTime, endTime);
    document.getElementById('calculatedHoursValue').textContent = `${hours}小时`;
    document.getElementById('calculatedHours').classList.remove('hidden');
  } else {
    document.getElementById('calculatedHours').classList.add('hidden');
  }
}

// 更新批量计算工时
function updateBatchCalculatedHours() {
  const startTime = document.getElementById('batchStartTime').value;
  const endTime = document.getElementById('batchEndTime').value;
  
  if (startTime && endTime) {
    const hours = calculateHours(startTime, endTime);
    document.getElementById('batchCalculatedHoursValue').textContent = `${hours}小时`;
    document.getElementById('batchCalculatedHours').classList.remove('hidden');
  } else {
    document.getElementById('batchCalculatedHours').classList.add('hidden');
  }
}

// 切换批量输入模式
function toggleBatchInputMode(mode) {
  if (mode === 'direct') {
    document.getElementById('batchDirectInputMode').classList.remove('hidden');
    document.getElementById('batchRangeInputMode').classList.add('hidden');
  } else {
    document.getElementById('batchDirectInputMode').classList.add('hidden');
    document.getElementById('batchRangeInputMode').classList.remove('hidden');
  }
}

// 保存单日记录
async function saveSingleDayRecord() {
  if (!selectedDate) return;
  
  const inputMethod = document.querySelector('input[name="inputMethod"]:checked').value;
  let hours = 0;
  let startTime = null;
  let endTime = null;
  
  if (inputMethod === 'direct') {
    hours = parseFloat(document.getElementById('workHours').value);
    if (!hours || hours <= 0) {
      showMessage('请输入有效的工作时长');
      return;
    }
  } else {
    startTime = document.getElementById('startTimeInput').value;
    endTime = document.getElementById('endTimeInput').value;
    
    if (!startTime || !endTime) {
      showMessage('请选择开始和结束时间');
      return;
    }
    
    hours = calculateHours(startTime, endTime);
  }
  
  const rate = parseFloat(document.getElementById('dailyRate').value);
  const notes = document.getElementById('workNotes').value.trim();
  
  if (!rate || rate <= 0) {
    showMessage('请输入有效的时薪');
    return;
  }
  
  try {
    // 调用 API 保存记录
    const response = await saveWorkRecord({
      employee_id: currentEmployee.id,
      date: selectedDate,
      hours: hours,
      hourly_rate: rate,
      start_time: startTime,
      end_time: endTime,
      notes: notes
    });
    
    if (response.success) {
      showMessage('保存成功');
      
      // 重新加载工时记录
      await loadWorkRecords(currentEmployee.id);
      renderCalendar();
      
      // 重新选中当前日期以刷新表单
      const dateElement = document.querySelector(`.day[data-date="${selectedDate}"]`);
      if (dateElement) {
        dateElement.classList.add('selected');
        showSingleDayForm(selectedDate);
      }
    } else {
      showMessage('保存失败');
    }
  } catch (error) {
    console.error('保存工时失败:', error);
    showMessage('保存失败，请重试');
  }
}

// 删除记录
async function deleteRecord() {
  if (!selectedDate || !workRecords[selectedDate]) return;
  
  if (!confirmAction('确定要删除这条工时记录吗？')) {
    return;
  }
  
  try {
    const recordId = workRecords[selectedDate].id;
    const response = await deleteWorkRecord(recordId);
    
    if (response.success) {
      showMessage('记录已删除');
      
      // 重新加载工时记录
      await loadWorkRecords(currentEmployee.id);
      renderCalendar();
      clearSelection();
    } else {
      showMessage('删除失败');
    }
  } catch (error) {
    console.error('删除工时失败:', error);
    showMessage('删除失败，请重试');
  }
}

// 清除选择
function clearSelection() {
  selectedDate = null;
  document.querySelectorAll('.day.selected').forEach(el => {
    el.classList.remove('selected');
  });
  
  document.getElementById('singleDayForm').classList.add('hidden');
  document.getElementById('placeholderSection').classList.remove('hidden');
}

// 切换多选模式
function toggleMultiSelectMode() {
  multiSelectMode = !multiSelectMode;
  const btn = document.getElementById('multiSelectBtn');
  
  if (multiSelectMode) {
    btn.classList.add('active');
    clearSelection();
  } else {
    btn.classList.remove('active');
    clearMultiSelection();
  }
}

// 清除多选
function clearMultiSelection() {
  selectedDates.clear();
  document.querySelectorAll('.day.multi-selected').forEach(el => {
    el.classList.remove('multi-selected');
  });
  hideStatistics();
  multiSelectMode = false;
  document.getElementById('multiSelectBtn').classList.remove('active');
}

// 显示统计卡片
function showStatistics() {
  document.getElementById('placeholderSection').classList.add('hidden');
  document.getElementById('singleDayForm').classList.add('hidden');
  document.getElementById('statisticsCard').classList.remove('hidden');
}

// 隐藏统计卡片
function hideStatistics() {
  document.getElementById('statisticsCard').classList.add('hidden');
  document.getElementById('placeholderSection').classList.remove('hidden');
}

// 更新统计数据
async function updateStatistics() {
  const dates = Array.from(selectedDates);
  
  if (dates.length === 0) {
    return;
  }
  
  try {
    const response = await getStatistics(currentEmployee.id, dates);
    
    if (response.success) {
      const stats = response.data;
      document.getElementById('selectedDaysCount').textContent = dates.length;
      document.getElementById('totalHours').textContent = `${stats.total_hours.toFixed(1)}h`;
      document.getElementById('avgHours').textContent = `${stats.average_hours.toFixed(1)}h`;
      document.getElementById('avgRate').textContent = `¥${stats.avg_rate.toFixed(0)}`;
      document.getElementById('totalSalary').textContent = `¥${stats.total_salary.toFixed(0)}`;
    }
  } catch (error) {
    console.error('获取统计失败:', error);
    // 显示默认值
    document.getElementById('selectedDaysCount').textContent = dates.length;
    document.getElementById('totalHours').textContent = '0.0h';
    document.getElementById('avgHours').textContent = '0.0h';
    document.getElementById('avgRate').textContent = '¥0';
    document.getElementById('totalSalary').textContent = '¥0';
  }
}

// 切换月份
async function changeMonth(delta) {
  currentMonth += delta;
  
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  } else if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  
  clearSelection();
  clearMultiSelection();
  
  // 重新加载当前月的工时记录
  await loadWorkRecords(currentEmployee.id);
  renderCalendar();
}

// 打开批量输入 Modal
function openBatchModal() {
  // 生成当月日期列表
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const listHtml = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateString = formatDate(date);
    const weekday = getWeekday(dateString);
    
    // 检查该日期是否已有工时记录
    const hasRecord = !!workRecords[dateString];
    const disabledAttr = hasRecord ? 'disabled' : '';
    const disabledClass = hasRecord ? 'disabled' : '';
    
    listHtml.push(`
      <div class="date-item ${disabledClass}">
        <input type="checkbox" value="${dateString}" id="batch_${dateString}" ${disabledAttr}>
        <label class="date-item-date" for="batch_${dateString}">${dateString}</label>
        <span class="date-item-weekday">${weekday}</span>
      </div>
    `);
  }
  
  document.getElementById('batchDateList').innerHTML = listHtml.join('');
  
  // 绑定复选框事件
  document.querySelectorAll('#batchDateList input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', updateBatchCount);
  });
  
  // 重置表单
  document.getElementById('batchInputDirect').checked = true;
  toggleBatchInputMode('direct');
  document.getElementById('batchWorkHours').value = '';
  document.getElementById('batchStartTime').value = '';
  document.getElementById('batchEndTime').value = '';
  document.getElementById('batchRate').value = currentEmployee.default_hourly_rate;
  document.getElementById('batchNotes').value = '';
  updateBatchCount();
  
  document.getElementById('batchModal').classList.add('active');
}

// 关闭批量输入 Modal
function closeBatchModal() {
  document.getElementById('batchModal').classList.remove('active');
}

// 更新批量选择计数
function updateBatchCount() {
  const count = document.querySelectorAll('#batchDateList input[type="checkbox"]:checked').length;
  document.getElementById('batchSelectedCount').textContent = count;
}

// 批量保存记录
async function saveBatchRecords() {
  const selectedCheckboxes = document.querySelectorAll('#batchDateList input[type="checkbox"]:checked');
  
  if (selectedCheckboxes.length === 0) {
    showMessage('请至少选择一个日期');
    return;
  }
  
  const inputMethod = document.querySelector('input[name="batchInputMethod"]:checked').value;
  let hours = 0;
  let startTime = null;
  let endTime = null;
  
  if (inputMethod === 'direct') {
    hours = parseFloat(document.getElementById('batchWorkHours').value);
    if (!hours || hours <= 0) {
      showMessage('请输入有效的工作时长');
      return;
    }
  } else {
    startTime = document.getElementById('batchStartTime').value;
    endTime = document.getElementById('batchEndTime').value;
    
    if (!startTime || !endTime) {
      showMessage('请选择开始和结束时间');
      return;
    }
    
    hours = calculateHours(startTime, endTime);
  }
  
  const rate = parseFloat(document.getElementById('batchRate').value);
  const notes = document.getElementById('batchNotes').value.trim();
  
  if (!rate || rate <= 0) {
    showMessage('请输入有效的时薪');
    return;
  }
  
  try {
    // 收集所有日期
    const dates = Array.from(selectedCheckboxes).map(cb => cb.value);
    
    // 调用批量保存 API
    const response = await batchSaveWorkRecords({
      employee_id: currentEmployee.id,
      dates: dates,
      hours: hours,
      hourly_rate: rate,
      notes: notes
    });
    
    if (response.success) {
      showMessage(`已为 ${dates.length} 天添加工时记录`);
      
      // 重新加载工时记录
      await loadWorkRecords(currentEmployee.id);
      renderCalendar();
      closeBatchModal();
    } else {
      showMessage('保存失败');
    }
  } catch (error) {
    console.error('批量保存失败:', error);
    showMessage('保存失败，请重试');
  }
}

