import os
import smtplib
from email.message import EmailMessage


def is_email_configured() -> bool:
    required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USERNAME", "SMTP_PASSWORD", "EMAIL_FROM"]
    return all(os.getenv(key) for key in required)


def send_password_reset_email(to_email: str, reset_link: str) -> None:
    if not is_email_configured():
        raise RuntimeError("SMTP email is not configured.")

    smtp_host = os.getenv("SMTP_HOST", "")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    email_from = os.getenv("EMAIL_FROM", smtp_username)
    use_tls = os.getenv("SMTP_USE_TLS", "true").lower() == "true"

    message = EmailMessage()
    message["Subject"] = "Reset your SupportIQ password"
    message["From"] = email_from
    message["To"] = to_email
    message.set_content(
        "\n".join(
            [
                "Hi,",
                "",
                "We received a request to reset your SupportIQ password.",
                "Use this link to choose a new password:",
                "",
                reset_link,
                "",
                "This link expires in 30 minutes. If you did not request this, you can ignore this email.",
                "",
                "SupportIQ",
            ]
        )
    )

    with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
        if use_tls:
            server.starttls()
        server.login(smtp_username, smtp_password)
        server.send_message(message)
