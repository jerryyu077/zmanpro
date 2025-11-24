// ==========================================
// API 请求封装
// ==========================================

const API_BASE = 'https://zmansys-api.jerryyu077.workers.dev/api';

// API 请求工具函数
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || '请求失败');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ===== 员工管理 API =====

// 获取所有员工
async function getEmployees() {
  return request('/employees');
}

// 获取单个员工
async function getEmployee(id) {
  return request(`/employees/${id}`);
}

// 新增员工
async function createEmployee(data) {
  return request('/employees', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 更新员工
async function updateEmployee(id, data) {
  return request(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// 删除员工
async function deleteEmployee(id) {
  return request(`/employees/${id}`, {
    method: 'DELETE',
  });
}

// ===== 工时记录 API =====

// 获取员工某月工时记录
async function getWorkRecords(employeeId, year, month) {
  return request(`/employees/${employeeId}/records?year=${year}&month=${month}`);
}

// 新增/更新单日工时
async function saveWorkRecord(data) {
  return request('/work-records', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 批量新增工时
async function batchSaveWorkRecords(data) {
  return request('/work-records/batch', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 删除工时记录
async function deleteWorkRecord(id) {
  return request(`/work-records/${id}`, {
    method: 'DELETE',
  });
}

// 多日期统计
async function getStatistics(employeeId, dates) {
  return request('/work-records/statistics', {
    method: 'POST',
    body: JSON.stringify({ employee_id: employeeId, dates }),
  });
}

