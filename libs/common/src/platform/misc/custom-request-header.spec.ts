import { validateCustomRequestHeader, isAllowedCustomHeaderName } from "./custom-request-header";

describe("custom-request-header", () => {
  describe("isAllowedCustomHeaderName", () => {
    it("accepts RFC 7230 token names", () => {
      expect(isAllowedCustomHeaderName("X-Auth-Token")).toBe(true);
      expect(isAllowedCustomHeaderName("cf-access-client-id")).toBe(true);
      expect(isAllowedCustomHeaderName("X_Custom.1~2")).toBe(true);
    });
    it("rejects non-token names and empties", () => {
      expect(isAllowedCustomHeaderName("")).toBe(false);
      expect(isAllowedCustomHeaderName("Bad Name")).toBe(false);
      expect(isAllowedCustomHeaderName("Bad:Name")).toBe(false);
      expect(isAllowedCustomHeaderName("a".repeat(129))).toBe(false);
    });
    it("rejects blocklisted names case-insensitively", () => {
      for (const n of [
        "Host",
        "content-length",
        "Cookie",
        "Authorization",
        "Device-Type",
        "Bitwarden-Client-Name",
        "Is-Prerelease",
        "User-Agent",
        "Content-Type",
        "Proxy-X",
        "Sec-Foo",
      ]) {
        expect(isAllowedCustomHeaderName(n)).toBe(false);
      }
    });
  });

  describe("validateCustomRequestHeader", () => {
    it("accepts a valid pair and trims the value", () => {
      const r = validateCustomRequestHeader({ name: "X-Auth", value: "  secret  " });
      expect(r.valid).toBe(true);
      if (r.valid) {expect(r.header).toEqual({ name: "X-Auth", value: "secret" });}
    });
    it("rejects half-configured pairs", () => {
      expect(validateCustomRequestHeader({ name: "X-Auth", value: "" }).valid).toBe(false);
      expect(validateCustomRequestHeader({ name: "", value: "secret" }).valid).toBe(false);
    });
    it("rejects control characters and CR/LF", () => {
      for (const v of ["a\r\nb", "a\nb", "a\rb", "a\u0000b", "a\tb"]) {
        expect(validateCustomRequestHeader({ name: "X-Auth", value: v }).valid).toBe(false);
      }
    });
    it("rejects non-ASCII and over-length values", () => {
      expect(validateCustomRequestHeader({ name: "X-Auth", value: "café" }).valid).toBe(false);
      expect(validateCustomRequestHeader({ name: "X-Auth", value: "a".repeat(4097) }).valid).toBe(
        false,
      );
    });
    it("rejects invalid names", () => {
      expect(validateCustomRequestHeader({ name: "Host", value: "x" }).valid).toBe(false);
    });
  });
});
