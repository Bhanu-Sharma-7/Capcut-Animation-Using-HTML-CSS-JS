import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_gradient_radial(width, height, center_x, center_y, radius, inner_color, outer_color):
    base = Image.new('RGBA', (width, height), outer_color)
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Draw concentric circles with decreasing alpha
    steps = 100
    for i in range(steps, 0, -1):
        r = radius * (i / steps)
        t = i / steps
        # Interpolate color
        r_c = int(inner_color[0] * (1 - t) + outer_color[0] * t)
        g_c = int(inner_color[1] * (1 - t) + outer_color[1] * t)
        b_c = int(inner_color[2] * (1 - t) + outer_color[2] * t)
        a_c = int(inner_color[3] * (1 - t) + 0 * t)
        
        draw.ellipse([center_x - r, center_y - r, center_x + r, center_y + r], fill=(r_c, g_c, b_c, a_c))
        
    base.alpha_composite(overlay)
    return base

def draw_rounded_rect(draw, bbox, radius, fill=None, outline=None, width=1):
    draw.rounded_rectangle(bbox, radius=radius, fill=fill, outline=outline, width=width)

def render_sudoku_emblem(size=360):
    # Render at 2x for supersampled anti-aliasing
    scale = 2
    w = size * scale
    img = Image.new('RGBA', (w, w), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Outer container badge
    pad = 8 * scale
    badge_rect = [pad, pad, w - pad, w - pad]
    badge_radius = 48 * scale
    
    # Draw soft outer glow
    glow = Image.new('RGBA', (w, w), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.rounded_rectangle(badge_rect, radius=badge_radius, fill=(56, 189, 248, 80))
    glow = glow.filter(ImageFilter.GaussianBlur(16 * scale))
    img.alpha_composite(glow)
    
    # Badge background gradient
    draw.rounded_rectangle(badge_rect, radius=badge_radius, fill=(15, 23, 42, 250), outline=(56, 189, 248, 220), width=3 * scale)
    
    # Inner 3x3 Grid
    grid_pad = 28 * scale
    grid_w = w - grid_pad * 2
    gap = 8 * scale
    cell_w = (grid_w - gap * 2) / 3
    
    # Numbers for 3x3 grid (classic Wikipedia center block or sample)
    grid_digits = [
        ['5', '3', '4'],
        ['6', '9', '1'],
        ['7', '2', '8']
    ]
    
    # Fonts
    font_path_bold = 'C:\\Windows\\Fonts\\segoeuib.ttf'
    font_path_reg = 'C:\\Windows\\Fonts\\segoeui.ttf'
    if not os.path.exists(font_path_bold):
        font_path_bold = 'C:\\Windows\\Fonts\\arialbd.ttf'
    if not os.path.exists(font_path_reg):
        font_path_reg = 'C:\\Windows\\Fonts\\arial.ttf'
        
    font_large = ImageFont.truetype(font_path_bold, int(cell_w * 0.68))
    font_small = ImageFont.truetype(font_path_bold, int(cell_w * 0.46))
    
    for r in range(3):
        for c in range(3):
            cx = grid_pad + c * (cell_w + gap)
            cy = grid_pad + r * (cell_w + gap)
            c_rect = [cx, cy, cx + cell_w, cy + cell_w]
            c_radius = 12 * scale
            
            is_center = (r == 1 and c == 1)
            is_accent = (r == 0 and c == 0) or (r == 2 and c == 2)
            
            if is_center:
                # Glowing center cell with stylized '9'
                # Cell glow
                cell_glow = Image.new('RGBA', (w, w), (0, 0, 0, 0))
                cg_draw = ImageDraw.Draw(cell_glow)
                cg_draw.rounded_rectangle(c_rect, radius=c_radius, fill=(37, 99, 235, 180))
                cell_glow = cell_glow.filter(ImageFilter.GaussianBlur(8 * scale))
                img.alpha_composite(cell_glow)
                
                # Cell fill
                draw.rounded_rectangle(c_rect, radius=c_radius, fill=(37, 99, 235, 255), outline=(56, 189, 248, 255), width=2 * scale)
                
                digit = '9'
                bbox = font_large.getbbox(digit)
                tw = bbox[2] - bbox[0]
                th = bbox[3] - bbox[1]
                tx = cx + (cell_w - tw) / 2 - bbox[0]
                ty = cy + (cell_w - th) / 2 - bbox[1]
                draw.text((tx, ty), digit, font=font_large, fill=(255, 255, 255, 255))
            else:
                cell_fill = (30, 41, 59, 230) if is_accent else (20, 28, 45, 200)
                cell_border = (56, 189, 248, 120) if is_accent else (51, 65, 85, 160)
                draw.rounded_rectangle(c_rect, radius=c_radius, fill=cell_fill, outline=cell_border, width=1 * scale)
                
                digit = grid_digits[r][c]
                bbox = font_small.getbbox(digit)
                tw = bbox[2] - bbox[0]
                th = bbox[3] - bbox[1]
                tx = cx + (cell_w - tw) / 2 - bbox[0]
                ty = cy + (cell_w - th) / 2 - bbox[1]
                text_color = (56, 189, 248, 230) if is_accent else (148, 163, 184, 210)
                draw.text((tx, ty), digit, font=font_small, fill=text_color)
                
    # Downscale with Lanczos for super-sharp anti-aliased finish
    return img.resize((size, size), Image.Resampling.LANCZOS)

def generate_icon(output_path='assets/icon.png', size=512):
    print(f'Generating {output_path} ({size}x{size})...')
    scale = 2
    w = size * scale
    
    # 1. Base gradient background
    base = Image.new('RGBA', (w, w), (9, 13, 22, 255))
    draw = ImageDraw.Draw(base)
    
    # Diagonal deep blue gradient
    for y in range(w):
        t = y / w
        r = int(9 * (1 - t) + 14 * t)
        g = int(13 * (1 - t) + 30 * t)
        b = int(22 * (1 - t) + 65 * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b, 255))
        
    # Radial glow from center
    center_glow = Image.new('RGBA', (w, w), (0, 0, 0, 0))
    cg_draw = ImageDraw.Draw(center_glow)
    cg_draw.ellipse([w*0.2, w*0.2, w*0.8, w*0.8], fill=(37, 99, 235, 75))
    center_glow = center_glow.filter(ImageFilter.GaussianBlur(50 * scale))
    base.alpha_composite(center_glow)
    
    # 2. Render emblem (size ~360 inside 512, scaled to 2x)
    emblem_size = int(360 * scale)
    emblem = render_sudoku_emblem(emblem_size)
    
    emblem_pos = ((w - emblem_size) // 2, (w - emblem_size) // 2)
    base.alpha_composite(emblem, emblem_pos)
    
    # 3. Downscale and save
    final_icon = base.resize((size, size), Image.Resampling.LANCZOS)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    final_icon.save(output_path, 'PNG', optimize=True)
    print(f'Saved icon to {output_path}')

def generate_splash(output_path='assets/splash.png', width=1242, height=2436):
    print(f'Generating {output_path} ({width}x{height})...')
    
    # Base background: #090D16
    img = Image.new('RGBA', (width, height), (9, 13, 22, 255))
    draw = ImageDraw.Draw(img)
    
    # Ambient radial blue glow behind emblem
    center_x = width // 2
    center_y = int(height * 0.42)
    
    glow_radius = 500
    glow_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    glow_draw.ellipse([center_x - glow_radius, center_y - glow_radius, center_x + glow_radius, center_y + glow_radius], fill=(30, 58, 138, 90))
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(100))
    img.alpha_composite(glow_img)
    
    # Central Emblem (size 380x380)
    emblem_size = 400
    emblem = render_sudoku_emblem(emblem_size)
    emblem_pos = (center_x - emblem_size // 2, center_y - emblem_size // 2)
    img.alpha_composite(emblem, emblem_pos)
    
    # Fonts
    font_path_bold = 'C:\\Windows\\Fonts\\segoeuib.ttf'
    font_path_reg = 'C:\\Windows\\Fonts\\segoeui.ttf'
    if not os.path.exists(font_path_bold):
        font_path_bold = 'C:\\Windows\\Fonts\\arialbd.ttf'
    if not os.path.exists(font_path_reg):
        font_path_reg = 'C:\\Windows\\Fonts\\arial.ttf'
        
    title_font = ImageFont.truetype(font_path_bold, 82)
    tagline_font = ImageFont.truetype(font_path_bold, 28)
    footer_font = ImageFont.truetype(font_path_reg, 22)
    
    # Draw Brand Title: "SUDOKU" (letter-spaced)
    title_text = "S U D O K U"
    t_bbox = title_font.getbbox(title_text)
    tw = t_bbox[2] - t_bbox[0]
    th = t_bbox[3] - t_bbox[1]
    title_y = center_y + emblem_size // 2 + 60
    draw.text((center_x - tw // 2 - t_bbox[0], title_y), title_text, font=title_font, fill=(248, 250, 252, 255))
    
    # Draw Sub-tagline: "TRAIN YOUR BRAIN"
    tagline_text = "TRAIN  YOUR  BRAIN"
    tag_bbox = tagline_font.getbbox(tagline_text)
    tag_w = tag_bbox[2] - tag_bbox[0]
    tag_y = title_y + th + 32
    draw.text((center_x - tag_w // 2 - tag_bbox[0], tag_y), tagline_text, font=tagline_font, fill=(56, 189, 248, 255))
    
    # Bottom minimal indicator
    footer_text = "CLASSIC  OFFLINE  PUZZLE"
    f_bbox = footer_font.getbbox(footer_text)
    fw = f_bbox[2] - f_bbox[0]
    draw.text((center_x - fw // 2 - f_bbox[0], height - 160), footer_text, font=footer_font, fill=(100, 116, 139, 200))
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, 'PNG', optimize=True)
    print(f'Saved splash to {output_path}')

if __name__ == '__main__':
    generate_icon('assets/icon.png', 512)
    generate_splash('assets/splash.png', 1242, 2436)
    # Also generate favicon
    generate_icon('assets/favicon.png', 48)
    print('All production assets successfully created!')
