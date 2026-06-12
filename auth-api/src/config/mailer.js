const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: `"FastGrocery APIs" <${process.env.EMAIL_FROM}>`,
    to: toEmail,
    subject: 'Your Password Reset OTP',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0; padding:0; background-color:#e8f5ae;">

  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#fdf0eb" style="background-color:#e8f5ae; padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px; 
        overflow:hidden; box-shadow:0 4px 24px rgba(232,65,10,0.10);">

          <!-- Header -->
          <tr>
            <td align="center" bgcolor="#e8410a" style="background-color:#e8410a; padding:40px 40px 32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background-color:#ffffff; border-radius:50%; width:64px; height:64px; 
                  text-align:center; vertical-align:middle; font-size:30px;  line-height:64px;">
                    🔐
                  </td>
                </tr>
              </table>
              <br/>
              <span style="color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.5px;">Password Reset</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 48px 28px;">
              <p style="margin:0 0 14px;color:#333333;font-size:16px;line-height:1.6;">
                Hi there,
              </p>
              <p style="margin:0 0 32px;color:#666666;font-size:15px;line-height:1.7;">
                We received a request to reset your password. Use the OTP below to proceed. <strong>Do not share this with anyone.</strong>
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0" style="background-color:#fff4f0;border:2px dashed #e8410a;border-radius:10px;">
                      <tr>
                        <td align="center" style="padding:24px 56px;">
                          <p style="margin:0 0 8px;color:#aaaaaa;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Your OTP</p>
                          <p style="margin:0;color:#e8410a;font-size:40px;font-weight:700;letter-spacing:12px;">${otp}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Validity notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  <td style="background-color:#fff8f5;border-left:4px solid #e8410a;border-radius:4px;padding:14px 18px;">
                    <p style="margin:0;color:#555555;font-size:14px;line-height:1.6;">
                      ⏱&nbsp; This OTP is valid for <strong>5 minutes</strong> only.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
                <tr>
                  <td style="background-color:#fff8e1;border-left:4px solid #f5a623;border-radius:4px;padding:14px 18px;">
                    <p style="margin:0;color:#7a6200;font-size:14px;line-height:1.6;">
                      ⚠️&nbsp; If you did not request this, please ignore this email. Your account is safe.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#e8f5ae" style="background-color:#e8f5ae;padding:22px 48px;border-top:1px solid #f5d5c8;">
              <p style="margin:0;color:#b07060;font-size:12px;text-align:center;line-height:1.8;">
                This is an automated email. Please do not reply.<br/>
                © 2026 FastGrocery APIs. All rights reserved by Tanisha Mathur.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };
