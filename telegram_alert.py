import os
import requests

# Get credentials from environment variables
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

def send_telegram_alert(image_path, intruder_id):
    """
    Send a Telegram message with an image to alert about intruder detection.
    
    Args:
        image_path: Path to the saved intruder image
        intruder_id: ID of the detected intruder
    """
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("⚠️  Telegram credentials not set. Skipping alert.")
        print("Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables.")
        return False
    
    try:
        # Prepare the message
        message = f"🚨 INTRUDER DETECTED!\n\nIntruder ID: {intruder_id}\n"
        
        # Telegram Bot API URL
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendPhoto"
        
        # Open and send the image
        with open(image_path, 'rb') as photo:
            files = {'photo': photo}
            data = {
                'chat_id': TELEGRAM_CHAT_ID,
                'caption': message
            }
            
            response = requests.post(url, files=files, data=data)
            
            if response.status_code == 200:
                print(f"✅ Telegram alert sent successfully for intruder {intruder_id}")
                return True
            else:
                print(f"❌ Failed to send Telegram alert: {response.text}")
                return False
                
    except FileNotFoundError:
        print(f"❌ Image file not found: {image_path}")
        return False
    except Exception as e:
        print(f"❌ Error sending Telegram alert: {e}")
        return False


def send_telegram_message(message):
    """
    Send a simple text message via Telegram.
    
    Args:
        message: Text message to send
    """
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("⚠️  Telegram credentials not set. Skipping message.")
        return False
    
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        data = {
            'chat_id': TELEGRAM_CHAT_ID,
            'text': message,
            'parse_mode': 'HTML'
        }
        
        response = requests.post(url, data=data)
        
        if response.status_code == 200:
            print(f"✅ Telegram message sent successfully")
            return True
        else:
            print(f"❌ Failed to send Telegram message: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error sending Telegram message: {e}")
        return False


if __name__ == "__main__":
    # Test the Telegram alert
    print("Testing Telegram bot connection...")
    test_message = "🔔 Intrusion Detection System is now active!"
    
    if send_telegram_message(test_message):
        print("\n✅ Telegram bot is working correctly!")
        print("You should receive a test message on Telegram.")
    else:
        print("\n❌ Telegram bot test failed.")
        print("Please check your TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.")