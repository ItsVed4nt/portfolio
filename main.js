// Dependencies are loaded globally via <script> tags in index.html

// --------------------------------------------------------
// 1. Lenis Smooth Scroll Setup
// --------------------------------------------------------
const lenis = new Lenis({
    duration: 1.5,
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
// 2. GSAP Animations & Parallax
// --------------------------------------------------------
gsap.registerPlugin(ScrollTrigger);

// Reveal Texts (More elegant reveal)
const revealElements = document.querySelectorAll('.reveal-text');
revealElements.forEach((el) => {
    gsap.to(el, {
        scrollTrigger: {
            trigger: el,
            start: "top 85%", // trigger slightly earlier
            toggleActions: "play none none reverse"
        },
        y: 0,
        opacity: 1,
        duration: 1.4,
        ease: "power4.out",
        onComplete: () => {
            el.style.willChange = 'auto';
        }
    });
});

// Reveal Lists with stagger
const revealLists = document.querySelectorAll('.reveal-items');
revealLists.forEach((list) => {
    const items = list.children;
    gsap.to(items, {
        scrollTrigger: {
            trigger: list,
            start: "top 80%",
            toggleActions: "play none none reverse"
        },
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.15,
        ease: "power3.out",
        onComplete: () => {
            Array.from(items).forEach(item => item.style.willChange = 'auto');
        }
    });
});

// Scale reveal for visuals
const scaleReveals = document.querySelectorAll('.scale-reveal');
scaleReveals.forEach((el) => {
    gsap.to(el, {
        scrollTrigger: {
            trigger: el,
            start: "top 75%",
            toggleActions: "play none none reverse"
        },
        scale: 1,
        opacity: 1,
        duration: 1.5,
        ease: "expo.out",
        onComplete: () => el.style.willChange = 'auto'
    });
});

// Subtle Parallax on text elements
const parallaxElements = document.querySelectorAll('[data-speed]');
parallaxElements.forEach((el) => {
    const speed = parseFloat(el.getAttribute('data-speed'));
    gsap.to(el, {
        y: (i, target) => -ScrollTrigger.maxScroll(window) * (1 - speed) * 0.1,
        ease: "none",
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1
        }
    });
});

// Pin Project Section
ScrollTrigger.create({
    trigger: "#project-studygrid",
    start: "top top",
    end: "+=100%", // pin longer for more impact
    pin: true,
    pinSpacing: true,
    anticipatePin: 1
});


// --------------------------------------------------------
// 3. Three.js Aesthetic Background (Object + Shooting Stars)
// --------------------------------------------------------
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();

// Camera
const sizes = { width: window.innerWidth, height: window.innerHeight };
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 6;
scene.add(camera);

// 3.1 The Main Abstract Object
const geometry = new THREE.IcosahedronGeometry(1.5, 2); // more detail
const posAttribute = geometry.attributes.position;
for(let i = 0; i < posAttribute.count; i++) {
    const vertex = new THREE.Vector3();
    vertex.fromBufferAttribute(posAttribute, i);
    vertex.normalize();
    // More dramatic displacement
    vertex.multiplyScalar(1.4 + Math.random() * 0.3); 
    posAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
}
geometry.computeVertexNormals();

const material = new THREE.MeshBasicMaterial({ 
    color: 0xffffff, 
    wireframe: true,
    transparent: true,
    opacity: 0.08 // softer opacity
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

if (window.innerWidth > 768) { mesh.position.x = 1.5; }

// 3.2 Background Stars
const starsGeometry = new THREE.BufferGeometry();
const starsCount = 1200;
const posArray = new Float32Array(starsCount * 3);

for(let i = 0; i < starsCount * 3; i++) {
    // Spread stars widely
    posArray[i] = (Math.random() - 0.5) * 20; 
}
starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const starsMaterial = new THREE.PointsMaterial({
    size: 0.015,
    color: 0xffffff,
    transparent: true,
    opacity: 0.4,
});
const starMesh = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starMesh);

// 3.3 Shooting Stars
const shootingStarsCount = 8;
const shootingStarsGeometries = [];
const shootingStarsMeshes = [];

// Create a simple line geometry for the shooting stars
for (let i = 0; i < shootingStarsCount; i++) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(3); // one point for head
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    
    const mat = new THREE.PointsMaterial({
        size: 0.08,
        color: 0xffffff,
        transparent: true,
        opacity: 0
    });
    
    const star = new THREE.Points(geo, mat);
    
    // Custom properties for animation
    star.userData = {
        active: false,
        velocity: new THREE.Vector3(),
        life: 0
    };
    
    scene.add(star);
    shootingStarsMeshes.push(star);
}

function spawnShootingStar(star) {
    star.userData.active = true;
    star.userData.life = 1.0;
    
    // Start somewhere top/right
    const startX = (Math.random() - 0.5) * 15 + 5;
    const startY = (Math.random() - 0.5) * 10 + 5;
    const startZ = (Math.random() - 0.5) * 5 - 2;
    
    const positions = star.geometry.attributes.position.array;
    positions[0] = startX;
    positions[1] = startY;
    positions[2] = startZ;
    star.geometry.attributes.position.needsUpdate = true;
    
    // Shoot diagonally towards bottom left
    star.userData.velocity.set(
        -0.2 - Math.random() * 0.2, 
        -0.1 - Math.random() * 0.1,
        0
    );
    
    star.material.opacity = 1.0;
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

    // Base slow rotation of main object
    mesh.rotation.y = elapsedTime * 0.05;
    mesh.rotation.x = elapsedTime * 0.02;

    // Slowly rotate background stars
    starMesh.rotation.y = elapsedTime * 0.02;

    // Update shooting stars
    shootingStarsMeshes.forEach(star => {
        if (!star.userData.active) {
            // Random chance to spawn
            if (Math.random() < 0.01) {
                spawnShootingStar(star);
            }
        } else {
            // Move star
            const positions = star.geometry.attributes.position.array;
            positions[0] += star.userData.velocity.x;
            positions[1] += star.userData.velocity.y;
            positions[2] += star.userData.velocity.z;
            star.geometry.attributes.position.needsUpdate = true;
            
            // Fade out
            star.userData.life -= 0.015;
            star.material.opacity = star.userData.life;
            
            if (star.userData.life <= 0) {
                star.userData.active = false;
            }
        }
    });

    // Mouse movement interaction (easing)
    target.x = mouse.x * 0.001;
    target.y = mouse.y * 0.001;
    
    mesh.rotation.y += 0.05 * (target.x - mesh.rotation.y);
    mesh.rotation.x += 0.05 * (target.y - mesh.rotation.x);
    
    // Parallax background stars slightly based on mouse
    starMesh.position.x += 0.05 * (target.x * 0.5 - starMesh.position.x);
    starMesh.position.y += 0.05 * (-target.y * 0.5 - starMesh.position.y);

    // Scroll influence
    mesh.position.y = -scrollY * 0.0015;

    renderer.render(scene, camera);
}

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
