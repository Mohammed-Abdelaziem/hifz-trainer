import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/server/auth", () => ({
  getSessionUser: vi.fn().mockResolvedValue({ id: "test-user", email: "test@test.com" }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { POST } from "../route";

describe("/api/tajweed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.HF_API_KEY = "hf_test_key_123";
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ text: "بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ" }),
    });
  });

  function makeAudioFile(size = 1000): File {
    return new File([new ArrayBuffer(size)], "recitation.webm", {
      type: "audio/webm;codecs=opus",
    });
  }

  function makeRequest(audioFile?: File, verseKey = "1:1"): Request {
    const formData = new FormData();
    if (audioFile) formData.append("audio", audioFile);
    formData.append("verseKey", verseKey);
    return new Request("http://localhost/api/tajweed", {
      method: "POST",
      body: formData,
    });
  }

  describe("input validation", () => {
    it("returns 400 when no audio file provided", async () => {
      const formData = new FormData();
      formData.append("verseKey", "1:1");
      const req = new Request("http://localhost/api/tajweed", {
        method: "POST",
        body: formData,
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("No audio file");
    });

    it("returns 400 when audio file is missing and only verseKey provided", async () => {
      const formData = new FormData();
      formData.append("verseKey", "1:1");
      const req = new Request("http://localhost/api/tajweed", {
        method: "POST",
        body: formData,
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("No audio file");
    });

    it("accepts files under 10MB", async () => {
      const smallFile = makeAudioFile(1000);
      const req = makeRequest(smallFile);
      const res = await POST(req);
      expect(res.status).toBe(200);
    });
  });

  describe("Whisper API integration", () => {
    it("calls HF Whisper API with correct headers", async () => {
      const file = makeAudioFile();
      const req = makeRequest(file);
      await POST(req);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("api-inference.huggingface.co"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer hf_test_key_123",
          }),
        })
      );
    });

    it("returns 500 when Whisper API fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: "model overloaded" }),
      });
      const req = makeRequest(makeAudioFile());
      const res = await POST(req);
      expect(res.status).toBe(500);
    });

    it("handles 503 model loading error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: () => Promise.resolve({ error: "model loading" }),
      });
      const req = makeRequest(makeAudioFile());
      const res = await POST(req);
      const data = await res.json();
      expect(data.error).toContain("loading");
    });

    it("handles network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failure"));
      const req = makeRequest(makeAudioFile());
      const res = await POST(req);
      expect(res.status).toBe(500);
    });

    it("returns empty transcription when Whisper returns no text", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ text: "" }),
      });
      const req = makeRequest(makeAudioFile());
      const res = await POST(req);
      const data = await res.json();
      expect(data.transcription).toBe("");
    });
  });

  describe("transcription and scoring", () => {
    it("returns transcription from Whisper", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ text: "بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ" }),
      });
      const req = makeRequest(makeAudioFile(), "1:1");
      const res = await POST(req);
      const data = await res.json();
      expect(data.transcription).toBe("بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ");
    });

    it("returns reference text for known verses", async () => {
      const req = makeRequest(makeAudioFile(), "1:1");
      const res = await POST(req);
      const data = await res.json();
      expect(data.reference).toBeTruthy();
      expect(data.reference).toContain("بِسْمِ");
    });

    it("returns null reference for unknown verses", async () => {
      const req = makeRequest(makeAudioFile(), "99:99");
      const res = await POST(req);
      const data = await res.json();
      expect(data.reference).toBeNull();
    });

    it("caps score at 70 for unknown verses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ text: "random arabic text" }),
      });
      const req = makeRequest(makeAudioFile(), "99:99");
      const res = await POST(req);
      const data = await res.json();
      expect(data.score).toBeLessThanOrEqual(70);
    });

    it("calculates similarity for matching transcription", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ text: "بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ" }),
      });
      const req = makeRequest(makeAudioFile(), "1:1");
      const res = await POST(req);
      const data = await res.json();
      expect(data.similarity).toBeGreaterThan(80);
    });

    it("returns low similarity for mismatched transcription", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ text: "hello world" }),
      });
      const req = makeRequest(makeAudioFile(), "1:1");
      const res = await POST(req);
      const data = await res.json();
      expect(data.similarity).toBeLessThan(20);
    });
  });

  describe("tajweed analysis", () => {
    it("returns issues array", async () => {
      const req = makeRequest(makeAudioFile(), "1:1");
      const res = await POST(req);
      const data = await res.json();
      expect(Array.isArray(data.issues)).toBe(true);
    });

    it("flags qalqalah letters at word end", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ text: "كتاب جد طلب ظرف باب" }),
      });
      const req = makeRequest(makeAudioFile(), "1:1");
      const res = await POST(req);
      const data = await res.json();
      const qalqalahIssues = data.issues.filter(
        (i: { rule: string }) => i.rule === "Echo (Qalqalah)"
      );
      expect(qalqalahIssues.length).toBeGreaterThan(0);
      expect(qalqalahIssues.length).toBeLessThanOrEqual(3);
    });

    it("limits qalqalah issues to max 3", async () => {
      const text = "ب ج د ط ظ ب ج د ط ظ ب ج د ط ظ ب ج د ط ظ ب ج د ط ظ";
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ text }),
      });
      const req = makeRequest(makeAudioFile(), "1:1");
      const res = await POST(req);
      const data = await res.json();
      const qalqalahIssues = data.issues.filter(
        (i: { rule: string }) => i.rule === "Echo (Qalqalah)"
      );
      expect(qalqalahIssues.length).toBeLessThanOrEqual(3);
    });
  });

  describe("verse key handling", () => {
    it("defaults to 1:1 when no verse key provided", async () => {
      const formData = new FormData();
      formData.append("audio", makeAudioFile());
      const req = new Request("http://localhost/api/tajweed", {
        method: "POST",
        body: formData,
      });
      const res = await POST(req);
      const data = await res.json();
      expect(data.reference).toBeTruthy();
    });

    it("uses provided verse key", async () => {
      const req = makeRequest(makeAudioFile(), "2:1");
      const res = await POST(req);
      const data = await res.json();
      expect(data.reference).toContain("الم");
    });
  });
});
