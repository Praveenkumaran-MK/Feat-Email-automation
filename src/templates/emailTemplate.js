/**
 * Generate OD notification email for teachers
 * @param {Object} teacher - Teacher data
 * @param {Array} students - List of students for the section
 * @param {Date} date - Current date
 * @returns {Object} Email subject and HTML content
 */
export function generateODEmail(teacher, students, date = new Date()) {
  const timeZone = process.env.APP_TIMEZONE || 'UTC';
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone 
  });
  
  const subject = `OD Notification - Section ${teacher.section.toUpperCase()} - ${formattedDate}`;
  
  const studentRows = students.map((student, index) => `
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center;">${index + 1}</td>
      <td style="border: 1px solid #000; padding: 8px; text-align: left;">${student.name}</td>
      <td style="border: 1px solid #000; padding: 8px; text-align: left;">${student.regno}</td>
      <td style="border: 1px solid #000; padding: 8px; text-align: left;">${student.event}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${subject}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #000;">
      
      <!-- Header with Logo -->
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://raw.githubusercontent.com/Praveenkumaran-MK/Feat-Email-automation/main/data/cit_logo.png" alt="CIT Logo" style="max-width: 150px; height: auto;">
        <h2 style="margin-top: 10px; color: #1e3a8a;">On-Duty (OD) Attendance Report</h2>
        <p style="margin: 5px 0; font-weight: bold;">${formattedDate}</p>
      </div>

      <!-- Brief Greeting -->
      <p>Respected <strong>${teacher.name}</strong>,</p>
      <p>Please find below the list of students from <strong>Section ${teacher.section.toUpperCase()}</strong> who are on duty today:</p>

      <!-- Copyable Student Table -->
      <table style="width: 100%; max-width: 600px; border-collapse: collapse; margin-top: 10px; font-size: 14px;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="border: 1px solid #000; padding: 8px; text-align: center; width: 50px;">S.No</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: left;">Name</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: left;">Reg. No</th>
            <th style="border: 1px solid #000; padding: 8px; text-align: left;">Event</th>
          </tr>
        </thead>
        <tbody>
          ${studentRows}
        </tbody>
      </table>

      <!-- Footer -->
      <div style="margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 10px;">
        <p>Chennai Institute of Technology | Automated Attendance System</p>
      </div>

    </body>
    </html>
  `;

  return { subject, htmlContent };
}

/**
 * Legacy support for existing references (optional)
 */
export function generateDailyEmail(subscriber, date = new Date()) {
  // Keeping this for compatibility if needed, but the main logic will use generateODEmail
  return { subject: "Update", htmlContent: "Please see new template" };
}
