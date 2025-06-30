const db = require("../Models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Users = db.users;

exports.create = async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      phone_number,
      user_type,
      contractor_id,
    } = req.body;

    const userCheck = await Users.findOne({ where: { email: email } });

    if (userCheck) {
      return res.status(409).send({ message: "User already exists" });
    }
    if (user_type === "contractor" && !contractor_id) {
      return res
        .status(400)
        .send({
          message: "Contractor company name is required for contractor user",
        });
    }

    if (user_type === "contractor" || user_type === "admin_contractor") {
      const contractor = await db.contractors.findOne({
        where: { id: contractor_id },
      });
      if (!contractor) {
        return res
          .status(400)
          .send({ message: "Invalid contractor company name" });
      }
    }
    const salt = await bcrypt.genSalt(Number(10));
    const hashedPassword = await bcrypt.hash(password, salt);

    let user;
    if (contractor_id) {
      user = await Users.create({
        full_name: full_name,
        email: email,
        password: hashedPassword,
        phone_number: phone_number,
        user_type: user_type,
        contractor_id: contractor_id,
      });
    } else {
      user = await Users.create({
        full_name: full_name,
        email: email,
        password: hashedPassword,
        phone_number: phone_number,
        user_type: user_type,
      });
    }
    if (user) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET);
      return res
        .status(201)
        .send({ message: "User created successfully", user, token });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, interface } = req.body;

    const user = await Users.findOne({ where: { email: email } });
    if (!interface) {
      return res.status(403).send({ message: "Not Allowed" });
    }

    if (!user ) {
      return res.status(404).send({ message: "User not found" });
    }

    if (interface === "mobile" &&
      user.user_type !== "contractor" &&
      user.user_type !== "admin_contractor") {
      return res
        .status(403)
        .send({ message: "Only contractor users can log in from mobile" });
    }

    if(interface === "web" && user.user_type === "contractor"){
      return res
        .status(403)
        .send({ message: "Contractor can not login in" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).send({ message: "Invalid password" });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET);
    console.log(user);
    res.status(200).send({ message: "Login successful", token, user });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const users = await Users.findAll();
    res.status(200).send({ message: "Users fetched successfully", users });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.updateById = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, password, phone_number, user_type, contractor_id } = req.body;
    console.log(req.body)
    const user = await Users.findOne({ where: { id } });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }


    if (user_type === "contractor" && !contractor_id) {
      return res.status(400).send({
        message: "Contractor company name is required for contractor user",
      });
    }


    if (user_type === "contractor" || user_type === "admin_contractor") {
      console.log(contractor_id, id)
      const contractor = await db.contractors.findOne({ where: { id: contractor_id } });
      console.log("hello",contractor )

      if (!contractor) {
        return res.status(400).send({ message: "Invalid contractor company name" });
      }
    }

    const updatedData = {
      full_name,
      email,
      phone_number,
      user_type,
      contractor_id,
    };

    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(Number(10));
      const hashedPassword = await bcrypt.hash(password, salt);
      updatedData.password = hashedPassword;
    }

    const updatedUser = await Users.update(updatedData, { where: { id } });

    if (updatedUser[0] === 1) {
      res.status(200).send({ message: "User updated successfully" });
    } else {
      res.status(400).send({ message: "Failed to update user" });
    }
  } catch (err) {
    console.log(err)
    res.status(500).send({ message: err.message });
  }
};


exports.deleteById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Users.findOne({ where: { id } });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    await Users.destroy({ where: { id } });
    res.status(200).send({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
}
