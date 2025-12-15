// src/routes/orderRoutes.js

const express = require('express');
const router = express.Router();

// Import Controller
const orderController = require('../controllers/orderController');

// PENTING: Import middleware
const { verifyAdmin, authorizeRoles } = require('../middleware/authMiddleware');

const OPERATIONAL_ROLES = ['SuperAdmin', 'editor'];
const SUPERADMIN_ROLE = ['SuperAdmin'];

// All routes require admin auth
router.use(verifyAdmin);

// GET /api/v1/admin/orders - Get all orders
router.get('/', authorizeRoles(...OPERATIONAL_ROLES), orderController.getAllOrders);

// GET /api/v1/admin/orders/:id - Get order by ID
router.get('/:id', authorizeRoles(...OPERATIONAL_ROLES), orderController.getOrderById);

// POST /api/v1/admin/orders - Create new order
router.post('/', orderController.validateCreateOrder, authorizeRoles(...OPERATIONAL_ROLES), orderController.createOrder);

// PUT /api/v1/admin/orders/:id - Update order
router.put('/:id', authorizeRoles(...OPERATIONAL_ROLES), orderController.updateOrder);

// DELETE /api/v1/admin/orders/:id - Delete order
router.delete('/:id', authorizeRoles(...SUPERADMIN_ROLE), orderController.deleteOrder);

// GET /api/v1/admin/orders/export/excel - Export to Excel
router.get('/export/excel', authorizeRoles(...OPERATIONAL_ROLES), orderController.exportOrdersToExcel);

module.exports = router;