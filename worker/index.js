// ==========================================
// Cloudflare Workers API
// 员工工时管理系统后端
// ==========================================

/**
 * CORS 响应头
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * 处理 CORS 预检请求
 */
function handleOptions(request) {
  return new Response(null, {
    headers: corsHeaders,
  });
}

/**
 * 返回 JSON 响应
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

/**
 * 错误响应
 */
function errorResponse(message, status = 400) {
  return jsonResponse({ success: false, message }, status);
}

/**
 * 主处理函数
 */
export default {
  async fetch(request, env) {
    // 处理 OPTIONS 请求
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      // ===== 员工管理 API =====
      
      // GET /api/employees - 获取所有员工
      if (path === '/api/employees' && method === 'GET') {
        return await getEmployees(env);
      }

      // GET /api/employees/:id - 获取单个员工
      if (path.match(/^\/api\/employees\/\d+$/) && method === 'GET') {
        const id = path.split('/')[3];
        return await getEmployee(env, id);
      }

      // POST /api/employees - 新增员工
      if (path === '/api/employees' && method === 'POST') {
        const body = await request.json();
        return await createEmployee(env, body);
      }

      // PUT /api/employees/:id - 更新员工
      if (path.match(/^\/api\/employees\/\d+$/) && method === 'PUT') {
        const id = path.split('/')[3];
        const body = await request.json();
        return await updateEmployee(env, id, body);
      }

      // DELETE /api/employees/:id - 删除员工
      if (path.match(/^\/api\/employees\/\d+$/) && method === 'DELETE') {
        const id = path.split('/')[3];
        return await deleteEmployee(env, id);
      }

      // ===== 工时记录 API =====

      // GET /api/employees/:id/records - 获取员工某月工时记录
      if (path.match(/^\/api\/employees\/\d+\/records$/) && method === 'GET') {
        const id = path.split('/')[3];
        const year = url.searchParams.get('year');
        const month = url.searchParams.get('month');
        return await getWorkRecords(env, id, year, month);
      }

      // POST /api/work-records - 新增/更新单日工时
      if (path === '/api/work-records' && method === 'POST') {
        const body = await request.json();
        return await saveWorkRecord(env, body);
      }

      // POST /api/work-records/batch - 批量新增工时
      if (path === '/api/work-records/batch' && method === 'POST') {
        const body = await request.json();
        return await batchSaveWorkRecords(env, body);
      }

      // DELETE /api/work-records/:id - 删除工时记录
      if (path.match(/^\/api\/work-records\/\d+$/) && method === 'DELETE') {
        const id = path.split('/')[3];
        return await deleteWorkRecord(env, id);
      }

      // POST /api/work-records/statistics - 多日期统计
      if (path === '/api/work-records/statistics' && method === 'POST') {
        const body = await request.json();
        return await getStatistics(env, body);
      }

      // GET /api/work-records/summary - 获取日期范围内所有员工的工时记录（汇总报告用）
      if (path === '/api/work-records/summary' && method === 'GET') {
        const startDate = url.searchParams.get('start');
        const endDate = url.searchParams.get('end');
        return await getSummaryRecords(env, startDate, endDate);
      }

      // 404
      return errorResponse('API endpoint not found', 404);

    } catch (error) {
      console.error('API Error:', error);
      return errorResponse(error.message || 'Internal server error', 500);
    }
  },
};

// ==========================================
// 员工管理函数
// ==========================================

/**
 * 获取所有员工（包含本周/本月工时统计）
 */
