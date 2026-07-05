import sys
import argparse
import cv2
import os
# If no input argument is given, try to open a file picker dialog
try:
    import tkinter as _tk
    from tkinter import filedialog as _filedialog
except Exception:
    _tk = None
    _filedialog = None


def auto_detect_and_box(img):
    hog = cv2.HOGDescriptor()
    hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
    # Try multiple image scales (including upscaling) to detect small people
    scales_to_try = [1.0, 1.2, 1.5, 2.0]
    for s in scales_to_try:
        if s != 1.0:
            resized = cv2.resize(img, None, fx=s, fy=s, interpolation=cv2.INTER_LINEAR)
        else:
            resized = img
        rects, weights = hog.detectMultiScale(resized, winStride=(8,8), padding=(16,16), scale=1.05)
        if len(rects) > 0:
            rects = sorted(rects, key=lambda r: r[2]*r[3], reverse=True)
            x,y,w,h = rects[0]
            # map back to original image coordinates
            x1 = int(x / s)
            y1 = int(y / s)
            x2 = int((x + w) / s)
            y2 = int((y + h) / s)
            return (x1, y1, x2, y2)
    return None


def interactive_box(img):
    pts = []
    clone = img.copy()
    win_name = "Select: click top-left then bottom-right, press Enter"

    def on_mouse(event, x, y, flags, param):
        if event == cv2.EVENT_LBUTTONDOWN:
            pts.append((x,y))

    cv2.namedWindow(win_name, cv2.WINDOW_AUTOSIZE)
    cv2.setMouseCallback(win_name, on_mouse)

    while True:
        display = clone.copy()
        if len(pts) == 1:
            cv2.circle(display, pts[0], 4, (0,0,255), -1)
        elif len(pts) >= 2:
            cv2.rectangle(display, pts[0], pts[1], (0,0,255), 2)
        cv2.imshow(win_name, display)
        key = cv2.waitKey(10) & 0xFF
        if key in (13, 10):  # Enter
            break
        if key == 27:  # ESC clears selection
            pts.clear()
        # continue until Enter
    cv2.destroyAllWindows()
    if len(pts) >= 2:
        (x1,y1) = pts[0]; (x2,y2) = pts[1]
        return (min(x1,x2), min(y1,y2), max(x1,x2), max(y1,y2))
    return None


def draw_and_save(img, box, outpath):
    x1,y1,x2,y2 = box
    cv2.rectangle(img, (x1,y1), (x2,y2), (0,0,255), 4)
    cv2.imwrite(outpath, img)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("input", nargs='?', help="input image path (optional). If omitted, a file dialog will open.")
    p.add_argument("--auto", action="store_true", help="try automatic person detection first")
    args = p.parse_args()

    input_path = args.input
    if not input_path:
        if _filedialog is None:
            print("input が指定されていません。ファイルダイアログが利用できません。コマンドラインで画像パスを指定してください。")
            sys.exit(1)
        root = _tk.Tk()
        root.withdraw()
        input_path = _filedialog.askopenfilename(title="Select input image", filetypes=[("Image files", "*.png;*.jpg;*.jpeg;*.bmp;*.tiff")])
        root.destroy()
        if not input_path:
            print("画像が選択されませんでした。終了します。")
            sys.exit(1)

    img = cv2.imread(input_path)
    if img is None:
        print("Failed to read image:", input_path)
        sys.exit(1)

    box = None
    if args.auto:
        box = auto_detect_and_box(img)
        if box is None:
            print("自動検出に失敗しました。手動で選択してください。")

    if box is None:
        box = interactive_box(img)
        if box is None:
            print("矩形が選択されませんでした。終了します。")
            sys.exit(1)

    base, ext = os.path.splitext(input_path)
    outpath = f"{base}_boxed{ext}"
    draw_and_save(img, box, outpath)
    print("保存しました:", outpath)

if __name__ == "__main__":
    main()
