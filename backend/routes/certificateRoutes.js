const express = require('express');
const auth = require('../middleware/authMiddleware');
const certificateCtrl = require('../controllers/certificateController');

const router = express.Router();

// GET /certificates/module/:moduleId -> Authenticated: Get or issue certificate for a completed module
router.get('/module/:moduleId', auth, certificateCtrl.getOrIssueCertificate);

// GET /certificates/verify/:certCode -> Public: Verify any certificate by its unique code
router.get('/verify/:certCode', certificateCtrl.verifyCertificate);

module.exports = router;
