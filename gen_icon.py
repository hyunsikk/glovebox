#!/usr/bin/env python3
"""Generate Car Story app icon — car silhouette with timeline/history motif."""

from PIL import Image, ImageDraw, ImageFont
import math
import os

SIZE = 1024
OUT_DIR = os.path.dirname(os.path.abspath(__file__))

# Colors
BG = (13, 27, 42)        # #0D1B2A dark navy
AMBER = (232, 168, 32)   # #E8A820 warm amber
AMBER_DIM = (232, 168, 32, 80)
WHITE = (255, 255, 255)
WHITE_SOFT = (255, 255, 255, 40)
TEAL = (0, 212, 170)     # accent

def draw_rounded_rect(draw, bbox, radius, fill):
    x0, y0, x1, y1 = bbox
    draw.rounded_rectangle(bbox, radius=radius, fill=fill)

def draw_car_side(draw, cx, cy, scale=1.0):
    """Draw a clean side-profile car silhouette."""
    s = scale
    
    # Car body - main shape using polygon
    body_points = [
        (cx - 180*s, cy + 30*s),   # front bottom
        (cx - 190*s, cy + 10*s),   # front bumper curve
        (cx - 175*s, cy - 15*s),   # hood start
        (cx - 120*s, cy - 25*s),   # hood end
        (cx - 100*s, cy - 75*s),   # windshield bottom
        (cx - 50*s, cy - 110*s),   # windshield top
        (cx + 30*s, cy - 115*s),   # roof front
        (cx + 100*s, cy - 110*s),  # roof back
        (cx + 140*s, cy - 75*s),   # rear window top
        (cx + 165*s, cy - 40*s),   # rear window bottom / trunk
        (cx + 185*s, cy - 20*s),   # trunk end
        (cx + 190*s, cy + 10*s),   # rear bumper
        (cx + 180*s, cy + 30*s),   # rear bottom
    ]
    draw.polygon(body_points, fill=WHITE)
    
    # Windows - darker cutouts
    # Windshield
    windshield = [
        (cx - 95*s, cy - 70*s),
        (cx - 48*s, cy - 103*s),
        (cx - 20*s, cy - 105*s),
        (cx - 15*s, cy - 70*s),
    ]
    draw.polygon(windshield, fill=BG)
    
    # Rear window
    rear_window = [
        (cx - 5*s, cy - 70*s),
        (cx - 5*s, cy - 105*s),
        (cx + 60*s, cy - 108*s),
        (cx + 95*s, cy - 105*s),
        (cx + 130*s, cy - 72*s),
        (cx + 90*s, cy - 70*s),
    ]
    draw.polygon(rear_window, fill=BG)
    
    # Wheels
    wheel_r = 32 * s
    # Front wheel
    wx1 = cx - 115*s
    draw.ellipse([wx1-wheel_r, cy+10*s, wx1+wheel_r, cy+10*s+2*wheel_r], fill=(60, 60, 70))
    draw.ellipse([wx1-wheel_r*0.65, cy+10*s+wheel_r*0.35, wx1+wheel_r*0.65, cy+10*s+wheel_r*1.65], fill=(120, 125, 135))
    draw.ellipse([wx1-wheel_r*0.25, cy+10*s+wheel_r*0.75, wx1+wheel_r*0.25, cy+10*s+wheel_r*1.25], fill=(60, 60, 70))
    
    # Rear wheel
    wx2 = cx + 115*s
    draw.ellipse([wx2-wheel_r, cy+10*s, wx2+wheel_r, cy+10*s+2*wheel_r], fill=(60, 60, 70))
    draw.ellipse([wx2-wheel_r*0.65, cy+10*s+wheel_r*0.35, wx2+wheel_r*0.65, cy+10*s+wheel_r*1.65], fill=(120, 125, 135))
    draw.ellipse([wx2-wheel_r*0.25, cy+10*s+wheel_r*0.75, wx2+wheel_r*0.25, cy+10*s+wheel_r*1.25], fill=(60, 60, 70))
    
    # Headlight
    draw.ellipse([cx-185*s, cy-12*s, cx-165*s, cy+5*s], fill=AMBER)
    
    # Taillight
    draw.rounded_rectangle([cx+170*s, cy-15*s, cx+190*s, cy+5*s], radius=4, fill=(220, 50, 50))


