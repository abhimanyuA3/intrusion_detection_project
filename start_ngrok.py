from pyngrok import ngrok, conf
import os, time

NGROK_AUTH = os.getenv('<NGROK_AUTH_TOKEN>')
PORT = int(os.getenv('NGROK_PORT', '5000'))

if not NGROK_AUTH:
    print('Please set NGROK_AUTH_TOKEN environment variable before running this script.')
    print('You can sign up at https://ngrok.com/ for an authtoken.')
    raise SystemExit(1)

conf.get_default().auth_token = NGROK_AUTH
print('Starting ngrok tunnel...')
http_tunnel = ngrok.connect(addr=PORT, bind_tls=True)
public_url = http_tunnel.public_url
print('Public URL:', public_url)
print('\nExport this as PUBLIC_URL so the detector uses it to send media URLs to Twilio:')
print('On Linux/macOS: export PUBLIC_URL="{}"'.format(public_url))
print('On Windows (PowerShell): $env:PUBLIC_URL = "{}"'.format(public_url))
print('\nPress Ctrl+C to stop the tunnel.')
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print('Stopping ngrok...')
    ngrok.disconnect(http_tunnel.public_url)
    ngrok.kill()
