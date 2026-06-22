/**
 * VIALA Email Templates
 * Styled raw HTML templates for customer confirmation and internal lead notifications.
 */

interface CustomerConfirmationData {
  full_name: string;
  organization_name: string;
  organization_type: string;
  work_email: string;
  submitted_date: string;
}

interface InternalNotificationData {
  full_name: string;
  work_email: string;
  phone: string;
  organization_name: string;
  organization_type: string;
  locations: string;
  message: string;
  submitted_at: string;
}

/**
 * Generate premium HTML for customer confirmation email
 */
export function getCustomerConfirmationHtml(data: CustomerConfirmationData): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your VIALA Demo Request</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@700;800&display=swap');
        body {
          margin: 0;
          padding: 0;
          width: 100% !important;
          background-color: #F8FAF9;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #0F172A;
          -webkit-font-smoothing: antialiased;
        }
        .wrapper {
          width: 100%;
          background-color: #F8FAF9;
          padding: 40px 20px;
        }
        .container {
          max-width: 580px;
          margin: 0 auto;
          background-color: #FFFFFF;
          border-radius: 16px;
          border: 1px solid #E4E0D9;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(13, 43, 26, 0.03);
        }
        .header {
          background-color: #064E3B;
          padding: 32px;
          text-align: center;
        }
        .logo-img {
          height: 38px;
          width: auto;
          display: block;
          margin: 0 auto;
        }
        .content {
          padding: 40px 32px;
        }
        .headline {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 22px;
          font-weight: 800;
          line-height: 1.3;
          color: #064E3B;
          margin-top: 0;
          margin-bottom: 16px;
          text-align: center;
        }
        .body-text {
          font-size: 14px;
          line-height: 1.6;
          color: #475569;
          margin-bottom: 32px;
          text-align: center;
        }
        .details-box {
          background-color: #F8FAF9;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 32px;
        }
        .details-title {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94A3B8;
          margin-top: 0;
          margin-bottom: 16px;
          border-bottom: 1px solid #E2E8F0;
          padding-bottom: 8px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 13px;
        }
        .detail-row:last-child {
          margin-bottom: 0;
        }
        .detail-label {
          color: #64748B;
          font-weight: 500;
        }
        .detail-value {
          color: #0F172A;
          font-weight: 600;
          text-align: right;
        }
        .expectation-card {
          background: linear-gradient(135deg, #064E3B 0%, #022C22 100%);
          border-radius: 12px;
          padding: 24px;
          color: #FFFFFF;
          margin-bottom: 32px;
        }
        .expectation-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 16px;
          font-weight: 800;
          margin-top: 0;
          margin-bottom: 16px;
          color: #34D399;
        }
        .step-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 12px;
          font-size: 13px;
        }
        .step-item:last-child {
          margin-bottom: 0;
        }
        .step-num {
          background-color: rgba(52, 211, 153, 0.2);
          border: 1px solid #34D399;
          color: #34D399;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 800;
          margin-right: 12px;
          flex-shrink: 0;
        }
        .step-text {
          line-height: 1.4;
          color: #E2E8F0;
        }
        .btn-wrapper {
          text-align: center;
          margin-bottom: 16px;
        }
        .btn {
          display: inline-block;
          background-color: #059669;
          color: #FFFFFF !important;
          text-decoration: none;
          padding: 14px 28px;
          font-size: 14px;
          font-weight: 700;
          border-radius: 8px;
          transition: background-color 0.2s;
        }
        .footer {
          background-color: #0D1E15;
          padding: 32px;
          text-align: center;
          border-top: 1px solid #1A2E24;
          color: #4A7A68;
        }
        .footer-brand {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: #FFFFFF;
          margin-bottom: 12px;
          letter-spacing: 0.05em;
        }
        .footer-desc {
          font-size: 11px;
          line-height: 1.5;
          margin-bottom: 16px;
          max-width: 380px;
          margin-left: auto;
          margin-right: auto;
        }
        .footer-link {
          color: #34D399;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
        }
        .footer-copy {
          font-size: 10px;
          color: #2D5243;
          margin-top: 24px;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <img src="cid:vialalogo" alt="VIALA Logo" class="logo-img" />
          </div>
          
          <div class="content">
            <h1 class="headline">Thank You For Connecting With VIALA</h1>
            <p class="body-text">
              We have successfully received your request for a platform demonstration. Our solutions team will review your organization details and reach out shortly to schedule your demo and align on your recovery goals.
            </p>
            
            <div class="details-box">
              <div class="details-title">Demo Request Details</div>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; font-family: 'Inter', sans-serif;">
                <tr>
                  <td style="padding: 6px 0; color: #64748B; font-weight: 500; text-align: left; width: 40%;">Organization Name</td>
                  <td style="padding: 6px 0; color: #0F172A; font-weight: 700; text-align: right; width: 60%;">${data.organization_name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748B; font-weight: 500; text-align: left;">Organization Type</td>
                  <td style="padding: 6px 0; color: #0F172A; font-weight: 700; text-align: right;">${data.organization_type}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748B; font-weight: 500; text-align: left;">Submitted Email</td>
                  <td style="padding: 6px 0; color: #0F172A; font-weight: 700; text-align: right;">${data.work_email}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748B; font-weight: 500; text-align: left;">Submission Date</td>
                  <td style="padding: 6px 0; color: #0F172A; font-weight: 700; text-align: right;">${data.submitted_date}</td>
                </tr>
              </table>
            </div>
            
            <div class="expectation-card">
              <h3 class="expectation-title">What Happens Next</h3>
              <div class="step-item">
                <div class="step-num">1</div>
                <div class="step-text"><strong>Profile Review:</strong> Our solutions team reviews your organization segments.</div>
              </div>
              <div class="step-item">
                <div class="step-num">2</div>
                <div class="step-text"><strong>Discovery Call:</strong> We host a brief 10-minute session to map your PMS operations.</div>
              </div>
              <div class="step-item">
                <div class="step-num">3</div>
                <div class="step-text"><strong>Live Demo:</strong> We demonstrate real-time value recovery workflows and compliance logs.</div>
              </div>
              <div class="step-item">
                <div class="step-num">4</div>
                <div class="step-text"><strong>Onboarding:</strong> Connect VIALA to your network in under 14 days.</div>
              </div>
            </div>
            
            <div class="btn-wrapper">
              <a href="https://viala.vercel.app" target="_blank" class="btn">Visit VIALA Website</a>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-brand">VIALA</div>
            <p class="footer-desc">
              Helping healthcare organizations recover inventory value, reduce medicine waste, and improve lifecycle visibility.
            </p>
            <a href="mailto:viala.health@gmail.com" class="footer-link">viala.health@gmail.com</a>
            <p class="footer-copy">
              &copy; 2026 VIALA Technologies Pvt. Ltd. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate HTML for internal lead notification email
 */
export function getInternalNotificationHtml(data: InternalNotificationData): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Lead Notification</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #1E293B;
          background-color: #F8FAFC;
          padding: 30px;
        }
        .card {
          max-width: 600px;
          margin: 0 auto;
          background-color: #FFFFFF;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .header {
          background-color: #064E3B;
          color: #FFFFFF;
          padding: 24px;
          text-align: center;
        }
        .logo-img {
          height: 32px;
          width: auto;
          display: block;
          margin: 0 auto 12px auto;
        }
        .title {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
        }
        .subtitle {
          font-size: 12px;
          color: #A7F3D0;
          margin-top: 4px;
        }
        .body {
          padding: 24px;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }
        .table th, .table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #F1F5F9;
          font-size: 14px;
        }
        .table th {
          font-weight: 600;
          color: #64748B;
          width: 35%;
        }
        .table td {
          color: #0F172A;
          font-weight: 500;
        }
        .msg-box {
          background-color: #F8FAF9;
          border: 1px solid #E4E0D9;
          border-radius: 8px;
          padding: 16px;
          font-size: 13px;
          line-height: 1.5;
          color: #334155;
          margin-top: 10px;
        }
        .btn {
          display: inline-block;
          background-color: #059669;
          color: #FFFFFF !important;
          text-decoration: none;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 6px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <img src="cid:vialalogo" alt="VIALA Logo" class="logo-img" />
          <h1 class="title">New Demo Request Received</h1>
          <div class="subtitle">VIALA Lead Intelligence Network</div>
        </div>
        <div class="body">
          <table class="table">
            <tr>
              <th>Name</th>
              <td>${data.full_name}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>${data.work_email}</td>
            </tr>
            <tr>
              <th>Phone</th>
              <td>${data.phone || 'N/A'}</td>
            </tr>
            <tr>
              <th>Organization</th>
              <td>${data.organization_name}</td>
            </tr>
            <tr>
              <th>Org Type</th>
              <td>${data.organization_type}</td>
            </tr>
            <tr>
              <th>Locations</th>
              <td>${data.locations || 'N/A'}</td>
            </tr>
            <tr>
              <th>Submitted At</th>
              <td>${data.submitted_at}</td>
            </tr>
          </table>
          
          <h3 style="font-size: 14px; margin-bottom: 8px; color: #475569;">Message / Challenge:</h3>
          <div class="msg-box">
            ${data.message ? data.message.replace(/\n/g, '<br />') : '<i>No message provided.</i>'}
          </div>
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="https://viala.vercel.app/login" class="btn">Access VIALA Lead Dashboard</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
