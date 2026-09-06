import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,

  auth: {
    user: process.env.SMTP_HOST,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string,
) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Reset your SupportAI password",
    text: ` We received a request to reset your SupportAI password. 
            Reset your password using this link: 
            ${resetUrl} This link will expire in 15 minutes. 
            If you didn't request a password reset, you can safely ignore this email. `,

    html: ` 
    <div style=" margin: 0; padding: 40px 20px; background: #f8fafc; font-family: Arial, sans-serif; "> 
        <div style=" max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; "> 
        <div style=" display: flex; align-items: center; margin-bottom: 24px; "> 
        <div style=" width: 40px; height: 40px; border-radius: 10px; background: #7c3aed; color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; "> ✦ </div> 
        <span style=" margin-left: 10px; font-size: 20px; font-weight: 700; color: #111827; ">
         SupportAI </span> 
         </div> 
         <h1 style=" font-size: 24px; color: #111827; margin-bottom: 12px; "> 
         Reset your password </h1> <p style=" color: #6b7280; line-height: 1.7; font-size: 14px; "> We received a request to reset your SupportAI password. Click the button below to create a new password. </p> <div style="margin: 28px 0;"> <a href="${resetUrl}" style=" display: inline-block; background: #7c3aed; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; " > Reset password </a> </div> <p style=" color: #6b7280; font-size: 13px; line-height: 1.6; "> This link will expire in <strong>15 minutes</strong>. </p> <p style=" color: #9ca3af; font-size: 12px; line-height: 1.6; margin-top: 24px; "> If you didn't request a password reset, you can safely ignore this email. </p> <div style=" border-top: 1px solid #e5e7eb; margin-top: 28px; padding-top: 20px; "> <p style=" color: #9ca3af; font-size: 11px; margin: 0; "> © 2026 SupportAI. All rights reserved. </p> </div> </div> </div> `,
  });
};
