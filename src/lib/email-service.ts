import { createTransport } from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  senderEmail: string;
  senderName: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailRequest {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export class EmailService {
  private static instance: EmailService;
  private transporter: any = null;
  private config: EmailConfig;

  private constructor() {
    // Default configuration with eroybelcesar@gmail.com as sender
    this.config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'eroybelcesar@gmail.com',
        pass: process.env.SMTP_PASS || '',
      },
      senderEmail: process.env.SENDER_EMAIL || 'eroybelcesar@gmail.com',
      senderName: process.env.SENDER_NAME || 'FixMo Support',
    };
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Initialize the email transporter
   */
  public async initialize(): Promise<void> {
    try {
      this.transporter = createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: this.config.auth,
      });

      // Verify connection
      await this.transporter.verify();
      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      throw new Error('Email service initialization failed');
    }
  }

  /**
   * Send an email
   */
  public async sendEmail(request: EmailRequest): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initialize();
      }

      const mailOptions = {
        from: request.from || `${this.config.senderName} <${this.config.senderEmail}>`,
        to: Array.isArray(request.to) ? request.to.join(', ') : request.to,
        subject: request.subject,
        html: request.html,
        text: request.text,
        replyTo: request.replyTo,
        attachments: request.attachments,
      };

      const result = await this.transporter!.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${request.to}: ${result.messageId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send welcome email to new users
   */
  public async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const template = this.getWelcomeEmailTemplate(userName);
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send payment confirmation email
   */
  public async sendPaymentConfirmationEmail(
    userEmail: string,
    userName: string,
    paymentDetails: {
      amount: number;
      currency: string;
      paymentId: string;
      paymentMethod: string;
    }
  ): Promise<boolean> {
    const template = this.getPaymentConfirmationTemplate(userName, paymentDetails);
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send task completion notification
   */
  public async sendTaskCompletionEmail(
    userEmail: string,
    userName: string,
    taskDetails: {
      taskId: string;
      taskTitle: string;
      amount: number;
      currency: string;
    }
  ): Promise<boolean> {
    const template = this.getTaskCompletionTemplate(userName, taskDetails);
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send verification status email
   */
  public async sendVerificationStatusEmail(
    userEmail: string,
    userName: string,
    status: 'approved' | 'rejected',
    reason?: string
  ): Promise<boolean> {
    const template = this.getVerificationStatusTemplate(userName, status, reason);
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send admin notification
   */
  public async sendAdminNotification(
    adminEmails: string[],
    subject: string,
    message: string,
    data?: any
  ): Promise<boolean> {
    const template = this.getAdminNotificationTemplate(subject, message, data);
    return this.sendEmail({
      to: adminEmails,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send disbursement test guide
   */
  public async sendDisbursementTestGuide(
    recipientEmail: string,
    recipientName: string
  ): Promise<boolean> {
    try {
      const template = this.getDisbursementTestGuideTemplate(recipientName);
      
      return await this.sendEmail({
        to: recipientEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    } catch (error) {
      console.error('Failed to send disbursement test guide:', error);
      return false;
    }
  }

  /**
   * Get welcome email template
   */
  private getWelcomeEmailTemplate(userName: string): EmailTemplate {
    return {
      subject: 'Welcome to FixMo! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to FixMo!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Your trusted platform for tasks and services</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}! 👋</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Welcome to FixMo! We're excited to have you join our community of taskers and clients.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0;">What you can do on FixMo:</h3>
              <ul style="color: #666; line-height: 1.6;">
                <li>📝 Post tasks and find reliable taskers</li>
                <li>💰 Earn money by completing tasks</li>
                <li>🔒 Secure payments with our trusted system</li>
                <li>📱 Easy mobile access and notifications</li>
                <li>⭐ Build your reputation and earn badges</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://fixmo.com'}" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Get Started Now
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If you have any questions, feel free to reach out to our support team at 
              <a href="mailto:${this.config.senderEmail}" style="color: #667eea;">${this.config.senderEmail}</a>
            </p>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center; color: white;">
            <p style="margin: 0; font-size: 14px;">
              © 2024 FixMo. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
Welcome to FixMo!

Hello ${userName}!

Welcome to FixMo! We're excited to have you join our community of taskers and clients.

What you can do on FixMo:
- Post tasks and find reliable taskers
- Earn money by completing tasks
- Secure payments with our trusted system
- Easy mobile access and notifications
- Build your reputation and earn badges

Get started at: ${process.env.NEXT_PUBLIC_APP_URL || 'https://fixmo.com'}

If you have any questions, contact us at: ${this.config.senderEmail}

© 2024 FixMo. All rights reserved.
      `,
    };
  }

  /**
   * Get payment confirmation template
   */
  private getPaymentConfirmationTemplate(
    userName: string,
    paymentDetails: {
      amount: number;
      currency: string;
      paymentId: string;
      paymentMethod: string;
    }
  ): EmailTemplate {
    return {
      subject: 'Payment Confirmed - FixMo 💰',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Payment Confirmed! ✅</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Your payment has been successfully processed</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}! 🎉</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Great news! Your payment has been confirmed and processed successfully.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #333; margin-top: 0;">Payment Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666;">Amount:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: bold;">${paymentDetails.currency} ${paymentDetails.amount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Payment Method:</td>
                  <td style="padding: 8px 0; color: #333;">${paymentDetails.paymentMethod}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Transaction ID:</td>
                  <td style="padding: 8px 0; color: #333; font-family: monospace;">${paymentDetails.paymentId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Date:</td>
                  <td style="padding: 8px 0; color: #333;">${new Date().toLocaleDateString()}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://fixmo.com'}/dashboard" 
                 style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Dashboard
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for using FixMo! If you have any questions about this payment, 
              please contact us at <a href="mailto:${this.config.senderEmail}" style="color: #28a745;">${this.config.senderEmail}</a>
            </p>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center; color: white;">
            <p style="margin: 0; font-size: 14px;">
              © 2024 FixMo. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
Payment Confirmed - FixMo

Hello ${userName}!

Great news! Your payment has been confirmed and processed successfully.

Payment Details:
- Amount: ${paymentDetails.currency} ${paymentDetails.amount.toFixed(2)}
- Payment Method: ${paymentDetails.paymentMethod}
- Transaction ID: ${paymentDetails.paymentId}
- Date: ${new Date().toLocaleDateString()}

View your dashboard at: ${process.env.NEXT_PUBLIC_APP_URL || 'https://fixmo.com'}/dashboard

Thank you for using FixMo! If you have any questions, contact us at: ${this.config.senderEmail}

© 2024 FixMo. All rights reserved.
      `,
    };
  }

  /**
   * Get task completion template
   */
  private getTaskCompletionTemplate(
    userName: string,
    taskDetails: {
      taskId: string;
      taskTitle: string;
      amount: number;
      currency: string;
    }
  ): EmailTemplate {
    return {
      subject: 'Task Completed - Payment Processed 💰',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Task Completed! 🎉</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Your payment has been processed</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Congratulations ${userName}! 🏆</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Excellent work! Your task has been completed and your payment has been processed.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="color: #333; margin-top: 0;">Task Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666;">Task Title:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: bold;">${taskDetails.taskTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Task ID:</td>
                  <td style="padding: 8px 0; color: #333; font-family: monospace;">${taskDetails.taskId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Payment Amount:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: bold; font-size: 18px;">${taskDetails.currency} ${taskDetails.amount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Status:</td>
                  <td style="padding: 8px 0; color: #28a745; font-weight: bold;">✅ Completed & Paid</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://fixmo.com'}/dashboard" 
                 style="background: #ffc107; color: #333; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                View Dashboard
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Keep up the great work! Your reputation and earnings are growing. 
              If you have any questions, contact us at <a href="mailto:${this.config.senderEmail}" style="color: #ffc107;">${this.config.senderEmail}</a>
            </p>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center; color: white;">
            <p style="margin: 0; font-size: 14px;">
              © 2024 FixMo. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
Task Completed - Payment Processed

Congratulations ${userName}!

Excellent work! Your task has been completed and your payment has been processed.

Task Details:
- Task Title: ${taskDetails.taskTitle}
- Task ID: ${taskDetails.taskId}
- Payment Amount: ${taskDetails.currency} ${taskDetails.amount.toFixed(2)}
- Status: Completed & Paid

View your dashboard at: ${process.env.NEXT_PUBLIC_APP_URL || 'https://fixmo.com'}/dashboard

Keep up the great work! Your reputation and earnings are growing.
If you have any questions, contact us at: ${this.config.senderEmail}

© 2024 FixMo. All rights reserved.
      `,
    };
  }

  /**
   * Get verification status template
   */
  private getVerificationStatusTemplate(
    userName: string,
    status: 'approved' | 'rejected',
    reason?: string
  ): EmailTemplate {
    const isApproved = status === 'approved';
    const gradient = isApproved 
      ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
      : 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)';
    const title = isApproved ? 'Verification Approved! ✅' : 'Verification Update 📋';
    const color = isApproved ? '#28a745' : '#dc3545';

    return {
      subject: isApproved ? 'Verification Approved - FixMo ✅' : 'Verification Update - FixMo 📋',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${gradient}; padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">${title}</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">
              ${isApproved ? 'Your account has been verified successfully' : 'We need additional information'}
            </p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}! ${isApproved ? '🎉' : '📋'}</h2>
            
            ${isApproved ? `
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Congratulations! Your account verification has been approved. You now have full access to all FixMo features.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${color};">
                <h3 style="color: #333; margin-top: 0;">What's Next:</h3>
                <ul style="color: #666; line-height: 1.6;">
                  <li>✅ Start posting and claiming tasks</li>
                  <li>💰 Receive payments for completed work</li>
                  <li>⭐ Build your reputation and earn badges</li>
                  <li>📱 Access all mobile features</li>
                </ul>
              </div>
            ` : `
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                We've reviewed your verification submission and need some additional information to complete your account verification.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${color};">
                <h3 style="color: #333; margin-top: 0;">Next Steps:</h3>
                <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
                  ${reason || 'Please provide clearer identification documents or additional verification information.'}
                </p>
                <ul style="color: #666; line-height: 1.6;">
                  <li>📸 Ensure your selfie is clear and well-lit</li>
                  <li>🆔 Make sure your ID document is fully visible</li>
                  <li>📱 Try again from a different device if needed</li>
                </ul>
              </div>
            `}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://fixmo.com'}/dashboard" 
                 style="background: ${color}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                ${isApproved ? 'Get Started' : 'Try Again'}
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If you have any questions about the verification process, 
              please contact us at <a href="mailto:${this.config.senderEmail}" style="color: ${color};">${this.config.senderEmail}</a>
            </p>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center; color: white;">
            <p style="margin: 0; font-size: 14px;">
              © 2024 FixMo. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
${isApproved ? 'Verification Approved' : 'Verification Update'} - FixMo

Hello ${userName}!

${isApproved ? 
  'Congratulations! Your account verification has been approved. You now have full access to all FixMo features.\n\nWhat\'s Next:\n- Start posting and claiming tasks\n- Receive payments for completed work\n- Build your reputation and earn badges\n- Access all mobile features' :
  'We\'ve reviewed your verification submission and need some additional information to complete your account verification.\n\nNext Steps:\n' + (reason || 'Please provide clearer identification documents or additional verification information.') + '\n- Ensure your selfie is clear and well-lit\n- Make sure your ID document is fully visible\n- Try again from a different device if needed'
}

${isApproved ? 'Get Started' : 'Try Again'} at: ${process.env.NEXT_PUBLIC_APP_URL || 'https://fixmo.com'}/dashboard

If you have any questions, contact us at: ${this.config.senderEmail}

© 2024 FixMo. All rights reserved.
      `,
    };
  }

  /**
   * Get admin notification template
   */
  private getAdminNotificationTemplate(
    subject: string,
    message: string,
    data?: any
  ): EmailTemplate {
    return {
      subject: `Admin Alert: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Admin Alert ⚠️</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">System notification for administrators</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">${subject}</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6f42c1;">
              <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
                ${message}
              </p>
              
              ${data ? `
                <h3 style="color: #333; margin-top: 20px; margin-bottom: 10px;">Additional Data:</h3>
                <pre style="background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; font-size: 12px; color: #333;">
${JSON.stringify(data, null, 2)}
                </pre>
              ` : ''}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://fixmo.com'}/admin" 
                 style="background: #6f42c1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Admin Dashboard
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              This is an automated notification from the FixMo system. 
              If you have any questions, contact the development team.
            </p>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center; color: white;">
            <p style="margin: 0; font-size: 14px;">
              © 2024 FixMo. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
Admin Alert: ${subject}

${message}

${data ? `Additional Data:\n${JSON.stringify(data, null, 2)}` : ''}

View Admin Dashboard at: ${process.env.NEXT_PUBLIC_APP_URL || 'https://fixmo.com'}/admin

This is an automated notification from the FixMo system.

© 2024 FixMo. All rights reserved.
      `,
    };
  }

  /**
   * Get current configuration
   */
  public getConfig(): EmailConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<EmailConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get disbursement test guide template
   */
  private getDisbursementTestGuideTemplate(recipientName: string): EmailTemplate {
    return {
      subject: 'FixMo Disbursement System Test Guide 📋',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">FixMo Disbursement System</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Complete Test Guide for Payment System</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${recipientName}! 👋</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Here's your complete guide to test the FixMo Disbursement System. This system allows you to pay taskers using digital payment methods (GCash, PayMaya, GoTyme).
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0;">🎯 Quick Test Setup</h3>
              <p style="color: #666; margin-bottom: 15px;"><strong>Step 1:</strong> Navigate to: <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">http://localhost:3000/test-disbursement</code></p>
              <p style="color: #666; margin-bottom: 15px;"><strong>Step 2:</strong> Use the test data provided below</p>
            </div>

            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
              <h3 style="color: #1976d2; margin-top: 0;">🧪 Test Data</h3>
              <div style="font-family: monospace; background: #f8f9fa; padding: 15px; border-radius: 4px; font-size: 14px;">
                Tasker ID: TEST-001<br>
                Tasker Name: John Doe (Test)<br>
                Phone: 09123456789<br>
                Email: test@example.com<br>
                Amount: ₱500<br>
                Task: Test Task - Website Development
              </div>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
              <h3 style="color: #333; margin-top: 0;">✅ Complete Test Workflow</h3>
              <ol style="color: #666; line-height: 1.8;">
                <li><strong>Create Disbursement:</strong> Use the test data above</li>
                <li><strong>Verify Payment Instructions:</strong> Check they're clear and accurate</li>
                <li><strong>Simulate Payment:</strong> Send ₱1 to test phone number</li>
                <li><strong>Upload Payment Proof:</strong> Screenshot of payment confirmation</li>
                <li><strong>Mark as Completed:</strong> Verify status updates</li>
                <li><strong>Check Email Notifications:</strong> Verify tasker receives emails</li>
                <li><strong>Test Cancellation:</strong> Try cancelling a disbursement</li>
                <li><strong>Test All Payment Methods:</strong> GCash, PayMaya, GoTyme</li>
              </ol>
            </div>

            <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
              <h3 style="color: #e65100; margin-top: 0;">📱 Payment Methods to Test</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li><strong>GCash:</strong> 09565121085</li>
                <li><strong>PayMaya:</strong> 09603845762</li>
                <li><strong>GoTyme:</strong> 09603845762</li>
              </ul>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9c27b0;">
              <h3 style="color: #333; margin-top: 0;">🔧 Troubleshooting</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li><strong>Disbursement not created:</strong> Check browser console for errors</li>
                <li><strong>Payment instructions unclear:</strong> Verify tasker phone number</li>
                <li><strong>Email not received:</strong> Check spam folder</li>
                <li><strong>Status not updating:</strong> Refresh page and check permissions</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/test-disbursement" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                🚀 Start Testing Now
              </a>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">📋 Test Checklist</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" style="width: 16px; height: 16px;"> Created disbursement successfully
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" style="width: 16px; height: 16px;"> Payment instructions are clear
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" style="width: 16px; height: 16px;"> Reference number generated correctly
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" style="width: 16px; height: 16px;"> Payment proof upload works
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" style="width: 16px; height: 16px;"> Marked disbursement as completed
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" style="width: 16px; height: 16px;"> Email notification received
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" style="width: 16px; height: 16px;"> Tested cancellation flow
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" style="width: 16px; height: 16px;"> All payment methods work
                </div>
              </div>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Once you've completed all tests and checked all boxes, your disbursement system is ready for production use!
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If you have any questions or encounter issues, please contact the development team at 
              <a href="mailto:${this.config.senderEmail}" style="color: #667eea;">${this.config.senderEmail}</a>
            </p>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center; color: white;">
            <p style="margin: 0; font-size: 14px;">
              © 2024 FixMo. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
FixMo Disbursement System Test Guide

Hello ${recipientName}!

Here's your complete guide to test the FixMo Disbursement System.

QUICK TEST SETUP:
Step 1: Navigate to: http://localhost:3000/test-disbursement
Step 2: Use the test data provided below

TEST DATA:
Tasker ID: TEST-001
Tasker Name: John Doe (Test)
Phone: 09123456789
Email: test@example.com
Amount: ₱500
Task: Test Task - Website Development

COMPLETE TEST WORKFLOW:
1. Create Disbursement: Use the test data above
2. Verify Payment Instructions: Check they're clear and accurate
3. Simulate Payment: Send ₱1 to test phone number
4. Upload Payment Proof: Screenshot of payment confirmation
5. Mark as Completed: Verify status updates
6. Check Email Notifications: Verify tasker receives emails
7. Test Cancellation: Try cancelling a disbursement
8. Test All Payment Methods: GCash, PayMaya, GoTyme

PAYMENT METHODS TO TEST:
- GCash: 09565121085
- PayMaya: 09603845762
- GoTyme: 09603845762

TROUBLESHOOTING:
- Disbursement not created: Check browser console for errors
- Payment instructions unclear: Verify tasker phone number
- Email not received: Check spam folder
- Status not updating: Refresh page and check permissions

TEST CHECKLIST:
□ Created disbursement successfully
□ Payment instructions are clear
□ Reference number generated correctly
□ Payment proof upload works
□ Marked disbursement as completed
□ Email notification received
□ Tested cancellation flow
□ All payment methods work

Start testing at: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/test-disbursement

If you have any questions, contact us at: ${this.config.senderEmail}

© 2024 FixMo. All rights reserved.
      `,
    };
  }

  /**
   * Test email configuration
   */
  public async testConnection(): Promise<boolean> {
    try {
      await this.initialize();
      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance(); 