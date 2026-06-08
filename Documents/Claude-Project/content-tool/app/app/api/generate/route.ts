import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const CREATOR_PROFILES: Record<string, string> = {
  Hien: `Phong cách viết kịch bản của HIEN (Eric):
- Xưng: "Eric" (nhất quán, KHÔNG dùng "mình")
- Gọi khán giả: "anh em"
- Giọng: Nghiêm túc, phân tích, phong cách chuyên gia tài chính
- Đoạn văn rất dài (4–10+ câu), câu phức hợp nhiều mệnh đề
- Dùng nhiều số liệu, tên tổ chức lớn (BlackRock, Fidelity...), lập luận có cấu trúc rõ ràng
- Câu nối cuối mỗi phần dẫn sang phần tiếp theo
- Hook: Số liệu gây sốc → Bối cảnh vĩ mô → Roadmap nội dung → Kêu gọi xem hết
- Mạnh về vĩ mô, trích dẫn uy tín, ít cảm xúc cá nhân, nhiều thuật ngữ chuyên ngành
- Cột editor: "Mô tả lưu ý cho editor"`,

  Loc: `Phong cách viết kịch bản của LOC:
- Xưng: "mình" (đặc trưng riêng, nhất quán)
- Gọi: "bạn", "các bạn", đôi khi "anh em"
- Giọng: Thân thiện như người bạn chia sẻ trải nghiệm, "cùng khám phá" không "giảng dạy"
- Câu ngắn hơn, gần với văn nói tự nhiên
- Nhiều câu hỏi trực tiếp gợi sự tương tác
- Hook: Đảo ngược kỳ vọng (bạn nghĩ X nhưng thực ra Y) hoặc kể chuyện pain point cá nhân
- Giọng "người bạn đồng hành" dễ gần nhất, mạnh về so sánh multi-coin
- Cột editor: "MÔ TẢ"`,

  Nhi: `Phong cách viết kịch bản của NHI:
- Xưng: "mình" (chủ yếu)
- Gọi: "anh em"
- Giọng: Cân bằng và chín chắn nhất — thừa nhận bất định, nhìn đa chiều
- Hay dùng: "Có thể là...", "Theo quan điểm cá nhân của mình...", "Nhưng cũng phải thừa nhận..."
- Tích hợp cảm xúc có chủ ý, tránh kết luận tuyệt đối
- Hook: Cảm xúc/nỗi sợ hãi được xây dựng dần, câu hỏi ám ảnh dai dẳng
- Phân tầng: thực trạng → nguyên nhân → đánh giá → nhận định
- Editor notes sáng tạo nhất (ghi chú âm nhạc nền, mood video)
- Cột editor: "MÔ TẢ"`,

  Trang: `Phong cách viết kịch bản của TRANG:
- Xưng: Xen kẽ "Eric" và "mình" trong cùng một video
- Gọi: "anh em" và "mọi người" (thường xuyên nhất)
- Giọng: Kết hợp chuyên gia + bạn bè — như người đã trải qua thất bại và chia sẻ bài học
- Câu dài, chi tiết, nhiều số liệu cụ thể nhất, giỏi xây dựng timeline lịch sử
- Cân bằng tích cực/tiêu cực có chủ ý, kết thúc bằng hy vọng
- Hook: Số liệu sốc → "Nhưng nhìn xem..." → 3 câu hỏi liên tiếp → "Hôm nay Eric sẽ bóc tách..." → "Nếu anh em... phải xem đến cuối nha!"
- SEO chi tiết nhất, tư duy visual/animation tốt nhất, giỏi storytelling theo timeline
- Cột editor: "EFFECT/CÁCH THỂ HIỆN"`,
};

const SCRIPT_REQUIREMENTS = `
YÊU CẦU BẮT BUỘC cho kịch bản:
1. Phải hook mạnh trong 30 giây đầu — người xem quyết định xem tiếp hay không
2. Phần đầu (phần 1 hoặc 2): có đoạn liên kết với video khác của kênh + call-to-action (like, subscribe, comment)
3. Kết video: tổng hợp nội dung chính + tuyên bố từ chối trách nhiệm (disclaimer) + CTA rõ ràng
4. Liên kết giữa các phần: cuối mỗi phần có 1-2 câu dẫn dắt sang phần tiếp theo để giữ người xem
5. Content 100% chứa các keyword (mỗi keyword xuất hiện ít nhất 1 lần), phân bổ đều
6. Keyword viết chính xác (đúng hoa thường như trong danh sách)
7. Độ dài: ~4000 ký tự (tương đương video 15 phút)
8. Văn phong tự nhiên, KHÔNG giống AI
9. Kịch bản format 2 cột: THOẠI | MÔ TẢ EDITOR
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { step, creator, topic, referenceVideos, keywords, title, timeline, additionalContext, apiKey } = body;

    if (!apiKey || !apiKey.startsWith("sk-ant-")) {
      return NextResponse.json({ error: "API key không hợp lệ. Vui lòng nhập Anthropic API key hợp lệ." }, { status: 401 });
    }

    const client = new Anthropic({ apiKey });

    const profile = CREATOR_PROFILES[creator];
    if (!profile) {
      return NextResponse.json({ error: "Creator không hợp lệ" }, { status: 400 });
    }

    let prompt = "";

    if (step === "keywords") {
      prompt = `Bạn là chuyên gia content YouTube Crypto/Finance, chuyên về keyword SEO và chiến lược nội dung.

${profile}

