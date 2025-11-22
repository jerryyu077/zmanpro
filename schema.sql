-- ==========================================
-- 员工工时管理系统 - 数据库结构
-- Cloudflare D1 SQLite Database
-- ==========================================

-- 1. 员工表
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,                         -- 员工姓名
    location TEXT,                              -- 工作地点/代码
    default_hourly_rate REAL NOT NULL,          -- 默认时薪
    notes TEXT,                                 -- 备注
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 2. 工时记录表
CREATE TABLE IF NOT EXISTS work_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,               -- 关联员工 ID
    date TEXT NOT NULL,                         -- 工作日期 YYYY-MM-DD
    hours REAL NOT NULL,                        -- 工作时长（小时）
    hourly_rate REAL NOT NULL,                  -- 当天时薪
    start_time TEXT,                            -- 开始时间 HH:MM（可选）
    end_time TEXT,                              -- 结束时间 HH:MM（可选）
    notes TEXT,                                 -- 备注
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE(employee_id, date)                   -- 每人每天只能有一条记录
);

-- 3. 索引优化
CREATE INDEX IF NOT EXISTS idx_work_records_employee_date 
ON work_records(employee_id, date);

CREATE INDEX IF NOT EXISTS idx_work_records_date 
ON work_records(date);

-- 4. 触发器：自动更新 updated_at
CREATE TRIGGER IF NOT EXISTS update_employees_timestamp 
AFTER UPDATE ON employees
BEGIN
    UPDATE employees SET updated_at = datetime('now', 'localtime') 
    WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_work_records_timestamp 
AFTER UPDATE ON work_records
BEGIN
    UPDATE work_records SET updated_at = datetime('now', 'localtime') 
    WHERE id = NEW.id;
END;

-- 5. 示例数据（可选，用于测试）
-- INSERT INTO employees (name, location, default_hourly_rate, notes) 
-- VALUES ('的吧', 'cn', 20, 'q');

