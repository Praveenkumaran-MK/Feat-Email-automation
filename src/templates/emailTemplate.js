/**
 * Generate personalized email template
 * @param {Object} subscriber - Subscriber data
 * @param {Date} date - Current date
 * @returns {Object} Email subject and HTML content
 */
export function generateDailyEmail(subscriber, date = new Date()) {
  const subject = `Your Daily Update - ${formatDate(date)}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 20px 0;">
            
            <!-- Main Container -->
            <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                    Hello, ${subscriber.name}! 👋
                  </h1>
                  <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 14px;">
                    ${formatDate(date)}
                  </p>
                </td>
              </tr>

              <!-- Personalized Greeting -->
              <tr>
                <td style="padding: 30px 20px;">
                  <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Welcome to your daily update! We hope you're having a great day.
                  </p>
                  
                  ${getContentByPreference(subscriber.preferences, subscriber.department)}
                </td>
              </tr>

              <!-- Daily Highlights -->
              <tr>
                <td style="padding: 0 20px 30px 20px;">
                  <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; border-radius: 4px;">
                    <h3 style="color: #667eea; margin: 0 0 15px 0; font-size: 18px;">
                      📌 Today's Highlights
                    </h3>
                    <ul style="color: #555555; margin: 0; padding-left: 20px; line-height: 1.8;">
                      <li>Check your tasks and priorities for today</li>
                      <li>Review any pending items from yesterday</li>
                      <li>Plan your schedule for maximum productivity</li>
                      <li>Stay connected with your team</li>
                    </ul>
                  </div>
                </td>
              </tr>

              <!-- Department Info -->
              ${subscriber.department !== 'General' ? `
              <tr>
                <td style="padding: 0 20px 30px 20px;">
                  <div style="background-color: #e7f3ff; border-radius: 4px; padding: 15px; text-align: center;">
                    <p style="color: #0066cc; margin: 0; font-size: 14px;">
                      <strong>Department:</strong> ${subscriber.department}
                    </p>
                  </div>
                </td>
              </tr>
              ` : ''}

              <!-- Call to Action -->
              <tr>
                <td style="padding: 0 20px 30px 20px; text-align: center;">
                  <a href="#" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 25px; font-weight: 600; font-size: 16px;">
                    View Dashboard
                  </a>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                  <p style="color: #888888; font-size: 12px; margin: 0 0 10px 0;">
                    You're receiving this email because you subscribed on ${subscriber.subscribed_date}
                  </p>
                  <p style="color: #888888; font-size: 12px; margin: 0;">
                    <a href="#" style="color: #667eea; text-decoration: none;">Update Preferences</a> | 
                    <a href="#" style="color: #667eea; text-decoration: none;">Unsubscribe</a>
                  </p>
                  <p style="color: #aaaaaa; font-size: 11px; margin: 15px 0 0 0;">
                    © ${date.getFullYear()} Email Automation System. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return { subject, htmlContent };
}

/**
 * Get personalized content based on subscriber preferences
 * @param {string} preference - Subscriber preference
 * @param {string} department - Subscriber department
 * @returns {string} HTML content
 */
function getContentByPreference(preference, department) {
  const contentMap = {
    tech: {
      title: '💻 Tech Updates',
      content: 'Stay ahead with the latest technology trends and development insights tailored for tech enthusiasts.',
      tips: [
        'Explore new programming frameworks and tools',
        'Keep up with industry best practices',
        'Enhance your technical skills daily'
      ]
    },
    business: {
      title: '📊 Business Insights',
      content: 'Get strategic business insights and market trends to help you make informed decisions.',
      tips: [
        'Review key business metrics and KPIs',
        'Stay updated on market trends',
        'Network with industry professionals'
      ]
    },
    marketing: {
      title: '📢 Marketing Trends',
      content: 'Discover the latest marketing strategies and creative campaigns to boost your brand.',
      tips: [
        'Analyze campaign performance data',
        'Explore new marketing channels',
        'Engage with your target audience'
      ]
    },
    general: {
      title: '📰 Daily Updates',
      content: 'Your daily dose of important updates and actionable insights.',
      tips: [
        'Stay organized and focused',
        'Prioritize your daily tasks',
        'Maintain work-life balance'
      ]
    }
  };

  const content = contentMap[preference] || contentMap.general;

  return `
    <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 8px; padding: 25px; margin-bottom: 20px;">
      <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 22px;">
        ${content.title}
      </h2>
      <p style="color: #34495e; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0;">
        ${content.content}
      </p>
      <div style="background-color: rgba(255, 255, 255, 0.8); border-radius: 6px; padding: 15px;">
        <p style="color: #2c3e50; font-weight: 600; margin: 0 0 10px 0; font-size: 14px;">
          Quick Tips:
        </p>
        <ul style="color: #555555; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
          ${content.tips.map(tip => `<li>${tip}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Generate test email for validation
 * @param {Object} subscriber - Subscriber data
 * @returns {Object} Email subject and HTML content
 */
export function generateTestEmail(subscriber) {
  return generateDailyEmail(subscriber, new Date());
}
