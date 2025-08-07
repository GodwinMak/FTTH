// models/stock_usage.js
module.exports = (sequelize, DataTypes) => {
  const StockUsage = sequelize.define("stock_usage", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    contractor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "contractors", // name of the table, not the model file
        key: "id",
      },
    },
    item_type: {
      type: DataTypes.ENUM("ONT", "ATB", "Patch Cord", "CAT 6 Cable", "Drop Cable"),
      allowNull: false
    },
    item_value: {
      type: DataTypes.STRING,
    },
    quantity_used: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    task_completion_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "task_completions",
        key: "id",
      },
    },
    stock_assignment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "stock_assignments",
        key: "id",
      },
    },
  });

  return StockUsage;
};