async function getEmployees(env) {
  const { results } = await env.DB.prepare(`
    SELECT id, name, location, default_hourly_rate, notes, created_at
    FROM employees
    ORDER BY created_at ASC
  `).all();

  // 计算每个员工的本周/本月工时
  const today = new Date().toISOString().split('T')[0];
  const weekStart = getWeekStart();
  const monthStart = getMonthStart();

  for (let employee of results) {
    // 本周工时
    const { weekly_hours } = await env.DB.prepare(`
      SELECT COALESCE(SUM(hours), 0) as weekly_hours
      FROM work_records
      WHERE employee_id = ? AND date >= ? AND date <= ?
    `).bind(employee.id, weekStart, today).first();

    // 本月工时
    const { monthly_hours } = await env.DB.prepare(`
      SELECT COALESCE(SUM(hours), 0) as monthly_hours
      FROM work_records
      WHERE employee_id = ? AND date >= ? AND date <= ?
    `).bind(employee.id, monthStart, today).first();

    employee.weekly_hours = weekly_hours || 0;
    employee.monthly_hours = monthly_hours || 0;
  }

  return jsonResponse({ success: true, data: results });
}

/**
 * 获取单个员工
 */
async function getEmployee(env, id) {
  const employee = await env.DB.prepare(`
    SELECT * FROM employees WHERE id = ?
  `).bind(id).first();

  if (!employee) {
    return errorResponse('Employee not found', 404);
  }

  return jsonResponse({ success: true, data: employee });
}

/**
 * 新增员工
 */
async function createEmployee(env, data) {
  const { name, location, default_hourly_rate, notes } = data;

  if (!name || !default_hourly_rate) {
    return errorResponse('Name and default_hourly_rate are required');
  }

  const result = await env.DB.prepare(`
    INSERT INTO employees (name, location, default_hourly_rate, notes)
    VALUES (?, ?, ?, ?)
  `).bind(name, location, default_hourly_rate, notes).run();

  return jsonResponse({ 
    success: true, 
    data: { id: result.meta.last_row_id },
    message: 'Employee created successfully'
  }, 201);
}

/**
 * 更新员工
 */
async function updateEmployee(env, id, data) {
  const { name, location, default_hourly_rate, notes } = data;

  await env.DB.prepare(`
    UPDATE employees
    SET name = ?, location = ?, default_hourly_rate = ?, notes = ?
    WHERE id = ?
  `).bind(name, location, default_hourly_rate, notes, id).run();

  return jsonResponse({ 
    success: true, 
    message: 'Employee updated successfully'
  });
}

/**
 * 删除员工（级联删除工时记录）
 */
async function deleteEmployee(env, id) {
  await env.DB.prepare(`
    DELETE FROM employees WHERE id = ?
  `).bind(id).run();

  return jsonResponse({ 
    success: true, 
    message: 'Employee deleted successfully'
  });
}

// ==========================================
// 工时记录函数
// ==========================================

/**
 * 获取员工某月工时记录
 */
async function getWorkRecords(env, employeeId, year, month) {
  // 获取员工信息
  const employee = await env.DB.prepare(`
    SELECT id, name, default_hourly_rate FROM employees WHERE id = ?
  `).bind(employeeId).first();

  if (!employee) {
    return errorResponse('Employee not found', 404);
  }

  // 构建日期范围
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

  // 获取工时记录
  const { results } = await env.DB.prepare(`
    SELECT * FROM work_records
    WHERE employee_id = ? AND date >= ? AND date <= ?
    ORDER BY date ASC
  `).bind(employeeId, startDate, endDate).all();

  return jsonResponse({
    success: true,
    data: {
      employee,
      records: results
    }
  });
}

/**
 * 新增/更新单日工时（UPSERT）
 */
async function saveWorkRecord(env, data) {
  const { employee_id, date, hours, hourly_rate, start_time, end_time, notes } = data;

  if (!employee_id || !date || !hours || !hourly_rate) {
    return errorResponse('Required fields: employee_id, date, hours, hourly_rate');
  }

  // 使用 INSERT OR REPLACE 实现 UPSERT
  await env.DB.prepare(`
    INSERT INTO work_records (employee_id, date, hours, hourly_rate, start_time, end_time, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(employee_id, date)
    DO UPDATE SET 
      hours = excluded.hours,
      hourly_rate = excluded.hourly_rate,
      start_time = excluded.start_time,
      end_time = excluded.end_time,
      notes = excluded.notes,
      updated_at = datetime('now', 'localtime')
  `).bind(employee_id, date, hours, hourly_rate, start_time, end_time, notes).run();

  return jsonResponse({ 
    success: true, 
    message: 'Work record saved successfully'
  });
}

