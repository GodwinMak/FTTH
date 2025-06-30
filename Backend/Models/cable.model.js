module.exports = (sequelize, DataTypes) => {
    return CableStock = sequelize.define("cable_stock", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        contractor_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'contractors',
                key: 'id',
            }
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
            allowNull: false,
        },
        quantity: {
            type: DataTypes.FLOAT,
            allowNull: false,
        }
    });
};
