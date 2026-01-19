from PIL import Image, ImageDraw, ImageFont


def get_font(size, bold=False):
    try:
        # Windows common fonts
        name = "arialbd.ttf" if bold else "arial.ttf"
        return ImageFont.truetype(name, size)
    except Exception:
        return ImageFont.load_default()


def rounded_rect(draw, xy, radius, fill, outline=None, width=2):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def arrow(draw, start, end, color, width=4, head=12):
    draw.line([start, end], fill=color, width=width)
    # Arrow head
    sx, sy = start
    ex, ey = end
    dx, dy = ex - sx, ey - sy
    length = max((dx**2 + dy**2) ** 0.5, 1)
    ux, uy = dx / length, dy / length
    # Perpendicular
    px, py = -uy, ux
    hx, hy = ex - ux * head, ey - uy * head
    p1 = (hx + px * head * 0.6, hy + py * head * 0.6)
    p2 = (hx - px * head * 0.6, hy - py * head * 0.6)
    draw.polygon([end, p1, p2], fill=color)


def draw_gradient(draw, width, height, top_color, bottom_color):
    for y in range(height):
        r = int(top_color[0] + (bottom_color[0] - top_color[0]) * (y / height))
        g = int(top_color[1] + (bottom_color[1] - top_color[1]) * (y / height))
        b = int(top_color[2] + (bottom_color[2] - top_color[2]) * (y / height))
        draw.line([(0, y), (width, y)], fill=(r, g, b))


def draw_heart(draw, center, size, color):
    cx, cy = center
    r = size // 3
    draw.ellipse([cx - r - r, cy - r, cx - r + r, cy + r], fill=color, outline=None)
    draw.ellipse([cx - r + r, cy - r, cx - r + 3 * r, cy + r], fill=color, outline=None)
    draw.polygon([(cx - 2 * r, cy), (cx, cy + 2 * r), (cx + 2 * r, cy)], fill=color)


def draw_chart(draw, box, color):
    x1, y1, x2, y2 = box
    draw.rectangle(box, outline=color, width=2)
    points = [(x1 + 10, y2 - 15), (x1 + 50, y2 - 45), (x1 + 90, y2 - 30), (x1 + 130, y2 - 70)]
    draw.line(points, fill=color, width=3)
    for px, py in points:
        draw.ellipse([px - 4, py - 4, px + 4, py + 4], fill=color)


