/* ============================================================
   Мамаев Курган — общий скрипт
   ============================================================ */
(function () {
    'use strict';

    /* ---------- 1. Тема (тёмная / светлая) ---------- */
    const THEME_KEY = 'mk-theme';
    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }

    function updateThemeButton(btn) {
        const isLight = document.body.classList.contains('light-theme');
        btn.textContent = isLight ? '🌙' : '☀️';
        btn.setAttribute('aria-label',
            isLight ? 'Включить тёмную тему' : 'Включить светлую тему');
        btn.setAttribute('title',
            isLight ? 'Тёмная тема' : 'Светлая тема');
    }

    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
        updateThemeButton(btn);
        btn.addEventListener('click', function () {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
            document.querySelectorAll('.theme-toggle').forEach(updateThemeButton);
        });
    });

    /* ---------- 2. Бургер-меню ---------- */
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('nav');
    const overlay = document.querySelector('.menu-overlay');

    function closeMenu() {
        if (!nav || !burger) return;
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        if (overlay) overlay.classList.remove('open');
    }

    if (burger && nav) {
        burger.addEventListener('click', function () {
            const isOpen = nav.classList.toggle('open');
            burger.setAttribute('aria-expanded', String(isOpen));
            if (overlay) overlay.classList.toggle('open', isOpen);
        });

        if (overlay) overlay.addEventListener('click', closeMenu);

        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeMenu();
        });
    }

    /* ---------- 3. Анимация появления при прокрутке ---------- */
    const reveals = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window && reveals.length) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        reveals.forEach(function (el) { observer.observe(el); });
    } else {
        reveals.forEach(function (el) { el.classList.add('visible'); });
    }

    /* ---------- 4. Лайтбокс для галереи ---------- */
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');

    if (lightbox && galleryItems.length) {
        const lightboxImg = lightbox.querySelector('img');
        const btnClose = lightbox.querySelector('.lightbox-close');
        const btnPrev = lightbox.querySelector('.lightbox-prev');
        const btnNext = lightbox.querySelector('.lightbox-next');

        const images = Array.from(galleryItems).map(function (item) {
            const img = item.querySelector('img');
            return {
                src: item.dataset.full || img.src,
                alt: img.alt || ''
            };
        });

        let currentIndex = 0;
        let lastFocused = null;

        function showImage(index) {
            currentIndex = (index + images.length) % images.length;
            lightboxImg.src = images[currentIndex].src;
            lightboxImg.alt = images[currentIndex].alt;
        }

        function openLightbox(index) {
            lastFocused = document.activeElement;
            showImage(index);
            lightbox.classList.add('open');
            document.body.style.overflow = 'hidden';
            btnClose.focus();
        }

        function closeLightbox() {
            lightbox.classList.remove('open');
            document.body.style.overflow = '';
            if (lastFocused) lastFocused.focus();
        }

        galleryItems.forEach(function (item, i) {
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            item.setAttribute('aria-label',
                'Открыть фото: ' + (item.querySelector('img').alt || ''));

            item.addEventListener('click', function () { openLightbox(i); });
            item.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(i);
                }
            });
        });

        btnClose.addEventListener('click', closeLightbox);
        btnPrev.addEventListener('click', function () { showImage(currentIndex - 1); });
        btnNext.addEventListener('click', function () { showImage(currentIndex + 1); });

        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', function (e) {
            if (!lightbox.classList.contains('open')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
            if (e.key === 'ArrowRight') showImage(currentIndex + 1);
        });

        /* Свайпы для мобильных */
        let touchStartX = 0;
        lightbox.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', function (e) {
            const dx = e.changedTouches[0].screenX - touchStartX;
            if (Math.abs(dx) > 60) {
                showImage(dx > 0 ? currentIndex - 1 : currentIndex + 1);
            }
        }, { passive: true });
    }
})();