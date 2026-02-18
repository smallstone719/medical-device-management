# Font Update - Inter Font

## ✅ Đã cập nhật

Font chữ của giao diện đã được thay đổi từ **Outfit** sang **Inter**.

## 🎨 Tại sao chọn Inter?

### 1. Hỗ trợ tiếng Việt tốt
- Inter được thiết kế với hỗ trợ đầy đủ cho Unicode
- Hiển thị dấu tiếng Việt rõ ràng, đẹp mắt
- Không bị lỗi font với các ký tự đặc biệt

### 2. Phổ biến và chuyên nghiệp
- Được sử dụng bởi hàng nghìn công ty lớn (GitHub, Figma, Mozilla, v.v.)
- Font mặc định của nhiều design system hiện đại
- Được tối ưu cho màn hình digital

### 3. Dễ đọc
- Thiết kế đặc biệt cho UI/UX
- Spacing và kerning được tối ưu
- Rõ ràng ở mọi kích thước (từ 12px đến 72px)

### 4. Variable Font
- Hỗ trợ weight từ 100-900
- Smooth transitions giữa các weight
- File size nhỏ hơn so với load nhiều weight riêng lẻ

### 5. Open Source
- Miễn phí sử dụng cho mọi mục đích
- License: SIL Open Font License 1.1
- Có thể tùy chỉnh nếu cần

## 📝 Thay đổi

### File: `frontend/src/assets/main.css`

**Trước:**
```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap')

@theme {
  --font-outfit: Outfit, sans-serif;
}

body {
  @apply font-outfit;
}
```

**Sau:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap')

@theme {
  --font-inter: Inter, sans-serif;
}

body {
  @apply font-inter;
}
```

## 🎯 Kết quả

### Hiển thị tiếng Việt
```
Trước (Outfit): Quản lý thiết bị y tế
Sau (Inter):    Quản lý thiết bị y tế
```

Inter hiển thị dấu tiếng Việt tự nhiên và cân đối hơn.

### Font Weights có sẵn
- 100 - Thin
- 200 - Extra Light
- 300 - Light
- 400 - Regular (default)
- 500 - Medium
- 600 - Semi Bold
- 700 - Bold
- 800 - Extra Bold
- 900 - Black

### Sử dụng trong code

```vue
<!-- Regular text -->
<p class="text-base">Văn bản thông thường</p>

<!-- Medium weight -->
<p class="text-base font-medium">Văn bản medium</p>

<!-- Bold -->
<h1 class="text-2xl font-bold">Tiêu đề đậm</h1>

<!-- Semi-bold -->
<h2 class="text-xl font-semibold">Tiêu đề semi-bold</h2>
```

## 🌐 Google Fonts

Font được load từ Google Fonts CDN:
```
https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap
```

### Ưu điểm:
- ✅ Fast CDN delivery
- ✅ Browser caching
- ✅ Automatic optimization
- ✅ Variable font support

### Nhược điểm:
- ⚠️ Cần internet để load (lần đầu)
- ⚠️ Phụ thuộc vào Google Fonts service

### Alternative: Self-host

Nếu muốn self-host font (không phụ thuộc Google):

1. Download Inter từ: https://rsms.me/inter/
2. Đặt files vào `frontend/public/fonts/`
3. Cập nhật CSS:

```css
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url('/fonts/Inter-Variable.woff2') format('woff2');
}
```

## 📊 So sánh với các font khác

| Font | Tiếng Việt | Phổ biến | Dễ đọc | File Size |
|------|-----------|----------|--------|-----------|
| Inter | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ~100KB |
| Roboto | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ~80KB |
| Open Sans | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ~90KB |
| Outfit | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ~85KB |
| Poppins | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ~95KB |

## 🎨 Font Pairing

Inter kết hợp tốt với:
- **Monospace**: JetBrains Mono, Fira Code (cho code blocks)
- **Serif**: Merriweather, Lora (cho headings đặc biệt)
- **Display**: Space Grotesk (cho hero sections)

## 🔧 Tùy chỉnh thêm

### Letter spacing
```css
.tight-spacing {
  letter-spacing: -0.02em;
}

.normal-spacing {
  letter-spacing: 0;
}

.loose-spacing {
  letter-spacing: 0.02em;
}
```

### Line height
```css
.tight-leading {
  line-height: 1.2;
}

.normal-leading {
  line-height: 1.5;
}

.loose-leading {
  line-height: 1.8;
}
```

## 📱 Responsive Typography

Inter scale tốt trên mọi thiết bị:

```css
/* Mobile */
@media (max-width: 640px) {
  body {
    font-size: 14px;
  }
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  body {
    font-size: 15px;
  }
}

/* Desktop */
@media (min-width: 1025px) {
  body {
    font-size: 16px;
  }
}
```

## ✅ Checklist

- [x] Import Inter từ Google Fonts
- [x] Cập nhật CSS variable `--font-inter`
- [x] Áp dụng cho body element
- [x] Test hiển thị tiếng Việt
- [x] Test trên các trình duyệt khác nhau
- [x] Test responsive trên mobile/tablet/desktop

## 🎉 Kết luận

Font Inter đã được áp dụng thành công cho toàn bộ giao diện. Giao diện giờ đây:
- ✅ Hiển thị tiếng Việt đẹp và rõ ràng hơn
- ✅ Chuyên nghiệp và hiện đại hơn
- ✅ Dễ đọc hơn trên mọi thiết bị
- ✅ Phù hợp với các ứng dụng y tế/doanh nghiệp

Reload trang để xem thay đổi! 🚀
