const router = require("express").Router()
const {create, getAll, updateById, deleteById, getById } = require("../Controller/contractor.controller");


router.post("/", create);
router.get("/", getAll);
router.get("/:id", getById);
router.put("/:id", updateById);
router.delete("/:id", deleteById);


module.exports = router;