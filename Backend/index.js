const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");

require("dotenv").config({ path: "./.env" });


// middleware
app.use(cors({
  // origin: ["http://localhost:3000"],
  // methods: ["POST","GET", "PUT", "DELETE"],
  // credentials: true
}));
app.use(express.static('public')); // Serve static files from the 'uploads' directory
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRoutes = require("./Routes/user.routes");
const contractorRoutes = require("./Routes/contractor.routes");
const taskRoutes = require("./Routes/task.routes");
const statsRoutes = require("./Routes/stats.routes");
const stockRoutes = require("./Routes/stock.routes");


 // Serve static files from the 'uploads' directory
app.use("/user", userRoutes);
app.use("/contractor", contractorRoutes);
app.use("/task", taskRoutes);
app.use("/stats",statsRoutes)
app.use("/stock", stockRoutes);


app.get("/", (req, res) => {
  res.send("Hello, World! how are you");
});


require("./Jobs/taskReminder"); 

const PORT = process.env.PORT || 8086;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});