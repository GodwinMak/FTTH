const dbConfig = require("../Config/dbConfig.js");
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./user.model.js")(sequelize, DataTypes,);
db.tasks = require("./task.model.js")(sequelize, DataTypes,);
db.task_completion = require("./taskcompletion.models.js")(sequelize, DataTypes);
db.contractors = require("./contractor.model.js")(sequelize, DataTypes);
db.onts = require("./ont.model.js")(sequelize, DataTypes);
db.cable_stocks = require("./cable.model.js")(sequelize, DataTypes);
db.atb_stocks = require("./atb.model.js")(sequelize, DataTypes);
db.notes = require("./notes.model.js")(sequelize, DataTypes);
db.patches = require("./patch.model.js")(sequelize, DataTypes);

db.contractors.hasMany(db.tasks, {
  foreignKey: 'contractor_id',
});

db.tasks.belongsTo(db.contractors, {
  foreignKey: 'contractor_id',
});

db.tasks.hasOne(db.task_completion, {
  foreignKey: "task_id",
  onDelete: "CASCADE",
});
db.task_completion.belongsTo(db.tasks, {
  foreignKey: "task_id",
});

db.contractors.hasMany(db.users, {
  foreignKey: 'contractor_id',
});

db.users.belongsTo(db.contractors, {
  foreignKey: 'contractor_id',
});

db.contractors.hasMany(db.onts, {
  foreignKey: 'contractor_id',
})

db.onts.belongsTo(db.contractors, {
  foreignKey: 'contractor_id',
});



db.patches.belongsTo(db.contractors, {
  foreignKey: 'contractor_id',
});

db.contractors.hasMany(db.patches, {
  foreignKey: 'contractor_id',
})

db.tasks.hasMany(db.notes, {
  foreignKey: 'task_id',
})

db.notes.belongsTo(db.tasks, {
  foreignKey: 'task_id',
});

db.users.hasMany(db.notes, {
  foreignKey: 'user_id',
});

db.notes.belongsTo(db.users, {
  foreignKey: 'user_id',
});

db.sequelize
  .sync({ force: false })
  .then(() => {})
  .then(() => {
    console.log("Yes re-sync done.");
  });

module.exports = db;