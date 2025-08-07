const router = require("express").Router()
const {createTask, getTasksByStatus, getTaskInfoById,updateTaskStatus, completeTask,approveTask, getCompletedTasks} = require("../Controller/task.controller")
const uploadImages = require("../middleware/uploadImages");

router.post("/", createTask);
router.get("/getTasksByStatus", getTasksByStatus);
router.get("/report", getCompletedTasks);
router.get("/:id", getTaskInfoById);
router.put("/:id", updateTaskStatus)
router.post("/complete/:id", uploadImages.array("images", 10),completeTask);
router.post("/approve/:id", approveTask);

module.exports = router;
