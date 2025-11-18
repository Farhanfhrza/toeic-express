const bcrypt = require('bcrypt');
const { sequelize, User, Quiz, Question, Option, Class, ScoreConversion } = require('./models');

const CONVERSION_DATA = [
  // Kolom: [Correct Count, Listening Score, Reading Score]
  [1, 5, 5], [2, 5, 5], [3, 5, 5], [4, 5, 5], [5, 5, 5],
  [6, 5, 5], [7, 5, 5], [8, 5, 5], [9, 5, 5], [10, 5, 5],
  [11, 5, 5], [12, 5, 5], [13, 5, 5], [14, 5, 5], [15, 5, 5],
  [16, 5, 5], [17, 10, 5], [18, 15, 5], [19, 20, 5], [20, 25, 5],
  [21, 30, 10], [22, 35, 15], [23, 40, 20], [24, 45, 25], [25, 50, 30],
  [26, 55, 35], [27, 60, 40], [28, 70, 45], [29, 80, 55], [30, 85, 60],
  [31, 90, 65], [32, 95, 70], [33, 100, 75], [34, 105, 80], [35, 115, 85],
  [36, 125, 90], [37, 135, 95], [38, 140, 105], [39, 150, 115], [40, 160, 120],
  [41, 170, 125], [42, 175, 130], [43, 180, 135], [44, 190, 140], [45, 200, 145],
  [46, 205, 155], [47, 215, 160], [48, 220, 170], [49, 225, 175], [50, 230, 185],
  [51, 235, 195], [52, 245, 205], [53, 255, 210], [54, 260, 215], [55, 265, 220],
  [56, 275, 230], [57, 285, 240], [58, 290, 245], [59, 295, 250], [60, 300, 255],
  [61, 310, 260], [62, 320, 270], [63, 325, 275], [64, 330, 280], [65, 335, 285],
  [66, 340, 290], [67, 345, 295], [68, 350, 295], [69, 355, 300], [70, 360, 310],
  [71, 365, 315], [72, 370, 320], [73, 375, 325], [74, 385, 330], [75, 395, 335],
  [76, 400, 340], [77, 405, 345], [78, 415, 355], [79, 420, 360], [80, 425, 370],
  [81, 430, 375], [82, 435, 385], [83, 440, 390], [84, 445, 395], [85, 450, 400],
  [86, 455, 405], [87, 460, 415], [88, 465, 420], [89, 475, 425], [90, 480, 435],
  [91, 485, 440], [92, 490, 450], [93, 495, 455], [94, 495, 460], [95, 495, 470],
  [96, 495, 475], [97, 495, 485], [98, 495, 485], [99, 495, 490], [100, 495, 495]
];

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database reset ✅');

    // Hash password
    const hashed = await bcrypt.hash('123456', 10);

    const classes = await Class.create({
      name:'X-MIPA-2',
      level:10,
    })

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
      class_id: classes.id,
      password: hashed,
      role: 'student'
    });

    // 2️⃣ Buat Quiz
    const quiz = await Quiz.create({
      title: 'Ujian Bahasa Inggris',
      description: 'Latihan listening dasar',
      duration_minutes: 30,
      createdBy: admin.id
    });

    // 3️⃣ Buat Question + Options
    const q1 = await Question.create({
      entity_type: "quiz",
      entity_id: quiz.id,
      question_type: "listening",
      question_text: "What is the correct translation of 'Good Morning'?"
    });
    const q2 = await Question.create({
      entity_type: "quiz",
      entity_id: quiz.id,
      question_type: "listening",
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

    // 3️⃣ Buat Data Konversi Skor (ScoreConversion)
    console.log('Inserting Score Conversion Data...');
    
    const scoreData = [];
    CONVERSION_DATA.forEach(row => {
      const [correctCount, listeningScore, readingScore] = row;

      // Data untuk Listening
      scoreData.push({
        type: 'listening',
        correct_answers_count: correctCount,
        converted_score: listeningScore,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Data untuk Reading
      scoreData.push({
        type: 'reading',
        correct_answers_count: correctCount,
        converted_score: readingScore,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
    
    await ScoreConversion.bulkCreate(scoreData);

    console.log('Seed data inserted successfully 🌱');
    process.exit();
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
