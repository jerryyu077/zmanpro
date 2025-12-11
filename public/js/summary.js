// ==========================================
// 汇总报告页逻辑 (summary.html)
// ==========================================

// 全局变量
let employees = [];
let allRecords = [];
let startDate = null;
let endDate = null;

// 初始化
document.addEventListener('DOMContentLoaded', async function() {
  console.log('汇总报告页已加载');
  
  // 设置默认日期范围（本月）
  setDateRange('month');
  
  // 绑定事件
  bindEvents();
  
  // 加载数据
  await loadAllData();
});

// 绑定事件
function bindEvents() {
  // 日期变化
  document.getElementById('startDate').addEventListener('change', handleDateChange);
  document.getElementById('endDate').addEventListener('change', handleDateChange);
  
  // 快捷选择按钮
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const range = this.dataset.range;
      setDateRange(range);
      
      // 更新按钮状态
      document.querySelectorAll('.quick-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      // 重新渲染
      renderSummary();
    });
  });
  
  // 默认选中"本月"
  document.getElementById('defaultRange').classList.add('active');
}

// 设置日期范围
function setDateRange(range) {
  const today = new Date();
  let start, end;
  
  switch (range) {
    case 'week':
      // 本周（周一到周日）
      const dayOfWeek = today.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      start = new Date(today);
      start.setDate(today.getDate() + diffToMonday);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      break;
      
    case 'month':
      // 本月
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
      
    case 'lastMonth':
      // 上月
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
      
    case 'year':
      // 今年
      start = new Date(today.getFullYear(), 0, 1);
      end = new Date(today.getFullYear(), 11, 31);
      break;
      
    default:
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = today;
  }
  
  startDate = formatDate(start);
  endDate = formatDate(end);
  
  document.getElementById('startDate').value = startDate;
  document.getElementById('endDate').value = endDate;
}

// 日期变化处理
function handleDateChange() {
  startDate = document.getElementById('startDate').value;
  endDate = document.getElementById('endDate').value;
  
  // 清除快捷按钮的选中状态
  document.querySelectorAll('.quick-btn').forEach(b => b.classList.remove('active'));
  
  // 重新渲染
  renderSummary();
}

// 加载所有数据
async function loadAllData() {
  try {
    // 加载员工列表
    const empResponse = await getEmployees();
    if (empResponse.success) {
      employees = empResponse.data;
    }
    
    // 加载所有工时记录
    const recordsResponse = await getSummaryRecords(startDate, endDate);
    if (recordsResponse.success) {
      allRecords = recordsResponse.data;
    }
    
    // 渲染汇总
    renderSummary();
  } catch (error) {
    console.error('加载数据失败:', error);
    showMessage('加载数据失败');
  }
}

// 渲染汇总表格
async function renderSummary() {
  try {
    // 重新获取日期范围内的记录
    const recordsResponse = await getSummaryRecords(startDate, endDate);
    if (recordsResponse.success) {
      allRecords = recordsResponse.data;
    }
  } catch (error) {
    console.error('获取记录失败:', error);
  }
  
  const tbody = document.getElementById('summaryTableBody');
  
  if (!employees || employees.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div>暂无员工数据</div>
          </div>
        </td>
      </tr>
    `;
    updateStats(0, 0, 0);
    return;
  }
  
  // 按员工汇总
  const summaryByEmployee = {};
  
  employees.forEach(emp => {
    summaryByEmployee[emp.id] = {
      id: emp.id,
      name: emp.name,
      location: emp.location || '-',
      default_rate: emp.default_hourly_rate,
      total_hours: 0,
      total_salary: 0,
      record_count: 0
    };
  });
  
  // 统计工时记录
  allRecords.forEach(record => {
    if (summaryByEmployee[record.employee_id]) {
      const emp = summaryByEmployee[record.employee_id];
      emp.total_hours += record.total_hours || 0;
      emp.total_salary += (record.total_hours || 0) * (record.hourly_rate || emp.default_rate);
      emp.record_count++;
    }
  });
  
  // 保持原始顺序（按 created_at ASC，与 index.html 一致）
  // employees 数组已经是按 created_at ASC 排序的
  const summaryList = employees.map(emp => summaryByEmployee[emp.id]).filter(emp => emp);
  
  // 计算总计（只计算有工时的员工）
  let totalEmployeesWithHours = 0;
  let totalHours = 0;
  let totalSalary = 0;
  
  summaryList.forEach(emp => {
    if (emp.total_hours > 0) {
      totalEmployeesWithHours++;
      totalHours += emp.total_hours;
      totalSalary += emp.total_salary;
    }
  });
  
  // 渲染表格行（显示所有员工，包括没有数据的）
  let html = summaryList.map(emp => `
    <tr onclick="window.location.href='calendar?id=${emp.id}'">
      <td class="name-col">${emp.name}</td>
      <td class="location-col">${emp.location}</td>
      <td class="rate-col">¥${emp.default_rate}</td>
      <td class="hours-col">${emp.total_hours > 0 ? emp.total_hours.toFixed(1) + 'h' : '-'}</td>
      <td class="salary-col">${emp.total_salary > 0 ? '¥' + emp.total_salary.toFixed(0) : '-'}</td>
    </tr>
  `).join('');
  
  // 添加合计行
  html += `
    <tr class="total-row">
      <td colspan="3">合计</td>
      <td class="hours-col">${totalHours.toFixed(1)}h</td>
      <td class="salary-col">¥${totalSalary.toFixed(0)}</td>
    </tr>
  `;
  
  tbody.innerHTML = html;
  
  // 更新统计卡片
  updateStats(totalEmployeesWithHours, totalHours, totalSalary);
}

// 更新统计数据
function updateStats(employeeCount, hours, salary) {
  document.getElementById('totalEmployees').textContent = employeeCount;
  document.getElementById('totalHours').textContent = `${hours.toFixed(1)}h`;
  document.getElementById('totalSalary').textContent = `¥${salary.toFixed(0)}`;
}

