import nodemailer from "nodemailer";

function getTransport() {
  const user = process.env.APP_MAIL;
  const pass = process.env.APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("APP_MAIL or APP_PASSWORD is not configured");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

function otpTemplate({ otp }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: #111827; color: #ffffff; padding: 16px 20px;">
        <h2 style="margin: 0; font-size: 18px;">Remote Ephemeral Browser</h2>
      </div>
      <div style="padding: 20px; color: #111827;">
        <p style="margin: 0 0 12px;">Your one-time verification code is:</p>
        <div style="font-size: 28px; letter-spacing: 6px; font-weight: 700; color: #1f2937; margin: 10px 0 18px;">${otp}</div>
        <p style="margin: 0 0 12px;">This code expires in 5 minutes.</p>
        <p style="margin: 0; color: #6b7280; font-size: 13px;">
          If you did not request this code, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;
}

export async function sendOtpEmail({ toEmail, otp }) {
  const transporter = getTransport();
  await transporter.sendMail({
    from: process.env.APP_MAIL,
    to: toEmail,
    subject: "Your OTP for Remote Ephemeral Browser",
    html: otpTemplate({ otp }),
  });
}
