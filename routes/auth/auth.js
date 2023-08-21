const express = require('express') // NodeJS 웹 프레임워크
const loginController = require('../controllers/login');
const registerController = require('../controllers/register');
// const checkController = require('../controllers/check');
// const payController = require('../controllers/pay');
// const chargeController = require('../controllers/charge');
const router = express.Router();

router.post('/register', registerController.register);
router.post('/login', loginController.login);

module.exports = router;