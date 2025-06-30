const db = require("../Models");

const ONT = db.onts;

exports.createONT = async (req, res) => {
  try {
    const { contractor_id, serial_number, model_number } = req.body;
    if (
      !contractor_id ||
      !Array.isArray(serial_number) ||
      serial_number.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Missing contractor or serial numbers." });
    }
    const newOnts = serial_number.map((sn) => ({
      serial_number: sn.trim(),
      model_number: model_number,
      contractor_id: contractor_id,
      status: "available",
    }));
    await ONT.bulkCreate(newOnts);
    return res.json({ message: "ONTs assigned successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getONTs = async (req, res) => {
  const { contractor_company_name, status } = req.params;

  if (!contractor_company_name || !status) {
    return res
      .status(400)
      .json({ message: "contractorName and status are required in params." });
  }

  try {
    const onts = await ONT.findAll({
      include: [
        {
          model: contractors,
          as: "contractors",
          where: { name: contractor_company_name },
          attributes: [], // omit contractor fields in result
        },
      ],
      where: {
        status: status,
      },
    });

    return res.json({
      count: ONT.length,
      data: ONT,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch ONTs." });
  }
};
