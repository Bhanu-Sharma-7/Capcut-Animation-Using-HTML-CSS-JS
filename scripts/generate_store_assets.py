import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# Common Fonts
FONT_BOLD = 'C:\\Windows\\Fonts\\segoeuib.ttf'
FONT_REG = 'C:\\Windows\\Fonts\\segoeui.ttf'
if not os.path.exists(FONT_BOLD):
    FONT_BOLD = 'C:\\Windows\\Fonts\\arialbd.ttf'
if not os.path.exists(FONT_REG):
    FONT_REG = 'C:\\Windows\\Fonts\\arial.ttf'

def get_font(bold=False, size=24):
    path = FONT_BOLD if bold else FONT_REG
    return ImageFont.truetype(path, size)

def draw_rounded_rect(draw, bbox, radius, fill=None, outline=None, width=1):
    draw.rounded_rectangle(bbox, radius=radius, fill=fill, outline=outline, width=width)

# -------------------------------------------------------------------------
# 1. GENERATE STORE ICON (512x512)
# -------------------------------------------------------------------------
def generate_store_icon(output_path='assets/store-icon.png', size=512):
    print(f"Generating Store Icon ({size}x{size})...")
    scale = 2
    w = size * scale
    
    img = Image.new('RGBA', (w, w), (9, 13, 22, 255))
    draw = ImageDraw.Draw(img)
    
    # Deep midnight to royal navy gradient background
    for y in range(w):
        t = y / w
        r = int(9 * (1 - t) + 14 * t)
        g = int(13 * (1 - t) + 32 * t)
        b = int(22 * (1 - t) + 68 * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b, 255))
        
    # Ambient radial cyan/blue glow in center
    glow = Image.new('RGBA', (w, w), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse([w * 0.15, w * 0.15, w * 0.85, w * 0.85], fill=(37, 99, 235, 90))
    glow_draw.ellipse([w * 0.28, w * 0.28, w * 0.72, w * 0.72], fill=(56, 189, 248, 80))
    glow = glow.filter(ImageFilter.GaussianBlur(60 * scale))
    img.alpha_composite(glow)
    
    # Rounded badge container (size 350x350 scaled)
    badge_size = int(360 * scale)
    badge_pad = (w - badge_size) // 2
    badge_rect = [badge_pad, badge_pad, badge_pad + badge_size, badge_pad + badge_size]
    badge_radius = 48 * scale
    
    # Badge drop shadow & glow
    badge_shadow = Image.new('RGBA', (w, w), (0, 0, 0, 0))
    bs_draw = ImageDraw.Draw(badge_shadow)
    bs_draw.rounded_rectangle(badge_rect, radius=badge_radius, fill=(56, 189, 248, 100))
    badge_shadow = badge_shadow.filter(ImageFilter.GaussianBlur(18 * scale))
    img.alpha_composite(badge_shadow)
    
    # Badge surface
    draw.rounded_rectangle(badge_rect, radius=badge_radius, fill=(15, 23, 42, 250), outline=(56, 189, 248, 240), width=4 * scale)
    
    # 3x3 Grid inside badge
    inner_pad = 26 * scale
    grid_x = badge_pad + inner_pad
    grid_y = badge_pad + inner_pad
    grid_size = badge_size - inner_pad * 2
    gap = 8 * scale
    cell_size = (grid_size - gap * 2) / 3
    
    digits = [
        ['1', '3', '4'],
        ['6', '9', '2'],
        ['7', '5', '8']
    ]
    
    font_bold_lg = get_font(bold=True, size=int(cell_size * 0.65))
    font_bold_md = get_font(bold=True, size=int(cell_size * 0.48))
    
    for r in range(3):
        for c in range(3):
            cx = grid_x + c * (cell_size + gap)
            cy = grid_y + r * (cell_size + gap)
            c_rect = [cx, cy, cx + cell_size, cy + cell_size]
            c_radius = 12 * scale
            
            is_center = (r == 1 and c == 1)
            is_corner_accent = (r == 0 and c == 0) or (r == 0 and c == 2)
            
            if is_center:
                # Vibrant glowing electric blue cell with bold white '9'
                cell_glow = Image.new('RGBA', (w, w), (0, 0, 0, 0))
                cg_draw = ImageDraw.Draw(cell_glow)
                cg_draw.rounded_rectangle(c_rect, radius=c_radius, fill=(37, 99, 235, 200))
                cell_glow = cell_glow.filter(ImageFilter.GaussianBlur(8 * scale))
                img.alpha_composite(cell_glow)
                
                draw.rounded_rectangle(c_rect, radius=c_radius, fill=(37, 99, 235, 255), outline=(56, 189, 248, 255), width=2 * scale)
                digit = '9'
                bbox = font_bold_lg.getbbox(digit)
                tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
                tx = cx + (cell_size - tw) / 2 - bbox[0]
                ty = cy + (cell_size - th) / 2 - bbox[1]
                draw.text((tx, ty), digit, font=font_bold_lg, fill=(255, 255, 255, 255))
            else:
                c_fill = (30, 41, 59, 240) if is_corner_accent else (18, 26, 42, 220)
                c_border = (56, 189, 248, 160) if is_corner_accent else (51, 65, 85, 180)
                draw.rounded_rectangle(c_rect, radius=c_radius, fill=c_fill, outline=c_border, width=1 * scale)
                
                digit = digits[r][c]
                bbox = font_bold_md.getbbox(digit)
                tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
                tx = cx + (cell_size - tw) / 2 - bbox[0]
                ty = cy + (cell_size - th) / 2 - bbox[1]
                color = (56, 189, 248, 240) if is_corner_accent else (148, 163, 184, 220)
                draw.text((tx, ty), digit, font=font_bold_md, fill=color)
                
    final_icon = img.resize((size, size), Image.Resampling.LANCZOS)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    final_icon.save(output_path, 'PNG', optimize=True)
    print(f"Saved {output_path}")

# -------------------------------------------------------------------------
# 2. GENERATE FEATURE GRAPHIC (1024x500)
# -------------------------------------------------------------------------
def generate_feature_graphic(output_path='assets/feature-graphic.png', width=1024, height=500):
    print(f"Generating Feature Graphic ({width}x{height})...")
    img = Image.new('RGBA', (width, height), (9, 13, 22, 255))
    draw = ImageDraw.Draw(img)
    
    # Smooth gradient background
    for x in range(width):
        t = x / width
        r = int(9 * (1 - t) + 14 * t)
        g = int(13 * (1 - t) + 25 * t)
        b = int(22 * (1 - t) + 48 * t)
        draw.line([(x, 0), (x, height)], fill=(r, g, b, 255))
        
    # Ambient glow on the right where emblem floats
    ambient = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    a_draw = ImageDraw.Draw(ambient)
    a_draw.ellipse([600, 20, 1020, 480], fill=(37, 99, 235, 80))
    a_draw.ellipse([680, 80, 960, 420], fill=(56, 189, 248, 70))
    ambient = ambient.filter(ImageFilter.GaussianBlur(70))
    img.alpha_composite(ambient)
    
    # Left Content
    # 1. Badge: "100% OFFLINE PUZZLE"
    badge_x, badge_y = 60, 68
    draw.rounded_rectangle([badge_x, badge_y, badge_x + 195, badge_y + 32], radius=16, fill=(30, 58, 138, 180), outline=(56, 189, 248, 220), width=1)
    font_badge = get_font(bold=True, size=12)
    draw.text((badge_x + 16, badge_y + 8), "100% OFFLINE PUZZLE", font=font_badge, fill=(56, 189, 248, 255))
    
    # 2. Main Title: "SUDOKU" & "Offline Puzzle"
    font_title1 = get_font(bold=True, size=52)
    font_title2 = get_font(bold=True, size=38)
    draw.text((badge_x, badge_y + 44), "SUDOKU", font=font_title1, fill=(248, 250, 252, 255))
    draw.text((badge_x, badge_y + 104), "Offline Puzzle", font=font_title2, fill=(56, 189, 248, 255))
    
    # 3. Tagline: "Train Your Brain • Master Every Grid"
    font_sub = get_font(bold=False, size=18)
    draw.text((badge_x, badge_y + 162), "Train Your Brain • Master Every Grid", font=font_sub, fill=(148, 163, 184, 255))
    
    # 4. Feature Pills
    features = ["✓ Unique Solutions", "✓ Dark & Light Theme", "✓ Smart Pencil Notes", "✓ Hints & Undo"]
    font_pill = get_font(bold=True, size=13)
    pill_y = badge_y + 215
    pill_x = badge_x
    for i, feat in enumerate(features):
        bbox = font_pill.getbbox(feat)
        pw = bbox[2] - bbox[0] + 24
        ph = 32
        if i == 2:
            pill_y += 42
            pill_x = badge_x
            
        draw.rounded_rectangle([pill_x, pill_y, pill_x + pw, pill_y + ph], radius=10, fill=(30, 41, 59, 200), outline=(51, 65, 85, 200), width=1)
        draw.text((pill_x + 12, pill_y + 7), feat, font=font_pill, fill=(241, 245, 249, 240))
        pill_x += pw + 12
        
    # 5. Right side: Floating 3x3 Sudoku Emblem (size 340x340)
    emblem_size = 330
    ex = 620
    ey = 85
    
    # Emblem Glow
    em_glow = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    eg_draw = ImageDraw.Draw(em_glow)
    eg_draw.rounded_rectangle([ex, ey, ex + emblem_size, ey + emblem_size], radius=42, fill=(56, 189, 248, 90))
    em_glow = em_glow.filter(ImageFilter.GaussianBlur(25))
    img.alpha_composite(em_glow)
    
    draw.rounded_rectangle([ex, ey, ex + emblem_size, ey + emblem_size], radius=42, fill=(15, 23, 42, 245), outline=(56, 189, 248, 220), width=3)
    
    # Grid inside emblem
    gpad = 22
    g_start_x = ex + gpad
    g_start_y = ey + gpad
    g_inner_w = emblem_size - gpad * 2
    gap = 8
    cw = (g_inner_w - gap * 2) / 3
    
    em_digits = [
        ['1', '4', '7'],
        ['6', '9', '2'],
        ['8', '5', '3']
    ]
    font_em_lg = get_font(bold=True, size=int(cw * 0.65))
    font_em_md = get_font(bold=True, size=int(cw * 0.48))
    
    for r in range(3):
        for c in range(3):
            cx = g_start_x + c * (cw + gap)
            cy = g_start_y + r * (cw + gap)
            cr = 12
            is_center = (r == 1 and c == 1)
            is_accent = (r == 0 and c == 0) or (r == 0 and c == 1)
            
            if is_center:
                draw.rounded_rectangle([cx, cy, cx + cw, cy + cw], radius=cr, fill=(37, 99, 235, 255), outline=(56, 189, 248, 255), width=2)
                digit = '9'
                bbox = font_em_lg.getbbox(digit)
                tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
                tx = cx + (cw - tw) / 2 - bbox[0]
                ty = cy + (cw - th) / 2 - bbox[1]
                draw.text((tx, ty), digit, font=font_em_lg, fill=(255, 255, 255, 255))
            else:
                c_fill = (30, 41, 59, 240) if is_accent else (18, 26, 42, 210)
                c_border = (56, 189, 248, 140) if is_accent else (51, 65, 85, 160)
                draw.rounded_rectangle([cx, cy, cx + cw, cy + cw], radius=cr, fill=c_fill, outline=c_border, width=1)
                
                digit = em_digits[r][c]
                bbox = font_em_md.getbbox(digit)
                tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
                tx = cx + (cw - tw) / 2 - bbox[0]
                ty = cy + (cw - th) / 2 - bbox[1]
                color = (56, 189, 248, 240) if is_accent else (148, 163, 184, 220)
                draw.text((tx, ty), digit, font=font_em_md, fill=color)
                
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, 'PNG', optimize=True)
    print(f"Saved {output_path}")

