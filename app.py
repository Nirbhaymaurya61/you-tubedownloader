from flask import Flask, render_template, request, send_file, jsonify
import yt_dlp
import os
import shutil

app = Flask(__name__)
DOWNLOAD_DIR = 'downloads'
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/download', methods=['POST'])
def download_video():
    data = request.get_json()
    url = data.get('url')
    user_format = data.get('format')

    if not url:
        return jsonify({'success': False, 'message': 'No URL provided'}), 400

    ffmpeg_installed = shutil.which("ffmpeg") is not None
    if user_format and "bestvideo" in user_format and not ffmpeg_installed:
        format_code = "best"
    else:
        format_code = user_format or ("bestvideo+bestaudio/best" if ffmpeg_installed else "best")

    try:
        ydl_opts = {
            'format': format_code,
            'noplaylist': True,
            'outtmpl': os.path.join(DOWNLOAD_DIR, '%(title)s.%(ext)s'),
            'quiet': True
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filepath = ydl.prepare_filename(info)

        if not os.path.exists(filepath):
            raise FileNotFoundError(f"File not found: {filepath}")

        return send_file(filepath, as_attachment=True)

    except Exception as e:
        print(f"❌ Backend Error: {e}")
        return jsonify({'success': False, 'message': f'Server Error: {str(e)}'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
