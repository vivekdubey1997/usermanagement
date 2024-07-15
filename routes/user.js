const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')

router.post('/assignrole', userController.assignRole);
router.patch('/updatemenus', userController.updateMenus);
router.get('/:id',userController.getById)

module.exports = router;