# -------------------------------------------------------------------------
# 3. GENERATE SCREENSHOT 1: GAMEPLAY SCREEN (1080x1920)
# -------------------------------------------------------------------------
def generate_screenshot_1(output_path='assets/screenshot-1.png', width=1080, height=1920):
    print(f"Generating Screenshot 1: Gameplay ({width}x{height})...")
    img = Image.new('RGBA', (width, height), (9, 13, 22, 255))
    draw = ImageDraw.Draw(img)
    
    # Top Marketing Banner Area (height ~230)
    font_banner_headline = get_font(bold=True, size=52)
    font_banner_sub = get_font(bold=False, size=28)
    
    h_text = "CLASSIC GAMEPLAY & LOGIC"
    s_text = "Clean Dark Theme • Live Timer • Smart Notes"
    
    h_bbox = font_banner_headline.getbbox(h_text)
    s_bbox = font_banner_sub.getbbox(s_text)
    
    hw = h_bbox[2] - h_bbox[0]
    sw = s_bbox[2] - s_bbox[0]
    
    draw.text(((width - hw) // 2, 70), h_text, font=font_banner_headline, fill=(56, 189, 248, 255))
    draw.text(((width - sw) // 2, 138), s_text, font=font_banner_sub, fill=(148, 163, 184, 255))
    
    # Device Phone Container Frame
    # Position: x: 50 to 1030, y: 220 to 1870
    fx1, fy1, fx2, fy2 = 50, 220, 1030, 1870
    draw.rounded_rectangle([fx1, fy1, fx2, fy2], radius=46, fill=(15, 23, 42, 255), outline=(51, 65, 85, 240), width=3)
    
    # Device Top Status Bar (y: 245)
    font_time = get_font(bold=True, size=20)
    font_status_icons = get_font(bold=True, size=16)
    draw.text((fx1 + 45, fy1 + 25), "09:41", font=font_time, fill=(248, 250, 252, 255))
    draw.text((fx2 - 120, fy1 + 27), "LTE  100%", font=font_status_icons, fill=(148, 163, 184, 255))
    
    # App Header Row (y: 295)
    # Home Back Button
    bx, by = fx1 + 35, fy1 + 75
    draw.rounded_rectangle([bx, by, bx + 110, by + 46], radius=12, fill=(30, 41, 59, 255), outline=(51, 65, 85, 255), width=1)
    font_btn = get_font(bold=True, size=18)
    draw.text((bx + 16, by + 11), "⌂ Home", font=font_btn, fill=(248, 250, 252, 255))
    
    # Difficulty Pill (Medium)
    dx = (fx1 + fx2) // 2 - 70
    draw.rounded_rectangle([dx, by, dx + 140, by + 46], radius=14, fill=(30, 41, 59, 255), outline=(56, 189, 248, 255), width=2)
    draw.text((dx + 26, by + 11), "Medium ▼", font=font_btn, fill=(56, 189, 248, 255))
    
    # New Game button
    nx = fx2 - 135
    draw.rounded_rectangle([nx, by, nx + 100, by + 46], radius=12, fill=(30, 41, 59, 255), outline=(51, 65, 85, 255), width=1)
    draw.text((nx + 18, by + 11), "↺ New", font=font_btn, fill=(148, 163, 184, 255))
    
    # Status Card: Mistakes & Timer (y: 395)
    sc_y = by + 68
    draw.rounded_rectangle([fx1 + 35, sc_y, fx2 - 35, sc_y + 60], radius=16, fill=(17, 24, 39, 255), outline=(31, 41, 55, 255), width=1)
    font_sc_lbl = get_font(bold=False, size=18)
    font_sc_val = get_font(bold=True, size=20)
    
    # Mistakes
    draw.text((fx1 + 60, sc_y + 18), "Mistakes", font=font_sc_lbl, fill=(156, 163, 175, 255))
    draw.rounded_rectangle([fx1 + 155, sc_y + 12, fx1 + 225, sc_y + 48], radius=8, fill=(31, 41, 55, 255))
    draw.text((fx1 + 172, sc_y + 16), "0/3", font=font_sc_val, fill=(229, 231, 235, 255))
    
    # Timer
    draw.text((fx2 - 240, sc_y + 18), "Time", font=font_sc_lbl, fill=(156, 163, 175, 255))
    draw.rounded_rectangle([fx2 - 180, sc_y + 12, fx2 - 55, sc_y + 48], radius=8, fill=(31, 41, 55, 255))
    draw.text((fx2 - 168, sc_y + 16), "03:42  ⏸", font=font_sc_val, fill=(56, 189, 248, 255))
    
    # 9x9 Sudoku Board Container (y: 490)
    board_top = sc_y + 85
    board_left = fx1 + 40
    board_w = (fx2 - fx1) - 80 # ~900
    board_rect = [board_left, board_top, board_left + board_w, board_top + board_w]
    
    draw.rounded_rectangle(board_rect, radius=12, fill=(15, 23, 42, 255), outline=(100, 116, 139, 255), width=3)
    
    cell_w = board_w / 9
    
    # Sample board configuration for realistic game in progress
    # 0 represents empty/notes
    board_nums = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ]
    # Simulate user placed numbers
    user_placed = {
        (0, 2): 4, (0, 3): 6, (1, 1): 7, (1, 2): 2, (2, 0): 1, (2, 3): 3,
        (4, 4): 5 # selected cell!
    }
    
    # Selected cell: (4, 4) with value 5
    sel_r, sel_c = 4, 4
    
    font_clue = get_font(bold=True, size=int(cell_w * 0.58))
    font_user = get_font(bold=True, size=int(cell_w * 0.58))
    font_note = get_font(bold=True, size=int(cell_w * 0.22))
    
    for r in range(9):
        for c in range(9):
            cx = board_left + c * cell_w
            cy = board_top + r * cell_w
            
            is_selected = (r == sel_r and c == sel_c)
            is_related = (r == sel_r or c == sel_c or (r // 3 == sel_r // 3 and c // 3 == sel_c // 3))
            
            # Background
            if is_selected:
                draw.rectangle([cx, cy, cx + cell_w, cy + cell_w], fill=(37, 99, 235, 255))
            elif is_related:
                draw.rectangle([cx, cy, cx + cell_w, cy + cell_w], fill=(30, 41, 59, 255))
            else:
                draw.rectangle([cx, cy, cx + cell_w, cy + cell_w], fill=(15, 23, 42, 255))
                
            # Borders (thick for 3x3 blocks)
            # right border
            b_color = (100, 116, 139, 255) if (c % 3 == 2 and c != 8) else (45, 55, 72, 255)
            b_width = 3 if (c % 3 == 2 and c != 8) else 1
            if c != 8:
                draw.line([(cx + cell_w, cy), (cx + cell_w, cy + cell_w)], fill=b_color, width=b_width)
            # bottom border
            bb_color = (100, 116, 139, 255) if (r % 3 == 2 and r != 8) else (45, 55, 72, 255)
            bb_width = 3 if (r % 3 == 2 and r != 8) else 1
            if r != 8:
                draw.line([(cx, cy + cell_w), (cx + cell_w, cy + cell_w)], fill=bb_color, width=bb_width)
                
            # Content
            val = board_nums[r][c]
            is_initial = (val != 0)
            if (r, c) in user_placed:
                val = user_placed[(r, c)]
                is_initial = False
                
            if val != 0:
                digit = str(val)
                f = font_clue if is_initial else font_user
                bbox = f.getbbox(digit)
                tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
                tx = cx + (cell_w - tw) / 2 - bbox[0]
                ty = cy + (cell_w - th) / 2 - bbox[1]
                color = (255, 255, 255, 255) if is_selected else ((248, 250, 252, 255) if is_initial else (56, 189, 248, 255))
                draw.text((tx, ty), digit, font=f, fill=color)
            else:
                # Sample pencil notes in a couple empty cells
                if (r, c) in [(0, 7), (2, 8), (3, 2), (5, 5)]:
                    notes_demo = [1, 2, 7]
                    for n in notes_demo:
                        nr, nc = (n - 1) // 3, (n - 1) % 3
                        nx = cx + nc * (cell_w / 3) + 7
                        ny = cy + nr * (cell_w / 3) + 4
                        draw.text((nx, ny), str(n), font=font_note, fill=(148, 163, 184, 255))
                        
    # Action Bar: Undo, Erase, Notes, Hint (y: 1410)
    ab_y = board_top + board_w + 30
    actions = [
        ("↩", "Undo", False),
        ("⌫", "Erase", False),
        ("✎", "Notes", True),  # Active notes
        ("💡", "Hint", False)
    ]
    act_btn_w = (board_w - 30 * 3) / 4
    font_act_icon = get_font(bold=True, size=24)
    font_act_lbl = get_font(bold=True, size=15)
    
    for i, (icon, label, is_act) in enumerate(actions):
        ax = board_left + i * (act_btn_w + 30)
        bg = (30, 41, 59, 255) if is_act else (17, 24, 39, 255)
        border = (56, 189, 248, 255) if is_act else (31, 41, 55, 255)
        draw.rounded_rectangle([ax, ab_y, ax + act_btn_w, ab_y + 70], radius=14, fill=bg, outline=border, width=2)
        
        # Icon & label
        draw.text((ax + act_btn_w / 2 - 12, ab_y + 10), icon, font=font_act_icon, fill=(56, 189, 248, 255) if is_act else (148, 163, 184, 255))
        draw.text((ax + act_btn_w / 2 - 18, ab_y + 42), label, font=font_act_lbl, fill=(56, 189, 248, 255) if is_act else (148, 163, 184, 255))
        
        if is_act:
            # "ON" badge
            draw.rounded_rectangle([ax + act_btn_w - 30, ab_y + 6, ax + act_btn_w - 6, ab_y + 24], radius=4, fill=(37, 99, 235, 255))
            draw.text((ax + act_btn_w - 26, ab_y + 8), "ON", font=get_font(bold=True, size=10), fill=(255, 255, 255, 255))
            
    # Number Pad Row: 1 to 9 (y: 1530)
    np_y = ab_y + 95
    np_btn_w = (board_w - 8 * 8) / 9
    font_num = get_font(bold=True, size=32)
    font_num_badge = get_font(bold=True, size=13)
    
    remaining = [4, 2, 3, 1, 0, 5, 2, 3, 2] # 5 is completed (0 left)
    
    for i in range(9):
        num_str = str(i + 1)
        nx = board_left + i * (np_btn_w + 8)
        is_completed = (remaining[i] == 0)
        
        bg = (15, 23, 42, 255) if is_completed else (30, 41, 59, 255)
        border = (30, 41, 59, 255) if is_completed else (51, 65, 85, 255)
        draw.rounded_rectangle([nx, np_y, nx + np_btn_w, np_y + 95], radius=12, fill=bg, outline=border, width=1)
        
        # Number text
        color = (100, 116, 139, 200) if is_completed else (248, 250, 252, 255)
        bbox = font_num.getbbox(num_str)
        tw = bbox[2] - bbox[0]
        draw.text((nx + (np_btn_w - tw) / 2, np_y + 14), num_str, font=font_num, fill=color)
        
        # Remaining badge
        badge_text = "✓" if is_completed else str(remaining[i])
        b_color = (16, 185, 129, 255) if is_completed else (56, 189, 248, 255)
        draw.text((nx + (np_btn_w - 10) / 2, np_y + 64), badge_text, font=font_num_badge, fill=b_color)
        
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, 'PNG', optimize=True)
    print(f"Saved {output_path}")

# -------------------------------------------------------------------------
# 4. GENERATE SCREENSHOT 2: MAIN MENU & LEVEL SELECTION (1080x1920)
# -------------------------------------------------------------------------
def generate_screenshot_2(output_path='assets/screenshot-2.png', width=1080, height=1920):
    print(f"Generating Screenshot 2: Main Menu ({width}x{height})...")
    img = Image.new('RGBA', (width, height), (9, 13, 22, 255))
    draw = ImageDraw.Draw(img)
    
    # Top Marketing Banner Area
    font_banner_headline = get_font(bold=True, size=52)
    font_banner_sub = get_font(bold=False, size=28)
    
    h_text = "PLAY 100% OFFLINE ANYWHERE"
    s_text = "3 Balanced Tiers • Unique Backtracking Solves"
    
    h_bbox = font_banner_headline.getbbox(h_text)
    s_bbox = font_banner_sub.getbbox(s_text)
    
    hw = h_bbox[2] - h_bbox[0]
    sw = s_bbox[2] - s_bbox[0]
    
    draw.text(((width - hw) // 2, 70), h_text, font=font_banner_headline, fill=(56, 189, 248, 255))
    draw.text(((width - sw) // 2, 138), s_text, font=font_banner_sub, fill=(148, 163, 184, 255))
    
    # Device Phone Container Frame
    fx1, fy1, fx2, fy2 = 50, 220, 1030, 1870
    draw.rounded_rectangle([fx1, fy1, fx2, fy2], radius=46, fill=(15, 23, 42, 255), outline=(51, 65, 85, 240), width=3)
    
    # Device Top Status Bar (y: 245)
    font_time = get_font(bold=True, size=20)
    font_status_icons = get_font(bold=True, size=16)
    draw.text((fx1 + 45, fy1 + 25), "09:41", font=font_time, fill=(248, 250, 252, 255))
    draw.text((fx2 - 120, fy1 + 27), "LTE  100%", font=font_status_icons, fill=(148, 163, 184, 255))
    
    # App Header: Brand & Profile (y: 295)
    px = fx1 + 40
    py = fy1 + 75
    # Brand
    draw.rounded_rectangle([px, py, px + 44, py + 44], radius=10, fill=(30, 58, 138, 200))
    draw.text((px + 12, py + 8), "S", font=get_font(bold=True, size=24), fill=(56, 189, 248, 255))
    draw.text((px + 56, py + 4), "SUDOKU", font=get_font(bold=True, size=22), fill=(248, 250, 252, 255))
    draw.text((px + 56, py + 26), "CLASSIC PUZZLE", font=get_font(bold=True, size=11), fill=(100, 116, 139, 255))
    
    # Profile pill on right
    pr_x = fx2 - 200
    draw.rounded_rectangle([pr_x, py, fx2 - 40, py + 44], radius=22, fill=(30, 41, 59, 255), outline=(51, 65, 85, 255), width=1)
    draw.text((pr_x + 14, py + 10), "🏆", font=get_font(bold=True, size=16))
    draw.text((pr_x + 42, py + 12), "Puzzle Master", font=get_font(bold=True, size=15), fill=(248, 250, 252, 255))
    
    # Hero Card: Master Every Grid (y: 385)
    hc_y = py + 68
    hc_w = (fx2 - fx1) - 80
    draw.rounded_rectangle([px, hc_y, px + hc_w, hc_y + 240], radius=22, fill=(17, 24, 39, 255), outline=(31, 41, 55, 255), width=1)
    
    draw.rounded_rectangle([px + 24, hc_y + 20, px + 210, hc_y + 48], radius=8, fill=(30, 58, 138, 200))
    draw.text((px + 36, hc_y + 26), "OFFLINE MIND CHALLENGE", font=get_font(bold=True, size=11), fill=(56, 189, 248, 255))
    draw.text((px + 24, hc_y + 60), "Master Every Grid", font=get_font(bold=True, size=30), fill=(248, 250, 252, 255))
    draw.text((px + 24, hc_y + 106), "Sharpen your deductive logic with pure unique backtracking puzzles.", font=get_font(bold=False, size=17), fill=(148, 163, 184, 255))
    
    # Hero Play Button
    draw.rounded_rectangle([px + 24, hc_y + 160, px + hc_w - 24, hc_y + 218], radius=14, fill=(37, 99, 235, 255))
    draw.text((px + hc_w // 2 - 80, hc_y + 176), "▶  PLAY NEW GAME", font=get_font(bold=True, size=18), fill=(255, 255, 255, 255))
    
    # Match in Progress Resume Card (y: 650)
    rc_y = hc_y + 265
    draw.rounded_rectangle([px, rc_y, px + hc_w, rc_y + 105], radius=18, fill=(30, 41, 59, 255), outline=(56, 189, 248, 255), width=2)
    draw.text((px + 24, rc_y + 16), "MATCH IN PROGRESS", font=get_font(bold=True, size=12), fill=(16, 185, 129, 255))
    draw.text((px + 24, rc_y + 38), "Continue Medium Match", font=get_font(bold=True, size=22), fill=(248, 250, 252, 255))
    draw.text((px + 24, rc_y + 70), "Time: 03:42 • Mistakes: 0/3", font=get_font(bold=False, size=15), fill=(148, 163, 184, 255))
    
    # Arrow circle
    draw.rounded_rectangle([px + hc_w - 75, rc_y + 28, px + hc_w - 25, rc_y + 78], radius=25, fill=(37, 99, 235, 255))
    draw.text((px + hc_w - 56, rc_y + 40), "▶", font=get_font(bold=True, size=18), fill=(255, 255, 255, 255))
    
    # Section Header: Select Challenge (y: 780)
    sh_y = rc_y + 125
    draw.text((px, sh_y), "Select Challenge", font=get_font(bold=True, size=24), fill=(248, 250, 252, 255))
    draw.text((px, sh_y + 32), "Pick a difficulty tier to generate a uniquely solvable puzzle", font=get_font(bold=False, size=16), fill=(100, 116, 139, 255))
    
    # 3 Difficulty Cards: Easy, Medium, Hard
    diff_data = [
        ("Easy", "~38 Clues • Gentle logic for beginners", "100% FREE", (16, 185, 129, 255), (6, 78, 59, 255), "Best: 04:12"),
        ("Medium", "~30 Clues • Standard deductive solving", "POPULAR", (56, 189, 248, 255), (30, 58, 138, 255), "Best: 08:45"),
        ("Hard", "~24 Clues • Pure advanced reasoning", "EXPERT", (245, 158, 11, 255), (69, 26, 3, 255), "Best: 15:30")
    ]
    
    dc_y = sh_y + 70
    for name, desc, tag, tag_color, tag_bg, best in diff_data:
        draw.rounded_rectangle([px, dc_y, px + hc_w, dc_y + 115], radius=16, fill=(30, 41, 59, 255), outline=(51, 65, 85, 255), width=1)
        
        # Title & Badge
        draw.text((px + 24, dc_y + 16), name, font=get_font(bold=True, size=24), fill=(248, 250, 252, 255))
        
        # Tag pill
        tag_bbox = get_font(bold=True, size=12).getbbox(tag)
        tw = tag_bbox[2] - tag_bbox[0] + 18
        draw.rounded_rectangle([px + hc_w - tw - 24, dc_y + 16, px + hc_w - 24, dc_y + 44], radius=6, fill=tag_bg, outline=tag_color, width=1)
        draw.text((px + hc_w - tw - 15, dc_y + 22), tag, font=get_font(bold=True, size=12), fill=tag_color)
        
        # Description
        draw.text((px + 24, dc_y + 54), desc, font=get_font(bold=False, size=16), fill=(148, 163, 184, 255))
        # Best record
        draw.text((px + 24, dc_y + 82), best, font=get_font(bold=True, size=14), fill=(100, 116, 139, 255))
        draw.text((px + hc_w - 45, dc_y + 78), "➔", font=get_font(bold=True, size=18), fill=(56, 189, 248, 255))
        
        dc_y += 130
        
    # Bottom Navigation Bar Mockup (y: 1770)
    nav_y = fy2 - 80
    draw.line([(fx1, nav_y), (fx2, nav_y)], fill=(31, 41, 55, 255), width=1)
    
    nav_items = [("Home", True), ("Profile", False), ("Settings", False)]
    nav_w = (fx2 - fx1) / 3
    for i, (tab_name, is_act) in enumerate(nav_items):
        cx = fx1 + i * nav_w + nav_w / 2
        color = (56, 189, 248, 255) if is_act else (100, 116, 139, 255)
        draw.text((cx - 24, nav_y + 28), tab_name, font=get_font(bold=is_act, size=17), fill=color)
        
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, 'PNG', optimize=True)
    print(f"Saved {output_path}")

if __name__ == '__main__':
    generate_store_icon('assets/store-icon.png', 512)
    generate_feature_graphic('assets/feature-graphic.png', 1024, 500)
    generate_screenshot_1('assets/screenshot-1.png', 1080, 1920)
    generate_screenshot_2('assets/screenshot-2.png', 1080, 1920)
    print("\nAll Play Store graphics generated successfully!")
