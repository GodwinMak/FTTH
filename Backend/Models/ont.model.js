module.exports = (sequelize, DataTypes) => {
  return (ONT = sequelize.define("ont", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    serial_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    model_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("available", "installed"),
      defaultValue: "available",
    },
    contractor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "contractors",
        key: "id",
      },
    },
    task_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "tasks",
        key: "id",
      },
    },
    stock_assignment_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "stock_assignments",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
  }));
};
