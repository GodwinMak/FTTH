const router = require("express").Router()
const { create, login, getAll, updateById, deleteById } = require("../Controller/user.controller");

router.post("/", create);
router.post("/login", login)
router.get("/", getAll);
router.put("/:id", updateById)
router.delete("/:id", deleteById)

module.exports = router;