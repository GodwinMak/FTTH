module.exports = (sequelize, DataTypes) => {
    return NOTES = sequelize.define("notes", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        note_text: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        task_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'tasks',
                key: 'id'
            }
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.ENUM("On Hold", "Closed", "Rejected", "In Progress"),
            allowNull: false,
            defaultValue: "In Progress",  // default status
        },
    })
}