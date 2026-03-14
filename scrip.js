// Animaciones suaves y navegación reactiva
window.addEventListener('DOMContentLoaded', () => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animateText = (selector, stagger = 30) => {
        if (prefersReduced) return;
        document.querySelectorAll(selector).forEach(node => {
            const text = node.textContent;
            node.textContent = '';
            [...text].forEach((char, i) => {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.className = 'char-pop';
                span.style.animationDelay = `${i * stagger}ms`;
                node.appendChild(span);
            });
        });
    };

    // Elementos a revelar
    const revealTargets = document.querySelectorAll('.hero__content, .horario, .catalogo > div, .helado-card, .ubicacion, .service-item');
    revealTargets.forEach(el => el.classList.add('will-reveal'));

    if (!prefersReduced) {
        const revealObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2, rootMargin: '0px 0px -5% 0px' });

        revealTargets.forEach(el => revealObserver.observe(el));
    } else {
        revealTargets.forEach(el => el.classList.add('is-visible'));
    }

    animateText('.hero__content h1', 35);
    animateText('.hero__content h3', 18);

    // Resaltar enlace activo según la sección visible
    const navLinks = Array.from(document.querySelectorAll('.drawer-nav a'));
    const chips = Array.from(document.querySelectorAll('.category-chip'));
    const indicator = document.querySelector('.chip-indicator');
    const drawer = document.getElementById('drawer');
    const drawerOverlay = document.querySelector('.drawer-overlay');
    const drawerToggle = document.querySelector('.menu-toggle');
    const drawerClose = document.querySelector('.drawer-close');
    const catalogCards = Array.from(document.querySelectorAll('.catalog-card'));

    const toggleHeladosMode = (id) => {
        const isHelados = id === '#helados';
        document.body.classList.toggle('show-helados', isHelados);
    };

    const moveIndicator = (el) => {
        if (!indicator || !el) return;
        indicator.style.width = `${el.offsetWidth}px`;
        indicator.style.transform = `translateX(${el.offsetLeft}px)`;
    };

    const setActiveById = (id) => {
        navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === id));
        const activeChip = chips.find(chip => chip.dataset.target === id);
        if (activeChip) {
            chips.forEach(chip => chip.classList.toggle('active', chip === activeChip));
            moveIndicator(activeChip);
        }
        toggleHeladosMode(id);
    };

    const setDrawerState = (isOpen) => {
        if (!drawer) return;
        drawer.classList.toggle('open', isOpen);
        drawer.setAttribute('aria-hidden', String(!isOpen));
        if (drawerOverlay) drawerOverlay.hidden = !isOpen;
        if (drawerToggle) drawerToggle.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('drawer-open', isOpen);
    };

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = '#' + entry.target.id;
                setActiveById(id);
            }
        });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0.25 });

    navLinks
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean)
        .forEach(section => navObserver.observe(section));

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            setActiveById(link.getAttribute('href'));
            setDrawerState(false);
        });
    });

    drawerToggle?.addEventListener('click', () => {
        const isOpen = !drawer?.classList.contains('open');
        setDrawerState(isOpen);
    });

    drawerClose?.addEventListener('click', () => setDrawerState(false));
    drawerOverlay?.addEventListener('click', () => setDrawerState(false));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setDrawerState(false);
    });

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const target = document.querySelector(chip.dataset.target);
            if (!target) return;
            toggleHeladosMode(chip.dataset.target);
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            chip.classList.add('pulse');
            setTimeout(() => chip.classList.remove('pulse'), 420);
            setActiveById(chip.dataset.target);
        });
    });

    const defaultChip = chips.find(chip => chip.classList.contains('active'));
    if (defaultChip) moveIndicator(defaultChip);

    // Fondo dinámico cromado basado en scroll (más suave)
    const updateScrollBG = () => {
        document.documentElement.style.setProperty('--scroll', String(window.scrollY || 0));
    };
    window.addEventListener('scroll', updateScrollBG, { passive: true });
    updateScrollBG();

    // Pequeño efecto de enfoque en tarjetas y servicios al mover el cursor
    const addHoverGlow = (selector) => {
        document.querySelectorAll(selector).forEach(card => {
            card.addEventListener('pointermove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width - 0.5) * 4;
                const y = ((e.clientY - rect.top) / rect.height - 0.5) * 4;
                card.style.transform = `translateY(-6px) rotateX(${-y}deg) rotateY(${x}deg)`;
            });
            card.addEventListener('pointerleave', () => {
                card.style.transform = '';
            });
        });
    };

    addHoverGlow('.catalogo > div');
    addHoverGlow('.helado-card');
    addHoverGlow('.service-item');

});
