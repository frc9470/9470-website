! function() {
    "use strict";
    class Accordion {
        constructor(t) {
            if (!(this instanceof Accordion)) {
                throw new TypeError("Cannot call a class as a function");
            }
            this.$box = t.target;
            this.$open = this.$box.find(".anchor");
            this.eventHandler();
        }

        eventHandler() {
            const t = this;
            t.$open.on("click", function(e) {
                if (!$(e.target).is("a")) {
                    $(this).toggleClass("is-open");
                    const n = $(this).find(".detail");
                    if ($(this).hasClass("is-open")) {
                        if (app.locoScroll) {
                            gsap.to(n, {
                                height: n.find(".detail__text").outerHeight(),
                                duration: 0.5,
                                ease: "power3.out",
                                onUpdate: function() {
                                    app.locoScroll.update();
                                },
                                onComplete: function() {
                                    app.locoScroll.update();
                                    $(window).trigger("accordion--complete");
                                }
                            });
                        } else {
                            n.css("height", n.find(".detail__text").outerHeight());
                        }
                    } else {
                        if (app.locoScroll) {
                            gsap.to(n, {
                                height: 0,
                                duration: 0.5,
                                ease: "power3.out",
                                onUpdate: function() {
                                    app.locoScroll.update();
                                },
                                onComplete: function() {
                                    app.locoScroll.update();
                                    $(window).trigger("accordion--complete");
                                }
                            });
                        } else {
                            n.css("height", 0);
                        }
                    }
                }
            });

            let n = false;
            $(window).on("resize", function() {
                if (n !== false) {
                    clearTimeout(n);
                }
                n = setTimeout(function() {
                    t.$open.each(function() {
                        if ($(this).hasClass("is-open")) {
                            const t = $(this).find(".detail");
                            t.css("height", t.find(".detail__text").outerHeight());
                            if (app.locoScroll) {
                                app.locoScroll.update();
                            }
                        }
                    });
                }, 200);
            });

            if (!app.locoScroll) {
                t.$open.find(".detail").on("transitionend webkitTransitionEnd", function(t) {
                    if (t.originalEvent.propertyName === "height") {
                        $(window).trigger("accordion--complete");
                    }
                });
            }
        }
    }

    class MainPageAnimation {
        constructor() {
            if (!(this instanceof MainPageAnimation)) {
                throw new TypeError("Cannot call a class as a function");
            }
            const t = this;
            t.$main = $("#Main");
            t.$main_top = t.$main.find(".Main__top");
            t.$main_mv = t.$main.find(".Main__visual");
            t.$main_mv_image = t.$main_mv.find(".image");
            $(window).on("content--show", function() {
                t.scrollTrigger();
            });
        }

        scrollTrigger() {
            const t = this;
            app.mm.add(app.mm_conditions, function(n) {
                const r = n.conditions;
                const e = r.isDesktop;
                r.isMobile;
                r.reduceMotion;

                if (e) {
                    gsap.to(t.$main_mv_image, {
                        y: "28%",
                        ease: "none",
                        scrollTrigger: {
                            trigger: t.$main_top,
                            start: "top top",
                            end: "bottom top",
                            scrub: true,
                            scroller: app.$scroller
                        }
                    });
                } else {
                    gsap.to(t.$main_mv_image, {
                        y: "20%",
                        ease: "none",
                        scrollTrigger: {
                            trigger: t.$main_top,
                            start: "top top",
                            end: "bottom top",
                            scrub: 0.05,
                            scroller: app.$scroller
                        }
                    });
                }

                return function() {};
            });
        }
    }

    new Accordion({
        target: $("#Faq .SectContents__block__main .c-accordion")
    });

    new MainPageAnimation();
}();