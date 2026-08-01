// Dependencies are loaded globally via <script> tags in index.html

// --------------------------------------------------------
// 1. Lenis Smooth Scroll Setup
// --------------------------------------------------------
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// --------------------------------------------------------
// 2. GSAP Animations
// --------------------------------------------------------
gsap.registerPlugin(ScrollTrigger);

// Reveal Texts
const revealElements = document.querySelectorAll('.reveal-text');
revealElements.forEach((el) => {
    gsap.to(el, {
        scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none reverse"
        },
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        onComplete: () => {
            el.style.willChange = 'auto';
        }
    });
});

// Reveal Lists
const revealLists = document.querySelectorAll('.reveal-items');
revealLists.forEach((list) => {
    const items = list.children;
    gsap.to(items, {
        scrollTrigger: {
            trigger: list,
            start: "top 85%",
            toggleActions: "play none none reverse"
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        onComplete: () => {
            Array.from(items).forEach(item => item.style.willChange = 'auto');
        }
    });
});

// --------------------------------------------------------
// 3. Three.js Abstract Object
// --------------------------------------------------------
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();

// Camera
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 6;
scene.add(camera);

// Object (Abstract Icosahedron)
const geometry = new THREE.IcosahedronGeometry(1.5, 1);
const posAttribute = geometry.attributes.position;
for(let i = 0; i < posAttribute.count; i++) {
    const vertex = new THREE.Vector3();
    vertex.fromBufferAttribute(posAttribute, i);
    vertex.normalize();
    vertex.multiplyScalar(1.5 + Math.random() * 0.2); // slight noise for organic feel
    posAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
}
geometry.computeVertexNormals();

const material = new THREE.MeshBasicMaterial({ 
    color: 0xffffff, 
    wireframe: true,
    transparent: true,
    opacity: 0.15
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Move object slightly to the right on desktop
if (window.innerWidth > 768) {
    mesh.position.x = 1.5;
}

// Mouse interaction
const mouse = new THREE.Vector2(0, 0);
const target = new THREE.Vector2(0, 0);
const windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);

document.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX - windowHalf.x);
    mouse.y = (event.clientY - windowHalf.y);
});

// Scroll interaction for 3D object
let scrollY = window.scrollY;
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
});

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Handle Resize
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    windowHalf.x = sizes.width / 2;
    windowHalf.y = sizes.height / 2;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    if (window.innerWidth > 768) {
        mesh.position.x = 1.5;
    } else {
        mesh.position.x = 0;
    }

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Animation Loop
const clock = new THREE.Clock();

function tick() {
    const elapsedTime = clock.getElapsedTime();

    // Base slow rotation
    mesh.rotation.y = elapsedTime * 0.1;
    mesh.rotation.x = elapsedTime * 0.05;

    // Mouse movement interaction (easing)
    target.x = mouse.x * 0.001;
    target.y = mouse.y * 0.001;
    
    mesh.rotation.y += 0.05 * (target.x - mesh.rotation.y);
    mesh.rotation.x += 0.05 * (target.y - mesh.rotation.x);

    // Scroll influence
    mesh.position.y = -scrollY * 0.001;

    renderer.render(scene, camera);
}

// Bind Three.js render to GSAP ticker so they share the same requestAnimationFrame
gsap.ticker.add(tick);

// Intersection Observer to pause rendering when hero is not visible
const heroSection = document.getElementById('hero');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            gsap.ticker.add(tick);
        } else {
            gsap.ticker.remove(tick);
        }
    });
}, { threshold: 0 });

observer.observe(heroSection);
