const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');

router.post('/create', roleController.createRole);
router.put('/update/:id', roleController.updateRole);
router.get('/', roleController.getAllRoles);

module.exports = router;
