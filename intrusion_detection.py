import cv2
import os
import time
from datetime import datetime
from ultralytics import YOLO
from collections import defaultdict
import threading

# Import Telegram alert instead of WhatsApp
from telegram_alert import send_telegram_alert

# Try to import playsound for alarm
try:
    from playsound import playsound
    PLAYSOUND_AVAILABLE = True
except ImportError:
    print("⚠️  playsound not available. Install with: pip install playsound")
    PLAYSOUND_AVAILABLE = False

# Create directory for saving intruder images
INTRUDERS_DIR = "intruders"
os.makedirs(INTRUDERS_DIR, exist_ok=True)

# Load YOLOv8 model
print("Loading YOLOv8 model...")
model = YOLO("yolov8n.pt")

# Video source (0 for webcam, or path to video file)
VIDEO_SOURCE = 0

# Tracking variables
detected_intruders = set()  # Track which IDs we've already saved
detection_history = defaultdict(int)  # Count detections per ID

# Alarm settings
ALARM_FILE = "alarm.wav"
COOLDOWN_SECONDS = 5  # Minimum seconds between alarms
last_alarm_time = 0

def play_alarm():
    """Play alarm sound in a separate thread"""
    global last_alarm_time
    
    current_time = time.time()
    if current_time - last_alarm_time < COOLDOWN_SECONDS:
        return  # Skip if alarm was played recently
    
    last_alarm_time = current_time
    
    if not PLAYSOUND_AVAILABLE:
        print("🔔 ALARM! (audio not available)")
        return
    
    if not os.path.exists(ALARM_FILE):
        print("🔔 ALARM! (alarm.wav not found)")
        return
    
    # Play sound in separate thread to avoid blocking
    threading.Thread(target=lambda: playsound(ALARM_FILE), daemon=True).start()

def save_intruder_image(frame, track_id):
    """Save full frame image for new intruder and send Telegram alert"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"intruder_{track_id}_{timestamp}.jpg"
    filepath = os.path.join(INTRUDERS_DIR, filename)
    
    # Save the image
    cv2.imwrite(filepath, frame)
    print(f"💾 Saved intruder image: {filename}")
    
    # Play alarm
    play_alarm()
    
    # Send Telegram alert with image
    send_telegram_alert(filepath, track_id)
    
    return filepath

def main():
    """Main detection loop"""
    print(f"🎥 Starting video capture from source: {VIDEO_SOURCE}")
    cap = cv2.VideoCapture(VIDEO_SOURCE)
    
    if not cap.isOpened():
        print("❌ Error: Could not open video source")
        return
    
    print("✅ Detection started! Press 'q' to quit.")
    print(f"📁 Intruder images will be saved to: {INTRUDERS_DIR}/")
    print("=" * 60)
    
    frame_count = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("⚠️  Failed to grab frame")
            break
        
        frame_count += 1
        
        # Run YOLOv8 tracking on the frame
        # track() returns detections with persistent IDs
        results = model.track(frame, persist=True, classes=[0], verbose=False)
        
        # Process detections
        if results[0].boxes is not None and results[0].boxes.id is not None:
            boxes = results[0].boxes.xyxy.cpu().numpy()
            track_ids = results[0].boxes.id.cpu().numpy().astype(int)
            confidences = results[0].boxes.conf.cpu().numpy()
            
            for box, track_id, conf in zip(boxes, track_ids, confidences):
                x1, y1, x2, y2 = map(int, box)
                
                # Increment detection count for this ID
                detection_history[track_id] += 1
                
                # Check if this is a new intruder (first time seeing this ID)
                if track_id not in detected_intruders:
                    print(f"🚨 NEW INTRUDER DETECTED! ID: {track_id}")
                    detected_intruders.add(track_id)
                    
                    # Save image and send alert
                    save_intruder_image(frame, track_id)
                
                # Draw bounding box
                color = (0, 0, 255)  # Red for intruder
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                
                # Draw label
                label = f"Intruder #{track_id} ({conf:.2f})"
                cv2.putText(frame, label, (x1, y1 - 10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
        
        # Display info on frame
        info_text = f"Frame: {frame_count} | Intruders tracked: {len(detected_intruders)}"
        cv2.putText(frame, info_text, (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        # Show the frame
        cv2.imshow("Intrusion Detection System", frame)
        
        # Press 'q' to quit
        if cv2.waitKey(1) & 0xFF == ord('q'):
            print("\n👋 Stopping detection...")
            break
    
    # Cleanup
    cap.release()
    cv2.destroyAllWindows()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 DETECTION SUMMARY")
    print("=" * 60)
    print(f"Total unique intruders detected: {len(detected_intruders)}")
    print(f"Images saved in: {INTRUDERS_DIR}/")
    print("=" * 60)

if __name__ == "__main__":
    main()
