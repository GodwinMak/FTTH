const router = require("express").Router()
const {createTask, getTasksByStatus, getTaskInfoById,updateTaskStatus, completeTask,approveTask, getCompletedTasks} = require("../Controller/task.controller")

router.post("/", createTask);
router.get("/getTasksByStatus", getTasksByStatus);
router.get("/report", getCompletedTasks);
router.get("/:id", getTaskInfoById);
router.put("/:id", updateTaskStatus)
router.post("/complete/:id", completeTask);
router.post("/approve/:id", approveTask);

module.exports = router;
