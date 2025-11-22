// ==========================================
// 员工列表页逻辑 (index.html)
// ==========================================

// 全局变量
let employees = [];
let currentEditId = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  console.log('员工列表页已加载');
  
  // 加载员工数据
  loadEmployees();
  
  // 绑定事件
  bindEvents();
  
  // 渲染员工列表
  renderEmployees();
});

// 从 localStorage 加载员工数据
function loadEmployees() {
  const data = localStorage.getItem('employees');
  if (data) {
    employees = JSON.parse(data);
  } else {
    // 初始化示例数据
    employees = [
      {
        id: 1,
        name: '的吧',
        location: 'cn',
        default_hourly_rate: 20,
        notes: 'q',
        created_at: new Date().toISOString()
      }
    ];
    saveEmployees();
  }
}

// 保存员工数据到 localStorage
function saveEmployees() {
  localStorage.setItem('employees', JSON.stringify(employees));
}

// 绑定事件
function bindEvents() {
  // 搜索功能（防抖）
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', debounce(function(e) {
    renderEmployees(e.target.value);
  }, 300));
  
  // 添加员工按钮
  document.getElementById('addEmployeeBtn').addEventListener('click', openAddModal);
  
  // 关闭 Modal
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('employeeModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });
  
  // 表单提交
  document.getElementById('employeeForm').addEventListener('submit', handleFormSubmit);
}

// 渲染员工列表
function renderEmployees(searchQuery = '') {
  const container = document.getElementById('employeeList');
  
  // 过滤员工
  let filteredEmployees = employees;
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredEmployees = employees.filter(emp => 
      emp.name.toLowerCase().includes(query) ||
      (emp.location && emp.location.toLowerCase().includes(query)) ||
      (emp.notes && emp.notes.toLowerCase().includes(query))
    );
  }
  
  // 渲染
  if (filteredEmployees.length === 0) {
    container.innerHTML = '<div class="placeholder-text" style="grid-column: 1/-1;">暂无员工数据</div>';
    return;
  }
  
  container.innerHTML = filteredEmployees.map(emp => createEmployeeCard(emp)).join('');
  
  // 绑定卡片事件
  bindCardEvents();
}

// 创建员工卡片 HTML
function createEmployeeCard(employee) {
  const weeklyHours = calculateWeeklyHours(employee.id);
  const monthlyHours = calculateMonthlyHours(employee.id);
  
  return `
    <div class="employee-card" data-employee-id="${employee.id}">
      <div class="employee-card-header">
        <div class="employee-info">
          <div class="employee-name">${employee.name}</div>
          <div class="employee-location">${employee.location || ''}</div>
          <div class="employee-rate">
            <span>时薪</span>
            <span class="employee-rate-value">¥${employee.default_hourly_rate}</span>
          </div>
        </div>
      </div>

      <div class="hours-stats">
        <div class="stat-card">
          <div class="stat-label">本周</div>
          <div class="stat-value">${formatHours(weeklyHours)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">本月</div>
          <div class="stat-value">${formatHours(monthlyHours)}</div>
        </div>
      </div>

      <div class="employee-card-footer">
        <div class="employee-note">${employee.notes || ''}</div>
        <div class="card-actions">
          <button class="icon-btn edit-btn" data-employee-id="${employee.id}" onclick="event.stopPropagation(); editEmployee(${employee.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="icon-btn delete-btn" data-employee-id="${employee.id}" onclick="event.stopPropagation(); deleteEmployee(${employee.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

// 绑定卡片点击事件
function bindCardEvents() {
  document.querySelectorAll('.employee-card').forEach(card => {
    card.addEventListener('click', function() {
      const employeeId = this.dataset.employeeId;
      goToCalendar(employeeId);
    });
  });
}

// 计算本周工时
function calculateWeeklyHours(employeeId) {
  const records = getWorkRecords(employeeId);
  const weekStart = formatDate(getWeekStart());
  const today = formatDate(new Date());
  
  return records
    .filter(r => {
      return r.date >= weekStart && r.date <= today;
    })
    .reduce((sum, r) => sum + r.hours, 0);
}

// 计算本月工时
function calculateMonthlyHours(employeeId) {
  const records = getWorkRecords(employeeId);
  const monthStart = formatDate(getMonthStart());
  const today = formatDate(new Date());
  
  return records
    .filter(r => {
      return r.date >= monthStart && r.date <= today;
    })
    .reduce((sum, r) => sum + r.hours, 0);
}

// 获取工时记录（从 localStorage）
function getWorkRecords(employeeId) {
  const data = localStorage.getItem(`work_records_${employeeId}`);
  return data ? JSON.parse(data) : [];
}

// 打开添加员工 Modal
function openAddModal() {
  currentEditId = null;
  document.getElementById('modalTitle').textContent = '添加员工';
  document.getElementById('employeeForm').reset();
  document.getElementById('employeeModal').classList.add('active');
}

// 打开编辑员工 Modal
function editEmployee(id) {
  currentEditId = id;
  const employee = employees.find(e => e.id === id);
  if (!employee) return;
  
  document.getElementById('modalTitle').textContent = '编辑员工';
  document.getElementById('employeeName').value = employee.name;
  document.getElementById('employeeLocation').value = employee.location || '';
  document.getElementById('employeeRate').value = employee.default_hourly_rate;
  document.getElementById('employeeNotes').value = employee.notes || '';
  document.getElementById('employeeModal').classList.add('active');
}

// 关闭 Modal
function closeModal() {
  document.getElementById('employeeModal').classList.remove('active');
  currentEditId = null;
  document.getElementById('employeeForm').reset();
}

// 处理表单提交
function handleFormSubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('employeeName').value.trim();
  const location = document.getElementById('employeeLocation').value.trim();
  const rate = parseFloat(document.getElementById('employeeRate').value);
  const notes = document.getElementById('employeeNotes').value.trim();
  
  if (!name || !rate || rate <= 0) {
    showMessage('请填写完整的员工信息');
    return;
  }
  
  if (currentEditId) {
    // 更新员工
    const employee = employees.find(e => e.id === currentEditId);
    if (employee) {
      employee.name = name;
      employee.location = location;
      employee.default_hourly_rate = rate;
      employee.notes = notes;
      employee.updated_at = new Date().toISOString();
    }
  } else {
    // 新增员工
    const newEmployee = {
      id: Date.now(),
      name,
      location,
      default_hourly_rate: rate,
      notes,
      created_at: new Date().toISOString()
    };
    employees.push(newEmployee);
  }
  
  saveEmployees();
  renderEmployees();
  closeModal();
  showMessage(currentEditId ? '员工信息已更新' : '员工添加成功');
}

// 删除员工（需要输入姓名确认）
function deleteEmployee(id) {
  const employee = employees.find(e => e.id === id);
  if (!employee) return;
  
  const confirmName = prompt(`请输入员工姓名 "${employee.name}" 以确认删除：`);
  
  if (confirmName !== employee.name) {
    if (confirmName !== null) {
      showMessage('员工姓名不匹配，删除已取消');
    }
    return;
  }
  
  // 删除员工
  employees = employees.filter(e => e.id !== id);
  saveEmployees();
  
  // 同时删除工时记录
  localStorage.removeItem(`work_records_${id}`);
  
  renderEmployees();
  showMessage('员工已删除');
}

// 跳转到日历页
function goToCalendar(employeeId) {
  window.location.href = `calendar.html?id=${employeeId}`;
}

