const db = require("../Models");
const { Op, where } = require("sequelize");
const Task = db.tasks;
const Contractors = db.contractors;
const CompletedTasks = db.task_completion;
const ONT = db.onts
const CableStock = db.cable_stocks;
const ATBStock = db.atb_stocks;
const Notes = db.notes;
const PatchCode = db.patches;

exports.createTask = async (req, res) => {
    try {
        const {contractor_id, user_id} = req.body


        const contractor = await Contractors.findOne({where: {id: contractor_id}});

        if (!contractor) {
            return res.status(404).json({message: "Contractor not found"});
        }

        const user = await db.users.findOne({where: {id: user_id}});
        if (!user) {    
                return res.status(404).json({message: "User not found"});
        }
        const task = await Task.create(req.body);

        // Create a note for the task creation
        const note = await Notes.create({
            note_text: `Task created by ${user.full_name}  and was Assigned to ${contractor.contractor_company_name}`,
            task_id: task.id,
            user_id: user_id,
            status: "In Progress"
        })

        res.status(201).json({message: "Task created successfully", task, note});
    } catch (err) {
        console.log(err)
        res.status(500).send({message: err.message});
        
    }
}

exports.getTasksByStatus = async (req, res) => {
    const { status } = req.query;

    if (!status) {
        return res.status(400).json({ message: "Status is required" });
    }

    try {
        let tasks;

        if (status === 'Closed') {
            // Query completed tasks
            tasks = await Task.findAll({
                where: { status },
                include: [
                    {
                    model: CompletedTasks,
                    where: { status: 'In progress' },
                },
                {
                    model: Contractors,
                    attributes: ['contractor_company_name'],
                }
            ]
            });
        } else if (status === 'notRejected') {
            tasks = await Task.findAll({
                where: {
                    status: { [Op.in]: ["In Progress", "On Hold"] }
                },
                include: [{
                    model: Contractors,
                    attributes: ['contractor_company_name'],
                }]
            })
        }
        else if (status === 'Rejected') {
            tasks = await Task.findAll({
                where: { status: "Rejected" },
                include: [{
                    model: Contractors,
                    attributes: ['contractor_company_name'],
                }]
            });
        }
        res.status(200).json({ message: "Tasks fetched successfully", tasks });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
};

exports.getTaskInfoById = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findOne({
            where: { id },
            include: [
                {
                    model: Contractors,
                    attributes: ['contractor_company_name']
                },
                {
                    model: Notes,
                    include: [
                        {
                            model: User,
                            attributes: ['full_name']
                        }
                    ]
                },
                {
                    model: TaskCompletion, // Include if exists
                    required: false // makes it optional
                }
            ]
        });

        res.status(200).json(task);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
};


exports.updateTaskStatus = async (req, res) => {
    const { id } = req.params;
    const { status, note_text, user_id } = req.body;

    const validStatuses = ["On Hold", "Rejected"];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    try {
        const task = await Task.findByPk(id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Update status
        task.status = status;
        await task.save();
        // Create a note for the status update
        const note = await Notes.create({
            note_text: note_text,
            task_id: task.id,
            user_id: user_id,
            status: status
        });


        res.status(200).json({ message: `Task status updated to ${status}`, task, note });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
};

exports.completeTask = async (req, res) => {
    const {
        task_id,
        serial_number,
        no_sleeve,
        cable_type,
        cable_length,
        no_atb,
        comments,
        user_id,
        task_type,
        patchCode
    } = req.body;
    try {
        const task = await Task.findByPk(task_id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }


        // Check if already completed
        const existingCompletion = await CompletedTasks.findOne({ where: { task_id } });
        if (existingCompletion) {
            return res.status(400).json({ message: "Task already completed" });
        }



        // Create completion record
        const completedTask = await CompletedTasks.create({
            task_id,
            serial_number,
            no_sleeve,
            cable_type,
            cable_length,
            no_atb,
            comments,
            task_type,
            no_patch_cords: patchCode
        });
        
        // Update the main task status to Closed
        task.status = "Closed";
        await task.save();
        // Create a note for the status update
        await Notes.create({
            note_text: comments,
            task_id: task.id,
            user_id: user_id,
            status: "Closed"
        });
         // If serial_number is provided, update ONT
         if (serial_number) {
            const ont = await ONT.findOne({ where: { serial_number } });
            if (ont) {
                ont.status = 'installed';
                ont.task_id = task_id;
                completedTask.no_ont =  1;
                await ont.save();
            }
        }

        const contractor_id = task.contractor_id
        // Reduce cable from stock
        if (cable_type && cable_length) {
            const stock = await CableStock.findOne({ where: {contractor_id, cable_type } });
            console.log(stock)
            if (stock && stock.quantity >= cable_length) {
                stock.quantity -= cable_length;
                await stock.save();
            } else {
                return res.status(400).json({ message: "Insufficient cable stock" });
            }
        }

        // Reduce ATB stock
        if (no_atb) {
            const atbStock = await ATBStock.findOne({ where: {contractor_id } });
            if (atbStock && atbStock.quantity >= no_atb) {
                atbStock.quantity -= no_atb;
                await atbStock.save();
            } else {
                return res.status(400).json({ message: "Insufficient ATB stock" });
            }
        }

        // Reduce Patch Code stock
        if (patchCode) {
            const patchStock = await PatchCode.findOne({ where: { contractor_id} });
            if (patchStock && patchStock.quantity >= 1) {
                patchStock.quantity -= patchCode;
                await patchStock.save();
            } else {
                return res.status(400).json({ message: "Insufficient Patch Code stock" });
            }
        }

        res.status(201).json({ message: "Task completed successfully", completedTask });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
};


exports.approveTask = async (req, res) => {
    try {
        const {id} = req.params;
        const {status} = req.body;

        console.log(status)

        const task_completion = await CompletedTasks.findByPk(id);

        if (!task_completion) {
            return res.status(404).json({ message: "Task completion not found" });
        }

        if (task_completion.status === "Accepted" || task_completion.status === "Rejected") {
            return res.status(400).json({ message: "Task completion is not in progress" });
        }
        // Update the task status to Closed

        await task_completion.update({ status: status});

        res.status(200).json({ message: `Task completion status updated to ${status}`});
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
}


exports.getCompletedTasks = async (req, res) => {
    try {
        
        const tasks = await Task.findAll({
            where: { status: "Closed" },
            include: [
                {
                    model: CompletedTasks,
                    where: { status: 'Accepted' },
                },
                {
                    model: Contractors,
                    attributes: ['contractor_company_name'],
                }
            ]
        })

        res.status(200).json({ message: "Tasks fetched successfully", tasks });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
};