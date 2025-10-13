import random
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from .models import OTPModel

def send_otp_to_email(email, otp=None):
    otp = otp or str(random.randint(100000, 999999))

    # Extract name from email (e.g., "john" from "john@example.com")
    user_name = email.split('@')[0]

    # Email details
    subject = "Your OTP for Login - Extruedge DAAPL"
    from_email = settings.DEFAULT_FROM_EMAIL
    to = [email]

    # Email template context
    context = {
        "otp_code": otp,
        "user_name": user_name,
    }

    # Render HTML + plain text
    html_content = render_to_string("emails/otp_email.html", context)
    text_content = f"Hi {user_name},\nYour OTP for Extruedge DAAPL login is: {otp}\nValid for 5 minutes."

    # Send the email
    try:
        msg = EmailMultiAlternatives(subject, text_content, from_email, to)
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        print(f"✅ OTP sent to {email}: {otp}")
    except Exception as e:
        print(f"❌ Failed to send OTP to {email}: {e}")

    # Save OTP in the database
    OTPModel.objects.update_or_create(email=email, defaults={"otp": otp})

    return otp
