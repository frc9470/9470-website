(function() {
    "use strict";

    const page = document.querySelector(".DivisionsPage");
    if (!page) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    document.documentElement.classList.add("division-effects");

    const cards = Array.from(page.querySelectorAll(".DivisionCard"));
    const intro = page.querySelector(".DivisionsPage__intro");

    requestAnimationFrame(function() {
        page.classList.add("is-ready");
    });

    if (!motionQuery.matches && "IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: "0px 0px -16% 0px",
            threshold: 0.18
        });

        if (intro) revealObserver.observe(intro);
        cards.forEach(function(card) {
            revealObserver.observe(card);
        });
    } else {
        if (intro) intro.classList.add("is-visible");
        cards.forEach(function(card) {
            card.classList.add("is-visible");
        });
    }

    function updateProgress() {
        const rect = page.getBoundingClientRect();
        const distance = rect.height - window.innerHeight;
        const progress = distance > 0 ? Math.min(1, Math.max(0, -rect.top / distance)) : 0;
        page.style.setProperty("--page-progress", progress.toFixed(4));
    }

    function requestProgressUpdate() {
        requestAnimationFrame(updateProgress);
    }

    updateProgress();
    window.addEventListener("scroll", requestProgressUpdate, { passive: true });
    window.addEventListener("resize", updateProgress);
    window.addEventListener("load", function() {
        updateProgress();
        if (window.app && app.locoScroll && typeof app.locoScroll.on === "function") {
            app.locoScroll.on("scroll", requestProgressUpdate);
        }
    });

    if (!motionQuery.matches && window.matchMedia("(pointer: fine)").matches) {
        cards.forEach(function(card) {
            const current = { x: 50, y: 50, rx: 0, ry: 0 };
            const target = { x: 50, y: 50, rx: 0, ry: 0 };
            let frame = null;
            let active = false;

            function writeValues() {
                current.x += (target.x - current.x) * 0.18;
                current.y += (target.y - current.y) * 0.18;
                current.rx += (target.rx - current.rx) * 0.18;
                current.ry += (target.ry - current.ry) * 0.18;

                card.style.setProperty("--mx", current.x.toFixed(2) + "%");
                card.style.setProperty("--my", current.y.toFixed(2) + "%");
                card.style.setProperty("--rx", current.rx.toFixed(2) + "deg");
                card.style.setProperty("--ry", current.ry.toFixed(2) + "deg");

                const settled =
                    Math.abs(target.x - current.x) < 0.04 &&
                    Math.abs(target.y - current.y) < 0.04 &&
                    Math.abs(target.rx - current.rx) < 0.01 &&
                    Math.abs(target.ry - current.ry) < 0.01;

                if (active || !settled) {
                    frame = requestAnimationFrame(writeValues);
                } else {
                    frame = null;
                }
            }

            function startLoop() {
                if (!frame) {
                    frame = requestAnimationFrame(writeValues);
                }
            }

            card.addEventListener("pointerenter", function(event) {
                if (event.pointerType && event.pointerType !== "mouse") return;
                active = true;
                card.classList.add("is-pointer-active");
                startLoop();
            });

            card.addEventListener("pointermove", function(event) {
                if (event.pointerType && event.pointerType !== "mouse") return;
                const rect = card.getBoundingClientRect();
                const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
                const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));

                target.x = x * 100;
                target.y = y * 100;
                target.rx = (0.5 - y) * 4.5;
                target.ry = (x - 0.5) * 5.5;
                startLoop();
            });

            card.addEventListener("pointerleave", function() {
                active = false;
                card.classList.remove("is-pointer-active");
                target.x = 50;
                target.y = 50;
                target.rx = 0;
                target.ry = 0;
                startLoop();
            });
        });
    }
})();
