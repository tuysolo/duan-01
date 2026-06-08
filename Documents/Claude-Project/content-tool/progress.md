# Progress — FAM Trading Content Tool

## Tổng quan dự án
Tool tạo kịch bản YouTube Crypto tự động theo phong cách từng content creator của kênh FAM Trading.

---

## ✅ Bước 1 — DNA Analysis (HOÀN THÀNH)
**File:** `analysis/style_analysis.md`

Phân tích phong cách viết kịch bản của 4 content creator từ ~80 kịch bản thực tế:
- **Hien** — Chuyên gia phân tích, xưng "Eric", đoạn văn dài, số liệu vĩ mô
- **Loc** — Người bạn đồng hành, xưng "mình", câu ngắn, thân thiện
- **Nhi** — Thận trọng đa chiều, hook cảm xúc mạnh, editor notes sáng tạo
- **Trang** — Storytelling + visual, hook 3 câu hỏi, animation chi tiết nhất

---

## ✅ Bước 2 — Quy trình chuẩn hóa (HOÀN THÀNH)
**File:** `quy-trinh-kich-ban.rtf`

4 bước quy trình từ đầu đến cuối:
1. Tìm chủ đề (video gốc + 2-3 video tham khảo)
2. Đề xuất keyword + tiêu đề (VIDIQ criteria: volume >3000, Low competition, score >60)
3. Timeline 4-5 phần (2-4 phút/phần, có keyword)
4. Kịch bản hoàn chỉnh (~4000 ký tự, hook, CTA, liên kết video) + Request thumbnail

**Tài liệu tham chiếu:**
- `cong-thuc-content.pdf` — công thức kịch bản chuẩn
- `CHECKLIST-editor-tong.csv` — checklist editor (âm thanh, style, text, thành phẩm)

---

## ✅ Bước 3 — Xây dựng Tool (HOÀN THÀNH — v1.0)
**Thư mục:** `app/` (Next.js 16 + TypeScript + Tailwind + Anthropic SDK)

### Tính năng đã có:
- [x] Wizard 5 bước: Chọn Creator → Input → Keyword → Timeline → Kịch bản
- [x] 4 DNA profiles tích hợp vào prompt (Hien/Loc/Nhi/Trang)
- [x] Generate keyword + tiêu đề với tiêu chí SEO VIDIQ
- [x] Generate timeline 4-5 phần theo quy trình
- [x] Generate kịch bản ~15,000 ký tự đúng phong cách từng người
- [x] Format 2 cột: THOẠI | MÔ TẢ EDITOR
- [x] Export kịch bản ra file `.md` hoặc `.txt`
- [x] Lịch sử các kịch bản đã generate (lưu local trong session)
- [x] Copy to clipboard
- [x] Dark theme UI

### Deploy:
- GitHub: https://github.com/trungtuy292/duan-01
- Vercel: https://app-eight-beta-94.vercel.app

---

## 🧪 Test đã chạy
| Creator | Chủ đề | Kết quả |
|---------|--------|---------|
| Trang | Bitcoin còn tiềm năng không 2026 | ✅ 15,864 ký tự, đúng phong cách, editor notes chi tiết |

**File output mẫu:** `output/kich-ban-trang-bitcoin-2026.md`

---

## 📋 Backlog / Cải tiến tiếp theo
- [ ] Tích hợp VIDIQ API để check volume keyword thật
- [ ] Lưu lịch sử kịch bản vào database/localStorage persistent
- [ ] Export ra Google Docs / Sheets trực tiếp
- [ ] Fine-tune prompt với checklist editor (CHECKLIST-editor-tong.csv)
- [ ] Thêm creator mới khi team mở rộng
- [ ] Tích hợp YouTube transcript API để tự động parse video tham khảo

---

*Cập nhật lần cuối: 2026-06-08*