def main():
    w, h = 2560, 1440
    img = Image.new("RGB", (w, h), "#F8FBFF")
    draw = ImageDraw.Draw(img)

    draw_gradient(draw, w, h, (248, 251, 255), (236, 243, 255))

    # Header ribbon
    header_h = 140
    draw.rectangle([0, 0, w, header_h], fill="#0B2A66")
    draw.text((60, 35), "Health Monitoring Platform", font=get_font(40, True), fill="#FFFFFF")
    draw.text((60, 85), "AI‑Powered Health Tracking", font=get_font(22, False), fill="#DCE6FF")

    title_font = get_font(54, True)
    draw.text((w // 2 - 320, 170), "ARCHITECTURE DIAGRAM", font=title_font, fill="#0B2A66")

    # Decorative arcs
    draw.ellipse([-300, 200, 380, 880], outline="#BBD3FF", width=28)
    draw.ellipse([w - 420, 120, w + 260, 800], outline="#C7D8FF", width=28)

    # Left user + UI
    user_box = (120, 320, 420, 470)
    rounded_rect(draw, user_box, 18, "#E8F2FF", outline="#7AA7E6", width=3)
    draw.text((190, 372), "User", font=get_font(30, True), fill="#0B2A66")
    # User icon (head + body) sized to match text
    draw.ellipse([158, 350, 188, 380], fill="#0B2A66")  # head
    draw.rounded_rectangle([150, 385, 196, 415], radius=10, fill="#0B2A66")  # body

    ui_box = (120, 520, 450, 760)
    rounded_rect(draw, ui_box, 22, "#FFFFFF", outline="#B0C7F2", width=3)
    draw.text((160, 545), "UI", font=get_font(28, True), fill="#0B2A66")
    draw.text((150, 590), "Login • Dashboard", font=get_font(20, False), fill="#2B3B5A")
    draw.text((150, 625), "Profile • Docs", font=get_font(20, False), fill="#2B3B5A")
    draw_chart(draw, (160, 660, 320, 740), "#4A90E2")

    # Main processing panels
    seg_box = (620, 300, 2360, 680)
    class_box = (620, 760, 2360, 1140)
    rounded_rect(draw, seg_box, 18, "#FFFFFF", outline="#B0C7F2", width=3)
    rounded_rect(draw, class_box, 18, "#FFFFFF", outline="#B0C7F2", width=3)

    draw.text((660, 315), "Health Analytics & Prediction", font=get_font(30, True), fill="#0B2A66")
    draw.text((660, 775), "AI Nutrition & Recommendations", font=get_font(30, True), fill="#0B2A66")

    # Inside top panel
    in_box = (700, 390, 1040, 600)
    rounded_rect(draw, in_box, 14, "#EFF6FF", outline="#94B6F2", width=2)
    draw.text((735, 445), "Health Metrics", font=get_font(22, True), fill="#0B2A66")
    draw.text((720, 485), "Heart, BP, Sleep, Stress", font=get_font(18), fill="#2B3B5A")
    draw_heart(draw, (760, 545), 40, "#E53935")

    model_box = (1140, 390, 1520, 600)
    rounded_rect(draw, model_box, 14, "#F3E8FF", outline="#B38AE6", width=2)
    draw.text((1180, 445), "ML Predictor", font=get_font(22, True), fill="#4A148C")
    draw.text((1165, 485), "Risk Level + Insights", font=get_font(18), fill="#4A148C")

    out_box = (1660, 390, 2060, 600)
    rounded_rect(draw, out_box, 14, "#E8F5E9", outline="#8BC34A", width=2)
    draw.text((1700, 445), "Analytics", font=get_font(22, True), fill="#1B5E20")
    draw.text((1690, 485), "Graphs & Scores", font=get_font(18), fill="#1B5E20")

    # Inside bottom panel
    prof_box = (700, 850, 1040, 1060)
    rounded_rect(draw, prof_box, 14, "#FFF3E0", outline="#FFB74D", width=2)
    draw.text((735, 905), "User Profile", font=get_font(22, True), fill="#E65100")
    draw.text((715, 945), "Age, Gender, Occupation", font=get_font(18), fill="#E65100")

    nut_box = (1140, 850, 1520, 1060)
    rounded_rect(draw, nut_box, 14, "#E0F7FA", outline="#4DD0E1", width=2)
    draw.text((1180, 905), "Nutrition Engine", font=get_font(22, True), fill="#006064")
    draw.text((1165, 945), "7-day Meal Plan", font=get_font(18), fill="#006064")

    plan_box = (1660, 850, 2060, 1060)
    rounded_rect(draw, plan_box, 14, "#FCE4EC", outline="#F06292", width=2)
    draw.text((1690, 905), "Recommendations", font=get_font(22, True), fill="#880E4F")
    draw.text((1680, 945), "Diet + Hydration", font=get_font(18), fill="#880E4F")

    # Storage block
    store_box = (470, 830, 610, 1060)
    rounded_rect(draw, store_box, 14, "#F1F8E9", outline="#9CCC65", width=2)
    draw.text((490, 875), "Storage", font=get_font(18, True), fill="#33691E")
    draw.text((490, 910), "MongoDB", font=get_font(16), fill="#33691E")
    draw.text((490, 940), "Docs/Avatars", font=get_font(16), fill="#33691E")

    # Arrows
    arrow(draw, (420, 380), (620, 430), "#5B7DBF", width=5)
    arrow(draw, (450, 620), (620, 520), "#5B7DBF", width=5)
    arrow(draw, (1040, 495), (1140, 495), "#6A1B9A", width=5)
    arrow(draw, (1520, 495), (1660, 495), "#2E7D32", width=5)

    arrow(draw, (1040, 955), (1140, 955), "#00838F", width=5)
    arrow(draw, (1520, 955), (1660, 955), "#AD1457", width=5)

    arrow(draw, (610, 945), (700, 945), "#7CB342", width=5)

    # Footer note
    draw.text((80, 1280), "End-to-end flow: UI → Backend API → ML Service → Insights & Recommendations",
              font=get_font(20), fill="#4A5568")

    img.save("architecture-diagram-styled.png")


if __name__ == "__main__":
    main()
