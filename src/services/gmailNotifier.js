import nodemailer from 'nodemailer';

let transporter = null;

function initializeTransporter() {
  if (transporter) return transporter;

  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPassword) {
    console.log('⚠️  Gmail credentials not configured - error notifications disabled');
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPassword,
    },
  });

  return transporter;
}

/**
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 */
export async function sendErrorNotification(error, context = {}) {
  try {
    const transport = initializeTransporter();
    if (!transport) {
      console.log('⚠️  Skipping error notification (Gmail not configured)');
      return;
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #dc3545; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
          <h2 style="margin: 0;">🚨 Email Automation Error Alert</h2>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border: 1px solid #dee2e6;">
          <h3 style="color: #dc3545; margin-top: 0;">Error Details</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; font-weight: bold; width: 150px;">Error Message:</td>
              <td style="padding: 8px; color: #dc3545;">${error.message}</td>
            </tr>
            <tr style="background-color: white;">
              <td style="padding: 8px; font-weight: bold;">Timestamp:</td>
              <td style="padding: 8px;">${new Date().toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Error Type:</td>
              <td style="padding: 8px;">${error.name || 'Unknown'}</td>
            </tr>
          </table>

          ${context.failedEmails && context.failedEmails.length > 0 ? `
            <h3 style="color: #dc3545; margin-top: 20px;">Failed Emails (${context.failedEmails.length})</h3>
            <ul style="background-color: white; padding: 15px; border-radius: 5px;">
              ${context.failedEmails.slice(0, 10).map(failed => `
                <li style="margin: 5px 0;">
                  <strong>${failed.name}</strong> (${failed.email})<br>
                  <span style="color: #6c757d; font-size: 14px;">${failed.error}</span>
                </li>
              `).join('')}
              ${context.failedEmails.length > 10 ? `<li style="color: #6c757d;">... and ${context.failedEmails.length - 10} more</li>` : ''}
            </ul>
          ` : ''}

          ${context.stats ? `
            <h3 style="color: #2c3e50; margin-top: 20px;">Execution Statistics</h3>
            <table style="width: 100%; border-collapse: collapse; background-color: white;">
              <tr>
                <td style="padding: 8px; font-weight: bold;">Total Subscribers:</td>
                <td style="padding: 8px;">${context.stats.total || 0}</td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <td style="padding: 8px; font-weight: bold;">Successful:</td>
                <td style="padding: 8px; color: #28a745;">${context.stats.success || 0}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Failed:</td>
                <td style="padding: 8px; color: #dc3545;">${context.stats.failed || 0}</td>
              </tr>
              <tr style="background-color: #f8f9fa;">
                <td style="padding: 8px; font-weight: bold;">Success Rate:</td>
                <td style="padding: 8px;">${context.stats.total > 0 ? ((context.stats.success / context.stats.total) * 100).toFixed(1) : 0}%</td>
              </tr>
            </table>
          ` : ''}

          <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin-top: 20px; border-radius: 5px;">
            <strong>⚠️ Action Required:</strong>
            <p style="margin: 10px 0 0 0;">Please check the GitHub Actions logs for detailed information and take appropriate action.</p>
          </div>
        </div>

        <div style="background-color: #6c757d; color: white; padding: 15px; border-radius: 0 0 5px 5px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">Email Automation System - Error Notification</p>
          <p style="margin: 5px 0 0 0;">Timestamp: ${new Date().toISOString()}</p>
        </div>
      </div>
    `;

    await transport.sendMail({
      from: process.env.GMAIL_USER,
      to: adminEmail,
      subject: `🚨 Email Automation Error - ${new Date().toLocaleDateString()}`,
      html: htmlContent,
    });

    console.log(`✅ Error notification sent to ${adminEmail}`);

  } catch (notificationError) {
    console.error('❌ Failed to send error notification:', notificationError.message);
  }
}

/**
 * @param {Object} stats 
 */
export async function sendDailySummary(stats) {
  try {
    const transport = initializeTransporter();
    if (!transport) {
      console.log('⚠️  Skipping daily summary (Gmail not configured)');
      return;
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER;
    
    const successRate = stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : 0;
    const statusColor = successRate >= 95 ? '#28a745' : successRate >= 80 ? '#ffc107' : '#dc3545';
    const statusIcon = successRate >= 95 ? '✅' : successRate >= 80 ? '⚠️' : '❌';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${statusColor}; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
          <h2 style="margin: 0;">${statusIcon} Daily Email Summary - ${new Date().toLocaleDateString()}</h2>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border: 1px solid #dee2e6;">
          <h3 style="color: #2c3e50; margin-top: 0;">Execution Summary</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div style="background-color: white; padding: 15px; border-radius: 5px; text-align: center;">
              <div style="font-size: 36px; font-weight: bold; color: #2c3e50;">${stats.total}</div>
              <div style="color: #6c757d; margin-top: 5px;">Total Emails</div>
            </div>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; text-align: center;">
              <div style="font-size: 36px; font-weight: bold; color: ${statusColor};">${successRate}%</div>
              <div style="color: #6c757d; margin-top: 5px;">Success Rate</div>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; background-color: white;">
            <tr>
              <td style="padding: 12px; font-weight: bold; border-bottom: 2px solid #dee2e6;">Metric</td>
              <td style="padding: 12px; font-weight: bold; border-bottom: 2px solid #dee2e6; text-align: right;">Value</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">✅ Successful</td>
              <td style="padding: 10px; border-bottom: 1px solid #dee2e6; text-align: right; color: #28a745; font-weight: bold;">${stats.success}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">❌ Failed</td>
              <td style="padding: 10px; border-bottom: 1px solid #dee2e6; text-align: right; color: #dc3545; font-weight: bold;">${stats.failed}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">⏱️ Execution Time</td>
              <td style="padding: 10px; border-bottom: 1px solid #dee2e6; text-align: right;">${stats.executionTime || 'N/A'}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px;">📅 Timestamp</td>
              <td style="padding: 10px; text-align: right;">${new Date().toLocaleString()}</td>
            </tr>
          </table>

          ${stats.failed > 0 && stats.failedEmails ? `
            <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin-top: 20px; border-radius: 5px;">
              <strong>⚠️ Failed Emails (${stats.failedEmails.length}):</strong>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                ${stats.failedEmails.slice(0, 5).map(failed => `
                  <li style="margin: 5px 0;">${failed.name} (${failed.email})</li>
                `).join('')}
                ${stats.failedEmails.length > 5 ? `<li>... and ${stats.failedEmails.length - 5} more</li>` : ''}
              </ul>
            </div>
          ` : `
            <div style="background-color: #d4edda; border: 1px solid #28a745; padding: 15px; margin-top: 20px; border-radius: 5px; color: #155724;">
              <strong>✅ All emails sent successfully!</strong>
            </div>
          `}
        </div>

        <div style="background-color: #6c757d; color: white; padding: 15px; border-radius: 0 0 5px 5px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">Email Automation System - Daily Summary</p>
        </div>
      </div>
    `;

    await transport.sendMail({
      from: process.env.GMAIL_USER,
      to: adminEmail,
      subject: `${statusIcon} Daily Email Summary - ${successRate}% Success - ${new Date().toLocaleDateString()}`,
      html: htmlContent,
    });

    console.log(`✅ Daily summary sent to ${adminEmail}`);

  } catch (error) {
    console.error('❌ Failed to send daily summary:', error.message);
  }
}
