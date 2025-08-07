module.exports = (sequelize, DataTypes) => {
  return sequelize.define("stock_assignment", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    contractor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "contractors",
        key: "id"
      }
    },
    item_type: {
      type: DataTypes.ENUM("ONT", "ATB", "Patch Cord", "CAT 6 Cable", "Drop Cable"),
      allowNull: false
    },
    item_value: {
      type: DataTypes.STRING, // Can store serial_number or description (e.g., cable type)
      allowNull: true
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: true // Required for non-ONT items
    },
    source: {
      type: DataTypes.ENUM("RAHA", "TRANSFER"),
      allowNull: false
    },
    transfer_from_contractor: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "contractors",
        key: "id"
      }
    },
    status:{
      type: DataTypes.ENUM("OPEN", "CLOSED"),
      allowNull: false,
      defaultValue: "OPEN"
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });
};
