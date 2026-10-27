const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

/**
 * Generate CSV for Topic Gradebook
 */
async function generateTopicGradebookCSV(chapterInfo, studentsData) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Topic Gradebook');

  worksheet.columns = [
    { header: 'Username', key: 'username', width: 15 },
    { header: 'First Name', key: 'first_name', width: 20 },
    { header: 'Surname', key: 'surname', width: 20 },
    { header: 'Attempts', key: 'attempts_count', width: 12 },
    { header: 'Latest Score (/20)', key: 'latest_score', width: 18 },
    { header: 'Highest Score (/20)', key: 'highest_score', width: 18 },
    { header: 'Highest Percentage', key: 'highest_percentage', width: 18 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Latest Attempt Date', key: 'latest_attempt_at', width: 24 }
  ];

  studentsData.forEach(s => {
    worksheet.addRow({
      username: s.username,
      first_name: s.first_name,
      surname: s.surname,
      attempts_count: s.attempts_count,
      latest_score: s.latest_score !== null ? `${s.latest_score} / 20` : 'N/A',
      highest_score: s.highest_score !== null ? `${s.highest_score} / 20` : 'N/A',
      highest_percentage: s.highest_percentage !== null ? `${s.highest_percentage}%` : 'N/A',
      status: s.status.toUpperCase(),
      latest_attempt_at: s.latest_attempt_at ? new Date(s.latest_attempt_at).toISOString() : 'Never'
    });
  });

  return await workbook.csv.writeBuffer();
}

/**
 * Generate XLSX for Topic Gradebook
 */
async function generateTopicGradebookXLSX(chapterInfo, studentsData) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Data Mining LMS (ITEP411-T)';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(`Chapter ${chapterInfo.chapter_number} Gradebook`);

  // Title block
  worksheet.mergeCells('A1:I1');
  worksheet.getCell('A1').value = `Course: Data Mining (Elective 2) — ITEP411-T (4th Year, 1st Term)`;
  worksheet.getCell('A1').font = { bold: true, size: 14 };

  worksheet.mergeCells('A2:I2');
  worksheet.getCell('A2').value = `Topic Gradebook: Chapter ${chapterInfo.chapter_number} — ${chapterInfo.title}`;
  worksheet.getCell('A2').font = { bold: true, size: 12, color: { argb: 'FF1E40AF' } };

  worksheet.mergeCells('A3:I3');
  worksheet.getCell('A3').value = `Generated: ${new Date().toLocaleString()} | Passing Criteria: 15/20 (75%)`;
  worksheet.getCell('A3').font = { italic: true, size: 10 };

  worksheet.addRow([]); // Blank line

  // Table headers
  const headerRow = worksheet.addRow([
    'Username',
    'First Name',
    'Surname',
    'Attempts',
    'Latest Score (/20)',
    'Highest Score (/20)',
    'Highest %',
    'Status',
    'Latest Attempt Date'
  ]);

  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' }
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Table data
  studentsData.forEach(s => {
    const row = worksheet.addRow([
      s.username,
      s.first_name,
      s.surname,
      s.attempts_count,
      s.latest_score !== null ? s.latest_score : 'N/A',
      s.highest_score !== null ? s.highest_score : 'N/A',
      s.highest_percentage !== null ? `${s.highest_percentage}%` : 'N/A',
      s.status.toUpperCase(),
      s.latest_attempt_at ? new Date(s.latest_attempt_at).toLocaleString() : 'Never'
    ]);

    // Color status cell
    const statusCell = row.getCell(8);
    if (s.status === 'passed') {
      statusCell.font = { color: { argb: 'FF166534' }, bold: true };
    } else if (s.status === 'failed') {
      statusCell.font = { color: { argb: 'FF991B1B' }, bold: true };
    }
  });

  // Set column widths
  worksheet.columns.forEach((column, i) => {
    column.width = [16, 20, 20, 12, 18, 18, 14, 16, 24][i] || 15;
  });

  return await workbook.xlsx.writeBuffer();
}

/**
 * Generate PDF for Topic Gradebook
 */
