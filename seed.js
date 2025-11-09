const bcrypt = require('bcrypt');
const { sequelize, User, Quiz, Question, Option } = require('./models');

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database reset ✅');

    // Hash password
    const hashed = await bcrypt.hash('123456', 10);

    // 1️⃣ Buat Users
    const admin = await User.create({
      name: 'Admin Guru',
      email: 'guru@example.com',
      password: hashed,
      role: 'teacher'
    });

    const siswa = await User.create({
      name: 'Budi Santoso',
      nisn: '1234567890',
      password: hashed,
      role: 'student'
    });

    // 2️⃣ Buat Quiz
    const quiz = await Quiz.create({
      title: 'Ujian Bahasa Inggris',
      description: 'Latihan listening dasar',
      duration: 30,
      createdBy: admin.id
    });

    // 3️⃣ Buat Question + Options
    const q1 = await Question.create({
      quiz_id: quiz.id,
      question_text: "What is the correct translation of 'Good Morning'?"
    });
    const q2 = await Question.create({
      quiz_id: quiz.id,
      question_text: "What is the correct translation of 'Good Night'?"
    });

    const options = [
      { question_id: q1.id, option_text: 'Selamat Pagi', is_correct: true },
      { question_id: q1.id, option_text: 'Selamat Siang', is_correct: false },
      { question_id: q1.id, option_text: 'Selamat Sore', is_correct: false },
      { question_id: q1.id, option_text: 'Selamat Malam', is_correct: false },
      { question_id: q2.id, option_text: 'Selamat Pagi', is_correct: false },
      { question_id: q2.id, option_text: 'Selamat Siang', is_correct: false },
      { question_id: q2.id, option_text: 'Selamat Sore', is_correct: false },
      { question_id: q2.id, option_text: 'Selamat Malam', is_correct: true },
    ];

    await Option.bulkCreate(options);

    console.log('Seed data inserted successfully 🌱');
    process.exit();
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
