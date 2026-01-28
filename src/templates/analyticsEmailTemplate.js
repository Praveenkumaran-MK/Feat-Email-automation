
export function generateAnalyticsEmail(department, analyticsData, date = new Date()) {
  const timeZone = process.env.APP_TIMEZONE || 'UTC';
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone 
  });

  const subject = `Daily OD Analytics - ${department} - ${formattedDate}`;

  const totalStudents = Object.values(analyticsData).reduce((a, b) => a + b, 0);

  let contentBody = '';

  // CSS Styles inlined for email compatibility
  const cardStyle = `background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; margin-bottom: 24px; border: 1px solid #eef2f6;`;
  const headerStyle = `background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 32px 24px; text-align: center; color: white;`;
  const tableHeaderStyle = `background-color: #f8fafc; color: #475569; font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; padding: 16px; border-bottom: 2px solid #e2e8f0;`;
  const tableCellStyle = `padding: 16px; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 14px;`;
  const statCardStyle = `background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; text-align: center; margin: 0 auto; max-width: 200px;`;

  if (totalStudents === 0) {
    contentBody = `
      <div style="${cardStyle} padding: 48px 24px; text-align: center;">
        <div style="background-color: #f0fdf4; width: 64px; height: 64px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <span style="font-size: 32px;">🎓</span>
        </div>
        <h3 style="margin: 0; color: #166534; font-size: 20px; font-weight: 700;">All Clear Today!</h3>
        <p style="margin: 12px 0 0; color: #64748b; font-size: 15px; line-height: 1.6;">
          No On-Duty requests for today.<br>Looks like full attendance focus!
        </p>
      </div>
    `;
  } else {
    const rows = Object.entries(analyticsData)
      .sort()
      .map(([section, count]) => `
        <tr style="transition: background-color 0.2s;">
          <td style="${tableCellStyle} border-right: 1px solid #f1f5f9;"><strong>${section}</strong></td>
          <td style="${tableCellStyle} text-align: center;">
            <span style="background-color: #eff6ff; color: #1e40af; padding: 4px 12px; border-radius: 99px; font-weight: 600; font-size: 13px;">${count}</span>
          </td>
        </tr>
      `).join('');

    contentBody = `
      <div style="${cardStyle} padding: 32px 24px;">
        <p style="text-align: center; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; font-weight: 600;">Overview</p>
        
        <div style="${statCardStyle}">
          <span style="display: block; font-size: 36px; font-weight: 800; color: #0ea5e9; line-height: 1;">${totalStudents}</span>
          <span style="display: block; font-size: 13px; color: #0369a1; font-weight: 600; margin-top: 4px;">Students on OD</span>
        </div>
      </div>

      <div style="${cardStyle}">
        <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; background-color: #ffffff;">
          <h3 style="margin: 0; color: #334155; font-size: 16px; font-weight: 700;">Section Breakdown</h3>
        </div>
        <table style="width: 100%; border-collapse: separate; border-spacing: 0;">
          <thead>
            <tr>
              <th style="${tableHeaderStyle} text-align: left;">Section</th>
              <th style="${tableHeaderStyle} text-align: center;">Student Count</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background-color: #f1f5f9; color: #334155;">
      
      <div style="max-width: 600px; margin: 40px auto; padding: 0 16px;">
        
        <!-- Main Container -->
        <div style="border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1); background-color: #f8fafc;">
          
          <!-- Header Hero -->
          <div style="${headerStyle}">
            <div style="background-color: rgba(255,255,255,0.1); padding: 12px; border-radius: 12px; display: inline-block; margin-bottom: 16px;">
              <img src="https://raw.githubusercontent.com/Praveenkumaran-MK/Feat-Email-automation/main/data/cit_logo.png" alt="CIT Logo" style="height: 48px; width: auto; display: block;">
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.02em;">Daily OD Analytics</h1>
            <div style="margin-top: 8px; opacity: 0.9; font-size: 15px;">${department} Department</div>
            <div style="margin-top: 24px; display: inline-block; background-color: rgba(255,255,255,0.15); padding: 6px 16px; border-radius: 99px; font-size: 13px; font-weight: 600;">
              📅 ${formattedDate}
            </div>
          </div>

          <!-- Body Content -->
          <div style="padding: 32px 24px; background-color: #f8fafc;">
            ${contentBody}
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding: 24px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; background-color: #ffffff;">
            <p style="margin: 0 0 4px;"><strong>Chennai Institute of Technology</strong></p>
            <p style="margin: 0;">Automated Attendance & OD System</p>
          </div>

        </div>
        
        <div style="text-align: center; margin-top: 24px; color: #94a3b8; font-size: 11px;">
          Generated automatically • Only for Coordinator & HOD
        </div>

      </div>

    </body>
    </html>
  `;

  return { subject, htmlContent };
}
