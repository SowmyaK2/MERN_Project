const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const User = require("./models/User");
const multer = require("multer");
const Employee = require("./models/Employee");

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/config", {
    
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => console.log(err));
  //------------------------------------------
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./uploads"); // Specify the destination folder for uploads
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname); // Use the original file name for the uploaded file
    },
});

// Create multer instance with defined storage
const upload = multer({ storage: storage });

// Login route
app.post("/login", async (req, res) => {
  const { userName, Pwd } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ userName,Pwd });
    if (!user || user.Pwd !== Pwd) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // If login is successful, return user data
    res.json({ id: user._id, email: user.email });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
//---------------------------------------------------------------------
app.get("/employees", async (req, res) => {
  try {
    // Fetch employees from the database
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//-------------------------------------------------------------------------
app.put("/employees/:id", async (req, res) => {
  const { id } = req.params;
  const employeeData = req.body;
  console.log(id,employeeData);

  try {
    // Find the employee by ID and update its data
    const updatedEmployee = await Employee.findByIdAndUpdate(id, employeeData, {
      new: true,
    });
    console.log(updatedEmployee);

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res
      .status(200)
      .json({ message: "Employee updated successfully", updatedEmployee });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//---------------------------------------------------------------------
app.delete("/employees/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Find the employee by ID and delete it
    const deletedEmployee = await Employee.findByIdAndDelete(id);
    console.log(deletedEmployee);
    if (!deletedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//  handle adding a new employee
app.post("/addemployee", upload.single("image"), async (req, res) => {
  try {
    // Extract employee data from the request body
    const { name, email, mobile, designation, gender, course } = req.body;
    const imagePath = req.file.path; // Path to the uploaded image file

    // Create a new employee instance
    const employee = new Employee({
      f_Name: name,
      f_Email: email,
      f_Mobile: mobile,
      f_Designation: designation,
      f_gender: gender,
      f_Course: course,
      f_Image: imagePath, // Store the path to the image in the database
    });

    // Save the employee to the database
    await employee.save();

    res.status(201).json({ message: "Employee added successfully" });
  } catch (error) {
    console.error("Error adding employee:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
