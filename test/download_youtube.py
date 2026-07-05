# download_youtube.py
import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Optional

try:
    from yt_dlp import YoutubeDL
except ModuleNotFoundError as exc:
    raise SystemExit(
        f"{exc}\n"
        f"Install it into the active Python environment with: {sys.executable} -m pip install yt-dlp\n"
        r"Or use the project venv: C:\Users\salzburug\Desktop\python\.venv\Scripts\python.exe -m pip install yt-dlp"
    ) from exc


def download(url: str, out_dir: str = "."):
    out_dir_path = Path(out_dir)
    out_dir_path.mkdir(parents=True, exist_ok=True)

    ydl_opts = {
        "format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "ffmpeg_location": r"C:\ffmpeg\bin\ffmpeg.exe",
        "outtmpl": str(out_dir_path / "%(title)s.%(ext)s"),
        "merge_output_format": "mp4",
        "noplaylist": True,
    }
    with YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    video_file = find_downloaded_video(out_dir_path)
    if video_file is None:
        print("No video file was found after download.")
        return

    mp3_file = extract_audio_to_mp3(video_file, out_dir_path)
    if mp3_file is not None:
        print(f"Audio extracted to: {mp3_file}")


def find_downloaded_video(out_dir: Path) -> Optional[Path]:
    video_extensions = {".mp4", ".mkv", ".webm", ".mov", ".avi"}
    candidates = [
        path
        for path in out_dir.iterdir()
        if path.is_file() and path.suffix.lower() in video_extensions
    ]
    if not candidates:
        return None
    return max(candidates, key=lambda path: path.stat().st_mtime)


def extract_audio_to_mp3(video_file: Path, out_dir: Path) -> Optional[Path]:
    ffmpeg_path = r"C:\ffmpeg\bin\ffmpeg.exe"
    if not os.path.exists(ffmpeg_path):
        ffmpeg_path = shutil.which("ffmpeg")

    if not ffmpeg_path:
        raise FileNotFoundError(
            "ffmpeg was not found. Install FFmpeg and make sure it is available in PATH."
        )

    mp3_file = out_dir / f"{video_file.stem}.mp3"
    subprocess.run(
        [
            ffmpeg_path,
            "-y",
            "-i",
            str(video_file),
            "-vn",
            "-acodec",
            "libmp3lame",
            "-q:a",
            "2",
            str(mp3_file),
        ],
        check=True,
    )
    return mp3_file


if __name__ == "__main__":
    p = argparse.ArgumentParser(description="Download YouTube video as MP4 and extract audio as MP3")
    p.add_argument("url", help="YouTube video URL")
    p.add_argument("-o", "--out", default=".", help="Output directory")
    args = p.parse_args()
    download(args.url, args.out)