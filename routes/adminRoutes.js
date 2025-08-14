const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');


router.get('/stats', adminController.getAdminStats);
router.get('/users', adminController.getAllUsers);
router.patch('/user/:id/role', adminController.updateUser);
router.delete('/user/:id', adminController.deleteUser);

router.get('/events', adminController.getAllEvents);
// router.patch('/event/:id', adminController.updateEvent);
router.delete('/event/:id', adminController.deleteEvent);

module.exports = router;
