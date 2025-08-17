module.exports = (sequelize, DataTypes) => {
  return (TaskCompletion = sequelize.define("task_completion", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    task_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "tasks", // name of the table, not the model file
        key: "id",
      },
    },
    serial_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_sleeve: {
      type: DataTypes.SMALLINT,
      allowNull: true,
    },
    cable_type: {
      type: DataTypes.ENUM(
        "CAT 6 Cable",
        "Drop Cable",
        "Aerial Fiber Cable 4F",
        "Aerial Fiber Cable 96F",
        "Underground Fiber Cable 12F",
        "Underground Fiber Cable 96F"
      ),
    },
    cable_length: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    no_atb: {
      type: DataTypes.SMALLINT,
      allowNull: true,
    },
    no_patch_cords: {
      type: DataTypes.SMALLINT,
      allowNull: true,
    },
    no_ont: {
      type: DataTypes.SMALLINT,
      allowNull: true,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    task_type: {
      type: DataTypes.ENUM(
        "Apartment Installation +Activation",
        "Relocation(Installation+Activation)",
        "Activation",
        "Relocation(Installation)",
        "Troubleshooting",
        "Others",
      ),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Accepted", "Rejected", "In Progress"),
      allowNull: false,
      defaultValue: "In Progress", // default status
    },
    image_urls: {
      type: DataTypes.JSON, // Stores ["url1","url2"]
      allowNull: true,
    },
  }));
};
