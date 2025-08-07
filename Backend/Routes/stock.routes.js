const router = require('express').Router();
const {updateStock, getContractorMaterialsStatus, createONT, getOntSerialNumbers, transferStock, getStockAssignments, getStockUsageReport} = require("../Controller/stock.controller")


router.post('/ont/create', createONT);
router.get('/contractor-materials-summary', getContractorMaterialsStatus);
router.post('/update', updateStock);
router.get('/get-ont-serial-numbers', getOntSerialNumbers);
router.post('/transfer', transferStock);
router.get('/assignments', getStockAssignments);
router.get('/usage-report/:id', getStockUsageReport);

module.exports = router;