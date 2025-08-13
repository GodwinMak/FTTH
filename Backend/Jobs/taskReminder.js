const cron = require("node-cron");
const { Op } = require("sequelize");

const db = require("../Models");
// const { Task, User } = require("../models"); // adjust path
const sendPushNotification = require("../middleware/sendPushNotification");

const Task = db.tasks
const User = db.users


// Run every 30 minutes
cron.schedule("*/30 * * * *", async () => {
  console.log("⏰ Running task reminder job...");

  const tasks = await Task.findAll({
    where: {
      status: { [Op.in]: ["In Progress"] },
    },
  });

  for (const task of tasks) {
    const contractorUsers = await User.findAll({
      where: {
        contractor_id: task.contractor_id,
        user_type: "contractor",
        pushToken: { [Op.ne]: null },
      },
    });

    for (const contractorUser of contractorUsers) {
      await sendPushNotification(
        contractorUser.pushToken,
        "⏳ Task Reminder",
        `Reminder: Customer ${task.customer_name}  Task type "${task.task_type}" is still in progress.`,
        task
      );
    }
  }
});