/**
 * 批量新增工时
 */
async function batchSaveWorkRecords(env, data) {
  const { employee_id, dates, hours, hourly_rate, notes } = data;

  if (!employee_id || !dates || !Array.isArray(dates) || !hours || !hourly_rate) {
    return errorResponse('Required fields: employee_id, dates (array), hours, hourly_rate');
  }

  // 使用事务批量插入
  const statements = dates.map(date => 
    env.DB.prepare(`
      INSERT INTO work_records (employee_id, date, hours, hourly_rate, notes)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(employee_id, date)
      DO UPDATE SET 
        hours = excluded.hours,
        hourly_rate = excluded.hourly_rate,
        notes = excluded.notes,
        updated_at = datetime('now', 'localtime')
    `).bind(employee_id, date, hours, hourly_rate, notes)
  );

  await env.DB.batch(statements);

  return jsonResponse({ 
    success: true, 
    message: `${dates.length} work records saved successfully`
  });
}

/**
 * 删除工时记录
 */
async function deleteWorkRecord(env, id) {
  await env.DB.prepare(`
    DELETE FROM work_records WHERE id = ?
  `).bind(id).run();

  return jsonResponse({ 
    success: true, 
    message: 'Work record deleted successfully'
  });
}

/**
 * 多日期统计
 */
async function getStatistics(env, data) {
  const { employee_id, dates } = data;

  if (!employee_id || !dates || !Array.isArray(dates)) {
    return errorResponse('Required fields: employee_id, dates (array)');
  }

  // 构建 IN 查询
  const placeholders = dates.map(() => '?').join(',');
  const query = `
    SELECT 
      COUNT(*) as valid_days,
      COALESCE(SUM(hours), 0) as total_hours,
      COALESCE(SUM(hours * hourly_rate), 0) as total_salary,
      COALESCE(AVG(hourly_rate), 0) as avg_rate
    FROM work_records
    WHERE employee_id = ? AND date IN (${placeholders})
  `;

  const result = await env.DB.prepare(query)
    .bind(employee_id, ...dates)
    .first();

  const avgHours = result.valid_days > 0 ? result.total_hours / result.valid_days : 0;

  return jsonResponse({
    success: true,
    data: {
      total_hours: result.total_hours,
      average_hours: avgHours,
      total_days: dates.length,
      valid_days: result.valid_days,
      total_salary: result.total_salary,
      avg_rate: result.avg_rate
    }
  });
}

/**
 * 获取日期范围内所有员工的工时记录（汇总报告用）
 */
async function getSummaryRecords(env, startDate, endDate) {
  if (!startDate || !endDate) {
    return errorResponse('Required params: start, end');
  }

  // 获取日期范围内的所有工时记录
  const { results } = await env.DB.prepare(`
    SELECT 
      wr.id,
      wr.employee_id,
      wr.date,
      wr.hours as total_hours,
      wr.hourly_rate,
      wr.notes,
      e.name as employee_name,
      e.location as employee_location
    FROM work_records wr
    JOIN employees e ON wr.employee_id = e.id
    WHERE wr.date >= ? AND wr.date <= ?
    ORDER BY wr.date ASC
  `).bind(startDate, endDate).all();

  return jsonResponse({
    success: true,
    data: results
  });
}

// ==========================================
// 工具函数
// ==========================================

/**
 * 获取本周第一天（周一）YYYY-MM-DD
 */
function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

/**
 * 获取本月第一天 YYYY-MM-DD
 */
function getMonthStart() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

