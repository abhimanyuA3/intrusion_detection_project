from flask import Flask, jsonify, send_file, Response
import RPi.GPIO as GPIO
import cv2
import time
import threading

app = Flask(__name__)

# Add basic CORS support for the React Dashboard
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# -------- GPIO --------
GPIO.setmode(GPIO.BCM)

PIR = 17
IR = 5
BUZZER = 22

GPIO.setup(PIR, GPIO.IN)
GPIO.setup(IR, GPIO.IN)
GPIO.setup(BUZZER, GPIO.OUT)

# -------- CAMERA --------
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

if not cap.isOpened():
    print("WARNING: Could not open camera (video0). Check connection.")

# -------- GLOBAL STATE --------
latest_status = {
    "motion": False,
    "object_close": False,
    "human_detected": False
}

latest_image = "latest.jpg"
latest_frame_for_stream = None
frame_lock = threading.Lock()

# Initialize HOG descriptor for person detection
hog = cv2.HOGDescriptor()
hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())

# -------- BACKGROUND LOOP --------
def run_detection():
    global latest_status, latest_frame_for_stream

    while True:
        pir = GPIO.input(PIR)
        ir = GPIO.input(IR)

        latest_status["motion"] = bool(pir)
        latest_status["object_close"] = (ir == 0)

        # Continually capture framing
        ret, frame = cap.read()
        
        if not ret or frame is None:
            time.sleep(0.5)
            continue
            
        human = False
        
        # Only run heavier AI if motion or close object is detected
        if (pir or ir == 0):
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            # detectMultiScale gives (boxes, weights)
            boxes, weights = hog.detectMultiScale(gray, winStride=(8,8), padding=(8, 8), scale=1.05)
            
            human = len(boxes) > 0
            latest_status["human_detected"] = human

            if human:
                GPIO.output(BUZZER, True)
                # Draw bounding boxes (green)
                for (x, y, w, h) in boxes:
                    cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                    cv2.putText(frame, "INTRUDER", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                
                # Save just for /image fallback
                cv2.imwrite(latest_image, cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            else:
                GPIO.output(BUZZER, False)
        else:
            latest_status["human_detected"] = False
            GPIO.output(BUZZER, False)

        # Update the live stream frame regardless so we can see an empty room
        # We need to convert it to BGR if picam array was RGB, but usually OpenCV plays nice if we just encode it here.
        # Often picam2.capture_array relies on RGB configs, we enforce matching colors.
        with frame_lock:
            # MJPEG stream uses BGR natively with cv2.imencode
            latest_frame_for_stream = frame.copy()

        time.sleep(0.1)


def generate_mjpeg():
    """Generator for MJPEG stream"""
    while True:
        with frame_lock:
            if latest_frame_for_stream is None:
                continue
            # Encode frame to JPEG
            ret, buffer = cv2.imencode('.jpg', latest_frame_for_stream)
            if not ret:
                continue
        
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        time.sleep(0.05)


# -------- API ROUTES --------

@app.route("/status")
def status():
    return jsonify(latest_status)


@app.route("/image")
def image():
    return send_file(latest_image, mimetype='image/jpeg')


@app.route("/video_feed")
def video_feed():
    # Return multipart stream
    return Response(generate_mjpeg(), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route("/trigger")
def trigger():
    return jsonify({"message": "Trigger endpoint hit"})


# -------- RUN --------
if __name__ == "__main__":
    t = threading.Thread(target=run_detection)
    t.daemon = True
    t.start()

    app.run(host="0.0.0.0", port=5000, threaded=True)