def draw_timeline_dots(draw, cx, cy, scale=1.0):
    """Draw a dotted timeline arc under the car suggesting history/journey."""
    s = scale
    
    # Timeline path - a gentle curved line of dots under the car
    num_dots = 8
    start_x = cx - 200*s
    end_x = cx + 200*s
    
    for i in range(num_dots):
        t = i / (num_dots - 1)
        x = start_x + t * (end_x - start_x)
        y = cy + 90*s + math.sin(t * math.pi) * (-20*s)  # gentle arc
        
        # Dots grow from left to right (past → present)
        r = (3 + t * 6) * s
        
        # Color fades from dim to bright amber
        alpha = int(80 + t * 175)
        color = (AMBER[0], AMBER[1], AMBER[2])
        
        # Bigger, brighter dots toward the right (present)
        draw.ellipse([x-r, y-r, x+r, y+r], fill=color)
    
    # Connect dots with a thin line
    for i in range(num_dots - 1):
        t1 = i / (num_dots - 1)
        t2 = (i+1) / (num_dots - 1)
        x1 = start_x + t1 * (end_x - start_x)
        y1 = cy + 90*s + math.sin(t1 * math.pi) * (-20*s)
        x2 = start_x + t2 * (end_x - start_x)
        y2 = cy + 90*s + math.sin(t2 * math.pi) * (-20*s)
        draw.line([x1, y1, x2, y2], fill=AMBER, width=int(2*s))


def draw_clock_hint(draw, cx, cy, scale=1.0):
    """Small clock/history icon element in top-right area."""
    s = scale
    r = 45 * s
    ccx = cx + 280*s
    ccy = cy - 200*s
    
    # Clock circle outline
    draw.ellipse([ccx-r, ccy-r, ccx+r, ccy+r], outline=AMBER, width=int(3*s))
    
    # Clock hands
    # Hour hand
    draw.line([ccx, ccy, ccx + 15*s, ccy - 25*s], fill=AMBER, width=int(4*s))
    # Minute hand  
    draw.line([ccx, ccy, ccx + 30*s, ccy + 5*s], fill=AMBER, width=int(3*s))
    
    # Small counterclockwise arrow suggesting "history"
    arrow_r = r + 10*s
    # Draw small arc arrow
    for angle_deg in range(120, 240, 3):
        angle = math.radians(angle_deg)
        x = ccx + arrow_r * math.cos(angle)
        y = ccy + arrow_r * math.sin(angle)
        draw.ellipse([x-1.5*s, y-1.5*s, x+1.5*s, y+1.5*s], fill=AMBER)


def generate_icon(variant=0):
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Background with rounded corners (iOS will clip, but good for preview)
    draw_rounded_rect(draw, [0, 0, SIZE, SIZE], radius=220, fill=BG)
    
    # Subtle gradient-like effect - lighter center
    for i in range(5):
        alpha = 8 - i
        r = 400 - i * 40
        center = SIZE // 2
        draw.ellipse([center-r, center-r+50, center+r, center+r+50], 
                     fill=(30, 50, 70, alpha))
    
    cx, cy = SIZE // 2, SIZE // 2 - 20
    
    # Draw the car
    draw_car_side(draw, cx, cy, scale=1.8)
    
    # Draw timeline dots underneath
    draw_timeline_dots(draw, cx, cy + 30, scale=1.8)
    
    # Draw small clock/history element
    if variant in [0, 2]:
        draw_clock_hint(draw, cx, cy, scale=1.8)
    
    return img


def generate_variant_book(variant=1):
    """Variant: car with an open book/page motif suggesting 'story'."""
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    draw_rounded_rect(draw, [0, 0, SIZE, SIZE], radius=220, fill=BG)
    
    cx, cy = SIZE // 2, SIZE // 2
    
    # Draw the car slightly higher
    draw_car_side(draw, cx, cy - 60, scale=1.6)
    
    # Draw a road/path underneath that looks like turning pages
    s = 1.6
    # Road line
    draw.line([cx - 250*s, cy + 80*s, cx + 250*s, cy + 80*s], fill=AMBER, width=int(3*s))
    
    # Page-turn marks (like chapter markers on a timeline)
    markers = [-200, -120, -40, 40, 120, 200]
    labels_height = [15, 25, 20, 30, 22, 35]
    for i, mx in enumerate(markers):
        x = cx + mx * s
        h = labels_height[i] * s
        # Vertical tick mark
        draw.line([x, cy + 80*s, x, cy + 80*s - h], fill=AMBER, width=int(3*s))
        # Small dot on top
        draw.ellipse([x-4*s, cy+80*s-h-4*s, x+4*s, cy+80*s-h+4*s], fill=AMBER)
    
    return img


# Generate variants
os.makedirs(os.path.join(OUT_DIR, "icon-candidates"), exist_ok=True)

for i, gen_func in enumerate([
    lambda: generate_icon(0),      # Car + timeline dots + clock
    lambda: generate_icon(1),      # Car + timeline dots only
    lambda: generate_variant_book(1),  # Car + road timeline markers
]):
    img = gen_func()
    # Flatten to RGB for PNG (no alpha needed for app icon)
    flat = Image.new('RGB', (SIZE, SIZE), BG)
    flat.paste(img, mask=img.split()[3])
    path = os.path.join(OUT_DIR, "icon-candidates", f"carstory-icon-v{i+1}.png")
    flat.save(path, "PNG")
    print(f"Saved: {path}")

print("Done! 3 variants generated.")
