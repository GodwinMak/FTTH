const db = require("../Models");
const { Op, fn,col, literal } = require("sequelize");

const Task = db.tasks;
const CompletedTasks = db.task_completion;
const Contractors = db.contractors;

exports.getStatus = async (req, res) => {
  try {
    const inProgress = await Task.count({
      where: {
        status: { [Op.in]: ["In Progress", "On Hold"] },
      },
    });

    const inProgressNewInstallations = await Task.count({
        where: {
          status: { [Op.in]: ["In Progress", "On Hold"] },
            task_type: "New Installation",
        },
    })

    const inProgressTroubleshooting = await Task.count({
        where: {
          status: { [Op.in]: ["In Progress", "On Hold"] },
            task_type: { [Op.ne]: "New Installation" },
        },
    })

    const rejected = await Task.count({
      where: {
        status: "Rejected",
      },
    });

    const completedTasksInprogress = await CompletedTasks.count({
      where: {
        status: "In Progress",
      },
    });

    const completedTaskRejected = await CompletedTasks.count({
      where: {
        status: "Rejected",
      },
    });

    // Monthly "In Progress" task count (for MySQL)
    const monthlyCompletedTasksAccepted = await CompletedTasks.findAll({
      attributes: [
        [fn("DATE_FORMAT", col("createdAt"), "%Y-%m"), "month"],
        [fn("COUNT", "*"), "count"],
      ],
      where: {
        status: "Accepted",
      },
      group: [literal("DATE_FORMAT(`createdAt`, '%Y-%m')")],
      order: [[literal("month"), "ASC"]],
    });

    const monthlyCounts = monthlyCompletedTasksAccepted.map((entry) => ({
      month: entry.dataValues.month,
      count: parseInt(entry.dataValues.count),
    }));

    // Count of Accepted CompletedTasks per contractor
    const acceptedPerContractor = await Task.findAll({
      attributes: [
        "contractor_id",
        [fn("COUNT", "*"), "count"],
      ],
      include: [
        {
          model: CompletedTasks,
          where: { status: "Accepted" },
          attributes: [],
        },
        {
          model: Contractors,
          // attributes: ["contractor_company_name"],
        },
      ],
      group: ["contractor_id"],
    });
    
    const acceptedByContractor = acceptedPerContractor.map((entry) => ({
      contractor_id: entry.contractor_id,
      contractor_name: entry.contractor?.contractor_company_name || "Unknown",
      count: parseInt(entry.dataValues.count),
    }));


    // Count of Incomplete tasks per contractor

    const incompletePerContractor = await Task.findAll({
      attributes: [
        "contractor_id",
        [fn("COUNT", "*"), "count"],
      ],
      where: {
        status: { [Op.in]: ["In Progress", "On Hold"] },
      },
      group: ["contractor_id"],
      include: [
        {
          model: Contractors,
          attributes: ["contractor_company_name"],
        },
      ],
    })

    const incompleteByContractor = incompletePerContractor.map((entry) => ({
      contractor_id: entry.contractor_id,
      contractor_name: entry.contractor?.contractor_company_name || "Unknown",
      count: parseInt(entry.dataValues.count),
    }))
    
  
      res.status(200).json({
        inProgress,
        inProgressNewInstallations,
        inProgressTroubleshooting,
        rejected,
        completedTasksInprogress,
        completedTaskRejected,
        monthlyCompletedAccepted: monthlyCounts,
        acceptedByContractor,
        incompleteByContractor
      });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
};

