module.exports =(sequelize, DataTypes) => {
    return patch = sequelize.define("patch", {
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
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    })
}