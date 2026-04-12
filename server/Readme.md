# Sentinel Eye - Raspberry Pi Server Setup

This directory contains the Python server (`server.py`) that runs directly on your Raspberry Pi 4 (Debian Trixie) to collect hardware sensor data and stream live camera feeds to the Dashboard.

## 🛠 Hardware Wiring

- **PIR Motion Sensor:** Data pin to `GPIO 17`
- **Infrared (IR) Sensor:** Data pin to `GPIO 5`
- **Buzzer:** Positive pin to `GPIO 22`
- **Raspberry Pi Camera:** Connected via the MIPI CSI port.

---

## 📦 STEP 1 — Install Dependencies

Before running the server, ensure your Raspberry Pi is connected to the internet and install the required Python packages. Open a terminal on your Pi and run:

```bash
# Update package list
sudo apt update

# Install OpenCV and its dependencies (required for HOG detection)
sudo apt install python3-opencv

# Install Flask and RPi.GPIO for Python virtual environments
pip install flask RPi.GPIO
```

---

## 🌐 STEP 2 — Find Your Pi IP Address

You will need the IP address of your Raspberry Pi to connect it to the Dashboard in "Real Mode".

Run the following command in your Pi's terminal:
```bash
hostname -I
```

*Example Output:* `192.168.1.6`

Take this IP address and ensure your Dashboard's `.env` file reflects it:
`VITE_PI_HOST="http://192.168.1.6:5000"`

---

## 🚀 STEP 3 — Run the Server

Navigate to the folder containing `server.py` and run it:

```bash
python3 server.py
```

*If successful, you will see Flask start up and say `Running on all addresses (0.0.0.0)`*

---

## 💻 STEP 4 — Access & Test API

You can test that your Pi server is functioning correctly by visiting the following URLs in your Windows browser (replace with your IP):

🔹 **Check Sensor Status (JSON):**
`http://192.168.1.6:5000/status`
*Expected Response:*
```json
{
  "human_detected": false,
  "motion": true,
  "object_close": false
}
```

🔹 **View Live Video Feed with AI Bounding Boxes:**
`http://192.168.1.6:5000/video_feed`
*(This simulates the live MJPEG stream the dashboard consumes)*

🔹 **View Last Snapshot:**
`http://192.168.1.6:5000/image`

---

## 🎯 STEP 5 — Connect to Your Dashboard

Once the server is running, open your AI Intrusion Dashboard frontend and toggle the modules (Camera, PIR, Infrared) to **"Real"** mode. The dashboard will automatically fetch data and video from the Pi.