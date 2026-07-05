import cv2
import sys
import os

if len(sys.argv) < 2:
    print('Usage: force_box_blue.py input.jpg')
    sys.exit(1)

path = sys.argv[1]
img = cv2.imread(path)
if img is None:
    print('Failed to read', path)
    sys.exit(1)

hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
# blue range (adjusted)
lower = (80, 40, 40)
upper = (140, 255, 255)
mask = cv2.inRange(hsv, lower, upper)
# clean up
kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7,7))
mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

# limit search to right side of image to avoid detecting tractor parts on left
height, width = mask.shape
left_limit = int(width * 0.45)
mask[:, :left_limit] = 0

contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
if not contours:
    print('No blue region found')
    sys.exit(1)
# pick largest contour
cnt = max(contours, key=cv2.contourArea)
area = cv2.contourArea(cnt)
h,w = img.shape[:2]
if area < (w*h)*0.0005:
    print('Largest blue region too small:', area)
    sys.exit(1)

x,y,wc,hc = cv2.boundingRect(cnt)
pad_x = int(wc * 0.2)
pad_y = int(hc * 0.1)
x1 = max(0, x - pad_x)
y1 = max(0, y - pad_y)
x2 = min(img.shape[1], x + wc + pad_x)
y2 = min(img.shape[0], y + hc + pad_y)

cv2.rectangle(img, (x1,y1), (x2,y2), (0,0,255), 4)
base,ext = os.path.splitext(path)
out = base + '_boxed_blue' + ext
cv2.imwrite(out, img)
print('Saved', out)
