"""
Minimal async-friendly email sender for password reset links.
Uses SMTP credentials from settings. Silently logs (does not crash the request)
if SMTP is not configured, so local/dev usage without email still works.
"""
import asyncio
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config.settings import settings

logger = logging.getLogger("email_service")


def _send_sync(to_email: str, subject: str, html_body: str) -> None:
    if not settings.smtp_user or not settings.smtp_password:
        logger.warning("SMTP not configured; skipping email send to %s. Subject: %s", to_email, subject)
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_user}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.sendmail(settings.smtp_user, to_email, msg.as_string())


async def send_password_reset_email(to_email: str, reset_link: str) -> None:
    subject = "Reset your Cafe Management System password"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2 style="color:#6F4E37;">Password Reset Request</h2>
      <p>Click the button below to reset your password. This link expires in
      {settings.reset_token_expire_minutes} minutes.</p>
      <a href="{reset_link}"
         style="display:inline-block;padding:12px 24px;background:#6F4E37;color:#fff;
                border-radius:8px;text-decoration:none;">Reset Password</a>
      <p style="color:#888;font-size:12px;margin-top:24px;">
        If you did not request this, you can safely ignore this email.
      </p>
    </div>
    """
    await asyncio.to_thread(_send_sync, to_email, subject, html_body)
