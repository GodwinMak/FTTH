const {getStatus} = require("../Controller/stats.controller")
const router = require("express").Router()


router.get("/", getStatus);


module.exports = router;