const express = require('express');
const cors = require('cors');

const app = express();


// IMPORT ROUTES

const studentRoutes = require('./routes/studentRoutes');
const alumniRoutes = require('./routes/alumniRoutes');
const adminRoutes = require('./routes/adminRoutes');


const authRoutes = require('./routes/authRoutes');


// MIDDLEWARE

app.use(cors());

app.use(express.json());


// ROUTES

app.use("/api/students", studentRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);



// TEST ROUTE

app.get("/", (req,res)=>{

res.send("AlmaMatters API Running");

});



// PORT

const PORT = process.env.PORT || 3000;


app.listen(PORT, () =>

console.log(`Server running on port ${PORT}`)

);