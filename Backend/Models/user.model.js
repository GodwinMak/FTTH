module.exports = (sequelize, DataTypes) =>{
    return User = sequelize.define("user", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      user_type: {
        type: DataTypes.ENUM("admin",  "admin_contractor", "contractor", "support"),
        allowNull: false,
      },
      contractor_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'contractors',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
    pushToken: {
      type: DataTypes.STRING,
      allowNull: true,
    }
    
    });
}