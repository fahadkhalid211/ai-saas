import os
import math
from PIL import Image, ImageDraw, ImageFont

ASSETS_DIR = os.path.join(os.getcwd(), 'wordpress-org-assets', 'assets')
os.makedirs(ASSETS_DIR, exist_ok=True)

# Brand colors
COLOR_DEEP_GREEN = (8, 37, 26)       # #08251a
COLOR_DARKER_GREEN = (5, 25, 18)     # #051912
COLOR_LIME = (171, 255, 68)          # #abff44
COLOR_TEAL = (15, 110, 88)           # #0f6e58
COLOR_CREAM_BG = (251, 251, 244)     # #fbfbf4
COLOR_CREAM_CARD = (255, 254, 235)   # #fffeeb
COLOR_BORDER = (232, 230, 209)       # #e8e6d1
COLOR_WHITE = (255, 255, 255)
COLOR_TEXT_MUTED = (107, 107, 92)    # #6b6b5c
COLOR_TEXT_DARK = (26, 26, 26)
COLOR_ACCENT_BLUE = (37, 99, 235)

def get_font(size, bold=False):
    # Try system fonts on Windows
    font_names = [
        "C:\\Windows\\Fonts\\segoeuib.ttf" if bold else "C:\\Windows\\Fonts\\segoeui.ttf",
        "C:\\Windows\\Fonts\\arialbd.ttf" if bold else "C:\\Windows\\Fonts\\arial.ttf",
        "segoeuib.ttf" if bold else "segoeui.ttf",
        "arial.ttf"
    ]
    for fn in font_names:
        try:
            return ImageFont.truetype(fn, size)
        except Exception:
            continue
    return ImageFont.load_default()

# -------------------------------------------------------------
# 1. ICON GENERATION (128x128, 256x256, SVG)
# -------------------------------------------------------------
def generate_icon(size, output_path):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Rounded background
    radius = int(size * 0.22)
    # Background gradient approximation (dark forest green)
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=COLOR_DEEP_GREEN)
    
    # Inner border
    draw.rounded_rectangle([1, 1, size - 2, size - 2], radius=radius, outline=(26, 71, 52), width=max(1, int(size * 0.02)))
    
    # Stylized Spark / Node graphic in Electric Lime
    center_x = size / 2
    center_y = size / 2
    
    # Sparkle / Star 4-pointed shape or Monogram "C" with AI spark
    spark_radius = size * 0.35
    spark_inner = size * 0.12
    
    points = []
    for i in range(8):
        angle = i * (math.pi / 4)
        r = spark_radius if (i % 2 == 0) else spark_inner
        px = center_x + r * math.cos(angle)
        py = center_y + r * math.sin(angle)
        points.append((px, py))
    
    draw.polygon(points, fill=COLOR_LIME)
    
    # Center core circle in deep green
    core_r = size * 0.08
    draw.ellipse([center_x - core_r, center_y - core_r, center_x + core_r, center_y + core_r], fill=COLOR_DEEP_GREEN)
    
    img.save(output_path, 'PNG')
    print(f"Created {output_path}")

def generate_svg_icon(output_path):
    svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#08251a"/>
      <stop offset="100%" stop-color="#0d3827"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="56" fill="url(#bgGrad)" stroke="#1a4734" stroke-width="4"/>
  <path d="M128 32 C128 85, 171 128, 224 128 C171 128, 128 171, 128 224 C128 171, 85 128, 32 128 C85 128, 128 85, 128 32 Z" fill="#abff44"/>
  <circle cx="128" cy="128" r="22" fill="#08251a"/>
