import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const link = `${env.FRONTEND_URL.replace(/\/$/, '')}/verificar-correo?token=${token}`;

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: 'Verifica tu correo — MTA Software',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color:#0b1220;">Hola, ${name} 👋</h2>
        <p style="color:#475569; line-height:1.6;">
          Gracias por registrarte en <strong>MTA Software</strong>. Confirma tu correo para activar tu cuenta:
        </p>
        <p style="text-align:center; margin: 32px 0;">
          <a href="${link}" style="background:#4f46e5; color:#fff; padding:14px 28px; border-radius:8px; text-decoration:none; font-weight:600;">
            Verificar mi correo
          </a>
        </p>
        <p style="color:#94a3b8; font-size:13px;">
          Si el botón no funciona, copia y pega este enlace en tu navegador:<br />${link}
        </p>
        <p style="color:#94a3b8; font-size:12px;">Este enlace expira en 24 horas.</p>
      </div>
    `,
  });
}