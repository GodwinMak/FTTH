module.exports = (sequelize, DataTypes) =>{
    return Task = sequelize.define("task", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        contractor_id: {
            type: DataTypes.UUID,
            allowNull: false,  // enforce that every task has a contractor
            references: {
                model: "contractors",  // name of the table, not the model file
                key: "id",
            },
        },
        customer_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        account_number: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        serial_number: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        case_ticket:{
            type: DataTypes.STRING,
            allowNull: true,
        },
        task_type:{
            type: DataTypes.ENUM("New Installation", "Offline Due to Fiber", "Offline Due to Power", "Router Change", "Router Relocation", "Box Preparation", "Running Cable","Gpon Uplinking"),
            allowNull: false,
        },
        contact_number: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("On Hold", "Closed", "Rejected", "In Progress"),
            allowNull: false,
            defaultValue: "In Progress",  // default status
        },
    })
}