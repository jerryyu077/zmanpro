// ==========================================
// 员工列表页逻辑 (index.html)
// ==========================================

// 全局变量
let employees = [];
let currentEditId = null;

// 初始化
document.addEventListener('DOMContentLoaded', async function() {
  console.log('员工列表页已加载');
  
  // 绑定事件
  bindEvents();
  
  // 从 API 加载员工数据
  await loadEmployees();
  
  // 渲染员工列表
  renderEmployees();
});

// 从 API 加载员工数据
async function loadEmployees() {
  try {
    const response = await getEmployees();
    if (response.success) {
      employees = response.data;
    } else {
      showMessage('加载员工数据失败');
      employees = [];
    }
  } catch (error) {
    console.error('加载员工失败:', error);
    showMessage('无法连接到服务器');
    employees = [];
  }
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
  const weeklyHours = employee.weekly_hours || 0;
  const monthlyHours = employee.monthly_hours || 0;
  
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
          <button class="icon-btn delete-btn" data-employee-id="${employee.id}" onclick="event.stopPropagation(); deleteEmployeeWithConfirm(${employee.id})">
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

// 注意：本周/本月工时现在由 API 直接返回，不需要本地计算

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
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('employeeName').value.trim();
  const location = document.getElementById('employeeLocation').value.trim();
  const rate = parseFloat(document.getElementById('employeeRate').value);
  const notes = document.getElementById('employeeNotes').value.trim();
  
  if (!name || !rate || rate <= 0) {
    showMessage('请填写完整的员工信息');
    return;
  }
  
  try {
    if (currentEditId) {
      // 更新员工
      await updateEmployee(currentEditId, {
        name,
        location,
        default_hourly_rate: rate,
        notes
      });
      showMessage('员工信息已更新');
    } else {
      // 新增员工
      await createEmployee({
        name,
        location,
        default_hourly_rate: rate,
        notes
      });
      showMessage('员工添加成功');
    }
    
    // 重新加载员工列表
    await loadEmployees();
    renderEmployees();
    closeModal();
  } catch (error) {
    console.error('保存员工失败:', error);
    showMessage('保存失败，请重试');
  }
}

// 删除员工（需要输入姓名确认）
async function deleteEmployeeWithConfirm(id) {
  const employee = employees.find(e => e.id == id);
  if (!employee) return;
  
  const confirmName = prompt(`请输入员工姓名 "${employee.name}" 以确认删除：`);
  
  if (confirmName !== employee.name) {
    if (confirmName !== null) {
      showMessage('员工姓名不匹配，删除已取消');
    }
    return;
  }
  
  try {
    // 调用 API 删除员工（会自动级联删除工时记录）
    const response = await deleteEmployee(id);
    
    if (response.success) {
      // 重新加载员工列表
      await loadEmployees();
      renderEmployees();
      showMessage('员工已删除');
    } else {
      showMessage('删除失败');
    }
  } catch (error) {
    console.error('删除员工失败:', error);
    showMessage('删除失败，请重试');
  }
}

// 跳转到日历页
function goToCalendar(employeeId) {
  window.location.href = `calendar.html?id=${employeeId}`;
}

