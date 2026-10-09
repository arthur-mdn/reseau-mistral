import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('ios chrome', () => {
    it('uses opaque apple status bar and viewport-fit cover', () => {
        const html = readFileSync(join(root, 'index.html'), 'utf8');
        assert.match(html, /viewport-fit=cover/);
        assert.match(html, /maximum-scale=1/);
        assert.match(html, /user-scalable=no/);
        assert.match(html, /apple-mobile-web-app-status-bar-style" content="black"/);
        assert.doesNotMatch(html, /black-translucent/);
        assert.match(html, /theme-color" content="#1B1F9C"/);
    });

    it('reserves safe-area padding for top bars and forces scan cover preview', () => {
        const css = readFileSync(join(root, 'src/index.css'), 'utf8');
        assert.match(css, /\.header-top\s*\{[^}]*safe-area-inset-top/s);
        assert.match(css, /\.over_top_menu\s*\{[^}]*safe-area-inset-top/s);
        assert.match(css, /\.scan-preview-video\s*\{[^}]*object-fit:\s*cover\s*!important/s);
        assert.doesNotMatch(css, /\.scan-preview-video\s*\{[^}]*object-fit:\s*contain/s);
    });

    it('uses a fixed solid top fill to kill iOS PWA status blur', () => {
        const css = readFileSync(join(root, 'src/index.css'), 'utf8');
        const app = readFileSync(join(root, 'src/App.jsx'), 'utf8');
        assert.match(css, /\.ios-status-fill\s*\{[^}]*position:\s*fixed/s);
        assert.match(css, /\.ios-status-fill\s*\{[^}]*background-color:\s*#1B1F9C/s);
        assert.match(css, /\.ios-status-fill\s*\{[^}]*safe-area-inset-top/s);
        assert.match(app, /ios-status-fill/);
        assert.match(css, /html\s*\{[^}]*background-color:\s*#1B1F9C/s);
    });
});
