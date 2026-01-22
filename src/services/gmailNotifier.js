import nodemailer from 'nodemailer';
import { collectDiagnostics, generateDiagnosticHTML } from './diagnosticService.js';

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
 * Get color and icon for error category
 */
function getErrorCategoryStyle(category) {
  const styles = {
    'API_LIMIT_EXCEEDED': { color: '#ff6b6b', icon: '🚫', label: 'API Limit Exceeded' },
    'AUTHENTICATION_ERROR': { color: '#dc3545', icon: '🔐', label: 'Authentication Error' },
    'NETWORK_ERROR': { color: '#fd7e14', icon: '🌐', label: 'Network Error' },
    'VALIDATION_ERROR': { color: '#ffc107', icon: '⚠️', label: 'Validation Error' },
    'RATE_LIMIT': { color: '#e83e8c', icon: '⏱️', label: 'Rate Limit' },
    'FATAL_ERROR': { color: '#6f42c1', icon: '💥', label: 'Fatal Error' },
    'UNKNOWN_ERROR': { color: '#6c757d', icon: '❓', label: 'Unknown Error' }
  };
  return styles[category] || styles['UNKNOWN_ERROR'];
}

/**
 * Generate troubleshooting guidance HTML based on error category
 */
function getTroubleshootingGuidance(category, details) {
  const guidance = {
    'API_LIMIT_EXCEEDED': {
      title: 'API Limit Exceeded',
      steps: [
        'Check your Brevo dashboard for current usage and limits',
        'Upgrade your Brevo plan if you need higher limits',
        'Wait for quota reset (daily limits reset at midnight UTC)',
        'Consider spreading emails across multiple days'
      ]
    },
    'AUTHENTICATION_ERROR': {
      title: 'Authentication Error',
      steps: [
        'Verify BREVO_API_KEY in GitHub repository secrets',
        'Check if API key is active in Brevo dashboard',
        'Regenerate API key if necessary',
        'Ensure API key has correct permissions'
      ]
    },
    'NETWORK_ERROR': {
      title: 'Network Error',
      steps: [
        'Check GitHub Actions network status',
        'Retry the workflow manually',
        'Check if Brevo API is experiencing downtime',
        'Verify firewall/proxy settings if applicable'
      ]
    },
    'VALIDATION_ERROR': {
      title: 'Validation Error',
      steps: [
        'Verify SENDER_EMAIL is confirmed in Brevo dashboard',
        'Check that all recipient emails are valid',
        'Ensure sender domain is properly configured',
        'Review email content for compliance issues'
      ]
    },
    'RATE_LIMIT': {
      title: 'Rate Limit',
      steps: [
        'Increase RATE_LIMIT_DELAY_MS environment variable',
        'Current delay should be at least 2000ms (2 seconds)',
        'Consider reducing MAX_EMAILS_PER_DAY if needed'
      ]
    },
    'FATAL_ERROR': {
      title: 'Fatal Error',
      steps: [
        'Check GitHub Actions logs for detailed error trace',
        'Verify CSV files are properly formatted',
        'Ensure all required environment variables are set',
        'Review recent code changes for issues'
      ]
    }
  };
  
  const guide = guidance[category] || {
    title: 'Unknown Error',
    steps: ['Check GitHub Actions logs for details', 'Contact support if issue persists']
  };
  
  return `
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-top: 20px; border-radius: 5px;">
      <h4 style="color: #856404; margin-top: 0;">🔧 Troubleshooting: ${guide.title}</h4>
      <ol style="margin: 10px 0 0 0; padding-left: 20px; color: #856404;">
        ${guide.steps.map(step => `<li style="margin: 5px 0;">${step}</li>`).join('')}
      </ol>
      ${details?.suggestion ? `<p style="margin: 10px 0 0 0; color: #856404;"><strong>Suggestion:</strong> ${details.suggestion}</p>` : ''}
    </div>
  `;
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
    
    // Collect diagnostic information
    console.log('🔍 Collecting diagnostic information...');
    let diagnostics = null;
    try {
      diagnostics = await collectDiagnostics();
    } catch (diagError) {
      console.warn('⚠️  Could not collect diagnostics:', diagError.message);
    }
    
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
            
            ${context.failedEmails.slice(0, 15).map(failed => {
              const categoryStyle = getErrorCategoryStyle(failed.category || 'UNKNOWN_ERROR');
              return `
                <div style="background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid ${categoryStyle.color}; border-radius: 5px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div>
                      <strong style="font-size: 16px;">${failed.name}</strong>
                      <span style="color: #6c757d; margin-left: 10px;">${failed.section || ''}</span>
                    </div>
                    <span style="background-color: ${categoryStyle.color}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold;">
                      ${categoryStyle.icon} ${categoryStyle.label}
                    </span>
                  </div>
                  <div style="color: #495057; margin-bottom: 5px;">
                    📧 <strong>Email:</strong> ${failed.email}
                  </div>
                  ${failed.studentCount ? `
                    <div style="color: #6c757d; font-size: 14px; margin-bottom: 5px;">
                      👥 <strong>Students affected:</strong> ${failed.studentCount}
                    </div>
                  ` : ''}
                  ${failed.httpStatus && failed.httpStatus !== 'N/A' ? `
                    <div style="color: #6c757d; font-size: 14px; margin-bottom: 5px;">
                      🔢 <strong>HTTP Status:</strong> ${failed.httpStatus}
                    </div>
                  ` : ''}
                  <div style="color: #dc3545; font-size: 14px; background-color: #f8f9fa; padding: 8px; border-radius: 3px; margin-top: 8px;">
                    <strong>Error:</strong> ${failed.error}
                  </div>
                </div>
              `;
            }).join('')}
            ${context.failedEmails.length > 15 ? `
              <div style="color: #6c757d; text-align: center; padding: 10px;">
                ... and ${context.failedEmails.length - 15} more failures
              </div>
            ` : ''}
            
            ${(() => {
              // Group errors by category for troubleshooting
              const categoryCounts = {};
              let primaryCategory = 'UNKNOWN_ERROR';
              let maxCount = 0;
              
              context.failedEmails.forEach(f => {
                const cat = f.category || 'UNKNOWN_ERROR';
                categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
                if (categoryCounts[cat] > maxCount) {
                  maxCount = categoryCounts[cat];
                  primaryCategory = cat;
                }
              });
              
              // Show troubleshooting for the most common error category
              const sampleError = context.failedEmails.find(f => f.category === primaryCategory);
              return getTroubleshootingGuidance(primaryCategory, sampleError?.details);
            })()}
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

          ${context.fatalError ? `
            <div style="background-color: #f8d7da; border: 1px solid #dc3545; padding: 15px; margin-top: 20px; border-radius: 5px; color: #721c24;">
              <strong>💥 FATAL ERROR - No Emails Sent</strong>
              <p style="margin: 10px 0 0 0;">A critical error occurred before any emails could be sent. All teachers listed above were affected.</p>
            </div>
          ` : ''}
          
          ${diagnostics ? generateDiagnosticHTML(diagnostics) : ''}
          
          <div style="background-color: #e7f3ff; border: 1px solid #2196F3; padding: 15px; margin-top: 20px; border-radius: 5px;">
            <strong>📋 Action Required:</strong>
            <p style="margin: 10px 0 0 0;">Please review the error details and diagnostics above, then check the GitHub Actions logs for complete information.</p>
            <p style="margin: 10px 0 0 0;"><a href="https://github.com" style="color: #2196F3;">View GitHub Actions Logs →</a></p>
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

          ${stats.todayDetails ? `
            <h3 style="color: #2c3e50; margin-top: 20px;">📧 Today's Email Details</h3>
            <div style="background-color: white; padding: 15px; border-radius: 5px;">
              <div style="margin-bottom: 10px;">
                <strong>Date:</strong> ${stats.todayDetails.date}<br>
                <strong>Total Students:</strong> ${stats.todayDetails.totalStudents}<br>
                <strong>Sections:</strong> ${stats.todayDetails.sections.length}
              </div>
              
              ${stats.todayDetails.sentEmails && stats.todayDetails.sentEmails.length > 0 ? `
                <div style="margin-top: 15px;">
                  <strong>Emails Sent:</strong>
                  ${stats.todayDetails.sentEmails.map(email => `
                    <div style="background-color: #f8f9fa; padding: 10px; margin: 8px 0; border-left: 3px solid #28a745; border-radius: 3px;">
                      <div style="font-weight: bold; color: #2c3e50;">Section ${email.section}</div>
                      <div style="color: #6c757d; font-size: 14px; margin-top: 3px;">
                        Teacher: ${email.teacher}<br>
                        📧 ${email.email}<br>
                        👥 Students: ${email.studentCount}
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          ` : ''}

          ${stats.failed > 0 && stats.failedEmails ? `
            <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin-top: 20px; border-radius: 5px;">
              <strong>⚠️ Failed Emails (${stats.failedEmails.length}):</strong>
              <div style="margin-top: 10px;">
                ${stats.failedEmails.slice(0, 8).map(failed => {
                  const categoryStyle = getErrorCategoryStyle(failed.category || 'UNKNOWN_ERROR');
                  return `
                    <div style="background-color: white; padding: 10px; margin: 8px 0; border-left: 3px solid ${categoryStyle.color}; border-radius: 3px;">
                      <div style="font-weight: bold; color: #2c3e50;">${failed.name} - ${failed.section || 'N/A'}</div>
                      <div style="color: #6c757d; font-size: 14px; margin-top: 3px;">📧 ${failed.email}</div>
                      <div style="margin-top: 5px;">
                        <span style="background-color: ${categoryStyle.color}; color: white; padding: 2px 8px; border-radius: 8px; font-size: 11px; font-weight: bold;">
                          ${categoryStyle.icon} ${categoryStyle.label}
                        </span>
                      </div>
                    </div>
                  `;
                }).join('')}
                ${stats.failedEmails.length > 8 ? `
                  <div style="text-align: center; color: #6c757d; margin-top: 10px;">
                    ... and ${stats.failedEmails.length - 8} more
                  </div>
                ` : ''}
              </div>
            </div>
          ` : `
            <div style="background-color: #d4edda; border: 1px solid #28a745; padding: 15px; margin-top: 20px; border-radius: 5px; color: #155724;">
              <strong>✅ All emails sent successfully!</strong>
            </div>
          `}

          ${stats.preFlightResults ? `
            <h3 style="color: #2c3e50; margin-top: 20px;">✅ Pre-Flight Validation</h3>
            <div style="background-color: white; padding: 15px; border-radius: 5px;">
              <div style="margin-bottom: 8px;">
                ${stats.preFlightResults.checks.csvValidation.passed ? '✅' : '❌'} CSV Validation: 
                ${stats.preFlightResults.checks.csvValidation.passed ? 'Passed' : 'Failed'}
              </div>
              <div style="margin-bottom: 8px;">
                ${stats.preFlightResults.checks.brevoStatus.passed ? '✅' : '❌'} Brevo API: 
                ${stats.preFlightResults.checks.brevoStatus.connected ? 'Connected' : 'Failed'}
              </div>
              <div style="margin-bottom: 8px;">
                ${stats.preFlightResults.checks.emailValidation.passed ? '✅' : '❌'} Email Validation: 
                ${stats.preFlightResults.checks.emailValidation.passed ? 'All valid' : 'Issues found'}
              </div>
              <div>
                ${stats.preFlightResults.checks.logicalErrors.passed ? '✅' : '❌'} Logical Checks: 
                ${stats.preFlightResults.checks.logicalErrors.passed ? 'No issues' : 'Issues found'}
              </div>
            </div>
          ` : ''}
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

/**
 * Send pre-flight failure report to admin
 * @param {Object} results - Pre-flight check results
 */
export async function sendPreFlightFailureReport(results) {
  try {
    const transport = initializeTransporter();
    if (!transport) {
      console.log('⚠️  Skipping pre-flight failure report (Gmail not configured)');
      return;
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER;
    const timeZone = process.env.APP_TIMEZONE || 'UTC';
    const today = new Date().toLocaleDateString('en-US', { timeZone });
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #dc3545; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
          <h2 style="margin: 0;">🚨 Email Automation Pre-Flight Check Failed</h2>
          <p style="margin: 10px 0 0 0; font-size: 14px;">${today}</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border: 1px solid #dee2e6;">
          <div style="background-color: #f8d7da; border: 1px solid #dc3545; padding: 15px; border-radius: 5px; color: #721c24; margin-bottom: 20px;">
            <strong>⚠️ NO EMAILS WERE SENT TODAY</strong>
            <p style="margin: 10px 0 0 0;">The system detected ${results.totalIssues} issue(s) that prevent sending emails. All issues must be resolved before emails can be sent.</p>
          </div>

          <h3 style="color: #2c3e50; margin-top: 0;">Validation Results</h3>
          
          <!-- CSV Validation -->
          <div style="margin-bottom: 20px;">
            <h4 style="color: #495057; margin-bottom: 8px;">
              ${results.checks.csvValidation.passed ? '✅' : '❌'} CSV Data Validation
            </h4>
            <div style="background-color: white; padding: 10px; border-radius: 3px;">
              ${results.checks.csvValidation.passed ? `
                <div style="color: #28a745;">✅ Validation Passed</div>
                <div style="font-size: 14px; color: #6c757d; margin-top: 5px;">
                  Students: ${results.checks.csvValidation.students.count}<br>
                  Teachers: ${results.checks.csvValidation.teachers.count}
                </div>
              ` : `
                <div style="color: #dc3545; font-weight: bold;">❌ Validation Failed</div>
                <ul style="margin: 10px 0; padding-left: 20px; color: #721c24;">
                  ${results.checks.csvValidation.issues.map(issue => `<li>${issue}</li>`).join('')}
                </ul>
              `}
            </div>
          </div>

          <!-- Brevo API Status -->
          <div style="margin-bottom: 20px;">
            <h4 style="color: #495057; margin-bottom: 8px;">
              ${results.checks.brevoStatus.passed ? '✅' : '❌'} Brevo API Status
            </h4>
            <div style="background-color: white; padding: 10px; border-radius: 3px;">
              ${results.checks.brevoStatus.connected ? `
                <div style="color: #28a745;">✅ Connected</div>
                <div style="font-size: 14px; color: #6c757d; margin-top: 5px;">
                  Account: ${results.checks.brevoStatus.account?.email}<br>
                  Plan: ${results.checks.brevoStatus.account?.plan}<br>
                  Credits: ${results.checks.brevoStatus.account?.credits}<br>
                  Sender Verified: ${results.checks.brevoStatus.senderVerified ? '✅ Yes' : '❌ No'}
                </div>
              ` : `
                <div style="color: #dc3545; font-weight: bold;">❌ Connection Failed</div>
              `}
              ${results.checks.brevoStatus.issues.length > 0 ? `
                <ul style="margin: 10px 0; padding-left: 20px; color: #721c24;">
                  ${results.checks.brevoStatus.issues.map(issue => `<li>${issue}</li>`).join('')}
                </ul>
              ` : ''}
            </div>
          </div>

          <!-- Email Validation -->
          <div style="margin-bottom: 20px;">
            <h4 style="color: #495057; margin-bottom: 8px;">
              ${results.checks.emailValidation.passed ? '✅' : '❌'} Teacher Email Validation
            </h4>
            <div style="background-color: white; padding: 10px; border-radius: 3px;">
              ${results.checks.emailValidation.passed ? `
                <div style="color: #28a745;">✅ All emails valid</div>
              ` : `
                <div style="color: #dc3545; font-weight: bold;">❌ Invalid Emails Found</div>
                <div style="margin-top: 10px;">
                  ${results.checks.emailValidation.invalidEmails.map(item => `
                    <div style="background-color: #f8f9fa; padding: 8px; margin: 5px 0; border-left: 3px solid #dc3545;">
                      <strong>Section ${item.section}:</strong> ${item.teacher}<br>
                      <span style="color: #dc3545; font-family: monospace;">${item.email}</span>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>

          <!-- Logical Errors -->
          <div style="margin-bottom: 20px;">
            <h4 style="color: #495057; margin-bottom: 8px;">
              ${results.checks.logicalErrors.passed ? '✅' : '❌'} Logical Validation
            </h4>
            <div style="background-color: white; padding: 10px; border-radius: 3px;">
              ${results.checks.logicalErrors.passed ? `
                ${results.checks.logicalErrors.noStudentsToday ? `
                  <div style="color: #856404;">ℹ️ No students scheduled for today</div>
                ` : `
                  <div style="color: #28a745;">✅ No issues found</div>
                `}
              ` : `
                <div style="color: #dc3545; font-weight: bold;">❌ Issues Found</div>
                ${results.checks.logicalErrors.missingSections.length > 0 ? `
                  <div style="margin-top: 10px;">
                    <strong>Missing Teachers:</strong>
                    ${results.checks.logicalErrors.missingSections.map(item => `
                      <div style="background-color: #f8f9fa; padding: 8px; margin: 5px 0; border-left: 3px solid #dc3545;">
                        <strong>Section ${item.section}:</strong> ${item.studentCount} student(s), no teacher assigned
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              `}
            </div>
          </div>

          <!-- Action Required -->
          <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin-top: 20px; border-radius: 5px;">
            <strong style="color: #856404;">📋 Action Required:</strong>
            <ol style="margin: 10px 0 0 0; padding-left: 20px; color: #856404;">
              ${results.checks.csvValidation.passed ? '' : '<li>Fix CSV data issues listed above</li>'}
              ${results.checks.brevoStatus.passed ? '' : '<li>Resolve Brevo API connection issues</li>'}
              ${results.checks.emailValidation.passed ? '' : '<li>Correct invalid email addresses in teachers.csv</li>'}
              ${results.checks.logicalErrors.passed ? '' : '<li>Assign teachers to all sections with students</li>'}
              <li>Re-run the workflow after fixing issues</li>
            </ol>
          </div>
        </div>

        <div style="background-color: #6c757d; color: white; padding: 15px; border-radius: 0 0 5px 5px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">Email Automation System - Pre-Flight Validation Report</p>
          <p style="margin: 5px 0 0 0;">Timestamp: ${new Date().toISOString()}</p>
        </div>
      </div>
    `;

    await transport.sendMail({
      from: process.env.GMAIL_USER,
      to: adminEmail,
      subject: `🚨 Email Automation Pre-Flight Failed - ${results.totalIssues} Issue(s) - ${today}`,
      html: htmlContent,
    });

    console.log(`✅ Pre-flight failure report sent to ${adminEmail}`);

  } catch (error) {
    console.error('❌ Failed to send pre-flight failure report:', error.message);
  }
}