</svg>"""
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print(f"Created {output_path}")

# -------------------------------------------------------------
# 2. BANNER GENERATION (772x250, 1544x500)
# -------------------------------------------------------------
def generate_banner(width, height, output_path):
    img = Image.new('RGB', (width, height), COLOR_DEEP_GREEN)
    draw = ImageDraw.Draw(img)
    
    # Subtle gradient bands / luxury backdrop
    scale = width / 772.0
    for y in range(height):
        factor = y / float(height)
        r = int(8 + (13 - 8) * factor)
        g = int(37 + (56 - 37) * factor)
        b = int(26 + (39 - 26) * factor)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    
    # Geometric decorative accents in electric lime with low opacity
    accent_box_x = width - int(320 * scale)
    accent_box_y = int(25 * scale)
    accent_box_w = int(280 * scale)
    accent_box_h = height - int(50 * scale)
    
    # Draw simulated sleek chat widget card on the right
    card_r = int(16 * scale)
    draw.rounded_rectangle(
        [accent_box_x, accent_box_y, accent_box_x + accent_box_w, accent_box_y + accent_box_h],
        radius=card_r,
        fill=(13, 56, 39),
        outline=(26, 71, 52),
        width=int(2 * scale)
    )
    
    # Chat card header inside banner
    font_chat_head = get_font(int(11 * scale), bold=True)
    draw.rounded_rectangle(
        [accent_box_x + int(12 * scale), accent_box_y + int(12 * scale), accent_box_x + accent_box_w - int(12 * scale), accent_box_y + int(38 * scale)],
        radius=int(6 * scale),
        fill=(8, 37, 26)
    )
    draw.text((accent_box_x + int(22 * scale), accent_box_y + int(17 * scale)), "● Crescelo AI Assistant", font=font_chat_head, fill=COLOR_LIME)
    
    # Chat message bubble 1 (Visitor)
    font_msg = get_font(int(9.5 * scale), bold=False)
    draw.rounded_rectangle(
        [accent_box_x + int(45 * scale), accent_box_y + int(48 * scale), accent_box_x + accent_box_w - int(15 * scale), accent_box_y + int(82 * scale)],
        radius=int(8 * scale),
        fill=(171, 255, 68)
    )
    draw.text((accent_box_x + int(53 * scale), accent_box_y + int(53 * scale)), "Do you have any acne\nproducts in stock?", font=font_msg, fill=COLOR_DEEP_GREEN)
    
    # Chat message bubble 2 (AI Assistant)
    draw.rounded_rectangle(
        [accent_box_x + int(15 * scale), accent_box_y + int(92 * scale), accent_box_x + accent_box_w - int(45 * scale), accent_box_y + int(155 * scale)],
        radius=int(8 * scale),
        fill=(255, 255, 255)
    )
    draw.text((accent_box_x + int(23 * scale), accent_box_y + int(97 * scale)), "Yes! The Clarifying Serum\nis in stock ($34). Verified\nfrom your WooCommerce store.", font=font_msg, fill=COLOR_DEEP_GREEN)
    
    # Direct Add-to-cart button simulation in card
    draw.rounded_rectangle(
        [accent_box_x + int(15 * scale), accent_box_y + int(164 * scale), accent_box_x + accent_box_w - int(15 * scale), accent_box_y + int(192 * scale)],
        radius=int(6 * scale),
        fill=COLOR_LIME
    )
    font_btn = get_font(int(10 * scale), bold=True)
    draw.text((accent_box_x + int(28 * scale), accent_box_y + int(169 * scale)), "🛒 Direct Add to Cart", font=font_btn, fill=COLOR_DEEP_GREEN)
    
    # Left Side: Brand & Value Proposition
    # Icon Mark
    mark_size = int(52 * scale)
    mark_x = int(45 * scale)
    mark_y = int(35 * scale)
    draw.rounded_rectangle([mark_x, mark_y, mark_x + mark_size, mark_y + mark_size], radius=int(14 * scale), fill=(5, 25, 18), outline=(26, 71, 52), width=int(2 * scale))
    
    # Star inside icon
    sc_x = mark_x + mark_size / 2
    sc_y = mark_y + mark_size / 2
    s_r = mark_size * 0.38
    s_in = mark_size * 0.14
    pts = []
    for i in range(8):
        ang = i * (math.pi / 4)
        r = s_r if (i % 2 == 0) else s_in
        pts.append((sc_x + r * math.cos(ang), sc_y + r * math.sin(ang)))
    draw.polygon(pts, fill=COLOR_LIME)
    
    # Titles
    font_brand = get_font(int(14 * scale), bold=True)
    draw.text((mark_x + mark_size + int(15 * scale), mark_y + int(12 * scale)), "CRESCELO FOR WORDPRESS", font=font_brand, fill=COLOR_LIME)
    
    font_main = get_font(int(24 * scale), bold=True)
    draw.text((mark_x, mark_y + mark_size + int(18 * scale)), "AI Chatbot & Website Scraper", font=font_main, fill=COLOR_WHITE)
    
    font_sub = get_font(int(12.5 * scale), bold=False)
    draw.text((mark_x, mark_y + mark_size + int(56 * scale)), "Autonomous Customer Support, WooCommerce Sales,\nLive Stock Verification & Real-Time Sync.", font=font_sub, fill=(169, 217, 203))
    
    # Feature Badges
    badges = ["1-Click Scraper", "Live Stock & Price", "Order Tracking", "WooCommerce Cart"]
    badge_x = mark_x
    badge_y = height - int(38 * scale)
    font_badge = get_font(int(9.5 * scale), bold=True)
    for b in badges:
        b_w = int(len(b) * 6.8 * scale) + int(16 * scale)
        draw.rounded_rectangle([badge_x, badge_y, badge_x + b_w, badge_y + int(22 * scale)], radius=int(6 * scale), fill=(13, 56, 39), outline=(26, 71, 52))
        draw.text((badge_x + int(8 * scale), badge_y + int(4 * scale)), b, font=font_badge, fill=COLOR_LIME)
        badge_x += b_w + int(8 * scale)
        
    img.save(output_path, 'PNG')
    print(f"Created {output_path}")

# -------------------------------------------------------------
# 3. SCREENSHOTS GENERATION (1280x800 for high resolution)
# -------------------------------------------------------------
def draw_wp_admin_frame(draw, w, h, active_step, title, subtitle):
    # Admin background
    draw.rectangle([0, 0, w, h], fill=(240, 240, 241))
    
    # Top WP Admin bar
    draw.rectangle([0, 0, w, 32], fill=(29, 35, 39))
    draw.text((16, 7), "WordPress 6.7  |  The Penthouse Living  |  Plugins", font=get_font(12, bold=False), fill=(240, 240, 241))
    
    # Left Admin Menu Sidebar
    draw.rectangle([0, 32, 160, h], fill=(29, 35, 39))
    menu_items = ["Dashboard", "Posts", "Media", "Pages", "WooCommerce", "Products", "Analytics", "Appearance", "Plugins", "Crescelo AI", "Settings"]
    y = 50
    for item in menu_items:
        if item == "Crescelo AI":
            draw.rectangle([0, y - 4, 160, y + 24], fill=COLOR_DEEP_GREEN)
            draw.text((20, y), item, font=get_font(13, bold=True), fill=COLOR_LIME)
        else:
            draw.text((20, y), item, font=get_font(13, bold=False), fill=(195, 196, 199))
        y += 34
        
    # Main Wizard Card Container
    card_x = 190
    card_y = 55
    card_w = w - card_x - 30
    card_h = h - card_y - 25
    
    draw.rounded_rectangle([card_x, card_y, card_x + card_w, card_y + card_h], radius=14, fill=COLOR_WHITE, outline=COLOR_BORDER, width=1)
    
    # Wizard Header
    draw.text((card_x + 30, card_y + 24), "Crescelo AI Assistant Setup", font=get_font(20, bold=True), fill=COLOR_DEEP_GREEN)
    draw.text((card_x + 30, card_y + 52), "Train your AI chatbot on website content, WooCommerce products, and documentation.", font=get_font(12.5, bold=False), fill=COLOR_TEXT_MUTED)
    
    # Header status badge
    draw.rounded_rectangle([card_x + card_w - 200, card_y + 24, card_x + card_w - 30, card_y + 54], radius=20, fill=COLOR_DEEP_GREEN)
    draw.text((card_x + card_w - 182, card_y + 31), "● WordPress Connected", font=get_font(11.5, bold=True), fill=COLOR_LIME)
    
    # Stepper line
    step_y = card_y + 86
    draw.line([(card_x + 30, step_y + 14), (card_x + card_w - 30, step_y + 14)], fill=COLOR_BORDER, width=2)
    
    steps = [
        "1. Website & Goal",
        "2. Database Scan",
        "3. Curate & Features",
        "4. AI Training",
        "5. Launch & Test"
    ]
    step_spacing = (card_w - 60) / 5
    for i, s_label in enumerate(steps):
        s_num = i + 1
        sx = card_x + 30 + i * step_spacing
        is_active = (s_num == active_step)
        is_completed = (s_num < active_step)
        
        circle_fill = COLOR_DEEP_GREEN if is_active else (COLOR_TEAL if is_completed else (232, 230, 209))
        circle_text = COLOR_LIME if is_active else (COLOR_WHITE if is_completed else (100, 100, 100))
        
        draw.ellipse([sx, step_y, sx + 28, step_y + 28], fill=circle_fill)
        draw.text((sx + 9, step_y + 5), str(s_num), font=get_font(12, bold=True), fill=circle_text)
        draw.text((sx + 36, step_y + 6), s_label, font=get_font(11.5, bold=is_active), fill=COLOR_DEEP_GREEN if is_active else COLOR_TEXT_MUTED)
        
    # Active Pane Header
    pane_y = step_y + 45
    draw.text((card_x + 30, pane_y), title, font=get_font(18, bold=True), fill=COLOR_DEEP_GREEN)
    draw.text((card_x + 30, pane_y + 28), subtitle, font=get_font(12.5, bold=False), fill=COLOR_TEXT_MUTED)
    
    return card_x + 30, pane_y + 60, card_w - 60

# SCREENSHOT 1: Onboarding & Goal Selection
def generate_screenshot_1(output_path):
    img = Image.new('RGB', (1280, 800), COLOR_WHITE)
    draw = ImageDraw.Draw(img)
    content_x, content_y, content_w = draw_wp_admin_frame(
        draw, 1280, 800, 1,
        "What type of website is this, and what should the AI achieve?",
        "This customizes the AI demeanor, sales style, and integration modules."
    )
    
    # 4 Website Types
    draw.text((content_x, content_y), "1. SELECT WEBSITE TYPE", font=get_font(12, bold=True), fill=COLOR_DEEP_GREEN)
    types = [
        ("WooCommerce Store", "Sell physical or digital goods.\nUnderstands stock, prices & cart.", True),
        ("Services & Booking", "Salons, clinics, consultants.\nSchedules consultation slots.", False),
        ("Docs & Knowledge Base", "Documentation & blogs.\nProvides accurate deflection.", False),
        ("B2B & Lead Generation", "Agencies & firms.\nCaptures high-value client leads.", False)
    ]
    card_w = (content_w - 45) / 4
    for i, (t_title, t_desc, sel) in enumerate(types):
        cx = content_x + i * (card_w + 15)
        cy = content_y + 25
        draw.rounded_rectangle([cx, cy, cx + card_w, cy + 115], radius=10, fill=COLOR_CREAM_CARD if sel else COLOR_WHITE, outline=COLOR_DEEP_GREEN if sel else COLOR_BORDER, width=2 if sel else 1)
        draw.text((cx + 15, cy + 15), "🛍️" if i==0 else ("📅" if i==1 else ("📚" if i==2 else "🎯")), font=get_font(18))
        draw.text((cx + 15, cy + 45), t_title, font=get_font(13, bold=True), fill=COLOR_DEEP_GREEN)
        draw.text((cx + 15, cy + 68), t_desc, font=get_font(10.5), fill=COLOR_TEXT_MUTED)
        
    # 4 Primary Objectives
    obj_y = content_y + 165
    draw.text((content_x, obj_y), "2. SELECT PRIMARY AI OBJECTIVE", font=get_font(12, bold=True), fill=COLOR_DEEP_GREEN)
    objs = [
        ("Conversational Sales", "Guide shoppers, compare products,\nand stage items to cart directly.", True),
        ("Schedule Appointments", "Answer service inquiries and schedule\nconsultations in chat.", False),
        ("24/7 Support Deflection", "Fast answers to shipping, refund &\npolicy questions.", False),
        ("Inquiry & Lead Capture", "Collect visitor email, phone, and\nproject requirements.", False)
    ]
    for i, (o_title, o_desc, sel) in enumerate(objs):
        cx = content_x + i * (card_w + 15)
        cy = obj_y + 25
        draw.rounded_rectangle([cx, cy, cx + card_w, cy + 115], radius=10, fill=COLOR_CREAM_CARD if sel else COLOR_WHITE, outline=COLOR_DEEP_GREEN if sel else COLOR_BORDER, width=2 if sel else 1)
        draw.text((cx + 15, cy + 15), "⚡" if i==0 else ("🗓️" if i==1 else ("🛡️" if i==2 else "✉️")), font=get_font(18))
        draw.text((cx + 15, cy + 45), o_title, font=get_font(13, bold=True), fill=COLOR_DEEP_GREEN)
        draw.text((cx + 15, cy + 68), o_desc, font=get_font(10.5), fill=COLOR_TEXT_MUTED)
        
    # Account & Connection box
    box_y = obj_y + 160
    draw.rounded_rectangle([content_x, box_y, content_x + content_w, box_y + 80], radius=10, fill=COLOR_DEEP_GREEN, outline=(26, 71, 52), width=1)
    draw.text((content_x + 20, box_y + 18), "● CONNECTED TO CRESCELO CLOUD", font=get_font(11.5, bold=True), fill=COLOR_LIME)
    draw.text((content_x + 20, box_y + 38), "The Penthouse Living Assistant (ast_44a29ef10c)", font=get_font(14, bold=True), fill=COLOR_WHITE)
    
    # Action Button
    draw.rounded_rectangle([content_x + content_w - 280, box_y + 20, content_x + content_w - 20, box_y + 60], radius=8, fill=COLOR_LIME)
    draw.text((content_x + content_w - 265, box_y + 32), "Start Website & Database Scan →", font=get_font(12.5, bold=True), fill=COLOR_DEEP_GREEN)
    
    img.save(output_path, 'PNG')
    print(f"Created {output_path}")

# SCREENSHOT 2: Database Scanner & Dynamic Post Type Counters
def generate_screenshot_2(output_path):
    img = Image.new('RGB', (1280, 800), COLOR_WHITE)
    draw = ImageDraw.Draw(img)
    content_x, content_y, content_w = draw_wp_admin_frame(
        draw, 1280, 800, 2,
        "Scanning Website & Knowledge Structure...",
        "Inspecting WordPress posts, pages, WooCommerce tables, custom post types, and media documents."
    )
    
    # Radar & status banner
    draw.rounded_rectangle([content_x, content_y, content_x + content_w, content_y + 65], radius=10, fill=COLOR_CREAM_BG, outline=COLOR_BORDER)
    draw.ellipse([content_x + 20, content_y + 20, content_x + 46, content_y + 46], fill=COLOR_DEEP_GREEN)
    draw.ellipse([content_x + 29, content_y + 29, content_x + 37, content_y + 37], fill=COLOR_LIME)
    draw.text((content_x + 60, content_y + 24), "Database scan complete! Discovered 9 registered post types with 1,938 total entries.", font=get_font(13.5, bold=True), fill=COLOR_DEEP_GREEN)
    
    # Progress Bar Container
    prog_y = content_y + 80
    draw.rounded_rectangle([content_x, prog_y, content_x + content_w, prog_y + 55], radius=8, fill=COLOR_CREAM_BG, outline=COLOR_BORDER)
    draw.rounded_rectangle([content_x + 15, prog_y + 12, content_x + content_w - 15, prog_y + 22], radius=5, fill=(232, 230, 209))
    draw.rounded_rectangle([content_x + 15, prog_y + 12, content_x + content_w - 15, prog_y + 22], radius=5, fill=COLOR_TEAL)
    draw.text((content_x + 15, prog_y + 32), "Ready to configure post types and AI commerce features.", font=get_font(11.5), fill=COLOR_DEEP_GREEN)
    draw.text((content_x + content_w - 60, prog_y + 32), "100%", font=get_font(11.5, bold=True), fill=COLOR_DEEP_GREEN)
    
    # Discovery Metrics Grid (Cards)
    draw.text((content_x, prog_y + 75), "DISCOVERED POST TYPES & DATA CATALOGS", font=get_font(12, bold=True), fill=COLOR_DEEP_GREEN)
    
    cards = [
        ("📝", "Posts", "1,791", "Published blog posts"),
        ("📄", "Pages", "120", "Website content pages"),
        ("🛍️", "Products", "27", "WooCommerce catalog"),
        ("🎨", "My Templates", "26", "Elementor builder blocks"),
        ("💼", "Portfolio", "4", "Showcase projects"),
        ("📊", "Case Studies", "4", "Client results"),
        ("📁", "Media Docs", "12", "PDF & attachment files"),
        ("✨", "Floating Elements", "3", "Interactive popups")
    ]
    grid_y = prog_y + 100
    card_w = (content_w - 45) / 4
    for i, (icon, label, count, sub) in enumerate(cards):
        col = i % 4
        row = i // 4
        cx = content_x + col * (card_w + 15)
        cy = grid_y + row * 105
        draw.rounded_rectangle([cx, cy, cx + card_w, cy + 90], radius=10, fill=COLOR_WHITE, outline=COLOR_BORDER)
        draw.text((cx + 15, cy + 12), icon, font=get_font(16))
        draw.text((cx + 15, cy + 34), count, font=get_font(20, bold=True), fill=COLOR_DEEP_GREEN)
        draw.text((cx + 15, cy + 58), label, font=get_font(12, bold=True), fill=COLOR_TEXT_DARK)
        draw.text((cx + 15, cy + 73), sub, font=get_font(10), fill=COLOR_TEXT_MUTED)
        
    # Actions
    act_y = grid_y + 225
    draw.rounded_rectangle([content_x + content_w - 330, act_y, content_x + content_w, act_y + 42], radius=8, fill=COLOR_DEEP_GREEN)
    draw.text((content_x + content_w - 315, act_y + 12), "Review Discovered Post Types & Content →", font=get_font(12.5, bold=True), fill=COLOR_LIME)
    
    img.save(output_path, 'PNG')
    print(f"Created {output_path}")

# SCREENSHOT 3: Structured Post Types & WooCommerce Catalog Curation
def generate_screenshot_3(output_path):
    img = Image.new('RGB', (1280, 800), COLOR_WHITE)
    draw = ImageDraw.Draw(img)
    content_x, content_y, content_w = draw_wp_admin_frame(
        draw, 1280, 800, 3,
        "Choose Post Types & Content to Scrape",
        "Select which post types to index into the AI Knowledge Base, and activate commerce actions."
    )
    
    col_w1 = content_w * 0.58
    col_w2 = content_w * 0.38
    
    # Left column: Structured post type cards
    draw.text((content_x, content_y), "Discovered Post Types & Content", font=get_font(14, bold=True), fill=COLOR_DEEP_GREEN)
    draw.rounded_rectangle([content_x + 240, content_y - 2, content_x + 390, content_y + 20], radius=10, fill=COLOR_DEEP_GREEN)
    draw.text((content_x + 250, content_y + 2), "1,938 items ready to scrape", font=get_font(10.5, bold=True), fill=COLOR_LIME)
    
    # Post Type Cards
    cards_data = [
        ("📝", "Posts", "1,791 items", True, ["Elevated Stays' AI-Driven Digital Itineraries for Luxury Penthouse Guests", "Corporate Penthouse Rentals in Minneapolis with AI Concierge"]),
        ("🛍️", "WooCommerce Products", "27 items", True, ["Luxury Suite Executive Penthouse ($450/night)", "Skyline Corner Suite ($380/night)"]),
        ("📄", "Pages", "120 items", True, ["Homepage", "Corporate Amenities", "Booking Policies", "Contact & Location"]),
        ("📐", "Templates & Builder Content", "26 items", False, None)
    ]
    py = content_y + 30
    for icon, label, count_lbl, sel, samples in cards_data:
        box_h = 95 if samples else 46
        draw.rounded_rectangle([content_x, py, content_x + col_w1, py + box_h], radius=8, fill=COLOR_CREAM_BG if sel else COLOR_WHITE, outline=COLOR_TEAL if sel else COLOR_BORDER, width=2 if sel else 1)
        # Checkbox
        draw.rectangle([content_x + 12, py + 14, content_x + 26, py + 28], fill=COLOR_DEEP_GREEN if sel else COLOR_WHITE, outline=COLOR_DEEP_GREEN)
        if sel:
            draw.text((content_x + 15, py + 14), "✓", font=get_font(11, bold=True), fill=COLOR_LIME)
        draw.text((content_x + 36, py + 13), f"{icon}  {label}", font=get_font(12.5, bold=True), fill=COLOR_DEEP_GREEN)
        draw.rounded_rectangle([content_x + col_w1 - 180, py + 12, content_x + col_w1 - 100, py + 30], radius=8, fill=COLOR_DEEP_GREEN if sel else (232, 230, 209))
        draw.text((content_x + col_w1 - 172, py + 15), count_lbl, font=get_font(10, bold=True), fill=COLOR_LIME if sel else (80, 80, 80))
        
        if samples:
            draw.rounded_rectangle([content_x + col_w1 - 90, py + 12, content_x + col_w1 - 10, py + 30], radius=6, fill=COLOR_WHITE, outline=COLOR_BORDER)
            draw.text((content_x + col_w1 - 85, py + 15), "▴ Hide Samples", font=get_font(9.5, bold=True), fill=COLOR_TEAL)
            # Sample rows inside drawer
            for s_idx, sample in enumerate(samples[:2]):
                sy = py + 40 + s_idx * 24
                draw.rounded_rectangle([content_x + 15, sy, content_x + col_w1 - 15, sy + 20], radius=4, fill=COLOR_WHITE, outline=(238, 240, 234))
                draw.rectangle([content_x + 22, sy + 4, content_x + 32, sy + 14], fill=COLOR_DEEP_GREEN)
                draw.text((content_x + 40, sy + 3), sample[:55] + "...", font=get_font(10.5), fill=COLOR_TEXT_DARK)
                draw.text((content_x + col_w1 - 65, sy + 3), f"#10{s_idx + 42}", font=get_font(9.5), fill=COLOR_TEXT_MUTED)
        else:
            draw.text((content_x + col_w1 - 80, py + 15), "▾ View (26)", font=get_font(9.5), fill=COLOR_TEAL)
        py += box_h + 10
        
    # Right column: AI Commerce & Action Features
    col2_x = content_x + col_w1 + 25
    draw.text((col2_x, content_y), "AI Commerce & Action Features", font=get_font(14, bold=True), fill=COLOR_DEEP_GREEN)
    features = [
        ("Conversational Add-to-Cart", "Stages recommended items directly into customer cart via AJAX.", True),
        ("Real-Time Stock Verification", "Deterministically verifies live inventory before responding.", True),
        ("Live Order Tracking & Dispatch", "Checks real-time WooCommerce order status & carriers in chat.", True),
        ("Self-Service Order Cancellation", "Allows cancellation of unfulfilled orders with 🤖 Bot badge.", True),
        ("In-Chat Appointment Booking", "Enables scheduling consultation slots directly in chat bubble.", False),
        ("Pre-Sale Lead Capture", "Captures visitor email and project requirements.", True)
    ]
    fy = content_y + 30
    for f_title, f_desc, active in features:
        draw.rounded_rectangle([col2_x, fy, col2_x + col_w2, fy + 52], radius=8, fill=COLOR_WHITE, outline=COLOR_BORDER)
        draw.text((col2_x + 12, fy + 8), f_title, font=get_font(12, bold=True), fill=COLOR_DEEP_GREEN)
        draw.text((col2_x + 12, fy + 26), f_desc, font=get_font(9.5), fill=COLOR_TEXT_MUTED)
        # Switch slider
        sw_x = col2_x + col_w2 - 46
        draw.rounded_rectangle([sw_x, fy + 14, sw_x + 36, fy + 32], radius=10, fill=COLOR_DEEP_GREEN if active else (203, 213, 225))
        circle_x = sw_x + 22 if active else sw_x + 4
        draw.ellipse([circle_x, fy + 16, circle_x + 12, fy + 28], fill=COLOR_LIME if active else COLOR_WHITE)
        fy += 60
        
    # Action Button
    draw.rounded_rectangle([content_x + content_w - 280, content_y + 380, content_x + content_w, content_y + 422], radius=8, fill=COLOR_DEEP_GREEN)
    draw.text((content_x + content_w - 265, content_y + 392), "Begin AI Knowledge Training →", font=get_font(12.5, bold=True), fill=COLOR_LIME)
    
    img.save(output_path, 'PNG')
    print(f"Created {output_path}")

# SCREENSHOT 4: Live Knowledge Base Batch Ingestion & Progress
def generate_screenshot_4(output_path):
    img = Image.new('RGB', (1280, 800), COLOR_WHITE)
    draw = ImageDraw.Draw(img)
    content_x, content_y, content_w = draw_wp_admin_frame(
        draw, 1280, 800, 4,
        "Training AI Knowledge Base...",
        "Content is securely chunked, vectorized, and embedded in small batches to protect server resources."
    )
    
    # Progress Bar Container
    draw.rounded_rectangle([content_x, content_y, content_x + content_w, content_y + 60], radius=10, fill=COLOR_CREAM_BG, outline=COLOR_BORDER)
    draw.rounded_rectangle([content_x + 15, content_y + 14, content_x + content_w - 15, content_y + 26], radius=6, fill=(232, 230, 209))
    draw.rounded_rectangle([content_x + 15, content_y + 14, content_x + content_w - 15, content_y + 26], radius=6, fill=COLOR_LIME)
    draw.text((content_x + 15, content_y + 34), "Training complete! AI Knowledge Base is fully indexed.", font=get_font(12, bold=True), fill=COLOR_DEEP_GREEN)
    draw.text((content_x + content_w - 55, content_y + 34), "100%", font=get_font(12, bold=True), fill=COLOR_DEEP_GREEN)
    
    # Terminal Console Log
    term_y = content_y + 75
    draw.rounded_rectangle([content_x, term_y, content_x + content_w, term_y + 210], radius=10, fill=COLOR_DARKER_GREEN, outline=(26, 71, 52))
    
    logs = [
        ("[AUTH] Connected to Crescelo SaaS engine at https://www.crescelo.com", (211, 236, 229)),
        ("[SUCCESS] Assistant provisioned: ast_44a29ef10c (The Penthouse Living AI)", COLOR_LIME),
        ("[SYNC] Scraping post (batch 1 from offset 0)...", (211, 236, 229)),
        ("[CHUNK] Stored 97 embeddings for 15 posts.", COLOR_LIME),
        ("[SYNC] Scraping product (batch 1 from offset 0)...", (211, 236, 229)),
        ("[CHUNK] Stored 142 embeddings for 27 WooCommerce products with stock attributes.", COLOR_LIME),
        ("[SYNC] Scraping page (batch 1 from offset 0)...", (211, 236, 229)),
        ("[CHUNK] Stored 68 embeddings for 120 published pages.", COLOR_LIME),
        ("[DONE] Whole website scraped! Indexed 1,938 items and generated 307 Knowledge Base chunks.", COLOR_LIME)
    ]
    ly = term_y + 15
    for text, color in logs:
        draw.text((content_x + 15, ly), text, font=get_font(11, bold=True if color==COLOR_LIME else False), fill=color)
        ly += 21
        
    # Success Complete Card
    succ_y = term_y + 225
    draw.rounded_rectangle([content_x, succ_y, content_x + content_w, succ_y + 70], radius=10, fill=(236, 253, 245), outline=(167, 243, 208), width=2)
    draw.ellipse([content_x + 18, succ_y + 16, content_x + 54, succ_y + 52], fill=COLOR_TEAL)
    draw.text((content_x + 28, succ_y + 22), "✓", font=get_font(18, bold=True), fill=COLOR_LIME)
    draw.text((content_x + 68, succ_y + 16), "AI Knowledge Base Training Completed!", font=get_font(14, bold=True), fill=COLOR_DEEP_GREEN)
    draw.text((content_x + 68, succ_y + 38), "Indexed 1,938 items across 9 post types. Assistant is fully grounded and ready for live visitors.", font=get_font(11.5), fill=(26, 71, 52))
    
    # Action Button
    draw.rounded_rectangle([content_x + content_w - 240, succ_y + 85, content_x + content_w, succ_y + 127], radius=8, fill=COLOR_DEEP_GREEN)
    draw.text((content_x + content_w - 220, succ_y + 97), "Launch & Test Assistant →", font=get_font(12.5, bold=True), fill=COLOR_LIME)
    
    img.save(output_path, 'PNG')
    print(f"Created {output_path}")

# SCREENSHOT 5: Live Interactive Chatbot Preview with Add-to-Cart & Order Tracking
def generate_screenshot_5(output_path):
    img = Image.new('RGB', (1280, 800), COLOR_WHITE)
    draw = ImageDraw.Draw(img)
    content_x, content_y, content_w = draw_wp_admin_frame(
        draw, 1280, 800, 5,
        "Your AI Business Assistant is Trained & Ready!",
        "The chatbot has indexed your selected store content and is ready to assist shoppers."
    )
    
    col_w1 = content_w * 0.45
    col_w2 = content_w * 0.52
    
    # Left: Settings
    draw.text((content_x, content_y), "Widget Visibility & Controls", font=get_font(15, bold=True), fill=COLOR_DEEP_GREEN)
    
    draw.rounded_rectangle([content_x, content_y + 25, content_x + col_w1, content_y + 95], radius=10, fill=COLOR_CREAM_BG, outline=COLOR_BORDER)
    draw.text((content_x + 15, content_y + 38), "Enable Public Chat Widget", font=get_font(13, bold=True), fill=COLOR_DEEP_GREEN)
    draw.text((content_x + 15, content_y + 60), "Display interactive chat bubble on all public pages.", font=get_font(10.5), fill=COLOR_TEXT_MUTED)
    # Switch
    sw_x = content_x + col_w1 - 50
    draw.rounded_rectangle([sw_x, content_y + 44, sw_x + 36, content_y + 62], radius=10, fill=COLOR_DEEP_GREEN)
    draw.ellipse([sw_x + 22, content_y + 46, sw_x + 34, content_y + 58], fill=COLOR_LIME)
    
    # Assistant ID Card
    draw.rounded_rectangle([content_x, content_y + 110, content_x + col_w1, content_y + 180], radius=8, fill=(248, 250, 252), outline=(226, 232, 240))
    draw.text((content_x + 15, content_y + 122), "Active Assistant ID", font=get_font(11.5, bold=True), fill=COLOR_DEEP_GREEN)
    draw.text((content_x + 15, content_y + 144), "ast_44a29ef10c78b2a1", font=get_font(13, bold=True), fill=COLOR_TEAL)
    
    # Live preview link
    draw.rounded_rectangle([content_x, content_y + 200, content_x + 260, content_y + 240], radius=8, fill=COLOR_WHITE, outline=COLOR_BORDER)
    draw.text((content_x + 20, content_y + 212), "Preview on Your Live Website →", font=get_font(12, bold=True), fill=COLOR_DEEP_GREEN)
    
    # Right: Live Chat Simulated Preview
    col2_x = content_x + col_w1 + 25
    draw.text((col2_x, content_y), "Interactive Simulated Widget Preview", font=get_font(15, bold=True), fill=COLOR_DEEP_GREEN)
    draw.rounded_rectangle([col2_x + 270, content_y - 2, col2_x + 350, content_y + 18], radius=8, fill=COLOR_DEEP_GREEN)
    draw.text((col2_x + 282, content_y + 2), "● Interactive", font=get_font(10, bold=True), fill=COLOR_LIME)
    
    # Chat window frame
    cw_y = content_y + 25
    cw_h = 360
    draw.rounded_rectangle([col2_x, cw_y, col2_x + col_w2, cw_y + cw_h], radius=14, fill=COLOR_CREAM_CARD, outline=COLOR_BORDER)
    
    # Chat header
    draw.rounded_rectangle([col2_x, cw_y, col2_x + col_w2, cw_y + 48], radius=14, fill=COLOR_DEEP_GREEN)
    draw.rectangle([col2_x, cw_y + 30, col2_x + col_w2, cw_y + 48], fill=COLOR_DEEP_GREEN) # square bottom corners
    draw.ellipse([col2_x + 15, cw_y + 10, col2_x + 43, cw_y + 38], fill=COLOR_LIME)
    draw.text((col2_x + 22, cw_y + 17), "AI", font=get_font(13, bold=True), fill=COLOR_DEEP_GREEN)
    draw.text((col2_x + 55, cw_y + 11), "The Penthouse Living AI", font=get_font(13, bold=True), fill=COLOR_WHITE)
    draw.text((col2_x + 55, cw_y + 28), "● Online & Grounded", font=get_font(10), fill=COLOR_LIME)
    
    # Message 1 (Bot)
    draw.rounded_rectangle([col2_x + 15, cw_y + 60, col2_x + col_w2 - 50, cw_y + 108], radius=10, fill=COLOR_WHITE, outline=COLOR_BORDER)
    draw.text((col2_x + 25, cw_y + 68), "Hi! 👋 Welcome to The Penthouse Living. I have indexed\nyour catalog and policies. Looking for a suite or have questions?", font=get_font(10.5), fill=COLOR_DEEP_GREEN)
    
    # Message 2 (User)
    draw.rounded_rectangle([col2_x + 70, cw_y + 118, col2_x + col_w2 - 15, cw_y + 152], radius=10, fill=COLOR_DEEP_GREEN)
    draw.text((col2_x + 85, cw_y + 126), "Do you have suites with city views under $500/night?", font=get_font(10.5), fill=COLOR_LIME)
    
    # Message 3 (Bot with Product Card)
    draw.rounded_rectangle([col2_x + 15, cw_y + 162, col2_x + col_w2 - 30, cw_y + 245], radius=10, fill=COLOR_WHITE, outline=COLOR_BORDER)
    draw.text((col2_x + 25, cw_y + 170), "Yes! The Skyline Executive Suite is available at $450/night.\nVerified in real time from your WooCommerce database.", font=get_font(10.5), fill=COLOR_DEEP_GREEN)
    # Mini product card in bot bubble
    draw.rounded_rectangle([col2_x + 25, cw_y + 204, col2_x + col_w2 - 45, cw_y + 236], radius=6, fill=COLOR_CREAM_BG, outline=COLOR_BORDER)
    draw.text((col2_x + 35, cw_y + 212), "🏙️ Skyline Executive Suite - $450", font=get_font(11, bold=True), fill=COLOR_DEEP_GREEN)
    draw.rounded_rectangle([col2_x + col_w2 - 145, cw_y + 208, col2_x + col_w2 - 55, cw_y + 232], radius=4, fill=COLOR_LIME)
    draw.text((col2_x + col_w2 - 138, cw_y + 213), "🛒 Add to Cart", font=get_font(9.5, bold=True), fill=COLOR_DEEP_GREEN)
    
    # Suggestion Chips
    chips = ["Check live availability", "Track my order #1042", "Cancellation policy"]
    chip_x = col2_x + 15
    chip_y = cw_y + 255
    for chip in chips:
        ch_w = int(len(chip) * 6.5) + 16
        draw.rounded_rectangle([chip_x, chip_y, chip_x + ch_w, chip_y + 22], radius=6, fill=COLOR_WHITE, outline=COLOR_BORDER)
        draw.text((chip_x + 8, chip_y + 4), chip, font=get_font(10), fill=COLOR_DEEP_GREEN)
        chip_x += ch_w + 8
        
    # Input simulation footer
    draw.rounded_rectangle([col2_x, cw_y + cw_h - 45, col2_x + col_w2, cw_y + cw_h], fill=COLOR_WHITE, outline=COLOR_BORDER)
    draw.rounded_rectangle([col2_x + 12, cw_y + cw_h - 36, col2_x + col_w2 - 45, cw_y + cw_h - 10], radius=6, fill=COLOR_CREAM_BG, outline=COLOR_BORDER)
    draw.text((col2_x + 22, cw_y + cw_h - 28), "Type a question or test message...", font=get_font(10.5), fill=COLOR_TEXT_MUTED)
    draw.ellipse([col2_x + col_w2 - 38, cw_y + cw_h - 36, col2_x + col_w2 - 12, cw_y + cw_h - 10], fill=COLOR_DEEP_GREEN)
    draw.text((col2_x + col_w2 - 30, cw_y + cw_h - 30), "➤", font=get_font(11), fill=COLOR_LIME)
    
    img.save(output_path, 'PNG')
    print(f"Created {output_path}")

# Run generation
if __name__ == '__main__':
    print("Generating WordPress.org Directory Assets...")
    generate_icon(128, os.path.join(ASSETS_DIR, 'icon-128x128.png'))
    generate_icon(256, os.path.join(ASSETS_DIR, 'icon-256x256.png'))
    generate_svg_icon(os.path.join(ASSETS_DIR, 'icon.svg'))
    
    generate_banner(772, 250, os.path.join(ASSETS_DIR, 'banner-772x250.png'))
    generate_banner(1544, 500, os.path.join(ASSETS_DIR, 'banner-1544x500.png'))
    
    generate_screenshot_1(os.path.join(ASSETS_DIR, 'screenshot-1.png'))
    generate_screenshot_2(os.path.join(ASSETS_DIR, 'screenshot-2.png'))
    generate_screenshot_3(os.path.join(ASSETS_DIR, 'screenshot-3.png'))
    generate_screenshot_4(os.path.join(ASSETS_DIR, 'screenshot-4.png'))
    generate_screenshot_5(os.path.join(ASSETS_DIR, 'screenshot-5.png'))
    print("All assets successfully generated!")
