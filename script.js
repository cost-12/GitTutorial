// /c:/Users/IFMA/GitTutorial/script.js
// GitHub Copilot
// Carrega README.md, converte Markdown para HTML e monta layout simples
(function () {
    const README_PATHS = ['/README.md', '/README.MD', '/readme.md', '/readme.MD', 'README.md'];

    // Injetar estilo básico
    const style = document.createElement('style');
    style.textContent = `
        :root{--bg:#0f1724;--card:#0b1220;--text:#e6eef8;--muted:#9fb0d1}
        body{margin:0;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial;background:var(--bg);color:var(--text);}
        .site{max-width:1000px;margin:28px auto;padding:24px;background:linear-gradient(180deg,rgba(255,255,255,0.02),transparent);border-radius:12px;box-shadow:0 6px 24px rgba(2,6,23,0.6)}
        header{display:flex;align-items:center;gap:12px;margin-bottom:18px}
        header img{width:56px;height:56px;border-radius:8px;object-fit:cover}
        header h1{margin:0;font-size:1.6rem}
        header p{margin:0;color:var(--muted);font-size:0.95rem}
        .meta{display:flex;gap:12px;flex-wrap:wrap;margin-top:8px;color:var(--muted);font-size:0.9rem}
        .content{margin-top:18px;line-height:1.6}
        .content img{max-width:100%}
        pre{background:#071324;padding:12px;border-radius:8px;overflow:auto}
        code{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace}
        nav.toc{margin-top:6px;padding:12px;border-radius:8px;background:rgba(255,255,255,0.02);color:var(--muted)}
        .controls{margin-left:auto;display:flex;gap:8px}
        .btn{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.03);padding:6px 10px;border-radius:8px;color:var(--text);cursor:pointer}
        @media(max-width:640px){.site{margin:12px;padding:16px}}
    `;
    document.head.appendChild(style);

    // Criar estrutura básica se não existir
    let app = document.querySelector('.site');
    if (!app) {
        app = document.createElement('main');
        app.className = 'site';
        document.body.appendChild(app);
    }

    // Header placeholder
    app.innerHTML = `
        <header>
            <div style="width:56px;height:56px;border-radius:8px;background:linear-gradient(135deg,#1e3a8a,#2563eb)"></div>
            <div style="flex:1">
                <h1>README</h1>
                <p>Gerado automaticamente a partir do README.md</p>
                <div class="meta"></div>
            </div>
            <div class="controls">
                <button class="btn" id="toggle-theme">Toggle Theme</button>
                <a class="btn" id="raw-link" target="_blank" rel="noopener">Abrir README</a>
            </div>
        </header>
        <nav class="toc" id="toc">Carregando sumário...</nav>
        <article class="content" id="content">Carregando README.md …</article>
    `;

    // Theme toggle (light/dark)
    const toggleBtn = document.getElementById('toggle-theme');
    toggleBtn.addEventListener('click', () => {
        if (document.documentElement.hasAttribute('data-light')) {
            document.documentElement.removeAttribute('data-light');
            document.documentElement.style.setProperty('--bg', '#0f1724');
            document.documentElement.style.setProperty('--card', '#0b1220');
            document.documentElement.style.setProperty('--text', '#e6eef8');
            document.documentElement.style.setProperty('--muted', '#9fb0d1');
        } else {
            document.documentElement.setAttribute('data-light', '1');
            document.documentElement.style.setProperty('--bg', '#f6fbff');
            document.documentElement.style.setProperty('--card', '#fff');
            document.documentElement.style.setProperty('--text', '#071633');
            document.documentElement.style.setProperty('--muted', '#475569');
        }
    });

    // Carrega script externo (marked + hljs) de forma idempotente
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) return resolve();
            const s = document.createElement('script');
            s.src = src;
            s.async = true;
            s.onload = () => resolve();
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    function loadStyle(href) {
        if (document.querySelector(`link[href="${href}"]`)) return;
        const l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = href;
        document.head.appendChild(l);
    }

    // Tenta localizar README em alguns caminhos comuns
    async function findReadme() {
        for (const p of README_PATHS) {
            try {
                const res = await fetch(p);
                if (res.ok) return { path: p, text: await res.text() };
            } catch (e) {
                // ignora e tenta próximo
            }
        }
        // fallback: tentar raiz relativa
        try {
            const res = await fetch(location.pathname.replace(/\/?$/, '') + '/README.md');
            if (res.ok) return { path: res.url, text: await res.text() };
        } catch (e) {}
        return null;
    }

    // Gera sumário simples a partir dos headings
    function buildToc(container, root) {
        const headings = root.querySelectorAll('h1,h2,h3');
        if (!headings.length) {
            container.textContent = 'Nenhum título encontrado no README.';
            return;
        }
        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        ul.style.margin = 0;
        ul.style.padding = 0;
        headings.forEach(h => {
            if (!h.id) h.id = h.textContent.trim().toLowerCase().replace(/[^\w]+/g, '-');
            const li = document.createElement('li');
            li.style.margin = h.tagName === 'H1' ? '8px 0' : '4px 0 4px 12px';
            const a = document.createElement('a');
            a.href = '#' + h.id;
            a.textContent = h.textContent;
            a.style.color = 'inherit';
            a.style.textDecoration = 'none';
            a.style.opacity = h.tagName === 'H1' ? '1' : '0.85';
            li.appendChild(a);
            ul.appendChild(li);
        });
        container.innerHTML = '';
        container.appendChild(ul);
    }

    // Main flow
    (async function main() {
        const found = await findReadme();
        const rawLink = document.getElementById('raw-link');
        const content = document.getElementById('content');
        const toc = document.getElementById('toc');

        if (!found) {
            content.innerHTML = '<p>README.md não encontrado no servidor.</p>';
            toc.textContent = '';
            rawLink.style.display = 'none';
            return;
        }

        rawLink.href = found.path;

        // carregar dependências
        try {
            await loadScript('https://cdn.jsdelivr.net/npm/marked/marked.min.js');
            await loadScript('https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.8.0/build/highlight.min.js');
            loadStyle('https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.8.0/build/styles/github-dark.min.css');
        } catch (e) {
            // dependências falharam; ainda tentamos um render mínimo
        }

        let md = found.text;

        // Se marked estiver disponível, usa-o; caso contrário, faz conversão mínima
        let html;
        if (window.marked) {
            // Configuração segura básica
            marked.setOptions({ breaks: true, gfm: true });
            html = marked.parse(md);
        } else {
            // conversor mínimo: apenas paragraphs e headings
            html = md
                .split(/\n\s*\n/)
                .map(block => {
                    if (/^#{1,6}\s/.test(block)) {
                        return block
                            .split('\n')
                            .map(l => {
                                const m = l.match(/^(#{1,6})\s+(.*)$/);
                                if (m) {
                                    const level = m[1].length;
                                    return `<h${level}>${escapeHtml(m[2])}</h${level}>`;
                                }
                                return `<p>${escapeHtml(l)}</p>`;
                            })
                            .join('');
                    }
                    return `<p>${escapeHtml(block).replace(/\n/g, '<br>')}</p>`;
                })
                .join('');
        }

        content.innerHTML = html;
        buildToc(toc, content);

        // Syntax highlight se disponível
        if (window.hljs && window.hljs.highlightAll) {
            window.hljs.highlightAll();
        }

        // pequenas melhorias: abrir links em nova aba
        content.querySelectorAll('a').forEach(a => {
            if (a.hostname && a.hostname !== location.hostname) {
                a.target = '_blank';
                a.rel = 'noopener';
            }
        });
    })();

    // util
    function escapeHtml(s) {
        return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
})();