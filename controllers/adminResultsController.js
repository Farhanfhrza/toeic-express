const ExcelJS = require("exceljs");
const { User, Quiz, QuizAttempt } = require("../models");

exports.getAllResults = async (req, res) => {
  try {
    const results = await QuizAttempt.findAll({
      include: [
        { model: User, attributes: ["name", "email"] },
        { model: Quiz, attributes: ["title"] },
      ],
      order: [["created_at", "DESC"]],
    });

    const formatted = results.map((r) => ({
      id: r.id,
      student: r.User.name,
      email: r.User.email,
      quiz: r.Quiz.title,
      score: r.score,
      date: r.created_at,
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching results" });
  }
};

exports.exportResultsToExcel = async (req, res) => {
  try {
    const results = await QuizAttempt.findAll({
      include: [
        { model: User, attributes: ["name", "email"] },
        { model: Quiz, attributes: ["title"] },
      ],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Hasil Ujian");

    worksheet.columns = [
      { header: "No", key: "no", width: 5 },
      { header: "Nama Siswa", key: "student", width: 25 },
      { header: "Email/NISN", key: "email", width: 25 },
      { header: "Judul Kuis", key: "quiz", width: 30 },
      { header: "Nilai", key: "score", width: 10 },
      { header: "Tanggal", key: "date", width: 20 },
    ];

    results.forEach((r, i) => {
      worksheet.addRow({
        no: i + 1,
        student: r.User.name,
        email: r.User.email,
        quiz: r.Quiz.title,
        score: r.score,
        date: new Date(r.created_at).toLocaleString("id-ID"),
      });
    });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=hasil_ujian.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error exporting Excel" });
  }
};
