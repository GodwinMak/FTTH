const db = require("../Models");
const { Op } = require("sequelize");

const Ont = db.onts;
const Atb = db.atb_stocks;
const Cable = db.cable_stocks;
const PatchCode = db.patches;
const Contractor = db.contractors;
const StockAssignment = db.stock_assignment;
const TaskCompletion = db.task_completion;
const Task = db.tasks

exports.createONT = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { contractor_id, serial_number, model_number } = req.body;

    const currentCount = await Ont.count({ where: { contractor_id } });

    const minAllowed = 5;

    if (currentCount >= minAllowed) {
      await transaction.rollback();
      return res.status(400).json({
        message: `Contractor already has ${minAllowed} ONTs assigned.`,
      });
    }

    if (
      !contractor_id ||
      !Array.isArray(serial_number) ||
      serial_number.length === 0
    ) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ message: "Missing contractor or serial numbers." });
    }

    const trimmedSerials = serial_number.map((sn) => sn.trim());

    const existingONTs = await Ont.findAll({
      where: {
        serial_number: trimmedSerials,
      },
      attributes: ["serial_number"],
    });

    const existingSet = new Set(existingONTs.map((o) => o.serial_number));

    const newSerials = trimmedSerials.filter((sn) => !existingSet.has(sn));

    if (newSerials.length === 0) {
      await transaction.rollback();
      return res.status(409).json({ message: "All ONTs already exist." });
    }

    // Step 1: Create StockAssignment records first
    const stockAsssigment = await StockAssignment.create(
      {
        contractor_id,
        item_type: "ONT",
        item_value: model_number,
        quantity: newSerials.length.toString(), // <-- just the count as a string
        source: "RAHA",
      },
      { transaction }
    );

    // Step 2: Create corresponding ONT records and link them with stock_assignment_id
    const ontsToCreate = newSerials.map((assignment, index) => ({
      serial_number: newSerials[index],
      model_number,
      contractor_id,
      status: "available",
      stock_assignment_id: stockAsssigment.id, // link here
    }));

    await Ont.bulkCreate(ontsToCreate, { transaction });

    await transaction.commit();

    return res.status(201).json({
      message: `${ontsToCreate.length} ONT(s) assigned successfully.`,
      skipped: [...existingSet],
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateStock = async (req, res) => {
  const MIN_STOCK_LIMITS = {
    ATB: 5, // ORM 1 min allowed
    "Drop Cable": 200,
    "CAT 6 Cable": 100,
    "Patch Cord": 5,
  };
  try {
    const { contractor, materials } = req.body;

    const contractorData = await Contractor.findByPk(contractor);
    if (!contractorData) {
      return res.status(404).json({ message: "Contractor not found" });
    }

    const assignments = [];

    // Helper function to check available stock in stock_assignments
    async function hasAvailableStock(contractor_id, item_type) {
      let stockRecord = null;

      if (item_type === "ATB") {
        stockRecord = await Atb.findOne({
          where: { contractor_id },
          attributes: ["quantity"],
        });
      } else if (["Drop Cable", "CAT 6 Cable"].includes(item_type)) {
        stockRecord = await Cable.findOne({
          where: {
            contractor_id,
            cable_type: item_type,
          },
          attributes: ["quantity"],
        });
      } else if (item_type === "Patch Cord") {
        stockRecord = await PatchCode.findOne({
          where: { contractor_id },
          attributes: ["quantity"],
        });
      }

      const availableQty = stockRecord?.quantity || 0;

      return availableQty >= (MIN_STOCK_LIMITS[item_type] || 0);
    }

    // ORM 1 (ATBStock)
    if (materials["ORM 1"] > 0) {
      const hasStock = await hasAvailableStock(contractor, "ATB");
      if (hasStock) {
        return res.status(400).json({
          message: "Sufficient ORM 1 stock available, cannot add more.",
        });
      }
      const [atb] = await ATBStock.findOrCreate({
        where: { contractor_id: contractor },
        defaults: { quantity: 0 },
      });
      await atb.update({ quantity: atb.quantity + materials["ORM 1"] });

      assignments.push({
        contractor_id: contractor,
        transfer_from_contractor: null,
        item_type: "ATB",
        quantity: materials["ORM 1"],
        source: "RAHA",
      });
    }

    // Drop Cable
    if (materials["DropCable"] > 0) {
      const hasStock = await hasAvailableStock(contractor, "Drop Cable");
      if (hasStock) {
        return res.status(400).json({
          message: "Sufficient Drop Cable stock available, cannot add more.",
        });
      }
      const [dropCable] = await CableStock.findOrCreate({
        where: { contractor_id: contractor, cable_type: "Drop Cable" },
        defaults: { quantity: 0 },
      });
      await dropCable.update({
        quantity: dropCable.quantity + materials["DropCable"],
      });

      assignments.push({
        contractor_id: contractor,
        transfer_from_contractor: null,
        item_type: "Drop Cable",
        quantity: materials["DropCable"],
        source: "RAHA",
      });
    }

    // CAT 6 Cable
    if (materials["Cat 6"] > 0) {
      const hasStock = await hasAvailableStock(contractor, "CAT 6 Cable");
      if (hasStock) {
        return res.status(400).json({
          message: "Sufficient CAT 6 Cable stock available, cannot add more.",
        });
      }
      const [cat6] = await CableStock.findOrCreate({
        where: { contractor_id: contractor, cable_type: "CAT 6 Cable" },
        defaults: { quantity: 0 },
      });
      await cat6.update({ quantity: cat6.quantity + materials["Cat 6"] });

      assignments.push({
        contractor_id: contractor,
        transfer_from_contractor: null,
        item_type: "CAT 6 Cable",
        quantity: materials["Cat 6"],
        source: "RAHA",
      });
    }

    // Patch Cord
    if (materials["Patch code"] > 0) {
      const hasStock = await hasAvailableStock(contractor, "Patch Cord");
      if (hasStock) {
        return res.status(400).json({
          message: "Sufficient Patch Cord stock available, cannot add more.",
        });
      }
      const [patchStock] = await patch.findOrCreate({
        where: { contractor_id: contractor },
        defaults: { quantity: 0 },
      });
      await patchStock.update({
        quantity: patchStock.quantity + materials["Patch code"],
      });

      assignments.push({
        contractor_id: contractor,
        transfer_from_contractor: null,
        item_type: "Patch Cord",
        quantity: materials["Patch code"],
        source: "RAHA",
      });
    }

    if (assignments.length > 0) {
      await StockAssignment.bulkCreate(assignments);
      res
        .status(200)
        .json({ message: "Stock updated and logged successfully" });
    } else {
      res.status(400).json({ message: "No valid material provided" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getOntSerialNumbers = async (req, res) => {
  try {
    const { contractor_id } = req.query;
    const whereCondition = {
      status: "available",
    };

    if (contractor_id) {
      whereCondition.contractor_id = contractor_id;
    }

    const ontSerialNumbers = await Ont.findAll({
      attributes: ["serial_number"],
      where: whereCondition,
    });

    res.status(200).json({ ontSerialNumbers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getContractorMaterialsStatus = async (req, res) => {
  try {
    const atbs = await Atb.findAll({
      attributes: ["contractor_id", "quantity"],
    });

    const onts = await Ont.findAll({
      attributes: ["contractor_id", "model_number"],
      where: { status: "available" },
    });

    const cables = await Cable.findAll({
      where: {
        cable_type: {
          [Op.in]: ["Drop Cable", "CAT 6 Cable"],
        },
      },
      attributes: ["contractor_id", "cable_type", "quantity"],
    });

    const patches = await PatchCode.findAll({
      attributes: ["contractor_id", "quantity"],
    });

    const contractors = await Contractor.findAll({
      attributes: ["id", "contractor_company_name"],
    });

    const contractorMap = {};
    contractors.forEach((c) => {
      contractorMap[c.id] = c.contractor_company_name;
    });

    const result = {};

    atbs.forEach((item) => {
      const cid = item.contractor_id;
      result[cid] = result[cid] || {
        contractor_company_name: contractorMap[cid],
      };
      result[cid].atb = (result[cid].atb || 0) + item.quantity;
    });

    onts.forEach((item) => {
      const cid = item.contractor_id;
      result[cid] = result[cid] || {
        contractor_company_name: contractorMap[cid],
      };
      result[cid].ont = result[cid].ont || {};
      result[cid].ont[item.model_number] =
        (result[cid].ont[item.model_number] || 0) + 1;
    });

    cables.forEach((item) => {
      const cid = item.contractor_id;
      result[cid] = result[cid] || {
        contractor_company_name: contractorMap[cid],
      };
      result[cid].cables = result[cid].cables || {};
      result[cid].cables[item.cable_type] =
        (result[cid].cables[item.cable_type] || 0) + item.quantity;
    });

    patches.forEach((item) => {
      const cid = item.contractor_id;
      result[cid] = result[cid] || {
        contractor_company_name: contractorMap[cid],
      };
      result[cid].patch = (result[cid].patch || 0) + item.quantity;
    });

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.transferStock = async (req, res) => {
  const { from_contractor, to_contractor, materials, ont_serials } = req.body;

  if (!from_contractor || !to_contractor || from_contractor === to_contractor) {
    return res.status(400).json({ message: "Invalid contractor selection" });
  }

  try {
    // Begin transaction
    const transaction = await ATBStock.sequelize.transaction();

    // 1. Transfer ONTs
    if (ont_serials && ont_serials.length > 0) {
      const onts = await ONT.findAll({
        where: { serial_number: ont_serials, contractor_id: from_contractor },
      });

      if (onts.length !== ont_serials.length) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ message: "One or more ONTs not available for transfer" });
      }

      for (let ont of onts) {
        await ont.update({ contractor_id: to_contractor }, { transaction });

        await StockAssignment.create(
          {
            contractor_id: to_contractor,
            item_type: "ONT",
            item_value: ont.serial_number,
            source: "TRANSFER",
            transfer_from_contractor: from_contractor,
          },
          { transaction }
        );
      }
    }

    // 2. Transfer Material Quantities
    const transferQty = async (
      Model,
      itemType,
      quantity,
      fromField,
      toField
    ) => {
      if (quantity <= 0) return;

      const fromStock = await Model.findOne({
        where: { contractor_id: from_contractor, ...fromField },
        transaction,
      });
      const toStock = await Model.findOrCreate({
        where: { contractor_id: to_contractor, ...fromField },
        defaults: { contractor_id: to_contractor, quantity: 0, ...toField },
        transaction,
      });

      if (!fromStock || fromStock.quantity < quantity) {
        throw new Error(`${itemType} - Insufficient stock`);
      }

      await fromStock.update(
        { quantity: fromStock.quantity - quantity },
        { transaction }
      );
      await toStock[0].update(
        { quantity: toStock[0].quantity + quantity },
        { transaction }
      );

      // Log stock assignment
      await StockAssignment.create(
        {
          contractor_id: to_contractor,
          item_type: itemType,
          item_value: toField?.cable_type || null,
          quantity: quantity,
          source: "TRANSFER",
          transfer_from_contractor: from_contractor,
        },
        { transaction }
      );
    };

    // ATB
    await transferQty(Atb, "ATB", materials["ATB"], {}, {});

    // Patch Cord
    await transferQty(PatchCode, "Patch Cord", materials["Patch Cord"], {}, {});

    // CAT 6 Cable
    await transferQty(
      CableStock,
      "CAT 6 Cable",
      materials["Cat 6"],
      { cable_type: "CAT 6 Cable" },
      { cable_type: "CAT 6 Cable" }
    );

    // Drop Cable
    await transferQty(
      CableStock,
      "Drop Cable",
      materials["Drop Cable"],
      { cable_type: "Drop Cable" },
      { cable_type: "Drop Cable" }
    );

    await transaction.commit();
    return res.status(200).json({ message: "Stock transferred successfully" });
  } catch (error) {
    console.error("Stock transfer error:", error);
    return res
      .status(500)
      .json({ message: "Stock transfer failed", error: error.message });
  }
};

exports.getStockAssignments = async (req, res) => {
  const { contractor_id, source, item_type } = req.query;
  try {
    const where = {};
    if (contractor_id) where.contractor_id = contractor_id;
    if (source) where.source = source;
    if (item_type) where.item_type = item_type;

    const records = await StockAssignment.findAll({
      where,
      include: [
        {
          model: Contractor,
          as: "toContractor",
          attributes: ["id", "contractor_company_name"],
        },
        {
          model: Contractor,
          as: "sourceContractor",
          attributes: ["id", "contractor_company_name"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json(records);
  } catch (error) {
    console.error("Failed to fetch stock assignments:", error);
    res.status(500).json({ message: "Error loading stock assignments" });
  }
};

exports.getStockUsageReport = async (req, res) => {
  try {
    const stock_assignment_id = req.params.id;

    const stockUsage = await db.stock_usage.findAll({
      where: { stock_assignment_id },
      attributes:["id","item_value", "quantity_used", "createdAt"],
      include: [
        {
          model: TaskCompletion,
          as: "taskCompletion",
          attributes: ["id"],
          required: false,
          include: [
            {
              model: Task,
              as: "task",
              attributes: ["customer_name", "account_number", "case_ticket"],
            },
          ],
        },
        {
          model: Contractor,
          as: "contractor",
          attributes: ["contractor_company_name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    })

    res.status(200).json(stockUsage);
  } catch (error) {
    console.error("Failed to fetch stock usage report:", error);
    res.status(500).json({ message: "Error loading stock usage report" });
  }
}