function generateTopicGradebookPDF(chapterInfo, studentsData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header Banner
      doc.fillColor('#1E3A8A').fontSize(16).text('Data Mining (Elective 2) — ITEP411-T', { align: 'left' });
      doc.fontSize(11).fillColor('#4B5563').text(`Academic Year: 4th Year, 1st Term (4-1)  |  Report: Topic Gradebook`, { align: 'left' });
      doc.moveDown(0.5);

      doc.fillColor('#0F172A').fontSize(13).text(`Chapter ${chapterInfo.chapter_number}: ${chapterInfo.title}`);
      doc.fontSize(9).fillColor('#64748B').text(`Generated: ${new Date().toLocaleString()}  |  Passing Threshold: 75% (15/20)`);
      doc.moveDown(1);

      // Simple Table layout
      const tableTop = doc.y;
      const headers = ['Username', 'Full Name', 'Attempts', 'Latest Score', 'Highest Score', 'Status', 'Latest Attempt'];
      const colX = [40, 140, 280, 360, 460, 560, 660];

      // Draw header row
      doc.rect(40, tableTop, 720, 20).fill('#1E3A8A');
      doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold');

      headers.forEach((h, i) => {
        doc.text(h, colX[i] + 4, tableTop + 5);
      });

      let yPos = tableTop + 24;
      doc.font('Helvetica').fontSize(9);

      studentsData.forEach((s, idx) => {
        if (yPos > doc.page.height - 50) {
          doc.addPage({ margin: 40, size: 'A4', layout: 'landscape' });
          yPos = 50;
        }

        // Alternating zebra row background
        if (idx % 2 === 1) {
          doc.rect(40, yPos - 3, 720, 18).fill('#F8FAFC');
        }

        doc.fillColor('#1E293B');
        doc.text(s.username, colX[0] + 4, yPos);
        doc.text(`${s.surname}, ${s.first_name}`, colX[1] + 4, yPos);
        doc.text(String(s.attempts_count), colX[2] + 4, yPos);
        doc.text(s.latest_score !== null ? `${s.latest_score}/20` : '-', colX[3] + 4, yPos);
        doc.text(s.highest_score !== null ? `${s.highest_score}/20 (${s.highest_percentage}%)` : '-', colX[4] + 4, yPos);

        // Status coloring
        if (s.status === 'passed') {
          doc.fillColor('#16A34A').font('Helvetica-Bold').text('PASSED', colX[5] + 4, yPos);
        } else if (s.status === 'failed') {
          doc.fillColor('#DC2626').font('Helvetica-Bold').text('FAILED', colX[5] + 4, yPos);
        } else {
          doc.fillColor('#64748B').font('Helvetica').text(s.status.toUpperCase(), colX[5] + 4, yPos);
        }

        doc.font('Helvetica').fillColor('#64748B');
        doc.text(s.latest_attempt_at ? new Date(s.latest_attempt_at).toLocaleDateString() : 'Never', colX[6] + 4, yPos);

        yPos += 18;
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generate CSV for Master Gradebook (all 12 chapters)
 */
async function generateMasterGradebookCSV(masterData) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Master Gradebook');

  const columns = [
    { header: 'Username', key: 'username', width: 16 },
    { header: 'Full Name', key: 'full_name', width: 24 }
  ];

  for (let ch = 1; ch <= 12; ch++) {
    columns.push({ header: `Ch ${ch} Score`, key: `ch_${ch}`, width: 12 });
  }

  columns.push(
    { header: 'Total Attempts', key: 'total_attempts', width: 14 },
    { header: 'Average Score (%)', key: 'average_score', width: 16 },
    { header: 'Chapters Passed (/12)', key: 'chapters_passed', width: 20 },
    { header: 'Completion %', key: 'completion_percentage', width: 16 }
  );

  worksheet.columns = columns;

  masterData.students.forEach(s => {
    const row = {
      username: s.username,
      full_name: `${s.surname}, ${s.first_name}`
    };

    for (let ch = 1; ch <= 12; ch++) {
      const chapData = s.chapters[ch];
      row[`ch_${ch}`] = chapData && chapData.best_score !== null ? `${chapData.best_score}/20` : 'Not Attempted';
    }

    row.total_attempts = s.total_attempts;
    row.average_score = s.average_score !== null ? `${s.average_score}%` : 'N/A';
    row.chapters_passed = `${s.passed_count} / 12`;
    row.completion_percentage = `${s.completion_percentage}%`;

    worksheet.addRow(row);
  });

  return await workbook.csv.writeBuffer();
}

/**
 * Generate XLSX for Master Gradebook
 */
async function generateMasterGradebookXLSX(masterData) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Master Gradebook');

  worksheet.mergeCells('A1:Q1');
  worksheet.getCell('A1').value = `Data Mining (Elective 2) — ITEP411-T: Master Class Gradebook`;
  worksheet.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF1E3A8A' } };

  worksheet.mergeCells('A2:Q2');
  worksheet.getCell('A2').value = `Academic Year: 4th Year, 1st Term (4-1)  |  Generated: ${new Date().toLocaleString()}`;
  worksheet.getCell('A2').font = { italic: true, size: 10 };

  worksheet.addRow([]); // Blank line

  const headerTitles = ['Username', 'Full Name'];
  for (let ch = 1; ch <= 12; ch++) headerTitles.push(`Ch ${ch}`);
  headerTitles.push('Total Attempts', 'Average %', 'Passed (/12)', 'Completion %');

  const headerRow = worksheet.addRow(headerTitles);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' }
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  masterData.students.forEach(s => {
    const rowVals = [s.username, `${s.surname}, ${s.first_name}`];

    for (let ch = 1; ch <= 12; ch++) {
      const chapData = s.chapters[ch];
      if (chapData && chapData.best_score !== null) {
        rowVals.push(`${chapData.best_score}/20`);
      } else {
        rowVals.push('-');
      }
    }

    rowVals.push(
      s.total_attempts,
      s.average_score !== null ? `${s.average_score}%` : 'N/A',
      `${s.passed_count}/12`,
      `${s.completion_percentage}%`
    );

    const r = worksheet.addRow(rowVals);

    // Apply color indicators to chapter score cells
    for (let ch = 1; ch <= 12; ch++) {
      const cell = r.getCell(ch + 2);
      const chapData = s.chapters[ch];
      if (chapData) {
        if (chapData.status === 'passed') {
          cell.font = { color: { argb: 'FF166534' }, bold: true };
        } else if (chapData.status === 'failed') {
          cell.font = { color: { argb: 'FFDC2626' } };
        }
      }
    }
  });

  worksheet.columns.forEach((col, idx) => {
    col.width = idx < 2 ? 22 : (idx < 14 ? 11 : 16);
  });

  return await workbook.xlsx.writeBuffer();
}

/**
 * Generate PDF for Master Gradebook
 */
function generateMasterGradebookPDF(masterData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Title
      doc.fillColor('#1E3A8A').fontSize(14).font('Helvetica-Bold').text('Data Mining (Elective 2) — ITEP411-T: Master Gradebook', 30, 30);
      doc.fillColor('#64748B').fontSize(9).font('Helvetica').text(`4th Year, 1st Term (4-1)  |  Generated: ${new Date().toLocaleString()}`);
      doc.moveDown(0.8);

      const tableTop = doc.y;
      const colWidths = [100, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 45, 50, 50];
      const headers = ['Student', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'C11', 'C12', 'Avg', 'Pass', 'Comp'];

      // Header background
      doc.rect(30, tableTop, 780, 18).fill('#1E3A8A');
      doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold');

      let curX = 35;
      headers.forEach((h, i) => {
        doc.text(h, curX, tableTop + 5, { width: colWidths[i], align: i === 0 ? 'left' : 'center' });
        curX += colWidths[i];
      });

      let yPos = tableTop + 22;
      doc.font('Helvetica').fontSize(8);

      masterData.students.forEach((s, idx) => {
        if (yPos > doc.page.height - 40) {
          doc.addPage({ margin: 30, size: 'A4', layout: 'landscape' });
          yPos = 30;
        }

        if (idx % 2 === 1) {
          doc.rect(30, yPos - 3, 780, 16).fill('#F8FAFC');
        }

        let x = 35;
        doc.fillColor('#1E293B').font('Helvetica');
        doc.text(`${s.surname}, ${s.first_name[0]}.`, x, yPos, { width: colWidths[0], align: 'left' });
        x += colWidths[0];

        for (let ch = 1; ch <= 12; ch++) {
          const cData = s.chapters[ch];
          if (cData && cData.best_score !== null) {
            doc.fillColor(cData.best_score >= 15 ? '#16A34A' : '#DC2626');
            doc.text(String(cData.best_score), x, yPos, { width: colWidths[ch], align: 'center' });
          } else {
            doc.fillColor('#94A3B8').text('-', x, yPos, { width: colWidths[ch], align: 'center' });
          }
          x += colWidths[ch];
        }

        doc.fillColor('#1E293B');
        doc.text(s.average_score !== null ? `${s.average_score}%` : 'N/A', x, yPos, { width: colWidths[13], align: 'center' });
        x += colWidths[13];

        doc.text(`${s.passed_count}/12`, x, yPos, { width: colWidths[14], align: 'center' });
        x += colWidths[14];

        doc.text(`${s.completion_percentage}%`, x, yPos, { width: colWidths[15], align: 'center' });

        yPos += 16;
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generate Student Personal Performance Summary PDF
 */
function generateStudentSummaryPDF(student, summaryData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fillColor('#1E3A8A').fontSize(18).font('Helvetica-Bold').text('Academic Performance Transcript', { align: 'center' });
      doc.fillColor('#4B5563').fontSize(11).font('Helvetica').text('Data Mining (Elective 2) — ITEP411-T (4th Year, 1st Term)', { align: 'center' });
      doc.moveDown(1);

      // Student info box
      doc.rect(40, doc.y, 515, 65).fill('#F1F5F9');
      const boxY = doc.y - 65 + 10;
      doc.fillColor('#0F172A').fontSize(10).font('Helvetica-Bold');
      doc.text(`Student Name: ${student.first_name} ${student.surname}`, 55, boxY);
      doc.text(`Username: ${student.username}`, 55, boxY + 15);
      doc.text(`Course Completion: ${summaryData.stats.completionPercentage}%`, 320, boxY);
      doc.text(`Chapters Passed: ${summaryData.stats.passedChapters} / 12`, 320, boxY + 15);
      doc.text(`Overall Average Score: ${summaryData.stats.averageScore ? `${summaryData.stats.averageScore}%` : 'N/A'}`, 320, boxY + 30);
      doc.moveDown(1.5);

      // Table of chapters
      const tableTop = doc.y;
      doc.rect(40, tableTop, 515, 20).fill('#1E3A8A');
      doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold');
      doc.text('Chapter & Module', 45, tableTop + 5);
      doc.text('Attempts', 270, tableTop + 5);
      doc.text('Highest Score', 340, tableTop + 5);
      doc.text('Status', 440, tableTop + 5);

      let yPos = tableTop + 24;
      doc.font('Helvetica').fontSize(9);

      summaryData.chapters.forEach((c, idx) => {
        if (idx % 2 === 1) {
          doc.rect(40, yPos - 3, 515, 18).fill('#F8FAFC');
        }

        doc.fillColor('#1E293B');
        doc.text(`Ch ${c.chapterNumber}: ${c.title.substring(0, 32)}`, 45, yPos);
        doc.text(String(c.attemptsCount), 280, yPos);
        doc.text(c.bestScore !== null ? `${c.bestScore}/20 (${c.bestPercentage}%)` : '-', 340, yPos);

        if (c.status === 'passed') {
          doc.fillColor('#16A34A').font('Helvetica-Bold').text('PASSED', 440, yPos);
        } else if (c.status === 'failed') {
          doc.fillColor('#DC2626').font('Helvetica-Bold').text('FAILED', 440, yPos);
        } else {
          doc.fillColor('#64748B').font('Helvetica').text(c.status.toUpperCase(), 440, yPos);
        }

        doc.font('Helvetica');
        yPos += 18;
      });

      doc.moveDown(2);
      doc.fontSize(8).fillColor('#94A3B8').text(`Official system-generated report. Timestamp: ${new Date().toISOString()}`, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generateTopicGradebookCSV,
  generateTopicGradebookXLSX,
  generateTopicGradebookPDF,
  generateMasterGradebookCSV,
  generateMasterGradebookXLSX,
  generateMasterGradebookPDF,
  generateStudentSummaryPDF
};

