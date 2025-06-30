const db = require('../Models');
const { Op, where } = require('sequelize');

const Ont = db.onts;
const Atb = db.atb_stocks;
const Cable = db.cable_stocks;
const PatchCode = db.patches;
const Contractor = db.contractors;



exports.createONT = async (req, res) => {
  try {
    const { contractor_id, serial_number, model_number } = req.body;

    if (!contractor_id || !Array.isArray(serial_number) || serial_number.length === 0) {
      return res.status(400).json({ message: "Missing contractor or serial numbers." });
    }

    // Fetch existing serial numbers from DB
    const existingONTs = await Ont.findAll({
      where: {
        serial_number: serial_number.map((sn) => sn.trim()),
      },
      attributes: ["serial_number"],
    });

    const existingSet = new Set(existingONTs.map((o) => o.serial_number));

    // Filter new serials
    const filteredONTs = serial_number
      .map((sn) => sn.trim())
      .filter((sn) => !existingSet.has(sn))
      .map((sn) => ({
        serial_number: sn,
        model_number,
        contractor_id,
        status: "available",
      }));

    if (filteredONTs.length === 0) {
      return res.status(409).json({ message: "All ONTs already exist." });
    }

    await ONT.bulkCreate(filteredONTs);

    return res.status(201).json({
      message: `${filteredONTs.length} ONT(s) assigned successfully.`,
      skipped: [...existingSet],
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { contractor, materials } = req.body;

    // Check contractor exists
    const contractorData = await Contractor.findByPk(contractor);
    if (!contractorData) {
      return res.status(404).json({ message: "Contractor not found" });
    }

    // Update ORM 1 (ATBStock)
    if (typeof materials["ORM 1"] === "number") {
      const [atb] = await ATBStock.findOrCreate({
        where: { contractor_id: contractor },
        defaults: { quantity: 0 },
      });
      await atb.update({ quantity: atb.quantity + materials["ORM 1"] });
    }

    // Update CableStock: Drop Cable
    if (typeof materials["DropCable"] === "number") {
      const [dropCable] = await CableStock.findOrCreate({
        where: { contractor_id: contractor, cable_type: "Drop Cable" },
        defaults: { quantity: 0 },
      });
      await dropCable.update({ quantity: dropCable.quantity + materials["DropCable"] });
    }

    // Update CableStock: CAT 6
    if (typeof materials["Cat 6"] === "number") {
      const [cat6] = await CableStock.findOrCreate({
        where: { contractor_id: contractor, cable_type: "CAT 6 Cable" },
        defaults: { quantity: 0 },
      });
      await cat6.update({ quantity: cat6.quantity + materials["Cat 6"] });
    }

    // Update Patch stock
    if (typeof materials["Patch code"] === "number") {
      const [patchStock] = await patch.findOrCreate({
        where: { contractor_id: contractor },
        defaults: { quantity: 0 },
      });
      await patchStock.update({ quantity: patchStock.quantity + materials["Patch code"] });
    }

    res.status(200).json({ message: "Stock updated successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getOntSerialNumbers = async (req, res) => {
  try {
    const { contractor_id } = req.query;
    console.log(contractor_id)
    const whereCondition = {
      status: 'available'
    };

    if (contractor_id) {
      whereCondition.contractor_id = contractor_id;
    }

    const ontSerialNumbers = await Ont.findAll({
      attributes: ['serial_number'],
      where:whereCondition,
    });
    console.log(ontSerialNumbers)

    res.status(200).json({ ontSerialNumbers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};



exports.getContractorMaterialsStatus = async (req, res) => {
    try {
      const atbs = await Atb.findAll({
        attributes: ['contractor_id', 'quantity']
      });
  
      const onts = await Ont.findAll({
        attributes: ['contractor_id', 'model_number'],
        where: {status: 'available'}
      });

  
      const cables = await Cable.findAll({
        where: {
          cable_type: {
            [Op.in]: ['Drop Cable', 'CAT 6 Cable']
          }
        },
        attributes: ['contractor_id', 'cable_type', 'quantity']
      });
  
      const patches = await PatchCode.findAll({
        attributes: ['contractor_id', 'quantity']
      });
  
      const contractors = await Contractor.findAll({
        attributes: ['id', 'contractor_company_name']
      });
  
      const contractorMap = {};
      contractors.forEach(c => {
        contractorMap[c.id] = c.contractor_company_name;
      });
  
      const result = {};
  
      atbs.forEach(item => {
        const cid = item.contractor_id;
        result[cid] = result[cid] || { contractor_company_name: contractorMap[cid] };
        result[cid].atb = (result[cid].atb || 0) + item.quantity;
      });
  
      onts.forEach(item => {
        const cid = item.contractor_id;
        result[cid] = result[cid] || { contractor_company_name: contractorMap[cid] };
        result[cid].ont = result[cid].ont || {};
        result[cid].ont[item.model_number] = (result[cid].ont[item.model_number] || 0) + 1;
      });
  
      cables.forEach(item => {
        const cid = item.contractor_id;
        result[cid] = result[cid] || { contractor_company_name: contractorMap[cid] };
        result[cid].cables = result[cid].cables || {};
        result[cid].cables[item.cable_type] = (result[cid].cables[item.cable_type] || 0) + item.quantity;
      });
  
      patches.forEach(item => {
        const cid = item.contractor_id;
        result[cid] = result[cid] || { contractor_company_name: contractorMap[cid] };
        result[cid].patch = (result[cid].patch || 0) + item.quantity;
      });
  
      res.status(200).json(result);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  };