// static/core/js/tile_loco.js
// Render 3D "tile" (rounded rectangle extruded) with Romania flag on front.
// No external textures: we paint the flag on a canvas and use it as a texture.

(function () {
    'use strict';

    if (!window.THREE) {
        console.warn('[tile_loco] THREE not loaded');
        return;
    }

    // --------- utils ----------
    function attachRenderer(container) {
        const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: true });
        r.setPixelRatio(window.devicePixelRatio || 1);
        container.appendChild(r.domElement);
        return r;
    }
    function fit(renderer, camera, container) {
        const w = container.clientWidth || 320;
        const h = container.clientHeight || w;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }
    function makeRoundedRectShape(w, h, r) {
        const x = -w / 2, y = -h / 2;
        const s = new THREE.Shape();
        const rr = Math.min(r, w / 2, h / 2);
        s.moveTo(x + rr, y);
        s.lineTo(x + w - rr, y);
        s.quadraticCurveTo(x + w, y, x + w, y + rr);
        s.lineTo(x + w, y + h - rr);
        s.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
        s.lineTo(x + rr, y + h);
        s.quadraticCurveTo(x, y + h, x, y + h - rr);
        s.lineTo(x, y + rr);
        s.quadraticCurveTo(x, y, x + rr, y);
        return s;
    }
    function makeFlagTexture() {
        // Romania flag painted on a canvas (blue, yellow, red)
        const W = 600, H = 400;
        const c = document.createElement('canvas'); c.width = W; c.height = H;
        const g = c.getContext('2d');
        g.fillStyle = '#002B7F'; g.fillRect(0, 0, W / 3, H);
        g.fillStyle = '#FCD116'; g.fillRect(W / 3, 0, W / 3, H);
        g.fillStyle = '#CE1126'; g.fillRect(2 * W / 3, 0, W / 3, H);
        const tx = new THREE.CanvasTexture(c);
        tx.anisotropy = 8;
        tx.generateMipmaps = true;
        tx.minFilter = THREE.LinearMipmapLinearFilter;
        tx.magFilter = THREE.LinearFilter;
        return tx;
    }

    // --------- main mount ----------
    function mountTile(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // clean old canvas if any
        while (container.firstChild && container.firstChild.tagName === 'CANVAS') {
            container.removeChild(container.firstChild);
        }

        const renderer = attachRenderer(container);
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
        camera.position.set(0, 0, 7);

        // lights: ambient + key light + rim
        scene.add(new THREE.AmbientLight(0xffffff, 0.55));
        const key = new THREE.DirectionalLight(0xffffff, 0.9);
        key.position.set(2.2, 2.4, 4.0);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x9bbcff, 0.35);
        rim.position.set(-2.0, -1.5, -3.0);
        scene.add(rim);

        const group = new THREE.Group();
        scene.add(group);

        // base: rounded rectangle extruded (the white tile)
        const tileW = 4.6, tileH = 3.6, tileD = 0.7, radius = 0.55;
        const shape = makeRoundedRectShape(tileW, tileH, radius);
        const geoTile = new THREE.ExtrudeGeometry(shape, {
            depth: tileD, bevelEnabled: false, steps: 1
        });
        geoTile.rotateX(Math.PI); // orient face forward
        const matTile = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            roughness: 0.35, metalness: 0.0, clearcoat: 0.6, clearcoatRoughness: 0.5,
            envMapIntensity: 0.2
        });
        const meshTile = new THREE.Mesh(geoTile, matTile);
        meshTile.position.z = -tileD / 2; // center it around z=0
        group.add(meshTile);

        // front face: slightly raised plane with the flag texture
        const flagTex = makeFlagTexture();
        const flagGeo = new THREE.PlaneGeometry(tileW * 0.78, tileH * 0.62, 1, 1);
        const flagMat = new THREE.MeshBasicMaterial({ map: flagTex, transparent: false });
        const flag = new THREE.Mesh(flagGeo, flagMat);
        flag.position.set(0, 0, 0.36); // a bit over the front
        group.add(flag);

        // subtle inner shadow/overlay
        const glass = new THREE.Mesh(
            new THREE.PlaneGeometry(tileW * 0.80, tileH * 0.64),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.07 })
        );
        glass.position.set(0, 0, 0.37);
        group.add(glass);

        // small ground shadow (fake)
        const shadow = new THREE.Mesh(
            new THREE.PlaneGeometry(tileW * 0.9, tileH * 0.3),
            new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 })
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.set(0, -tileH * 0.62, -0.2);
        group.add(shadow);

        // initial tilt
        group.rotation.x = -0.14;
        group.rotation.y = 0.28;

        // hover tilt by pointer
        let targetRX = group.rotation.x, targetRY = group.rotation.y;
        function onPointerMove(e) {
            const rect = renderer.domElement.getBoundingClientRect();
            const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
            targetRY = 0.35 * nx;
            targetRX = -0.15 + (-0.25 * ny);
        }
        renderer.domElement.addEventListener('pointermove', onPointerMove);

        // resize
        function resize() { fit(renderer, camera, container); }
        window.addEventListener('resize', resize);
        resize();

        // animate
        let t = 0;
        (function animate() {
            requestAnimationFrame(animate);
            t += 0.01;
            // subtle idle wobble
            const wobY = Math.sin(t * 0.7) * 0.02;
            group.rotation.y += (targetRY - group.rotation.y) * 0.08 + wobY;
            group.rotation.x += (targetRX - group.rotation.x) * 0.08;
            renderer.render(scene, camera);
        })();
    }

    function init() {
        mountTile('tile-loco'); // left tile (LOCO)
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
