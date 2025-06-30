module.exports = (sequelize, DataTypes) =>{
    return Contractor = sequelize.define("contractor", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        contractor_company_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        contact_number:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        office_location:{
            type: DataTypes.STRING,
            allowNull: false
        },
    })
}