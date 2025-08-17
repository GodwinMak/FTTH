const router = require("express").Router()
const {createTask, getTasksByStatus, getTaskInfoById,updateTaskStatus, completeTask,approveTask, getCompletedTasks, getTaksByContractorId, taskTransfer, deleteTask} = require("../Controller/task.controller")
const uploadImages = require("../middleware/uploadImages");

router.post("/", createTask);
router.get("/getTasksByStatus/", getTasksByStatus);
router.get("/getTasksByContractorId/:id", getTaksByContractorId)
router.get("/report", getCompletedTasks);
router.get("/:id", getTaskInfoById);
router.post("/:id", updateTaskStatus)
router.post("/complete/:id", uploadImages.array("images", 10),completeTask);
router.post("/transfer/:id", taskTransfer);
router.post("/approve/:id", approveTask);
router.delete("/:id", deleteTask);

module.exports = router;
