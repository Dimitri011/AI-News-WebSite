// static/core/js/chat.js
// Fixed-size chat body with real vertical scroll; page scroll is blocked while scrolling inside chat.

(function () {
    var root = document.getElementById('tgchat');
    if (!root) return;

    var body = document.getElementById('tgchat_body');
    var stream = document.getElementById('tgchat_stream');
    var form = document.getElementById('tgchat_form');
    var input = document.getElementById('tgchat_input');
    var closeB = document.getElementById('tgchat_close');
    var bd = document.getElementById('tgchat_backdrop');
    var state = document.getElementById('tgchat_state');
    var fab = document.getElementById('tgchatFab');

    // Ensure body is focusable for better wheel behavior
    if (body && !body.hasAttribute('tabindex')) body.setAttribute('tabindex', '0');

    var history = []; // { role:'user'|'assistant', content:string }

    function setState(s) { if (state) state.textContent = s; }
    function openChat() {
        root.classList.remove('tgchat--closed');
        root.classList.add('tgchat--open');
        localStorage.setItem('tgchat_open', '1');
        setTimeout(function () { input && input.focus(); }, 50);
    }
    function closeChat() {
        root.classList.remove('tgchat--open');
        root.classList.add('tgchat--closed');
        localStorage.setItem('tgchat_open', '0');
    }

    if (fab) fab.addEventListener('click', openChat);
    if (closeB) closeB.addEventListener('click', closeChat);
    if (bd) bd.addEventListener('click', closeChat);

    if (localStorage.getItem('tgchat_open') === '1') openChat();

    function addMsg(txt, who) {
        var div = document.createElement('div');
        div.className = 'tgchat__msg tgchat__msg--' + (who || 'sys');
        div.textContent = txt;
        stream.appendChild(div);
        // autoscroll ONLY inside chat body
        body.scrollTop = body.scrollHeight;
    }
    function asciiOnly(s) { return (s || '').normalize('NFKD').replace(/[^\x00-\x7F]/g, ''); }

    if (form) form.addEventListener('submit', function (e) {
        e.preventDefault();
        var msg = (input.value || '').trim();
        if (!msg) return;

        addMsg(msg, 'user');
        history.push({ role: 'user', content: msg });
        input.value = '';

        setState('typing...');

        fetch('/api/chat/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg, history: history })
        })
            .then(function (r) { return r.json(); })
            .then(function (j) {
                if (j && j.reply) {
                    var reply = asciiOnly(j.reply);
                    addMsg(reply, 'bot');
                    history.push({ role: 'assistant', content: reply });
                    setState('ready');
                } else if (j && j.error) {
                    addMsg('Eroare API: ' + JSON.stringify(j), 'sys');
                    setState('error');
                } else {
                    addMsg('Eroare necunoscuta.', 'sys');
                    setState('error');
                }
            })
            .catch(function (err) {
                addMsg('Eroare retea: ' + (err && err.message ? err.message : err), 'sys');
                setState('error');
            });
    });

    if (input) input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            form && form.dispatchEvent(new Event('submit'));
        }
    });

    /* ===== Lock scroll to chat body ===== */
    if (body) {
        function canScroll(el) { return el.scrollHeight > el.clientHeight + 1; }

        function onWheel(e) {
            // if not scrollable, allow page scroll
            if (!canScroll(body)) return;
            var delta = e.deltaY || -e.wheelDelta || e.detail || 0;
            var up = delta < 0;
            var atTop = body.scrollTop <= 0;
            var atBottom = body.scrollTop + body.clientHeight >= body.scrollHeight - 1;

            // When at edges, still prevent page from stealing the wheel
            if ((up && atTop) || (!up && atBottom)) e.preventDefault();
            // Always stop bubbling out of chat
            e.stopPropagation();
        }

        var startY = 0;
        function onTouchStart(e) { startY = e.touches[0].clientY; }
        function onTouchMove(e) {
            if (!canScroll(body)) return;
            var dy = startY - e.touches[0].clientY;
            var up = dy < 0;
            var atTop = body.scrollTop <= 0;
            var atBottom = body.scrollTop + body.clientHeight >= body.scrollHeight - 1;

            if ((up && atTop) || (!up && atBottom)) e.preventDefault();
            e.stopPropagation();
        }

        // Attach to body AND to the inner stream (for safety)
        [body, stream].forEach(function (el) {
            if (!el) return;
            el.addEventListener('wheel', onWheel, { passive: false });
            el.addEventListener('touchstart', onTouchStart, { passive: true });
            el.addEventListener('touchmove', onTouchMove, { passive: false });
        });
    }
})();
