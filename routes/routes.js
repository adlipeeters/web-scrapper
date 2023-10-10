const express = require('express');
const scrappingController = require('../controllers/scrappingController');

const router = express.Router();

router.post('/', scrappingController.scrapeWebsite);

module.exports = router;