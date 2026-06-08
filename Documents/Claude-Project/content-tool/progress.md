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

## ✅ Bước 3 — Xây dựng Tool (HOÀN THÀNH — v1.1)
**Thư mục:** `app/` (Next.js 16 + TypeScript + Tailwind + Anthropic SDK)

### Tính năng đã có (v1.1 — 2026-06-08):
- [x] Wizard 6 bước: **API Key** → Chọn Creator → Input → Keyword → Timeline → Kịch bản
- [x] Màn hình nhập API key đầu tiên — không lưu server, chỉ tồn tại trong session
- [x] 4 DNA profiles tích hợp vào prompt (Hien/Loc/Nhi/Trang)
- [x] Generate keyword + tiêu đề với tiêu chí SEO VIDIQ
- [x] Generate timeline 4-5 phần theo quy trình
- [x] Generate kịch bản ~15,000 ký tự đúng phong cách từng người
- [x] Format 2 cột: THOẠI | MÔ TẢ EDITOR
- [x] Export kịch bản ra file `.md` hoặc `.txt` (download trực tiếp)
- [x] Lịch sử các kịch bản đã generate trong session — xem lại / download từng cái
- [x] Copy to clipboard
- [x] Dark theme UI
- [x] Bảo mật: API key do người dùng nhập, không hardcode, không lưu env

### Deploy:
- GitHub: https://github.com/trungtuy292/duan-01
- Vercel: https://content-tool-inc.vercel.app

---

## 🧪 Test đã chạy
| Creator | Chủ đề | Kết quả |
|---------|--------|---------|
| Trang | Bitcoin còn tiềm năng không 2026 | ✅ 15,864 ký tự, đúng phong cách, editor notes chi tiết |

**File output mẫu:** `output/kich-ban-trang-bitcoin-2026.md`

---

## 📋 Trạng thái hiện tại — chờ feedback thực tế

Tool đã live tại **https://content-tool-inc.vercel.app**

Phiên làm việc 2026-06-08 đã hoàn thành. Bước tiếp theo phụ thuộc vào kết quả test thực tế của team:

### Cần feedback sau khi test:
- [ ] Kịch bản generate có đúng phong cách từng người không? (Hien/Loc/Nhi/Trang)
- [ ] Keyword gợi ý có sát thực tế VIDIQ không?
- [ ] Timeline có hợp lý về thời lượng và nội dung không?
- [ ] Editor notes có đủ chi tiết để editor hiểu không?
- [ ] Thumbnail request có dùng được không?
- [ ] Có phần nào của prompt cần điều chỉnh không?

---

## 📋 Backlog / Cải tiến tiếp theo
- [ ] Fine-tune prompt dựa trên feedback thực tế từ team
- [ ] Tích hợp VIDIQ API để check volume keyword thật
- [ ] Lưu lịch sử kịch bản vào localStorage (persistent sau khi reload)
- [ ] Export ra Google Docs / Sheets trực tiếp
- [ ] Fine-tune prompt với checklist editor (CHECKLIST-editor-tong.csv)
- [ ] Thêm creator mới khi team mở rộng
- [ ] Tích hợp YouTube transcript API để tự động parse video tham khảo

---

## 📝 Lịch sử phiên làm việc

### Phiên 1 — 2026-06-08
**Những gì đã làm:**
- Đọc và hiểu `promt-order.rtf` (3 bước yêu cầu ban đầu)
- Đọc `analysis/style_analysis.md` (DNA 4 creator đã có từ trước)
- Đọc `quy-trinh-kich-ban.rtf` (quy trình 4 bước đã cập nhật)
- Tham chiếu `CHECKLIST-editor-tong.csv` để hiểu yêu cầu editor
- Xây dựng toàn bộ app từ Next.js skeleton:
  - API route `/api/generate` với 3 mode: keywords / timeline / script
  - UI wizard 6 bước, dark theme
  - DNA profiles của 4 creator tích hợp vào prompt
- Test thành công: kịch bản Trang / Bitcoin 2026 — 15,864 ký tự
- Thêm tính năng: export .md/.txt, lịch sử session, màn hình API key
- Bảo mật: xóa hardcoded API key, user tự nhập qua UI
- Deploy: GitHub + Vercel (content-tool-inc.vercel.app)

**Trạng thái khi kết thúc phiên:** Tool live, chờ test thực tế từ team.

**Để tiếp tục phiên sau:** Đọc file này trước, sau đó nhận feedback từ user để fine-tune prompt hoặc thêm tính năng theo backlog.

---

*Cập nhật lần cuối: 2026-06-08*
