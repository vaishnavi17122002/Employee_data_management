// backend/src/server.js

// 1. Load environment variables first
require('dotenv').config({ path: '../.env' });

// 2. Import dependencies
const express = require('express');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const db = require('./db');
const employeeModel = require('./employeeModel');
const multer = require('multer'); // For bulk CSV import if needed

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors());
app.use(express.static(path.join(__dirname, '..', 'public'))); // Serve static files
app.use(express.json()); // Parse JSON requests

// --- Rate Limiting ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// --- Validation Schema ---
const employeeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().max(100).required(),
  position: Joi.string().trim().min(2).max(100).required(),
  department: Joi.string().trim().min(2).max(100).required(),
  photoUrl: Joi.string().uri().allow('').allow(null).optional(),
});

// Middleware to validate employee
const validateEmployee = (req, res, next) => {
  const dataToValidate = req.body;
  const { error } = employeeSchema.validate(dataToValidate, { abortEarly: false });

  if (error) {
    const errorDetails = error.details.map(detail => ({
      field: detail.context.key,
      message: detail.message.replace(/['"]/g, ''),
    }));
    return res.status(400).json({ error: 'Validation failed.', details: errorDetails });
  }
  next();
};

// --- API Routes ---
const apiRouter = express.Router();

// GET all employees with filters
// GET all employees with filters
apiRouter.get('/employees', async (req, res, next) => {
  try {
    const { department, position, minId, maxId } = req.query;

    const filters = {
      department: department || null,
      position: position || null,
      minId: minId != null ? parseInt(minId, 10) : null,
      maxId: maxId != null ? parseInt(maxId, 10) : null,
    };

    const employees = await employeeModel.getAllEmployees(filters);
    res.status(200).json(employees);
  } catch (err) {
    next(err);
  }
});


// GET single employee
apiRouter.get('/employees/:id', async (req, res, next) => {
  try {
    const employee = await employeeModel.getEmployeeById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found.' });
    res.status(200).json(employee);
  } catch (err) {
    next(err);
  }
});

// POST new employee
apiRouter.post('/employees', validateEmployee, async (req, res, next) => {
  try {
    const newEmployee = await employeeModel.createEmployee({ ...req.body, photoUrl: req.body.photoUrl || null });
    res.status(201).json(newEmployee);
  } catch (err) {
    next(err);
  }
});

// PUT update employee
apiRouter.put('/employees/:id', validateEmployee, async (req, res, next) => {
  try {
    const updatedEmployee = await employeeModel.updateEmployee(req.params.id, req.body);
    res.status(200).json(updatedEmployee);
  } catch (err) {
    if (err.message.includes('not found')) return res.status(404).json({ error: err.message });
    next(err);
  }
});

// DELETE employee
apiRouter.delete('/employees/:id', async (req, res, next) => {
  try {
    const deletedEmployee = await employeeModel.deleteEmployee(req.params.id);
    if (!deletedEmployee) return res.status(404).json({ error: 'Employee not found.' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// POST bulk import (CSV / JSON)
const upload = multer({ dest: path.join(__dirname, '..', 'public', 'uploads') });
apiRouter.post('/employees/bulk-import', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    const result = await employeeModel.bulkImportCSV(req.file.path);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// Mount API router
app.use('/api', apiRouter);

// --- Error Handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `File Upload Error: ${err.message}` });
  }
  res.status(500).json({
    error: err.message || 'Unexpected server error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// --- Start Server after DB Connection ---
db.pool.connect()
  .then(() => {
    console.log('[Database] PostgreSQL connected successfully.');
    app.listen(PORT, () => {
      console.log(`[Server] Listening on port ${PORT}`);
      console.log(`API URL: http://localhost:${PORT}`);
      console.log(`Photo Storage: /public/uploads`);
    });
  })
  .catch(err => {
    console.error('[Database] Connection Error:', err.stack);
    process.exit(1);
  });
