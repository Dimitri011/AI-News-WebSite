// static/core/js/prochat.js
// Production chat bubble (ASCII only) that calls your backend /api/chat.
// Waits for DOM ready, logs clear markers, and fails silently if API missing.

(function () {
    "use strict";

    // ---- dom ready helper ----
    function onReady(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn, { once: true });
        } else {
            fn();
        }
    }

    // ---- ascii sanitizer ----
    function ascii(s) {
        return (s || "").toString().normalize("NFKD").replace(/[^\x00-\x7F]/g, "");
    }

    onReady(function () {
        try {
            console.log("[prochat] init v3");

            // ---- inject styles ----
            const css = `
      .pc-bubble{position:fixed;right:18px;bottom:18px;width:54px;height:54px;border-radius:50%;
        display:grid;place-items:center;background:#111;border:1px solid #2a2a2a;color:#fff;
        box-shadow:0 8px 28px rgba(0,0,0,.4);cursor:pointer;z-index:9999}
      .pc-bubble:hover{background:#1a1a1a}
      .pc-panel{position:fixed;right:18px;bottom:84px;width:min(420px,94vw);height:60vh;max-height:640px;
        border:1px solid #252525;background:#0b0b0b;color:#fff;border-radius:14px;
        box-shadow:0 18px 40px rgba(0,0,0,.55);display:none;flex-direction:column;overflow:hidden;z-index:9999}
      .pc-panel.open{display:flex}
      .pc-head{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid #1a1a1a;background:#101010}
      .pc-head strong{font-size:14px}
      .pc-body{flex:1;overflow:auto;padding:10px 12px;display:flex;flex-direction:column;gap:10px}
      .pc-msg{line-height:1.55;font-size:14px;background:#111;border:1px solid #1d1d1d;padding:8px 10px;border-radius:10px;white-space:pre-wrap}
      .pc-msg.user{background:#121212;border-color:#2b2b2b}
      .pc-foot{display:flex;gap:8px;padding:10px 12px;border-top:1px solid #1a1a1a;background:#0f0f0f}
      .pc-inp{flex:1;min-height:42px;max-height:120px;resize:vertical;border-radius:10px;border:1px solid #2a2a2a;background:#0a0a0a;color:#fff;padding:8px}
      .pc-btn{border:0;border-radius:10px;background:#1f6feb;color:#fff;padding:9px 12px;font-weight:600;cursor:pointer}
      .pc-btn:disabled{opacity:.6;cursor:not-allowed}
      .pc-hint{opacity:.75;font-size:12px;margin-left:auto}
      @media (max-width:768px){.pc-panel{height:55vh}.pc-bubble{right:12px;bottom:12px}}
      `;
            const style = document.createElement("style");
            style.textContent = css;
            document.head.appendChild(style);

            // ---- UI elements ----
            const bubble = document.createElement("button");
            bubble.className = "pc-bubble";
            bubble.title = "Chat AI";
            bubble.setAttribute("aria-label", "Deschide chat AI");
            bubble.innerHTML =
                '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2zM6 9h12v2H6V9zm0-4h12v2H6V5zm0 8h8v2H6v-2z"/></svg>';
            document.body.appendChild(bubble);

            const panel = document.createElement("div");
            panel.className = "pc-panel";
            panel.innerHTML = [
                '<div class="pc-head">',
                '  <strong>Telegrame Chat</strong>',
                '  <span class="pc-hint" id="pcStatus">ready</span>',
                '  <button id="pcClose" class="pc-btn" style="margin-left:auto;background:#333">x</button>',
                '</div>',
                '<div class="pc-body" id="pcBody">',
                '  <div class="pc-msg">Salut! Eu raspund prin serverul tau. Intreaba-ma ceva.</div>',
                '</div>',
                '<div class="pc-foot">',
                '  <textarea id="pcInput" class="pc-inp" placeholder="Scrie mesajul... (Shift+Enter = linie noua)"></textarea>',
                '  <button id="pcSend" class="pc-btn">Trimite</button>',
                '</div>'
            ].join("");
            document.body.appendChild(panel);

            const $ = (sel) => panel.querySelector(sel);
            const body = $("#pcBody");
            const inp = $("#pcInput");
            const sendBtn = $("#pcSend");
            const statusEl = $("#pcStatus");

            let history = []; // short in-memory history

            function setStatus(s) { statusEl.textContent = s; }

            function addMsg(text, who) {
                const div = document.createElement("div");
                div.className = "pc-msg" + (who === "user" ? " user" : "");
                div.textContent = ascii(text);
                body.appendChild(div);
                body.scrollTop = body.scrollHeight;
                return div;
            }

            async function ask() {
                const text = (inp.value || "").trim();
                if (!text) return;
                inp.value = "";
                addMsg(text, "user");
                sendBtn.disabled = true;
                setStatus("sending");

                try {
                    const res = await fetch("/api/chat/", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ message: text, history: history.slice(-6) })
                    });
                    if (!res.ok) {
                        const err = await res.text();
                        addMsg("Eroare API: " + err.slice(0, 120), "bot");
                        setStatus("error");
                    } else {
                        const j = await res.json();
                        if (j.reply) {
                            addMsg(j.reply, "bot");
                            history.push({ role: "user", content: ascii(text) });
                            history.push({ role: "assistant", content: ascii(j.reply) });
                            setStatus("ready");
                        } else {
                            addMsg("Eroare: reply lipsa", "bot");
                            setStatus("error");
                        }
                    }
                } catch (e) {
                    addMsg("Network error: " + String(e).slice(0, 120), "bot");
                    setStatus("error");
                } finally {
                    sendBtn.disabled = false;
                }
            }

            function toggle(open) {
                const on = open ?? !panel.classList.contains("open");
                panel.classList.toggle("open", on);
                if (on) setTimeout(() => inp && inp.focus(), 80);
            }

            bubble.addEventListener("click", () => toggle(true));
            $("#pcClose").addEventListener("click", () => toggle(false));
            sendBtn.addEventListener("click", ask);
            inp.addEventListener("keydown", (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    ask();
                }
            });

            console.log("[prochat] ready");
        } catch (err) {
            // don't break the page if something goes wrong
            console.error("[prochat] failed to init", err);
        }
    });
})();
