const db = require("../Models");

const Contractors = db.contractors;
const AtbStocks = db.atb_stocks;
const CableStocks = db.cable_stocks;
const PatchCodes = db.patches;

exports.create = async (req, res) => {
  try {
    const { contractor_company_name, contact_number, office_location } =
      req.body;

    const contractorCheck = await Contractors.findOne({
      where: { contractor_company_name: contractor_company_name },
    });

    if (contractorCheck) {
      return res.status(409).send({ message: "Contractor already exists" });
    }
    const newContractor = await Contractors.create({
      contractor_company_name: contractor_company_name,
      contact_number: contact_number,
      office_location: office_location,
    });

    const contractor_id = newContractor.id;
    // Create initial stock entries
    await Promise.all([
      AtbStocks.create({ contractor_id, quantity: 0 }),

      CableStocks.create({
        contractor_id,
        cable_type: "Drop Cable",
        quantity: 0,
      }),
      CableStocks.create({
        contractor_id,
        cable_type: "CAT 6 Cable",
        quantity: 0,
      }),

      PatchCodes.create({ contractor_id, quantity: 0 }),
    ]);

    res.status(201).send({ message: "Contractor created successfully" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const contractors = await Contractors.findAll();
    res
      .status(200)
      .send({ message: "Contractors fetched successfully", contractors });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const contractor = await Contractors.findOne({ where: { id: id } });
    if (!contractor) {
      return res.status(404).send({ message: "Contractor not found" });
    }
    res
      .status(200)
      .send({ message: "Contractor fetched successfully", contractor });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.updateById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const { contractor_company_name, contact_number, office_location } =
      req.body;
    console.log(req.body);

    const contractor = await Contractors.findOne({ where: { id: id } });
    if (!contractor) {
      return res.status(404).send({ message: "Contractor not found" });
    }

    await Contractors.update(
      {
        contractor_company_name: contractor_company_name,
        contact_number: contact_number,
        office_location: office_location,
      },
      { where: { id: id } }
    );

    res.status(200).send({ message: "Contractor updated successfully" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.deleteById = async (req, res) => {
  try {
    const { id } = req.params;
    const contractor = await Contractors.findOne({ where: { id: id } });
    if (!contractor) {
      return res.status(404).send({ message: "Contractor not found" });
    }

    await Contractors.destroy({ where: { id: id } });

    res.status(200).send({ message: "Contractor deleted successfully" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
