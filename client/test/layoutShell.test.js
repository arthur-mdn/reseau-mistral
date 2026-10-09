import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('layout shell', () => {
    it('locks viewport height and paints bottom safe-area white via navbar', () => {
        const css = readFileSync(join(root, 'src/index.css'), 'utf8');
        assert.match(css, /--bottom-bar-height:\s*calc\(66px \+ env\(safe-area-inset-bottom/);
        assert.match(css, /\.bottom-bar\s*\{[^}]*safe-area-inset-bottom/s);
        assert.match(css, /\.bottom-bar\s*\{[^}]*background-color:\s*#ffffff/s);
        assert.match(css, /html\s*\{[^}]*100dvh/s);
        assert.match(css, /body\s*\{[^}]*overflow:\s*hidden/s);
        assert.match(css, /\.page-lock-scroll\s*\{[^}]*overflow:\s*hidden/s);
        assert.match(css, /\.page-scroll\s*\{[^}]*overflow:\s*hidden/s);
    });

    it('uses sticky page shells on horaires and trafic', () => {
        const horaires = readFileSync(join(root, 'src/pages/Horaires.jsx'), 'utf8');
        const trafic = readFileSync(join(root, 'src/pages/Trafic.jsx'), 'utf8');
        assert.match(horaires, /page-scroll/);
        assert.match(horaires, /PullToRefresh/);
        assert.match(trafic, /page-scroll/);
        assert.match(trafic, /PullToRefresh/);
        assert.match(trafic, /border:\s*'1px solid #e6e6e6'/);
    });
});
