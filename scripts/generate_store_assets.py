import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# -------------------------------------------------------------------------
# FONT & HELPER CONFIGURATION
# -------------------------------------------------------------------------
FONT_BOLD = 'C:\\Windows\\Fonts\\segoeuib.ttf'
FONT_REG = 'C:\\Windows\\Fonts\\segoeui.ttf'
if not os.path.exists(FONT_BOLD):
    FONT_BOLD = 'C:\\Windows\\Fonts\\arialbd.ttf'
if not os.path.exists(FONT_REG):
    FONT_REG = 'C:\\Windows\\Fonts\\arial.ttf'

def get_font(bold=False, size=24):
    path = FONT_BOLD if bold else FONT_REG
    return ImageFont.truetype(path, int(size))

# -------------------------------------------------------------------------
# 1. STORE ICON (512x512)
# -------------------------------------------------------------------------
def generate_store_icon(output_path='assets/store-icon.png', size=512):
    print(f"Generating Store Icon ({size}x{size})...")
    scale = 2
    w = size * scale
    
    img = Image.new('RGBA', (w, w), (9, 13, 22, 255))
    draw = ImageDraw.Draw(img)
    
    for y in range(w):
        t = y / w
        r = int(9 * (1 - t) + 14 * t)
        g = int(13 * (1 - t) + 32 * t)
        b = int(22 * (1 - t) + 68 * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b, 255))
        
    glow = Image.new('RGBA', (w, w), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse([w * 0.15, w * 0.15, w * 0.85, w * 0.85], fill=(37, 99, 235, 90))
    glow_draw.ellipse([w * 0.28, w * 0.28, w * 0.72, w * 0.72], fill=(56, 189, 248, 80))
    glow = glow.filter(ImageFilter.GaussianBlur(60 * scale))
    img.alpha_composite(glow)
    draw = ImageDraw.Draw(img)
    
    badge_size = int(360 * scale)
    badge_pad = (w - badge_size) // 2
    badge_rect = [badge_pad, badge_pad, badge_pad + badge_size, badge_pad + badge_size]
    badge_radius = 48 * scale
    
    badge_shadow = Image.new('RGBA', (w, w), (0, 0, 0, 0))
    bs_draw = ImageDraw.Draw(badge_shadow)
    bs_draw.rounded_rectangle(badge_rect, radius=badge_radius, fill=(56, 189, 248, 100))
    badge_shadow = badge_shadow.filter(ImageFilter.GaussianBlur(18 * scale))
    img.alpha_composite(badge_shadow)
    draw = ImageDraw.Draw(img)
    
    draw.rounded_rectangle(badge_rect, radius=badge_radius, fill=(15, 23, 42, 250), outline=(56, 189, 248, 240), width=4 * scale)
    
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
                cell_glow = Image.new('RGBA', (w, w), (0, 0, 0, 0))
                cg_draw = ImageDraw.Draw(cell_glow)
                cg_draw.rounded_rectangle(c_rect, radius=c_radius, fill=(37, 99, 235, 200))
                cell_glow = cell_glow.filter(ImageFilter.GaussianBlur(8 * scale))
                img.alpha_composite(cell_glow)
                draw = ImageDraw.Draw(img)
                
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
# 2. FEATURE GRAPHIC (1024x500)
# -------------------------------------------------------------------------
def generate_feature_graphic(output_path='assets/feature-graphic.png', width=1024, height=500):
    print(f"Generating Feature Graphic ({width}x{height})...")
    img = Image.new('RGBA', (width, height), (9, 13, 22, 255))
    draw = ImageDraw.Draw(img)
    
    for x in range(width):
        t = x / width
        r = int(9 * (1 - t) + 14 * t)
        g = int(13 * (1 - t) + 25 * t)
        b = int(22 * (1 - t) + 48 * t)
        draw.line([(x, 0), (x, height)], fill=(r, g, b, 255))
        
    ambient = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    a_draw = ImageDraw.Draw(ambient)
    a_draw.ellipse([width - 450, -50, width + 50, height + 50], fill=(37, 99, 235, 70))
    a_draw.ellipse([width - 320, 50, width - 50, height - 50], fill=(56, 189, 248, 55))
    ambient = ambient.filter(ImageFilter.GaussianBlur(50))
    img.alpha_composite(ambient)
    draw = ImageDraw.Draw(img)
    
    badge_x = 55
    badge_y = 65
    draw.rounded_rectangle([badge_x, badge_y, badge_x + 190, badge_y + 32], radius=16, fill=(30, 41, 59, 230), outline=(56, 189, 248, 230), width=1)
    font_badge = get_font(bold=True, size=12)
    draw.text((badge_x + 16, badge_y + 8), "100% OFFLINE PUZZLE", font=font_badge, fill=(56, 189, 248, 255))
    
    font_title1 = get_font(bold=True, size=52)
    font_title2 = get_font(bold=True, size=38)
    draw.text((badge_x, badge_y + 44), "SUDOKU", font=font_title1, fill=(248, 250, 252, 255))
    draw.text((badge_x, badge_y + 104), "Offline Puzzle", font=font_title2, fill=(56, 189, 248, 255))
    
    font_sub = get_font(bold=False, size=18)
    draw.text((badge_x, badge_y + 162), "Train Your Brain • Master Every Grid", font=font_sub, fill=(148, 163, 184, 255))
    
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
        
    emblem_size = 330
    ex = 620
    ey = 85
    
    em_glow = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    eg_draw = ImageDraw.Draw(em_glow)
    eg_draw.rounded_rectangle([ex, ey, ex + emblem_size, ey + emblem_size], radius=42, fill=(56, 189, 248, 90))
    em_glow = em_glow.filter(ImageFilter.GaussianBlur(25))
    img.alpha_composite(em_glow)
    draw = ImageDraw.Draw(img)
    
    draw.rounded_rectangle([ex, ey, ex + emblem_size, ey + emblem_size], radius=42, fill=(15, 23, 42, 245), outline=(56, 189, 248, 220), width=3)
    
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
# COMMON SCREENSHOT CANVAS BUILDER (1080x1920)
# -------------------------------------------------------------------------
def create_base_canvas(tag, title, subtitle, accent_color=(56, 189, 248, 255), is_offline=False):
    width, height = 1080, 1920
    img = Image.new('RGBA', (width, height), (7, 10, 20, 255))
    draw = ImageDraw.Draw(img)
    
    # 1. Premium dark-blue vertical gradient background
    for y in range(height):
        t = y / float(height)
        r = int(7 * (1 - t) + 18 * t)
        g = int(10 * (1 - t) + 26 * t)
        b = int(22 * (1 - t) + 52 * t)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
        
    # 2. Ambient lighting radial glows
    glow = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse([650, 40, 1150, 520], fill=(37, 99, 235, 55))
    gdraw.ellipse([-80, 180, 440, 720], fill=(56, 189, 248, 45))
    glow = glow.filter(ImageFilter.GaussianBlur(80))
    img.alpha_composite(glow)
    draw = ImageDraw.Draw(img)
    
    # 3. Top Marketing Callout
    # Tag Pill
    font_tag = get_font(bold=True, size=15)
    t_bbox = font_tag.getbbox(tag)
    tw = t_bbox[2] - t_bbox[0]
    tag_w = tw + 32
    tag_x = (width - tag_w) // 2
    draw.rounded_rectangle([tag_x, 42, tag_x + tag_w, 42 + 34], radius=17, fill=(30, 41, 59, 230), outline=accent_color, width=1)
    draw.text((tag_x + 16, 42 + 8), tag, font=font_tag, fill=accent_color)
    
    # Main Header
    font_title = get_font(bold=True, size=52)
    h_bbox = font_title.getbbox(title)
    hw = h_bbox[2] - h_bbox[0]
    draw.text(((width - hw) // 2, 92), title, font=font_title, fill=(255, 255, 255, 255))
    
    # Subtitle
    font_sub = get_font(bold=False, size=25)
    s_bbox = font_sub.getbbox(subtitle)
    sw = s_bbox[2] - s_bbox[0]
    draw.text(((width - sw) // 2, 162), subtitle, font=font_sub, fill=(148, 163, 184, 255))
    
    # 4. Device Phone Mockup Frame
    fx1, fy1, fx2, fy2 = 55, 225, 1025, 1895
    p_shadow = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    ps_draw = ImageDraw.Draw(p_shadow)
    ps_draw.rounded_rectangle([fx1 - 4, fy1 - 4, fx2 + 4, fy2 + 4], radius=50, fill=(0, 0, 0, 180))
    p_shadow = p_shadow.filter(ImageFilter.GaussianBlur(24))
    img.alpha_composite(p_shadow)
    draw = ImageDraw.Draw(img)
    
    # Bezel and Screen Surface
    draw.rounded_rectangle([fx1, fy1, fx2, fy2], radius=48, fill=(11, 15, 26, 255), outline=(51, 65, 85, 255), width=3)
    
    # Dynamic Island Camera Notch
    draw.rounded_rectangle([475, fy1 + 16, 605, fy1 + 42], radius=13, fill=(0, 0, 0, 255))
    draw.ellipse([585, fy1 + 24, 595, fy1 + 34], fill=(20, 30, 45, 255))
    
    # Status Bar
    font_status_time = get_font(bold=True, size=20)
    font_status_sub = get_font(bold=True, size=15)
    time_str = "✈ 09:41" if is_offline else "09:41"
    draw.text((fx1 + 45, fy1 + 22), time_str, font=font_status_time, fill=(248, 250, 252, 255))
    
    right_status = "Offline Ready" if is_offline else "5G  100%"
    draw.text((fx2 - 145, fy1 + 24), right_status, font=font_status_sub, fill=(148, 163, 184, 255))
    
    return img, draw, fx1, fy1, fx2, fy2

def draw_bottom_nav(draw, fx1, fx2, fy2, active_tab='Home'):
    nav_y = fy2 - 82
    draw.line([(fx1 + 10, nav_y), (fx2 - 10, nav_y)], fill=(31, 41, 55, 255), width=1)
    
    tabs = ["Home", "Profile", "Settings"]
    w = (fx2 - fx1) / 3.0
    for i, tab in enumerate(tabs):
        cx = fx1 + i * w + w / 2.0
        is_act = (tab == active_tab)
        color = (56, 189, 248, 255) if is_act else (100, 116, 139, 255)
        font = get_font(bold=is_act, size=18)
        bbox = font.getbbox(tab)
        tw = bbox[2] - bbox[0]
        draw.text((cx - tw / 2.0, nav_y + 26), tab, font=font, fill=color)

def draw_sudoku_board(draw, board_left, board_top, board_w, board_nums, user_placed=None, notes=None, selected_cell=(4, 4), error_cell=None):
    if user_placed is None:
        user_placed = {}
    if notes is None:
        notes = {}
        
    cell_w = board_w / 9.0
    board_rect = [board_left, board_top, board_left + board_w, board_top + board_w]
    draw.rounded_rectangle(board_rect, radius=12, fill=(15, 23, 42, 255), outline=(100, 116, 139, 255), width=3)
    
    sel_r, sel_c = selected_cell if selected_cell else (-1, -1)
    sel_val = None
    if selected_cell:
        sel_val = user_placed.get(selected_cell, board_nums[sel_r][sel_c])
        
    font_clue = get_font(bold=True, size=int(cell_w * 0.58))
    font_user = get_font(bold=True, size=int(cell_w * 0.58))
    font_note = get_font(bold=True, size=int(cell_w * 0.22))
    
    for r in range(9):
        for c in range(9):
            cx = board_left + c * cell_w
            cy = board_top + r * cell_w
            
            is_selected = (r == sel_r and c == sel_c)
            is_related = (r == sel_r or c == sel_c or (r // 3 == sel_r // 3 and c // 3 == sel_c // 3))
            is_error = (error_cell and r == error_cell[0] and c == error_cell[1])
            
            val = board_nums[r][c]
            is_initial = (val != 0)
            if (r, c) in user_placed:
                val = user_placed[(r, c)]
                is_initial = False
                
            is_matching_num = (sel_val is not None and sel_val > 0 and val == sel_val)
            
            # Cell Background
            if is_selected:
                draw.rectangle([cx, cy, cx + cell_w, cy + cell_w], fill=(37, 99, 235, 255))
            elif is_error:
                draw.rectangle([cx, cy, cx + cell_w, cy + cell_w], fill=(127, 29, 29, 255))
            elif is_matching_num:
                draw.rectangle([cx, cy, cx + cell_w, cy + cell_w], fill=(30, 58, 138, 255))
            elif is_related:
                draw.rectangle([cx, cy, cx + cell_w, cy + cell_w], fill=(26, 36, 56, 255))
            else:
                draw.rectangle([cx, cy, cx + cell_w, cy + cell_w], fill=(15, 23, 42, 255))
                
            # Cell Borders
            if c != 8:
                b_color = (100, 116, 139, 255) if (c % 3 == 2) else (45, 55, 72, 255)
                b_width = 3 if (c % 3 == 2) else 1
                draw.line([(cx + cell_w, cy), (cx + cell_w, cy + cell_w)], fill=b_color, width=b_width)
            if r != 8:
                bb_color = (100, 116, 139, 255) if (r % 3 == 2) else (45, 55, 72, 255)
                bb_width = 3 if (r % 3 == 2) else 1
                draw.line([(cx, cy + cell_w), (cx + cell_w, cy + cell_w)], fill=bb_color, width=bb_width)
                
            # Content
            if val != 0:
                digit = str(val)
                f = font_clue if is_initial else font_user
                bbox = f.getbbox(digit)
                tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
                tx = cx + (cell_w - tw) / 2 - bbox[0]
                ty = cy + (cell_w - th) / 2 - bbox[1]
                
                if is_selected or is_matching_num:
                    color = (255, 255, 255, 255)
                elif is_error:
                    color = (254, 202, 202, 255)
                elif is_initial:
                    color = (248, 250, 252, 255)
                else:
                    color = (56, 189, 248, 255)
                    
                draw.text((tx, ty), digit, font=f, fill=color)
            elif (r, c) in notes:
                cell_notes = notes[(r, c)]
                for n in cell_notes:
                    nr, nc = (n - 1) // 3, (n - 1) % 3
                    nx = cx + nc * (cell_w / 3.0) + (cell_w / 3.0 - 10) / 2
                    ny = cy + nr * (cell_w / 3.0) + (cell_w / 3.0 - 14) / 2
                    draw.text((nx, ny), str(n), font=font_note, fill=(148, 163, 184, 255))

def draw_action_bar(draw, left, top, width, notes_active=True, hint_badge=3):
    actions = [
        ("↶", "Undo", False),
        ("⌫", "Erase", False),
        ("✎", "Notes", notes_active),
        ("💡", "Hint", False)
    ]
    act_btn_w = (width - 30 * 3) / 4.0
    font_act_icon = get_font(bold=True, size=24)
    font_act_lbl = get_font(bold=True, size=15)
    
    for i, (icon, label, is_act) in enumerate(actions):
        ax = left + i * (act_btn_w + 30)
        bg = (30, 41, 59, 255) if is_act else (17, 24, 39, 255)
        border = (56, 189, 248, 255) if is_act else (31, 41, 55, 255)
        draw.rounded_rectangle([ax, top, ax + act_btn_w, top + 70], radius=14, fill=bg, outline=border, width=2)
        
        draw.text((ax + act_btn_w / 2.0 - 12, top + 10), icon, font=font_act_icon, fill=(56, 189, 248, 255) if is_act else (148, 163, 184, 255))
        draw.text((ax + act_btn_w / 2.0 - 18, top + 42), label, font=font_act_lbl, fill=(56, 189, 248, 255) if is_act else (148, 163, 184, 255))
        
        if is_act:
            draw.rounded_rectangle([ax + act_btn_w - 30, top + 6, ax + act_btn_w - 6, top + 24], radius=4, fill=(37, 99, 235, 255))
            draw.text((ax + act_btn_w - 26, top + 8), "ON", font=get_font(bold=True, size=10), fill=(255, 255, 255, 255))
        elif label == "Hint" and hint_badge:
            draw.rounded_rectangle([ax + act_btn_w - 26, top + 6, ax + act_btn_w - 6, top + 24], radius=9, fill=(245, 158, 11, 255))
            draw.text((ax + act_btn_w - 20, top + 8), str(hint_badge), font=get_font(bold=True, size=11), fill=(0, 0, 0, 255))

def draw_number_keypad(draw, left, top, width, remaining):
    np_btn_w = (width - 8 * 8) / 9.0
    font_num = get_font(bold=True, size=32)
    font_num_badge = get_font(bold=True, size=13)
    
    for i in range(9):
        num_str = str(i + 1)
        nx = left + i * (np_btn_w + 8)
        is_completed = (remaining[i] == 0)
        
        bg = (15, 23, 42, 255) if is_completed else (30, 41, 59, 255)
        border = (30, 41, 59, 255) if is_completed else (51, 65, 85, 255)
        draw.rounded_rectangle([nx, top, nx + np_btn_w, top + 95], radius=12, fill=bg, outline=border, width=1)
        
        color = (100, 116, 139, 200) if is_completed else (248, 250, 252, 255)
        bbox = font_num.getbbox(num_str)
        tw = bbox[2] - bbox[0]
        draw.text((nx + (np_btn_w - tw) / 2.0, top + 14), num_str, font=font_num, fill=color)
        
        badge_text = "✓" if is_completed else str(remaining[i])
        b_color = (16, 185, 129, 255) if is_completed else (56, 189, 248, 255)
        bbox_b = font_num_badge.getbbox(badge_text)
        bw = bbox_b[2] - bbox_b[0]
        draw.text((nx + (np_btn_w - bw) / 2.0, top + 64), badge_text, font=font_num_badge, fill=b_color)

# -------------------------------------------------------------------------
# SCREENSHOT 1: CLASSIC SUDOKU PUZZLE (1080x1920)
# -------------------------------------------------------------------------
def generate_screenshot_1(output_path='assets/screenshot-1.png'):
    print("Generating Screenshot 1: Classic Sudoku Puzzle...")
    img, draw, fx1, fy1, fx2, fy2 = create_base_canvas(
        tag="PURE BRAIN WORKOUT",
        title="CLASSIC SUDOKU PUZZLE",
        subtitle="Train your brain with pure deductive logic",
        accent_color=(56, 189, 248, 255)
    )
    
    # Header Row
    by = fy1 + 65
    bx = fx1 + 35
    draw.rounded_rectangle([bx, by, bx + 110, by + 46], radius=12, fill=(30, 41, 59, 255), outline=(51, 65, 85, 255), width=1)
    draw.text((bx + 18, by + 11), "‹ Home", font=get_font(bold=True, size=18), fill=(248, 250, 252, 255))
    
    dx = (fx1 + fx2) // 2 - 70
    draw.rounded_rectangle([dx, by, dx + 140, by + 46], radius=14, fill=(30, 41, 59, 255), outline=(56, 189, 248, 255), width=2)
    draw.text((dx + 26, by + 11), "Medium ▼", font=get_font(bold=True, size=18), fill=(56, 189, 248, 255))
    
    nx = fx2 - 145
    draw.rounded_rectangle([nx, by, nx + 110, by + 46], radius=12, fill=(30, 41, 59, 255), outline=(51, 65, 85, 255), width=1)
    draw.text((nx + 20, by + 11), "↺ Reset", font=get_font(bold=True, size=18), fill=(148, 163, 184, 255))
    
    # Status Card (Mistakes, Score, Timer)
    sc_y = by + 65
    draw.rounded_rectangle([fx1 + 35, sc_y, fx2 - 35, sc_y + 58], radius=16, fill=(17, 24, 39, 255), outline=(31, 41, 55, 255), width=1)
    
    draw.text((fx1 + 60, sc_y + 17), "Mistakes", font=get_font(bold=False, size=17), fill=(156, 163, 175, 255))
    draw.rounded_rectangle([fx1 + 145, sc_y + 12, fx1 + 215, sc_y + 46], radius=8, fill=(31, 41, 55, 255))
    draw.text((fx1 + 162, sc_y + 16), "0/3", font=get_font(bold=True, size=18), fill=(229, 231, 235, 255))
    
    draw.text((fx1 + 250, sc_y + 17), "Score", font=get_font(bold=False, size=17), fill=(156, 163, 175, 255))
    draw.text((fx1 + 305, sc_y + 16), "1,250", font=get_font(bold=True, size=18), fill=(248, 250, 252, 255))
    
    draw.text((fx2 - 240, sc_y + 17), "Time", font=get_font(bold=False, size=17), fill=(156, 163, 175, 255))
    draw.rounded_rectangle([fx2 - 180, sc_y + 12, fx2 - 55, sc_y + 46], radius=8, fill=(31, 41, 55, 255))
    draw.text((fx2 - 168, sc_y + 16), "03:42  ⏸", font=get_font(bold=True, size=18), fill=(56, 189, 248, 255))
    
    # Sudoku Board
    board_top = sc_y + 75
    board_w = 880
    board_left = (1080 - board_w) // 2
    
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
    user_placed = {
        (0, 2): 4, (0, 3): 6, (1, 1): 7, (1, 2): 2, (2, 0): 1, (2, 3): 3,
        (4, 4): 5
    }
    notes = {
        (0, 7): [1, 2, 7],
        (2, 8): [4, 8],
        (3, 2): [1, 9],
        (5, 5): [4, 7]
    }
    
    draw_sudoku_board(draw, board_left, board_top, board_w, board_nums, user_placed=user_placed, notes=notes, selected_cell=(4, 4))
    
    # Action Bar
    ab_y = board_top + board_w + 30
    draw_action_bar(draw, board_left, ab_y, board_w, notes_active=True, hint_badge=3)
    
    # Number Keypad
    np_y = ab_y + 92
    remaining = [4, 2, 3, 1, 0, 5, 2, 3, 2]
    draw_number_keypad(draw, board_left, np_y, board_w, remaining)
    
    # Bottom Nav
    draw_bottom_nav(draw, fx1, fx2, fy2, active_tab='Home')
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, 'PNG', optimize=True)
    print(f"Saved {output_path}")

# -------------------------------------------------------------------------
# SCREENSHOT 2: PLAY 100% OFFLINE (1080x1920)
# -------------------------------------------------------------------------
def generate_screenshot_2(output_path='assets/screenshot-2.png'):
    print("Generating Screenshot 2: Play 100% Offline...")
    img, draw, fx1, fy1, fx2, fy2 = create_base_canvas(
        tag="ZERO DATA REQUIRED",
        title="PLAY 100% OFFLINE",
        subtitle="No internet required • Enjoy anytime, anywhere",
        accent_color=(16, 185, 129, 255),
        is_offline=True
    )
    
    # 1. Radiant Glowing Offline Banner inside device
    b_y = fy1 + 65
    b_h = 80
    px = fx1 + 35
    pw = (fx2 - fx1) - 70
    draw.rounded_rectangle([px, b_y, px + pw, b_y + b_h], radius=18, fill=(6, 78, 59, 220), outline=(16, 185, 129, 255), width=2)
    
    draw.rounded_rectangle([px + 20, b_y + 18, px + 64, b_y + 62], radius=12, fill=(16, 185, 129, 255))
    draw.text((px + 32, b_y + 24), "🛡", font=get_font(bold=True, size=20))
    
    draw.text((px + 80, b_y + 16), "OFFLINE PLAY ACTIVE • NO WI-FI NEEDED", font=get_font(bold=True, size=18), fill=(248, 250, 252, 255))
    draw.text((px + 80, b_y + 44), "100% battery-friendly • Zero ads • Local mathematical engine", font=get_font(bold=False, size=14), fill=(167, 243, 208, 255))
    
    # 2. In-Game Mini Header
    gh_y = b_y + 98
    draw.rounded_rectangle([px, gh_y, px + pw, gh_y + 54], radius=14, fill=(17, 24, 39, 255), outline=(31, 41, 55, 255), width=1)
    
    draw.rounded_rectangle([px + 16, gh_y + 10, px + 175, gh_y + 44], radius=8, fill=(69, 26, 3, 200), outline=(245, 158, 11, 255), width=1)
    draw.text((px + 28, gh_y + 15), "Hard Mode ★★★", font=get_font(bold=True, size=15), fill=(245, 158, 11, 255))
    
    draw.text((px + 210, gh_y + 16), "Mistakes: 1/3", font=get_font(bold=False, size=16), fill=(156, 163, 175, 255))
    draw.text((px + pw - 180, gh_y + 16), "Time: 08:15 ⏸", font=get_font(bold=True, size=16), fill=(56, 189, 248, 255))
    
    # 3. Compact Sudoku Board (800x800)
    board_top = gh_y + 70
    board_w = 800
    board_left = (1080 - board_w) // 2
    
    board_nums = [
        [0, 2, 0, 6, 0, 8, 0, 0, 0],
        [5, 8, 0, 0, 0, 9, 7, 0, 0],
        [0, 0, 0, 0, 4, 0, 0, 0, 0],
        [3, 7, 0, 0, 0, 0, 5, 0, 0],
        [6, 0, 0, 0, 0, 0, 0, 0, 4],
        [0, 0, 8, 0, 0, 0, 0, 1, 3],
        [0, 0, 0, 0, 2, 0, 0, 0, 0],
        [0, 0, 9, 8, 0, 0, 0, 3, 6],
        [0, 0, 0, 3, 0, 6, 0, 9, 0]
    ]
    user_placed = {
        (0, 0): 1, (0, 2): 4, (1, 3): 1, (1, 4): 3, (2, 4): 4,
        (4, 4): 7
    }
    notes = {
        (0, 4): [5, 7],
        (2, 0): [7, 9],
        (3, 2): [2, 5],
        (6, 6): [1, 4, 8]
    }
    
    draw_sudoku_board(draw, board_left, board_top, board_w, board_nums, user_placed=user_placed, notes=notes, selected_cell=(4, 4))
    
    # 4. Offline Benefits Showcase Card
    ob_y = board_top + board_w + 30
    draw.rounded_rectangle([px, ob_y, px + pw, ob_y + 270], radius=20, fill=(15, 23, 42, 255), outline=(16, 185, 129, 200), width=2)
    
    draw.text((px + 24, ob_y + 20), "⚡ PURE ON-DEVICE ADVANTAGES", font=get_font(bold=True, size=20), fill=(16, 185, 129, 255))
    draw.text((px + 24, ob_y + 48), "Engineered for travel, commutes, and zero network dependence.", font=get_font(bold=False, size=15), fill=(148, 163, 184, 255))
    
    bullets = [
        ("✓  Pure Local Generation", "Instant mathematical backtracking puzzles without server lag"),
        ("✓  Zero Data & Ad-Free", "Play continuously on airplanes, subways, or remote areas"),
        ("✓  Auto-Saves Everywhere", "Close the app anytime; timer, notes & moves are preserved"),
        ("✓  Super Battery Efficient", "No background telemetry, beacons, or sync battery drain")
    ]
    
    cur_by = ob_y + 82
    for title, desc in bullets:
        draw.text((px + 24, cur_by), title, font=get_font(bold=True, size=15), fill=(248, 250, 252, 255))
        draw.text((px + 24, cur_by + 20), desc, font=get_font(bold=False, size=13), fill=(100, 116, 139, 255))
        cur_by += 44
        
    # Bottom Nav
    draw_bottom_nav(draw, fx1, fx2, fy2, active_tab='Home')
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, 'PNG', optimize=True)
    print(f"Saved {output_path}")

# -------------------------------------------------------------------------
# SCREENSHOT 3: MULTIPLE DIFFICULTY LEVELS (1080x1920)
# -------------------------------------------------------------------------
def generate_screenshot_3(output_path='assets/screenshot-3.png'):
    print("Generating Screenshot 3: Multiple Difficulty Levels...")
    img, draw, fx1, fy1, fx2, fy2 = create_base_canvas(
        tag="BALANCED FOR EVERYONE",
        title="MULTIPLE DIFFICULTY LEVELS",
        subtitle="Easy, Medium, Hard & Expert modes",
        accent_color=(245, 158, 11, 255)
    )
    
    px = fx1 + 35
    pw = (fx2 - fx1) - 70
    
    # App Brand Header
    py = fy1 + 65
    draw.rounded_rectangle([px, py, px + 44, py + 44], radius=10, fill=(30, 58, 138, 200))
    draw.text((px + 12, py + 8), "S", font=get_font(bold=True, size=24), fill=(56, 189, 248, 255))
    draw.text((px + 56, py + 4), "SUDOKU", font=get_font(bold=True, size=22), fill=(248, 250, 252, 255))
    draw.text((px + 56, py + 26), "OFFLINE PUZZLE ENGINE", font=get_font(bold=True, size=11), fill=(100, 116, 139, 255))
    
    # Player Level pill
    pr_w = 210
    draw.rounded_rectangle([px + pw - pr_w, py, px + pw, py + 44], radius=22, fill=(30, 41, 59, 255), outline=(51, 65, 85, 255), width=1)
    draw.text((px + pw - pr_w + 14, py + 10), "🏆", font=get_font(bold=True, size=16))
    draw.text((px + pw - pr_w + 44, py + 12), "Level 14 • 56 Wins", font=get_font(bold=True, size=15), fill=(248, 250, 252, 255))
    
    # Daily Streak Card
    st_y = py + 65
    draw.rounded_rectangle([px, st_y, px + pw, st_y + 60], radius=14, fill=(69, 26, 3, 180), outline=(245, 158, 11, 255), width=1)
    draw.text((px + 20, st_y + 18), "🔥  14-Day Streak Active!", font=get_font(bold=True, size=17), fill=(245, 158, 11, 255))
    draw.text((px + pw - 240, st_y + 20), "Daily workout completed ✓", font=get_font(bold=False, size=15), fill=(254, 215, 170, 255))
    
    # Section Title
    sh_y = st_y + 80
    draw.text((px, sh_y), "Select Your Challenge Tier", font=get_font(bold=True, size=24), fill=(248, 250, 252, 255))
    draw.text((px, sh_y + 32), "Every puzzle is generated fresh with a guaranteed unique backtracking solve", font=get_font(bold=False, size=16), fill=(100, 116, 139, 255))
    
    # 4 Difficulty Cards: Easy, Medium, Hard, Expert
    tiers = [
        (
            "Easy Mode", "BEGINNER", (16, 185, 129, 255), (6, 78, 59, 220),
            "~38 Clues • Gentle deductive warm-up for beginners",
            "Best: 03:24 • 18 Games Solved"
        ),
        (
            "Medium Mode", "POPULAR", (56, 189, 248, 255), (30, 58, 138, 220),
            "~30 Clues • Standard cross-elimination & line deduction",
            "Best: 07:18 • 24 Games Solved"
        ),
        (
            "Hard Mode", "ADVANCED", (245, 158, 11, 255), (69, 26, 3, 220),
            "~24 Clues • Hidden pairs, triples & pointing candidates",
            "Best: 13:45 • 10 Games Solved"
        ),
        (
            "Expert Mode", "MASTER", (168, 85, 247, 255), (88, 28, 135, 220),
            "~20 Clues • Advanced X-Wing & complex chain logic",
            "Best: 21:10 • 4 Games Solved"
        )
    ]
    
    card_y = sh_y + 70
    card_h = 135
    for name, tag, tag_col, tag_bg, desc, stat in tiers:
        draw.rounded_rectangle([px, card_y, px + pw, card_y + card_h], radius=16, fill=(30, 41, 59, 255), outline=(51, 65, 85, 255), width=1)
        
        # Color bar indicator on left edge
        draw.rounded_rectangle([px, card_y + 12, px + 6, card_y + card_h - 12], radius=3, fill=tag_col)
        
        # Title
        draw.text((px + 24, card_y + 16), name, font=get_font(bold=True, size=22), fill=(248, 250, 252, 255))
        
        # Tag pill
        tag_f = get_font(bold=True, size=11)
        t_box = tag_f.getbbox(tag)
        tw = t_box[2] - t_box[0] + 18
        draw.rounded_rectangle([px + 175, card_y + 18, px + 175 + tw, card_y + 42], radius=6, fill=tag_bg, outline=tag_col, width=1)
        draw.text((px + 184, card_y + 23), tag, font=tag_f, fill=tag_col)
        
        # Play Button on Right
        btn_w = 110
        btn_x = px + pw - btn_w - 20
        draw.rounded_rectangle([btn_x, card_y + 20, btn_x + btn_w, card_y + 64], radius=10, fill=tag_col)
        draw.text((btn_x + 22, card_y + 32), "Play ▶", font=get_font(bold=True, size=15), fill=(0, 0, 0, 255) if tag_col != (56, 189, 248, 255) else (15, 23, 42, 255))
        
        # Description
        draw.text((px + 24, card_y + 56), desc, font=get_font(bold=False, size=15), fill=(148, 163, 184, 255))
        
        # Stats record
        draw.text((px + 24, card_y + 90), stat, font=get_font(bold=True, size=14), fill=(100, 116, 139, 255))
        
        card_y += card_h + 18
        
    # Hero Quick Resume Card
    hc_y = card_y + 20
    draw.rounded_rectangle([px, hc_y, px + pw, hc_y + 155], radius=18, fill=(15, 23, 42, 255), outline=(56, 189, 248, 220), width=2)
    draw.text((px + 24, hc_y + 18), "MATCH IN PROGRESS", font=get_font(bold=True, size=12), fill=(16, 185, 129, 255))
    draw.text((px + 24, hc_y + 40), "Resume Medium Match", font=get_font(bold=True, size=22), fill=(248, 250, 252, 255))
    draw.text((px + 24, hc_y + 72), "Elapsed Time: 03:42 • Mistakes: 0/3 • Notes: 8 Active", font=get_font(bold=False, size=15), fill=(148, 163, 184, 255))
    
    draw.rounded_rectangle([px + 24, hc_y + 102, px + pw - 24, hc_y + 144], radius=10, fill=(37, 99, 235, 255))
    draw.text((px + pw // 2 - 85, hc_y + 112), "▶  CONTINUE MATCH", font=get_font(bold=True, size=16), fill=(255, 255, 255, 255))
    
    # Bottom Nav
    draw_bottom_nav(draw, fx1, fx2, fy2, active_tab='Home')
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, 'PNG', optimize=True)
    print(f"Saved {output_path}")

# -------------------------------------------------------------------------
# SCREENSHOT 4: SMART HINTS & NOTES (1080x1920)
# -------------------------------------------------------------------------
def generate_screenshot_4(output_path='assets/screenshot-4.png'):
    print("Generating Screenshot 4: Smart Hints & Notes...")
    img, draw, fx1, fy1, fx2, fy2 = create_base_canvas(
        tag="INTELLIGENT ASSISTANT",
        title="SMART HINTS & NOTES",
        subtitle="Auto-check mistakes and pencil marks",
        accent_color=(56, 189, 248, 255)
    )
    
    # Header Row
    by = fy1 + 65
    bx = fx1 + 35
    draw.rounded_rectangle([bx, by, bx + 110, by + 46], radius=12, fill=(30, 41, 59, 255), outline=(51, 65, 85, 255), width=1)
    draw.text((bx + 18, by + 11), "‹ Home", font=get_font(bold=True, size=18), fill=(248, 250, 252, 255))
    
    dx = (fx1 + fx2) // 2 - 70
    draw.rounded_rectangle([dx, by, dx + 140, by + 46], radius=14, fill=(30, 41, 59, 255), outline=(245, 158, 11, 255), width=2)
    draw.text((dx + 30, by + 11), "Hard Mode", font=get_font(bold=True, size=17), fill=(245, 158, 11, 255))
    
    nx = fx2 - 145
    draw.rounded_rectangle([nx, by, nx + 110, by + 46], radius=12, fill=(30, 41, 59, 255), outline=(51, 65, 85, 255), width=1)
    draw.text((nx + 20, by + 11), "↺ Reset", font=get_font(bold=True, size=18), fill=(148, 163, 184, 255))
    
    # Status Card
    sc_y = by + 65
    draw.rounded_rectangle([fx1 + 35, sc_y, fx2 - 35, sc_y + 58], radius=16, fill=(17, 24, 39, 255), outline=(31, 41, 55, 255), width=1)
    
    draw.text((fx1 + 60, sc_y + 17), "Mistakes", font=get_font(bold=False, size=17), fill=(156, 163, 175, 255))
    draw.rounded_rectangle([fx1 + 145, sc_y + 12, fx1 + 215, sc_y + 46], radius=8, fill=(127, 29, 29, 255), outline=(239, 68, 68, 255), width=1)
    draw.text((fx1 + 162, sc_y + 16), "1/3", font=get_font(bold=True, size=18), fill=(254, 202, 202, 255))
    
    draw.text((fx1 + 250, sc_y + 17), "Pencil Marks", font=get_font(bold=False, size=17), fill=(156, 163, 175, 255))
    draw.text((fx1 + 360, sc_y + 16), "ACTIVE", font=get_font(bold=True, size=17), fill=(56, 189, 248, 255))
    
    draw.text((fx2 - 240, sc_y + 17), "Time", font=get_font(bold=False, size=17), fill=(156, 163, 175, 255))
    draw.rounded_rectangle([fx2 - 180, sc_y + 12, fx2 - 55, sc_y + 46], radius=8, fill=(31, 41, 55, 255))
    draw.text((fx2 - 168, sc_y + 16), "05:22  ⏸", font=get_font(bold=True, size=18), fill=(56, 189, 248, 255))
    
    # Sudoku Board with visible notes and highlighted hint target
    board_top = sc_y + 75
    board_w = 820
    board_left = (1080 - board_w) // 2
    
    board_nums = [
        [0, 2, 0, 6, 0, 8, 0, 0, 0],
        [5, 8, 0, 0, 0, 9, 7, 0, 0],
        [0, 0, 0, 0, 4, 0, 0, 0, 0],
        [3, 7, 0, 0, 0, 0, 5, 0, 0],
        [6, 0, 0, 0, 0, 0, 0, 0, 4],
        [0, 0, 8, 0, 0, 0, 0, 1, 3],
        [0, 0, 0, 0, 2, 0, 0, 0, 0],
        [0, 0, 9, 8, 0, 0, 0, 3, 6],
        [0, 0, 0, 3, 0, 6, 0, 9, 0]
    ]
    user_placed = {
        (0, 0): 1, (0, 2): 4, (1, 3): 1, (1, 4): 3, (2, 4): 4,
        (4, 4): 7,
        (2, 1): 2  # Error cell (Duplicate 2 in column 1)
    }
    notes = {
        (0, 4): [5, 7],
        (2, 0): [7, 9],
        (3, 2): [2, 5],
        (4, 6): [7], # The hint target cell!
        (6, 6): [1, 4, 8],
        (7, 4): [1, 5]
    }
    
    draw_sudoku_board(
        draw, board_left, board_top, board_w, board_nums,
        user_placed=user_placed, notes=notes,
        selected_cell=(4, 6), error_cell=(2, 1)
    )
    
    # Floating Smart Hint Modal / Tooltip Card
    hint_y = board_top + board_w + 22
    px = fx1 + 35
    pw = (fx2 - fx1) - 70
    draw.rounded_rectangle([px, hint_y, px + pw, hint_y + 235], radius=18, fill=(23, 27, 44, 255), outline=(245, 158, 11, 255), width=2)
    
    # Hint Header
    draw.rounded_rectangle([px + 20, hint_y + 16, px + 54, hint_y + 50], radius=8, fill=(69, 26, 3, 220))
    draw.text((px + 28, hint_y + 20), "💡", font=get_font(bold=True, size=18))
    
    draw.text((px + 64, hint_y + 16), "SMART HINT: NAKED SINGLE", font=get_font(bold=True, size=18), fill=(245, 158, 11, 255))
    draw.rounded_rectangle([px + pw - 120, hint_y + 16, px + pw - 20, hint_y + 44], radius=6, fill=(30, 41, 59, 255))
    draw.text((px + pw - 105, hint_y + 21), "Hint 1/3", font=get_font(bold=True, size=12), fill=(148, 163, 184, 255))
    
    # Explanation
    draw.text((px + 20, hint_y + 60), "Look at highlighted Cell [Row 5, Col 7].", font=get_font(bold=True, size=16), fill=(248, 250, 252, 255))
    draw.text((px + 20, hint_y + 86), "The digits 1, 2, 3, 4, 5, 6, 8, and 9 all appear in its row, column,", font=get_font(bold=False, size=15), fill=(203, 213, 225, 255))
    draw.text((px + 20, hint_y + 108), "or 3x3 block. By elimination, this cell CAN ONLY BE 7!", font=get_font(bold=True, size=15), fill=(56, 189, 248, 255))
    
    # Action buttons inside hint modal
    btn_w = (pw - 60) // 2
    draw.rounded_rectangle([px + 20, hint_y + 150, px + 20 + btn_w, hint_y + 208], radius=12, fill=(37, 99, 235, 255))
    draw.text((px + 20 + btn_w // 2 - 65, hint_y + 168), "✓ Fill Digit 7", font=get_font(bold=True, size=16), fill=(255, 255, 255, 255))
    
    draw.rounded_rectangle([px + 40 + btn_w, hint_y + 150, px + 40 + btn_w * 2, hint_y + 208], radius=12, fill=(30, 41, 59, 255), outline=(51, 65, 85, 255), width=1)
    draw.text((px + 40 + btn_w + btn_w // 2 - 40, hint_y + 168), "Dismiss", font=get_font(bold=True, size=16), fill=(148, 163, 184, 255))
    
    # Action Bar & Keypad below
    ab_y = hint_y + 250
    draw_action_bar(draw, px, ab_y, pw, notes_active=True, hint_badge=2)
    
    np_y = ab_y + 88
    remaining = [2, 1, 3, 2, 0, 4, 1, 2, 1]
    draw_number_keypad(draw, px, np_y, pw, remaining)
    
    # Bottom Nav
    draw_bottom_nav(draw, fx1, fx2, fy2, active_tab='Home')
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, 'PNG', optimize=True)
    print(f"Saved {output_path}")

# -------------------------------------------------------------------------
# SCREENSHOT 5: TRACK YOUR STATS (1080x1920)
# -------------------------------------------------------------------------
def generate_screenshot_5(output_path='assets/screenshot-5.png'):
    print("Generating Screenshot 5: Track Your Stats...")
    img, draw, fx1, fy1, fx2, fy2 = create_base_canvas(
        tag="CAREER MASTERY",
        title="TRACK YOUR STATS",
        subtitle="Beat your best times and daily streaks",
        accent_color=(168, 85, 247, 255)
    )
    
    px = fx1 + 35
    pw = (fx2 - fx1) - 70
    
    # Profile Header Box
    py = fy1 + 65
    draw.rounded_rectangle([px, py, px + pw, py + 120], radius=20, fill=(17, 24, 39, 255), outline=(31, 41, 55, 255), width=1)
    
    # Avatar Circle
    av_x, av_y, av_r = px + 20, py + 20, 40
    draw.ellipse([av_x, av_y, av_x + av_r * 2, av_y + av_r * 2], fill=(30, 58, 138, 255), outline=(56, 189, 248, 255), width=2)
    draw.text((av_x + 24, av_y + 20), "👑", font=get_font(bold=True, size=28))
    
    # User Details
    draw.text((av_x + 100, py + 22), "Puzzle Master", font=get_font(bold=True, size=26), fill=(248, 250, 252, 255))
    
    draw.rounded_rectangle([av_x + 100, py + 58, av_x + 295, py + 84], radius=6, fill=(88, 28, 135, 220), outline=(168, 85, 247, 255), width=1)
    draw.text((av_x + 110, py + 62), "GRANDMASTER • LVL 16", font=get_font(bold=True, size=11), fill=(216, 180, 254, 255))
    
    draw.text((av_x + 100, py + 92), "18h 42m Total Sudoku Solve Time • 100% Offline Saved", font=get_font(bold=False, size=13), fill=(100, 116, 139, 255))
    
    # 4 Key Stat Metric Cards (2x2 Grid)
    stat_y = py + 140
    card_w = (pw - 20) // 2
    card_h = 100
    
    stats_data = [
        ("GAMES WON", "56", (16, 185, 129, 255), "100% Verified Solves"),
        ("WIN RATE", "94.2%", (56, 189, 248, 255), "56 of 59 Completed"),
        ("CURRENT STREAK", "14 Days 🔥", (245, 158, 11, 255), "Personal Record"),
        ("BEST WIN STREAK", "21 Games", (168, 85, 247, 255), "Consecutive Wins")
    ]
    
    for i, (title, val, val_col, sub) in enumerate(stats_data):
        rx = px + (i % 2) * (card_w + 20)
        ry = stat_y + (i // 2) * (card_h + 16)
        
        draw.rounded_rectangle([rx, ry, rx + card_w, ry + card_h], radius=16, fill=(30, 41, 59, 255), outline=(51, 65, 85, 255), width=1)
        draw.text((rx + 20, ry + 14), title, font=get_font(bold=True, size=12), fill=(148, 163, 184, 255))
        draw.text((rx + 20, ry + 36), val, font=get_font(bold=True, size=28), fill=val_col)
        draw.text((rx + 20, ry + 74), sub, font=get_font(bold=False, size=12), fill=(100, 116, 139, 255))
        
    # Best Times & Breakdown Card
    bt_y = stat_y + card_h * 2 + 35
    draw.rounded_rectangle([px, bt_y, px + pw, bt_y + 360], radius=18, fill=(17, 24, 39, 255), outline=(31, 41, 55, 255), width=1)
    
    draw.text((px + 24, bt_y + 18), "⚡ BEST TIMES & AVERAGE SOLVES", font=get_font(bold=True, size=18), fill=(248, 250, 252, 255))
    draw.text((px + 24, bt_y + 44), "Detailed offline performance records across all tiers", font=get_font(bold=False, size=14), fill=(100, 116, 139, 255))
    
    tiers_stats = [
        ("Easy", "02:54", "04:10", "18 Solved", (16, 185, 129, 255)),
        ("Medium", "06:30", "08:45", "24 Solved", (56, 189, 248, 255)),
        ("Hard", "13:12", "17:20", "10 Solved", (245, 158, 11, 255)),
        ("Expert", "21:40", "26:15", "4 Solved", (168, 85, 247, 255))
    ]
    
    cur_ty = bt_y + 80
    for name, best, avg, count, col in tiers_stats:
        draw.rounded_rectangle([px + 20, cur_ty, px + pw - 20, cur_ty + 60], radius=12, fill=(30, 41, 59, 255))
        
        # Pill
        draw.rounded_rectangle([px + 32, cur_ty + 14, px + 120, cur_ty + 46], radius=6, fill=(15, 23, 42, 255), outline=col, width=1)
        draw.text((px + 44, cur_ty + 20), name, font=get_font(bold=True, size=14), fill=col)
        
        # Best Time
        draw.text((px + 140, cur_ty + 12), "Best", font=get_font(bold=False, size=12), fill=(148, 163, 184, 255))
        draw.text((px + 140, cur_ty + 30), best, font=get_font(bold=True, size=18), fill=(248, 250, 252, 255))
        
        # Avg Time
        draw.text((px + 260, cur_ty + 12), "Average", font=get_font(bold=False, size=12), fill=(148, 163, 184, 255))
        draw.text((px + 260, cur_ty + 30), avg, font=get_font(bold=True, size=18), fill=(148, 163, 184, 255))
        
        # Solved Count
        draw.text((px + pw - 130, cur_ty + 20), count, font=get_font(bold=True, size=15), fill=col)
        
        cur_ty += 68
        
    # Achievements Showcase Card
    ach_y = bt_y + 380
    draw.rounded_rectangle([px, ach_y, px + pw, ach_y + 390], radius=18, fill=(17, 24, 39, 255), outline=(168, 85, 247, 180), width=1)
    
    draw.text((px + 24, ach_y + 18), "🏆 UNLOCKED ACHIEVEMENTS", font=get_font(bold=True, size=18), fill=(168, 85, 247, 255))
    draw.text((px + 24, ach_y + 44), "Milestones earned during offline gameplay", font=get_font(bold=False, size=14), fill=(100, 116, 139, 255))
    
    achievements = [
        ("⚡", "Speed Demon", "Solved a complete puzzle in under 3 minutes", "UNLOCKED ✓"),
        ("💎", "Flawless Logic", "Completed a Hard match with zero mistakes", "UNLOCKED ✓"),
        ("👑", "Grandmaster", "Conquered 10 or more Hard difficulty grids", "UNLOCKED ✓"),
        ("🔥", "14-Day Devotee", "Kept an unbroken 14-day daily brain training streak", "UNLOCKED ✓")
    ]
    
    cur_ay = ach_y + 76
    for icon, name, desc, status in achievements:
        draw.rounded_rectangle([px + 20, cur_ay, px + pw - 20, cur_ay + 68], radius=12, fill=(30, 41, 59, 255))
        
        # Badge circle
        draw.ellipse([px + 32, cur_ay + 14, px + 72, cur_ay + 54], fill=(88, 28, 135, 220))
        draw.text((px + 42, cur_ay + 20), icon, font=get_font(bold=True, size=16))
        
        # Details
        draw.text((px + 88, cur_ay + 14), name, font=get_font(bold=True, size=16), fill=(248, 250, 252, 255))
        draw.text((px + 88, cur_ay + 38), desc, font=get_font(bold=False, size=13), fill=(148, 163, 184, 255))
        
        draw.text((px + pw - 130, cur_ay + 25), status, font=get_font(bold=True, size=12), fill=(16, 185, 129, 255))
        
        cur_ay += 76
        
    # Bottom Nav
    draw_bottom_nav(draw, fx1, fx2, fy2, active_tab='Profile')
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, 'PNG', optimize=True)
    print(f"Saved {output_path}")

# -------------------------------------------------------------------------
# MAIN RUNNER
# -------------------------------------------------------------------------
if __name__ == '__main__':
    generate_store_icon('assets/store-icon.png', 512)
    generate_feature_graphic('assets/feature-graphic.png', 1024, 500)
    generate_screenshot_1('assets/screenshot-1.png')
    generate_screenshot_2('assets/screenshot-2.png')
    generate_screenshot_3('assets/screenshot-3.png')
    generate_screenshot_4('assets/screenshot-4.png')
    generate_screenshot_5('assets/screenshot-5.png')
    print("\nAll 5 Play Store screenshots and store assets generated successfully!")
