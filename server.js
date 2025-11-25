const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
require('dotenv').config();

const app = express();

// ✅ Izinkan CORS
app.use(cors({
  origin: 'http://localhost:5173', // alamat frontend React
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json());

// Import routes
const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');
const resultRoutes = require('./routes/resultRoutes');
const adminRoutes = require("./routes/adminRoutes");
const classRoutes = require("./routes/classRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");
const materialRoutes = require("./routes/materialRoutes");
const { verifyToken, isAdminOrTeacher } = require("./middleware/authMiddleware");

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/results', resultRoutes);
app.use("/api/admin", verifyToken, isAdminOrTeacher, adminRoutes);
app.use("/api/admin/classes", verifyToken, isAdminOrTeacher, classRoutes);
app.use("/api/exercise", exerciseRoutes);
app.use("/api/material", materialRoutes);

const PORT = process.env.PORT || 5000;

sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});