// static/core/js/globe_tile.js
// Tile 3D alb cu steagul Romaniei pe fa?? (pentru containerul #tile_loco)

(function () {
    'use strict';
    if (!window.THREE) {
        console.warn('[tile] THREE nu este inc?rcat.');
        return;
    }

    // ---------- helpers ----------
    function attachRenderer(container) {
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        try { renderer.outputColorSpace = THREE.SRGBColorSpace; } catch (e) { }
        renderer.setPixelRatio(window.devicePixelRatio || 1);
        container.appendChild(renderer.domElement);
        return renderer;
    }

    function fit(renderer, camera, container) {
        const w = container.clientWidth || 320;
        const h = container.clientHeight || w;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }

    // creeaz? un CanvasTexture cu tricolor RO
    function makeRomaniaFlagTexture() {
        const w = 600, h = 380;
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const g = c.getContext('2d');

        // culori oficiale aprox
        const BLUE = '#002B7F';
        const YELLOW = '#FCD116';
        const RED = '#CE1126';

        const stripe = Math.floor(w / 3);
        g.fillStyle = BLUE; g.fillRect(0, 0, stripe, h);
        g.fillStyle = YELLOW; g.fillRect(stripe, 0, stripe, h);
        g.fillStyle = RED; g.fillRect(stripe * 2, 0, stripe, h);

        const tex = new THREE.CanvasTexture(c);
        try { tex.colorSpace = THREE.SRGBColorSpace; } catch (e) { }
        tex.anisotropy = 4;
        tex.needsUpdate = true;
        return tex;
    }

    // ---------- tile ----------
    function mountTile(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        while (container.firstChild && container.firstChild.tagName === 'CANVAS') {
            container.removeChild(container.firstChild);
        }

        const renderer = attachRenderer(container);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        camera.position.set(0, 0.15, 3.2);

        // lumini  alb plastic
        const amb = new THREE.AmbientLight(0xffffff, 0.85);
        const key = new THREE.DirectionalLight(0xffffff, 1.15);
        key.position.set(2, 3, 4);
        const rim = new THREE.DirectionalLight(0xffffff, 0.6);
        rim.position.set(-2, 1.5, -2);
        scene.add(amb, key, rim);

        const group = new THREE.Group();
        scene.add(group);

        // dimensiuni tile (mai MIC decat inainte)
        const W = 1.55, H = 1.10, D = 0.22;

        // incerc?m RoundedBoxGeometry dac? exist?, altfel BoxGeometry simplu
        let geom;
        if (THREE.RoundedBoxGeometry) {
            geom = new THREE.RoundedBoxGeometry(W, H, D, 4, 0.12);
        } else {
            geom = new THREE.BoxGeometry(W, H, D, 1, 1, 1);
        }

        const whiteMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,          // ALB
            roughness: 0.45,
            metalness: 0.0,
            clearcoat: 1.0,
            clearcoatRoughness: 0.2,
            sheen: 0.0
        });

        const tile = new THREE.Mesh(geom, whiteMat);
        // pu?in mai mic pe mobil
        const baseScale = (Math.min(container.clientWidth, container.clientHeight) < 520) ? 0.9 : 1.0;
        tile.scale.set(baseScale, baseScale, baseScale);
        group.add(tile);

        // steag  mai mic, clar vizibil (nu acoper? toat? fa?a)
        const flagTex = makeRomaniaFlagTexture();
        const flagW = W * 0.70;      // 70% din l??imea fe?ei
        const flagH = H * 0.48;      // 48% din in?l?imea fe?ei
        const flag = new THREE.Mesh(
            new THREE.PlaneGeometry(flagW, flagH),
            new THREE.MeshBasicMaterial({ map: flagTex, transparent: false })
        );
        flag.position.set(0, 0.02, D / 2 + 0.002);  // u?or in fa?a fe?ei
        flag.renderOrder = 5;
        group.add(flag);

        // shadow fake discret sub tile
        const shGeo = new THREE.PlaneGeometry(2.2, 0.5);
        const shMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 });
        const shadow = new THREE.Mesh(shGeo, shMat);
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.set(0, -H * 0.70, -0.1);
        group.add(shadow);

        // pozi?ie + anima?ie
        group.rotation.set(0.03, 0.42, 0.0);

        function resize() { fit(renderer, camera, container); }
        window.addEventListener('resize', resize);
        resize();

        (function animate() {
            requestAnimationFrame(animate);
            group.rotation.y += 0.0022; // rotire lent?
            renderer.render(scene, camera);
        })();
    }

    // ---------- init ----------
    function init() { mountTile('tile_loco'); }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
