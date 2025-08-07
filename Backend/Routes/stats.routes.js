const {getStatus, getStatusCount} = require("../Controller/stats.controller")
const router = require("express").Router()


router.get("/", getStatus);
router.get("/count/:id", getStatusCount);


module.exports = router;