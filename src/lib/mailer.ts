import net from "net";
import crypto from "crypto";

// Dependency-free local SMTP sender. Speaks plain SMTP over 127.0.0.1:25 to the
// Postfix relay that ships on this VPS. No nodemailer, no external provider —
// fully local-first, matching the Godseye VPS deployment.
export type MailResult = { ok: boolean; error?: string; size?: number };

export interface MailOptions {
  from?: string;
  fromName?: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const DEFAULT_FROM = "Godseye <noreply@godseye.digitalhustlerx.com>";

function sanitize(val: string): string {
  // Strip CR/LF to prevent header injection through user-supplied fields.
  return String(val).replace(/[\r\n]+/g, " ").trim();
}

export async function sendMail(opts: MailOptions, host = "127.0.0.1", port = 25): Promise<MailResult> {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(opts.to)) {
    return { ok: false, error: "Invalid recipient email" };
  }
  const from = sanitize(opts.from && opts.fromName
    ? `${opts.fromName} <${opts.from}>`
    : opts.from && !opts.fromName
      ? opts.from
      : DEFAULT_FROM);
  const to = sanitize(opts.to);
  const subject = sanitize(opts.subject);

  const boundary = `----=_godseye_${crypto.randomBytes(8).toString("hex")}`;
  const text = String(opts.text || "");
  const html = opts.html;
  let bodyParts = "";
  if (html) {
    bodyParts = `Content-Type: multipart/alternative; boundary="${boundary}"\r\n\r\n` +
      `--${boundary}\r\nContent-Type: text/plain; charset="utf-8"\r\nContent-Transfer-Encoding: 8bit\r\n\r\n${text}\r\n\r\n` +
      `--${boundary}\r\nContent-Type: text/html; charset="utf-8"\r\nContent-Transfer-Encoding: 8bit\r\n\r\n${html}\r\n\r\n` +
      `--${boundary}--\r\n`;
  } else {
    bodyParts = `Content-Type: text/plain; charset="utf-8"\r\nContent-Transfer-Encoding: 8bit\r\n\r\n${text}\r\n`;
  }

  const data =
    `From: ${from}\r\n` +
    `To: ${to}\r\n` +
    `Subject: ${subject}\r\n` +
    `Date: ${new Date().toUTCString()}\r\n` +
    `Message-ID: <${crypto.randomBytes(12).toString("hex")}@godseye.digitalhustlerx.com>\r\n` +
    `MIME-Version: 1.0\r\n` +
    bodyParts +
    `.\r\n`;

  return new Promise<MailResult>((resolve) => {
    let buffer = "";
    let step = 0;
    let sentBytes = 0;
    const sock = net.connect({ host, port });
    const timeout = setTimeout(() => sock.destroy(), 15000);

    const error = (msg: string) => {
      clearTimeout(timeout);
      sock.destroy();
      resolve({ ok: false, error: msg });
    };

    sock.on("error", (e) => error(`SMTP connection error: ${e.message}`));

    sock.on("data", (chunk) => {
      buffer += chunk.toString("utf8");
      // Wait for a bare newline (possible multiple responses in one chunk).
      while (/\r?\n/.test(buffer)) {
        const line = buffer.slice(0, buffer.search(/\r?\n/));
        buffer = buffer.slice(buffer.search(/\r?\n/) + (buffer[0] === "\r" && buffer[1] === "\n" ? 2 : 1));
        const code = parseInt(line.slice(0, 3), 10);

        if (code === 220 && step === 0) {
          step = 1;
          sock.write("EHLO godseye.digitalhustlerx.com\r\n");
        } else if (step === 1 && code === 250) {
          step = 2;
          sock.write(`MAIL FROM:<noreply@godseye.digitalhustlerx.com>\r\n`);
        } else if (step === 2 && code === 250) {
          step = 3;
          sock.write(`RCPT TO:<${to}>\r\n`);
        } else if (step === 3 && code === 250) {
          step = 4;
          sock.write("DATA\r\n");
        } else if (step === 4 && code === 354) {
          step = 5;
          sentBytes = Buffer.byteLength(data, "utf8");
          sock.write(data);
        } else if (step === 5 && code === 250) {
          clearTimeout(timeout);
          sock.write("QUIT\r\n");
          sock.end();
          resolve({ ok: true, size: sentBytes });
        } else if (code >= 400) {
          error(`SMTP error (${code}): ${line}`);
        }
      }
    });
  });
}
