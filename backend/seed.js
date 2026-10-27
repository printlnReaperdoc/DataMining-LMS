require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const modules = [
  ['Foundations and Preprocessing', ['Introduction to Data Mining', 'Data, Measurements, and Data Preprocessing', 'Data Warehousing and Online Analytical Processing (OLAP)']],
  ['Pattern Mining and Association', ['Pattern Mining: Basic Concepts and Methods', 'Pattern Mining: Advanced Methods']],
  ['Classification and Machine Learning', ['Classification: Basic Concepts and Methods', 'Classification: Advanced Methods']],
  ['Clustering and Advanced Mining', ['Cluster Analysis: Basic Concepts and Methods', 'Cluster Analysis: Advanced Methods', 'Deep Learning', 'Outlier Detection', 'Data Mining Trends and Research Frontiers']]
];
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'datamininglms',
  multipleStatements: true
});
async function seed() {
  const connection = await pool.getConnection();
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await connection.query(schema);
    await connection.beginTransaction();
    let chapterNumber = 1;
    for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex += 1) {
      const [moduleResult] = await connection.execute('INSERT INTO modules (module_number, title) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id), title=VALUES(title)', [moduleIndex + 1, modules[moduleIndex][0]]);
      const moduleId = moduleResult.insertId;
      for (const title of modules[moduleIndex][1]) {
        const [chapterResult] = await connection.execute(`INSERT INTO chapters (module_id, chapter_number, title, overview, objectives, content)
          VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id), module_id=VALUES(module_id), title=VALUES(title)`,
          [moduleId, chapterNumber, title, `Learn the core ideas and practical methods behind ${title}.`,
            JSON.stringify([`Explain the key concepts in ${title}`, 'Apply an appropriate data mining workflow', 'Evaluate results responsibly']),
            `This lesson introduces ${title}. Connect the concepts to a concrete data problem, inspect the quality of your inputs, and validate findings before using them to support decisions.`]);
        const chapterId = chapterResult.insertId;
        const [quizResult] = await connection.execute('INSERT INTO quizzes (chapter_id, published) VALUES (?, TRUE) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id), published=TRUE', [chapterId]);
        const quizId = quizResult.insertId;
        for (let questionNumber = 1; questionNumber <= 20; questionNumber += 1) {
          await connection.execute(`INSERT INTO questions (quiz_id, question_number, prompt, options, correct_option)
            VALUES (?, ?, ?, ?, 0) ON DUPLICATE KEY UPDATE prompt=VALUES(prompt), options=VALUES(options), correct_option=VALUES(correct_option)`,
            [quizId, questionNumber, `Which practice best supports reliable work in ${title}?`,
              JSON.stringify(['Validate the data and results', 'Skip data preparation', 'Share credentials', 'Use unverified assumptions'])]);
        }
        chapterNumber += 1;
      }
    }
    if (process.env.FACULTY_USERNAME && process.env.FACULTY_PASSWORD) {
      const passwordHash = await bcrypt.hash(process.env.FACULTY_PASSWORD, 12);
      await connection.execute(`INSERT INTO users (username, password_hash, first_name, surname, role) VALUES (?, ?, ?, ?, 'faculty')
        ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), role='faculty'`,
      [process.env.FACULTY_USERNAME, passwordHash, process.env.FACULTY_FIRST_NAME || 'Course', process.env.FACULTY_SURNAME || 'Faculty']);
    }
    await connection.commit();
    console.log('Database seeded with 4 modules, 12 chapters, and 20 questions per quiz.');
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}
seed().catch((error) => { console.error(error.message); process.exitCode = 1; });
