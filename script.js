// ============================================================
// 1. ЭФФЕКТ ПАДАЮЩИХ ЛЕПЕСТКОВ / КОНФЕТТИ (весь экран)
// ============================================================
(function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    // Параметры
    const PARTICLE_COUNT = 120;
    const MAX_SPEED = 1.2;
    const MOUSE_RADIUS = 120;

    // Массив частиц
    let particles = [];
    let mouse = { x: -9999, y: -9999 };

    // Типы частиц: 'petal' (лепесток), 'heart' (сердечко), 'star' (блестка)
    const types = ['petal', 'heart', 'star'];

    // Цветовая палитра
    const colors = [
        '#ff6b8a', // розовый
        '#ff9eb5', // светлый розовый
        '#ff4d6d', // яркий красный
        '#ffb3c6', // бледный розовый
        '#ffd700', // золотой
        '#fff0f5', // лавандовый
        '#ff8c94', // коралловый
    ];

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Создание частицы
    function createParticle() {
        const type = types[Math.floor(Math.random() * types.length)];
        const size = random(12, 26);
        const color = colors[Math.floor(Math.random() * colors.length)];
        return {
            x: random(0, width),
            y: random(-height * 0.2, height * 1.2),
            vx: random(-0.4, 0.4),
            vy: random(0.3, MAX_SPEED),
            size: size,
            color: color,
            type: type,
            rotation: random(0, Math.PI * 2),
            rotSpeed: random(-0.02, 0.02),
            opacity: random(0.4, 0.9),
            // для лепестка – дополнительные параметры
            scaleX: random(0.6, 1.0),
            scaleY: random(0.6, 1.0),
        };
    }

    // Инициализация
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(createParticle());
    }

    // Рисование частицы
    function drawParticle(p) {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(p.scaleX, p.scaleY);

        if (p.type === 'petal') {
            // Лепесток – эллипс с градиентом
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
            grad.addColorStop(0, p.color);
            grad.addColorStop(1, p.color + '80');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size * 0.6, p.size * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
            // жилка
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = p.opacity * 0.3;
            ctx.beginPath();
            ctx.moveTo(0, -p.size * 0.3);
            ctx.quadraticCurveTo(p.size * 0.2, 0, 0, p.size * 0.3);
            ctx.stroke();
        } else if (p.type === 'heart') {
            // Сердечко
            ctx.fillStyle = p.color;
            ctx.beginPath();
            const s = p.size * 0.5;
            ctx.moveTo(0, s * 0.3);
            ctx.bezierCurveTo(-s * 0.8, -s * 0.6, -s * 0.8, s * 0.6, 0, s * 1.0);
            ctx.bezierCurveTo(s * 0.8, s * 0.6, s * 0.8, -s * 0.6, 0, s * 0.3);
            ctx.fill();
        } else if (p.type === 'star') {
            // Блестка – звёздочка или круг с бликом
            const grad = ctx.createRadialGradient(-p.size*0.2, -p.size*0.2, 0, 0, 0, p.size);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.3, p.color);
            grad.addColorStop(1, p.color + '40');
            ctx.fillStyle = grad;
            ctx.beginPath();
            // Рисуем 4-конечную звезду
            const spikes = 4;
            const outerRadius = p.size * 0.7;
            const innerRadius = p.size * 0.3;
            for (let i = 0; i < spikes * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            // добавим маленький блик
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(p.size*0.2, -p.size*0.2, p.size*0.15, 0, Math.PI*2);
            ctx.fill();
        }

        ctx.restore();
    }

    // Обновление частиц
    function updateParticles() {
        for (let p of particles) {
            // Движение
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotSpeed;

            // Ветер (лёгкое колебание)
            p.vx += Math.sin(Date.now() * 0.001 + p.y * 0.01) * 0.002;

            // Отталкивание от мыши
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < MOUSE_RADIUS && dist > 0) {
                const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
                const angle = Math.atan2(dy, dx);
                const push = 0.8;
                p.vx += Math.cos(angle) * force * push;
                p.vy += Math.sin(angle) * force * push;
            }

            // Ограничение скорости
            const speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
            if (speed > MAX_SPEED * 1.5) {
                p.vx = (p.vx / speed) * MAX_SPEED * 1.5;
                p.vy = (p.vy / speed) * MAX_SPEED * 1.5;
            }

            // Возврат в пределы экрана (сброс снизу)
            if (p.y > height + 50) {
                Object.assign(p, createParticle());
                p.y = -20;
                p.x = random(0, width);
            }
            if (p.x < -50) p.x = width + 50;
            if (p.x > width + 50) p.x = -50;
        }
    }

    // Рендер
    function render() {
        ctx.clearRect(0, 0, width, height);
        for (let p of particles) {
            drawParticle(p);
        }
        updateParticles();
        requestAnimationFrame(render);
    }

    // Событие мыши (координаты для canvas)
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    document.addEventListener('mouseleave', () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    // Для тач-устройств – пальцем
    document.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        if (touch) {
            mouse.x = touch.clientX;
            mouse.y = touch.clientY;
        }
    }, { passive: true });
    document.addEventListener('touchend', () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    render();
})();

// ============================================================
// 2. БУРГЕР, ТАЙМЕР, ФОРМА (как и раньше)
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // Бургер-меню
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('open');
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('open');
            });
        });
    }

    // Таймер
    const targetDate = new Date('2026-08-17T18:00:00').getTime();
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function updateCountdown() {
        const now = Date.now();
        let diff = targetDate - now;
        if (diff < 0) diff = 0;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Форма RSVP
    const form = document.getElementById('rsvpForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const attendance = form.querySelector('input[name="attendance"]:checked')?.value || '';
            if (!name) {
                alert('Пожалуйста, введите ваше имя.');
                return;
            }
            alert(`Спасибо, ${name}! Вы ответили: ${attendance}. Мы ждём вас!`);
            form.reset();
        });
    }

    // Анимация при скролле
    const animated = document.querySelectorAll('.animate-on-scroll');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });
        animated.forEach(el => observer.observe(el));
    } else {
        animated.forEach(el => el.classList.add('visible'));
    }
});