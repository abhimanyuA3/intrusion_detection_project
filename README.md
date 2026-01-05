# Intrusion Detection Project

This project contains a full working example of an intrusion detection system using YOLOv8 (Ultralytics), with:

- Person detection + tracking
- Save full-frame images for each *new* intruder (with timestamp)
- Local Flask dashboard to view saved intruders (auto-refresh)
- Alarm sound on new intruder
- WhatsApp notifications via Twilio (with image)
- Optional ngrok integration to expose dashboard publicly (for Twilio media URLs)

---

## Setup (Linux / macOS / Windows WSL recommended)

1. Create and activate a virtual environment
```bash
python3 -m venv venv
source venv/bin/activate   # or .\venv\Scripts\activate on Windows PowerShell
```

2. Install dependencies
```bash
pip install -r requirements.txt
```

3. Put a small `alarm.wav` audio file in the project root if you want a custom alarm (optional).

4. Configure environment variables for Twilio (recommended):
```bash
export TWILIO_ACCOUNT_SID="your_account_sid"
export TWILIO_AUTH_TOKEN="your_auth_token"
export TWILIO_FROM="whatsapp:+14155238886"  # Twilio sandbox number or WhatsApp-enabled number
export TWILIO_TO="whatsapp:+91XXXXXXXXXX"  # your phone number
```
On Windows PowerShell use `setx` or `$env:TWILIO_ACCOUNT_SID = "..."` for the session.

Alternatively you can edit `whatsapp_alert.py` and hardcode values (not recommended).

5. (Optional) NGROK: to allow Twilio to fetch images, you must expose the Flask dashboard with a public URL.
- Install ngrok and sign up to get an authtoken: https://ngrok.com/
- Option A: Start ngrok manually:
```bash
ngrok http 5000
```
- Option B: Use the included `start_ngrok.py` which uses `pyngrok` and the `NGROK_AUTH_TOKEN` env var.
```bash
export NGROK_AUTH_TOKEN="your_token"
python start_ngrok.py
# it will print a public URL; set PUBLIC_URL to it in the same shell:
export PUBLIC_URL="https://xxxxxx.ngrok.io"
```

6. Run the dashboard (this serves image files for Twilio to fetch)
```bash
python dashboard.py
```

7. In a new terminal, run the detector
```bash
python intrusion_detection.py
```

8. Open the dashboard in your browser:
```
http://localhost:5000
```

9. To receive WhatsApp images you must provide Twilio with a public `media_url`. Use ngrok and set `PUBLIC_URL` environment variable to the ngrok URL (e.g. `https://abcd1234.ngrok.io`).

---

## Notes & Tips
- YOLO tracker assigns IDs per run. To re-identify across restarts, you'd need a re-id model or appearance matching.
- Make sure your webcam index is correct or use a video file path in `intrusion_detection.py`.
- If `playsound` has issues, try installing `simpleaudio` and update the alarm function.
- For production exposure, secure the dashboard (add authentication) before exposing publicly.

If you want, I can now:
- Replace the placeholder `alarm.wav` with a small generated beep wav.
- Package everything as a single runnable script that starts dashboard, ngrok, and detector together.
