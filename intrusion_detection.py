import os
import time
import json
import threading
from datetime import datetime
from ultralytics import YOLO
import cv2
import shutil
import logging
from whatsapp_alert import send_intruder_alert, can_send_alerts

# Configuration
MODEL_PATH = os.getenv('MODEL_PATH', 'yolov8n.pt')
CAMERA_INDEX = int(os.getenv('CAMERA_INDEX', '0'))
SAVE_DIR = os.getenv('SAVE_DIR', 'intruders')
FLASK_STATIC_DIR = os.path.join('static', 'intruders')
METADATA_PATH = os.path.join(SAVE_DIR, 'metadata.json')
ALARM_FILE = os.getenv('ALARM_FILE', 'alarm.wav')
ALARM_ENABLED = os.getenv('ALARM_ENABLED', '1') == '1'
MIN_CONFIDENCE = float(os.getenv('MIN_CONFIDENCE', '0.35'))
IMG_SIZE = int(os.getenv('IMG_SIZE', '640'))

os.makedirs(SAVE_DIR, exist_ok=True)
os.makedirs(FLASK_STATIC_DIR, exist_ok=True)

# logging
logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(message)s')

# init metadata
if not os.path.exists(METADATA_PATH):
    with open(METADATA_PATH, 'w') as f:
        json.dump([], f)

# Load model
logging.info('Loading YOLO model...')
model = YOLO(MODEL_PATH)

# saved intruder ids for this session
saved_intruders = set()

# play alarm in separate thread
def play_alarm_nonblocking():
    if not ALARM_ENABLED:
        return
    def _play():
        try:
            from playsound import playsound
            if os.path.exists(ALARM_FILE):
                playsound(ALARM_FILE)
            else:
                # fallback beep (Windows)
                try:
                    import winsound
                    winsound.Beep(1000, 400)
                except Exception:
                    print('Alarm: (no sound available)')
        except Exception as e:
            print('Alarm playback error:', e)
    t = threading.Thread(target=_play, daemon=True)
    t.start()

def append_metadata(entry):
    try:
        with open(METADATA_PATH, 'r') as f:
            data = json.load(f)
    except Exception:
        data = []
    data.append(entry)
    with open(METADATA_PATH, 'w') as f:
        json.dump(data, f, indent=2)

def save_full_frame(frame, intruder_id):
    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f'intruder_{intruder_id}_{ts}.jpg'
    save_path = os.path.join(SAVE_DIR, filename)
    cv2.imwrite(save_path, frame)
    # copy to static folder
    static_path = os.path.join(FLASK_STATIC_DIR, filename)
    try:
        shutil.copyfile(save_path, static_path)
    except Exception as e:
        logging.warning('Could not copy to static folder: %s', e)
    return filename

def is_person(box):
    try:
        cls = int(box.cls[0])
        label = model.names[cls]
        return label == 'person'
    except Exception:
        return False

def main():
    cap = cv2.VideoCapture(CAMERA_INDEX)
    if not cap.isOpened():
        logging.error('Cannot open camera index %s', CAMERA_INDEX)
        return

    logging.info('Starting detection. Press q to quit.')
    while True:
        ret, frame = cap.read()
        if not ret:
            logging.warning('Frame read failed, exiting.')
            break

        # Run tracker - model.track returns results where box.id is set by tracker
        results = model.track(frame, persist=True, imgsz=IMG_SIZE)
        if len(results) > 0 and getattr(results[0], 'boxes', None) is not None:
            for box in results[0].boxes:
                if not is_person(box):
                    continue

                intruder_id = None
                try:
                    if getattr(box, 'id', None) is not None:
                        intruder_id = int(box.id[0])
                except Exception:
                    intruder_id = None

                # draw bbox
                try:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0,255,0), 2)
                    txt = f'Intruder {intruder_id}' if intruder_id is not None else 'Person'
                    cv2.putText(frame, txt, (x1, max(20,y1-10)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,0,255), 2)
                except Exception:
                    pass

                # handle new intruder
                if intruder_id is not None and intruder_id not in saved_intruders:
                    saved_intruders.add(intruder_id)
                    filename = save_full_frame(frame, intruder_id)
                    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    entry = {
                        'id': intruder_id,
                        'timestamp': timestamp,
                        'filename': filename
                    }
                    append_metadata(entry)
                    logging.info('New Intruder Detected! ID=%s saved as %s', intruder_id, filename)

                    # play alarm
                    play_alarm_nonblocking()

                    # send whatsapp alert (if configured)
                    try:
                        if can_send_alerts():
                            # PUBLIC_URL can be set as env var (e.g., from ngrok)
                            public_url = os.getenv('PUBLIC_URL', None)
                            if public_url:
                                media_path = f"{public_url}/intruders/{filename}"
                            else:
                                # fallback to localhost (won't work for Twilio remote fetch)
                                media_path = f"http://localhost:5000/intruders/{filename}"
                            # send (non-blocking thread)
                            threading.Thread(target=send_intruder_alert, args=(media_path, intruder_id, timestamp, filename), daemon=True).start()
                        else:
                            logging.info('WhatsApp alerts not configured (TWILIO env vars missing).')
                    except Exception as e:
                        logging.warning('Failed to send WhatsApp alert: %s', e)

        # show live video
        cv2.imshow('Intrusion Detection + Tracking (Press q to quit)', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    main()