CHỦ ĐỀ VIDEO: ${topic}
${referenceVideos ? `VIDEO THAM KHẢO: ${referenceVideos}` : ""}
${additionalContext ? `THÔNG TIN BỔ SUNG: ${additionalContext}` : ""}

Hãy đề xuất keyword và tiêu đề cho video này theo tiêu chí:

KEYWORD CHÍNH (2 keyword):
- 1 keyword core Crypto có volume tìm kiếm cao
- 1 keyword liên quan chủ đề video (volume >3000)
- Cả 2 phải có: volume >3000, độ cạnh tranh Low, điểm tổng quát >60
- Keyword khó/cạnh tranh cao → ưu tiên đặt bên trái đầu tiêu đề

KEYWORD PHỤ (10+ keyword):
- Liên quan chủ đề video, volume càng cao càng tốt, điểm tổng quát >60

TIÊU ĐỀ VIDEO (2-3 gợi ý):
- Dưới 70 ký tự, tối ưu 60 ký tự
- Chứa 2 keyword chính
- Hấp dẫn, tò mò, có con số
- Phù hợp phong cách ${creator}

Trả về JSON format:
{
  "mainKeywords": [{"keyword": "...", "notes": "lý do chọn"}],
  "subKeywords": ["kw1", "kw2", ...],
  "titleOptions": [{"title": "...", "charCount": 0, "notes": "..."}]
}`;
    } else if (step === "timeline") {
      prompt = `Bạn là chuyên gia content YouTube Crypto/Finance.

${profile}

CHỦ ĐỀ VIDEO: ${topic}
TIÊU ĐỀ ĐÃ CHỌN: ${title}
KEYWORD CHÍNH: ${keywords?.main?.join(", ")}
KEYWORD PHỤ: ${keywords?.sub?.join(", ")}
${referenceVideos ? `VIDEO THAM KHẢO: ${referenceVideos}` : ""}
${additionalContext ? `NỘI DUNG THAM KHẢO: ${additionalContext}` : ""}

Hãy xây dựng timeline cho video theo yêu cầu:
- 4-5 phần (mỗi phần 2-4 phút)
- Ít nhất 1 phần chứa keyword chính trong tên phần
- Sắp xếp logic tăng dần: từ dễ đến khó, từ tổng quan đến chi tiết
- Phù hợp phong cách ${creator}
- Phần 1 hoặc 2 cần có không gian cho call-to-action và liên kết video khác

Trả về JSON:
{
  "timeline": [
    {"part": 1, "title": "Tên phần", "duration": "2-3 phút", "keyPoints": ["điểm 1", "điểm 2"], "hasKeyword": true/false}
  ],
  "totalDuration": "khoảng X phút"
}`;
    } else if (step === "script") {
      prompt = `Bạn là ${creator}, content creator chuyên về Crypto/Finance cho kênh FAM Trading YouTube.

${profile}

${SCRIPT_REQUIREMENTS}

CHỦ ĐỀ: ${topic}
TIÊU ĐỀ VIDEO: ${title}
KEYWORD CHÍNH: ${keywords?.main?.join(", ")}
KEYWORD PHỤ: ${keywords?.sub?.join(", ")}
TIMELINE:
${timeline?.map((t: {part: number; title: string; keyPoints: string[]}) => `- Phần ${t.part}: ${t.title}\n  Nội dung: ${t.keyPoints?.join(", ")}`).join("\n")}
${referenceVideos ? `VIDEO THAM KHẢO: ${referenceVideos}` : ""}
${additionalContext ? `NỘI DUNG THAM KHẢO: ${additionalContext}` : ""}

Viết kịch bản HOÀN CHỈNH theo phong cách của ${creator}. Format output là markdown table 2 cột:

| THOẠI | MÔ TẢ EDITOR |
|-------|--------------|
| (nội dung thoại) | (hướng dẫn hiệu ứng, hình ảnh cho editor) |

Ghi chú MÔ TẢ EDITOR theo phong cách ${creator}:
${creator === "Hien" ? "- Ký hiệu: qq1.png, bl2.mp4... Lệnh: vid, ảnh, popup text, bôi màu, zoom, khoanh" : ""}
${creator === "Loc" ? "- Lệnh: source, tham chiếu slide số, popup, zoom" : ""}
${creator === "Nhi" ? "- Lệnh: xh source, popup ảnh bên cạnh, bôi màu vào text khớp thoại, xh ảnh 1/2 bên cạnh, ghi chú nhạc nền/mood" : ""}
${creator === "Trang" ? "- Lệnh: vid, ảnh, popup text, item con người thắc mắc + bong bóng text, nền xám + popup text, hiệu ứng text bùng nổ, mũi tên, từ từ zoom" : ""}

Sau bảng kịch bản, thêm phần:
## THUMBNAIL REQUEST
- Title thumbnail: (dưới 7 chữ, có số, liên quan chủ đề)
- Ý tưởng thumbnail: (mô tả visual)`;
    } else {
      return NextResponse.json({ error: "Step không hợp lệ" }, { status: 400 });
    }

    const message = await (client as Anthropic).messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Lỗi response" }, { status: 500 });
    }

    if (step === "keywords" || step === "timeline") {
      const jsonMatch = content.text.match(/```json\n?([\s\S]*?)\n?```/) ||
        content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          return NextResponse.json({ result: parsed, raw: content.text });
        } catch {
          return NextResponse.json({ result: null, raw: content.text });
        }
      }
    }

    return NextResponse.json({ result: content.text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
