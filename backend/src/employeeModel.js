// backend/src/employeeModel.js

const db = require('./db');
const fs = require('fs');
const csvParser = require('csv-parser');

// --- Helper Functions (assuming they exist and remain unchanged) ---

async function createEmployee(data) {
  const { name, email, position, department, photoUrl } = data;
  const result = await db.query(
    `INSERT INTO employees (name, email, position, department, photo_url, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
    [name, email, position, department, photoUrl || null]
  );
  return result.rows[0];
}

async function getEmployeeById(id) {
  const result = await db.query(
    `SELECT id, name, email, position, department, photo_url AS "photoUrl", created_at
     FROM employees WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

async function updateEmployee(id, data) {
  const { name, email, position, department, photoUrl } = data;
  const result = await db.query(
    `UPDATE employees 
     SET name = $1, email = $2, position = $3, department = $4, photo_url = $5
     WHERE id = $6 RETURNING *`,
    [name, email, position, department, photoUrl || null, id]
  );
  return result.rows[0];
}

async function deleteEmployee(id) {
  const result = await db.query(`DELETE FROM employees WHERE id = $1 RETURNING *`, [id]);
  return result.rows[0];
}

// --- Bulk Import (assuming it exists and remains unchanged) ---

async function bulkImportCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      const failedRows = [];
      let rowNumber = 1;

      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => {
          rowNumber++;
          // Clean and validate fields
          const name = row.name?.trim();
          const email = row.email?.trim();
          const position = row.position?.trim();
          const department = row.department?.trim();
          const photoUrl = row.photoUrl?.trim() || null;

          if (!name || !email || !position || !department) {
            failedRows.push({ row: rowNumber, error: 'Missing required fields' });
            return;
          }

          results.push({ name, email, position, department, photoUrl });
        })
        .on('end', async () => {
          if (results.length === 0) {
            return reject(new Error('The uploaded CSV file is empty or contains no valid employee records.'));
          }

          let importedCount = 0;

          for (const emp of results) {
            try {
              await db.query(
                `INSERT INTO employees (name, email, position, department, photo_url, created_at)
                 VALUES ($1,$2,$3,$4,$5,NOW())`,
                [emp.name, emp.email, emp.position, emp.department, emp.photoUrl]
              );
              importedCount++;
            } catch (err) {
              failedRows.push({ row: 'unknown', error: err.message });
            }
          }

          resolve({
            totalRecords: results.length,
            importedCount,
            failedCount: failedRows.length,
            failedRows,
          });
        })
        .on('error', (err) => {
          reject(err);
        })
        .on('close', () => {
          // Clean up the file after processing
          fs.unlink(filePath, (err) => {
            if (err) console.error("Failed to delete temp file:", err);
          });
        });
    });
}


// --- UPDATED getAllEmployees FUNCTION ---

async function getAllEmployees(filters = {}) {
  let query = `
    SELECT id, name, email, position, department, photo_url AS "photoUrl", created_at
    FROM employees
    WHERE 1=1
  `;
  const params = [];

  // NEW: Filter by Name (uses ILIKE for case-insensitive partial matching)
  if (filters.name) {
    params.push(`%${filters.name}%`);
    query += ` AND name ILIKE $${params.length}`;
  }
  
  // NEW: Filter by Email (uses ILIKE for case-insensitive partial matching)
  if (filters.email) {
    params.push(`%${filters.email}%`);
    query += ` AND email ILIKE $${params.length}`;
  }

  // Existing: Filter by Department
  if (filters.department) {
    params.push(`%${filters.department}%`);
    query += ` AND department ILIKE $${params.length}`;
  }

  // Existing: Filter by Position
  if (filters.position) {
    params.push(`%${filters.position}%`);
    query += ` AND position ILIKE $${params.length}`;
  }

  // REMOVED LOGIC: The code block for minId and maxId has been removed.

  // Default sorting
  query += ` ORDER BY created_at DESC`;
  
  const result = await db.query(query, params);
  return result.rows;
}


module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  bulkImportCSV,
};