import os
from twilio.rest import Client

# Read Twilio configuration from environment variables
TWILIO_ACCOUNT_SID = os.getenv('ACXXXXXXXXXXXXXXXX')
TWILIO_AUTH_TOKEN = os.getenv('your_auth_token')
TWILIO_FROM = os.getenv('+14155238886')  # e.g. whatsapp:+14155238886 (Twilio sandbox)
TWILIO_TO = os.getenv('+91XXXXXXXXXX')      # e.g. whatsapp:+91XXXXXXXXXX

def can_send_alerts():
    return all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM, TWILIO_TO])

def send_intruder_alert(media_url, intruder_id, timestamp, filename=None):
    """Send WhatsApp message with optional media_url via Twilio."""
    if not can_send_alerts():
        print('Twilio env vars not set; skipping WhatsApp alert.')
        return None
    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    body = (
        f"🚨 Intruder Alert! 🚨\n\n"
        f"ID: {intruder_id}\n"
        f"Time: {timestamp}\n"
        f"Image: {filename or media_url}\n"
    )
    try:
        msg = client.messages.create(
            body=body,
            from_=TWILIO_FROM,
            to=TWILIO_TO,
            media_url=[media_url] if media_url else None
        )
        print('WhatsApp alert sent, SID:', msg.sid)
        return msg.sid
    except Exception as e:
        print('Error sending WhatsApp alert:', e)
        return None