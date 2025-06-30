const router = require('express').Router();
const {updateStock, getContractorMaterialsStatus, createONT, getOntSerialNumbers} = require("../Controller/stock.controller")


router.post('/create-ont', createONT);
router.get('/contractor-materials-summary', getContractorMaterialsStatus);
router.post('/update', updateStock);
router.get('/get-ont-serial-numbers', getOntSerialNumbers);

module.exports = router;