const { task_completion } = require(".");

module.exports = (sequelize, DataTypes) => {
  return (OtherTask = sequelize.define("other_task", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    task_type: {
      type: DataTypes.ENUM(
        "Access Point",
        "Splicing",
        "Distribution box installation",
        "Closure preparation and installation",
        "Extender installation",
        "Cable installation"
      ),
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }));
};
