(function() {
    "use strict";

    class HeaderController {
        constructor() {
            const self = this;
            self.$header = $("#Header");
            $(window).on("content--show", function() {
                new $.fInview(document.querySelectorAll(".headerObserver"), {
                    rootMargin: "0%",
                    threshold: 0,
                    infinite: true,
                    enter_callback: function() {
                        self.$header.removeClass("is-active");
                    },
                    leave_callback: function() {
                        self.$header.addClass("is-active");
                    }
                });
            });
        }
    }

    class SectionContentsController {
        constructor() {
            const self = this;
            self.$block = $(".SectContents__block");
            self.$nav = $(".SectContents__nav");

            if (self.$nav.length) {
                self.$innerNav_listItem = self.$nav.find(".innerNav__list__item");
                new $.fInview(self.$block, {
                    rootMargin: "-50% 0%",
                    threshold: 0,
                    infinite: true,
                    enter_callback: function(entry) {
                        const $currentItem = self.$innerNav_listItem.eq(self.$block.index($(entry.target)));
                        $currentItem.addClass("is-current");
                        self.$innerNav_listItem.not($currentItem).removeClass("is-current");
                    },
                    leave_callback: function(entry) {}
                });
            }
        }
    }

    class FixedMainScrollEffects {
        constructor() {
            const self = this;
            self.$main = $("#Main.Main--fixed");
            self.$main_title = $(".Main__title");
            self.$main_title_list = self.$main_title.find(".Main__title__list");
            self.$main_title_list_box = self.$main_title_list.find(".box");
            self.$main_title_listSub = self.$main_title.find(".Main__title__listSub");
            self.$main_title_listSub_box = self.$main_title_listSub.find(".box");
            self.$fixedMv = $("#FixedMv");
            self.$mv_container = self.$fixedMv.find(".FixedMv__container");

            if (self.$main.length || self.$fixedMv.length) {
                if (!self.$main.length) {
                    self.$main = $("#Main");
                }
                $(window).on("content--show", function() {
                    self.scrollTrigger();
                    if (self.$fixedMv.find("video.fvLoad").length) {
                        self.$fixedMv.find("video.fvLoad")[0].play();
                    }
                    if (self.$main_title_list.length) {
                        self.loopTitle({
                            target: self.$main_title_list_box,
                            speed: 100000,
                            speed_sp: 100000
                        });
                    }
                    if (self.$main_title_listSub.length) {
                        self.loopTitle({
                            target: self.$main_title_listSub_box,
                            speed: 250000,
                            speed_sp: 250000
                        });
                    }
                });
            }
        }

        scrollTrigger() {
            const self = this;
            app.mm.add(app.mm_conditions, (function(context) {
                const isDesktop = context.conditions.isDesktop;

                if (isDesktop) {
                    self.$main_title_list.each(function(index) {
                        gsap.to($(this), {
                            x: index === 0 ? "-13rem" : "-7rem",
                            ease: "none",
                            scrollTrigger: {
                                trigger: $(this),
                                start: "top bottom",
                                end: "bottom top",
                                scrub: 0.7,
                                scroller: app.$scroller
                            }
                        });
                    });
                    gsap.to(self.$mv_container, {
                        y: "-30%",
                        filter: "grayscale(100%)",
                        ease: "none",
                        scrollTrigger: {
                            trigger: self.$main,
                            start: "top top",
                            end: "bottom+=100% top",
                            scrub: true,
                            scroller: app.$scroller
                        }
                    });
                    if (self.$main_title_listSub.length) {
                        gsap.to(self.$main_title_listSub, {
                            x: "3rem",
                            ease: "none",
                            scrollTrigger: {
                                trigger: self.$main_title_listSub,
                                start: "top bottom",
                                end: "bottom top",
                                scrub: 0.7,
                                scroller: app.$scroller
                            }
                        });
                    }
                } else {
                    self.$main_title_list.each(function(index) {
                        gsap.to($(this), {
                            x: index === 0 ? "-8rem" : "-4.5rem",
                            ease: "none",
                            scrollTrigger: {
                                trigger: $(this),
                                start: "top bottom",
                                end: "bottom top",
                                scrub: 1,
                                scroller: app.$scroller
                            }
                        });
                    });
                    gsap.to(self.$mv_container, {
                        y: "-20%",
                        filter: "grayscale(100%)",
                        ease: "none",
                        scrollTrigger: {
                            trigger: self.$main,
                            start: "top top",
                            end: "bottom+=100% top",
                            scrub: 0.05,
                            scroller: app.$scroller
                        }
                    });
                    if (self.$main_title_listSub.length) {
                        gsap.to(self.$main_title_listSub, {
                            x: "2rem",
                            ease: "none",
                            scrollTrigger: {
                                trigger: self.$main_title_listSub,
                                start: "top bottom",
                                end: "bottom top",
                                scrub: 1,
                                scroller: app.$scroller
                            }
                        });
                    }
                }
                return function() {};
            }));
        }

        loopTitle(options) {
            if (!this.$main.length) return;

            const target = options.target;
            const containerWidth = 3000;
            const speed = options.speed;
            const speed_sp = options.speed_sp;
            let itemWidth = target.eq(0).width();

            if (itemWidth < 1) return;

            const cloneCount = Math.ceil(containerWidth / itemWidth) - 1;
            const originalText = target.eq(0).text();
            for (let i = 0; i < cloneCount; i++) {
                target.append(originalText);
            }

            const setAnimationDuration = function() {
                itemWidth = target.eq(0).width();
                const duration = util.displayMode === 'pc' ?
                    (itemWidth / containerWidth) * speed :
                    (speed_sp ? (itemWidth / containerWidth) * speed_sp : (itemWidth / containerWidth) * speed * 1.3);
                target.css("animation-duration", duration + "ms");
            };

            setAnimationDuration();

            let resizeTimeout = false;
            $(window).on(util.device === 'pc' ? "resize" : "sp-resize", function() {
                if (resizeTimeout !== false) {
                    clearTimeout(resizeTimeout);
                }
                resizeTimeout = setTimeout(function() {
                    setAnimationDuration();
                }, 200);
            });
        }
    }

    class MobileInnerNav {
        constructor() {
            const self = this;
            self.$nav = $(".SpInnerNav");

            if (self.$nav.length) {
                self.$observer = $("#SpInnerNavObserver");
                self.$observer_bottom = $("#SpInnerNavObserver__bottom");
                self.observation();

                $(window).on("content--show", function() {
                    self.slider = new Swiper(".SpInnerNav__container", {
                        speed: 300,
                        loop: true,
                        freeMode: {
                            momentumRatio: 0.3,
                            momentumVelocityRatio: 0.7,
                            sticky: true
                        },
                        slidesPerView: "auto",
                        centeredSlides: true,
                        initialSlide: $(".SpInnerNav__container").data("init")
                    });

                    $(window).on("fonts-loaded", function() {
                        if (util.displayMode === 'sp') {
                            self.slider.update();
                            self.slider.slideToLoop(self.slider.realIndex, 0);
                        }
                    });
                });
            }
        }

        observation() {
            const self = this;

            function handleScroll() {
                if (util.scroll > self.targetOffset_bottom && util.scroll_direction === 'down') {
                    self.$nav.addClass("is-fix");
                } else if (util.scroll > self.targetOffset_top && util.scroll_direction === 'up') {
                    self.$nav.addClass("is-fix is-show");
                } else {
                    self.$nav.removeClass("is-fix is-show");
                }
                if (util.scroll > self.targetOffset_bottom && util.scroll_direction === 'down') {
                    self.$nav.removeClass("is-show");
                }
            }

            $(window).on("content--show resize", function() {
                self.targetOffset_top = self.$observer.offset().top;
                self.targetOffset_bottom = self.$observer_bottom.offset().top;
            });

            $(window).on("content--show scroll", function() {
                requestAnimationFrame(handleScroll);
            });
        }
    }

    new FixedMainScrollEffects();
    new HeaderController();
    new SectionContentsController();
    new MobileInnerNav();

})();