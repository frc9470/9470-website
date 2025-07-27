!(function() {
    "use strict";

    class FadeSlider {
        constructor(options) {
            this.flag = false;
            this.$slider = options.target;
            this.$slider_item = this.$slider.find(".slide__item");
            this.now = 0;
            this.intervalTime = options.interval;
            this.delay = options.delay ? options.delay : 0;

            $(window).on(options.originalEvent ? options.originalEvent : "content--show", () => {
                this.eventHandler();
                new $.fInview(this.$slider, {
                    rootMargin: "0%",
                    threshold: 0.2,
                    infinite: true,
                    enter_callback: () => this.play(),
                    leave_callback: () => this.pause(),
                });
            });
        }

        intervalManager(time) {
            clearTimeout(this.interval);
            this.interval = setTimeout(() => {
                this.next();
            }, time || this.intervalTime);
        }

        change(prevIndex) {
            this.$itemCurrent = this.$slider_item.eq(this.now);
            this.$itemBefore = this.$slider_item.eq(prevIndex);
            this.$itemBefore.css("z-index", 0);
            this.$itemCurrent.css("z-index", 1).addClass("is-current");
            this.$itemCurrent.on("transitionend webkitTransitionEnd", () => {
                this.$itemBefore.removeClass("is-current is-init");
                this.flag = false;
                this.intervalManager();
            });
        }

        next() {
            if (this.flag) return;
            const prevIndex = this.now;
            this.flag = true;
            if (this.now >= this.$slider_item.length - 1) {
                this.now = -1;
            }
            this.now++;
            this.change(prevIndex);
        }

        prev() {
            if (this.flag) return;
            const prevIndex = this.now;
            this.flag = true;
            if (this.now === 0) {
                this.now = this.$slider_item.length;
            }
            this.now--;
            this.change(prevIndex);
        }

        play() {
            this.flag = false;
            this.delayTimer = setTimeout(() => {
                this.next();
            }, this.delay);
        }

        pause() {
            this.flag = true;
            clearTimeout(this.delayTimer);
            clearTimeout(this.interval);
            if (this.$itemBefore) {
                this.$itemBefore.removeClass("is-current");
            }
        }

        reset(index) {
            this.$itemBefore = this.$slider_item.eq(this.now);
            this.now = index;
            this.$itemCurrent = this.$slider_item.eq(this.now);
            this.$itemBefore.css("z-index", 0).removeClass("is-current is-init");
            this.$itemCurrent.css("z-index", 1).addClass("is-init");
        }

        eventHandler() {
            this.$slider.on("click", (event) => {
                event.preventDefault();
                if (!this.flag) {
                    this.next();
                }
            });

            let startX, startY;
            let startCoords = [0, 0];
            let moveCoords = [0, 0];
            let isDragging = false;

            this.$slider
                .on("mousedown touchstart", (event) => {
                    startCoords = [0, 0];
                    moveCoords = [0, 0];
                    isDragging = true;
                    if (event.touches) {
                        startX = event.touches[0].pageX;
                        startY = event.touches[0].pageY;
                    } else {
                        startX = event.pageX;
                        startY = event.pageY;
                    }
                    startCoords = [startX, startY];
                })
                .on("mousemove touchmove", (event) => {
                    if (event.touches) {
                        startX = event.touches[0].pageX;
                        startY = event.touches[0].pageY;
                    } else {
                        startX = event.pageX;
                        startY = event.pageY;
                    }
                    moveCoords = [startX - startCoords[0], startY - startCoords[1]];
                    if (Math.abs(moveCoords[0]) > 50 && Math.abs(moveCoords[1]) < 50) {
                        event.preventDefault();
                    }
                })
                .on("mouseleave mouseup touchend touchcancel", () => {
                    if (isDragging) {
                        isDragging = false;
                        if (moveCoords[0] > 50) {
                            if (this.flag) return;
                            this.prev();
                        } else if (moveCoords[0] < -50) {
                            if (this.flag) return;
                            this.next();
                        }
                    }
                });
        }
    }

    class MainVisualController {
        constructor() {
            this.$main = $("#Main");
            this.$mv = this.$main.find(".Main__visual");
            this.$mv_slide = this.$mv.find(".movie");
            this.$mv_catch = this.$mv.find(".catch");
            this.$mv_title = $(".MvTitle");
            this.$header = $("#Header");
            this.opening();
            this.mvSlider();
            this.parallax();
        }

        opening() {
            const preventDefault = (e) => e.preventDefault();
            const wheelEvent = "onwheel" in document ? "wheel" : "onmousewheel" in document ? "mousewheel" : "DOMMouseScroll";

            this.no_scroll = () => {
                document.addEventListener(wheelEvent, preventDefault, { passive: false });
                document.addEventListener("touchmove", preventDefault, { passive: false });
                if (util.device === "pc" && app.locoScroll) {
                    app.locoScroll.stop();
                } else {
                    $("body").addClass("no-scroll");
                    $(window).scrollTop(0);
                }
            };

            this.return_scroll = () => {
                document.removeEventListener(wheelEvent, preventDefault, { passive: false });
                document.removeEventListener("touchmove", preventDefault, { passive: false });
                if (util.device === "pc" && app.locoScroll) {
                    app.locoScroll.start();
                } else {
                    $("html, body").animate({ scrollTop: 0 }, {
                        duration: 100,
                        complete: () => $("body").removeClass("no-scroll"),
                    });
                }
            };

            this.no_scroll();
            this.initFlag = false;

            $(window).on("content--show", () => {
                setTimeout(() => {
                    this.$main.addClass("is-opening");
                    this.$mv_title.addClass("is-opening is-init");
                    setTimeout(() => $(".SpNav").addClass("is-show"), 300);

                    this.$mv_title.find(".logos--3").on("transitionstart webkitTransitionStart", (event) => {
                        if (event.target === event.currentTarget) {
                            this.$mv_slide.find("video")[0].play();
                        }
                    }).on("transitionend webkitTransitionEnd", (event) => {
                        if (event.target === event.currentTarget) {
                            this.return_scroll();
                            $(window).trigger("opening--end");
                            this.$mv_title.removeClass("is-opening");
                        }
                    });
                }, util.displayMode === "pc" ? 250 : 0);
            });
        }

        mvSlider() {
            new FadeSlider({ target: this.$mv_slide, interval: 4500, delay: 3000, originalEvent: "opening--end" });
        }

        parallax() {
            gsap.to(this.$mv_slide, {
                y: "20%",
                scrollTrigger: {
                    trigger: this.$main,
                    start: "top top",
                    end: "bottom+=300 top",
                    scrub: util.device === "pc" ? 0 : 0.1,
                    scroller: util.device === "pc" ? app.$scroller : "",
                },
            });

            app.mm.add(app.mm_conditions, (context) => {
                const { isDesktop } = context.conditions;
                if (isDesktop) {
                    gsap.to(this.$mv_title.find(".MvTitle__logo"), {
                        y: "9%",
                        scale: "0.17",
                        scrollTrigger: {
                            trigger: this.$main,
                            start: "top top",
                            end: "bottom top-=15%",
                            scrub: 0,
                            scroller: util.device === "pc" ? app.$scroller : "",
                            onEnter: () => this.$mv.find(".subTitle").addClass("is-hidden"),
                            onLeaveBack: () => this.$mv.find(".subTitle").removeClass("is-hidden"),
                        },
                    });

                    gsap.to(this.$mv_catch, {
                        opacity: 0,
                        scrollTrigger: {
                            trigger: this.$main,
                            start: "top+=15% top",
                            end: "bottom-=20% top",
                            scrub: 0,
                            scroller: util.device === "pc" ? app.$scroller : "",
                        },
                    });

                    gsap.to(this.$main, {
                        scrollTrigger: {
                            trigger: this.$main,
                            start: "top top",
                            end: "bottom top+=5%",
                            scrub: 0,
                            scroller: util.device === "pc" ? app.$scroller : "",
                            onLeave: () => {
                                this.$mv_title.addClass("is-hidden");
                                this.$header.addClass("is-visible");
                            },
                            onEnterBack: () => {
                                this.$mv_title.removeClass("is-hidden");
                                this.$header.removeClass("is-visible");
                            },
                        },
                    });
                }
                return () => {};
            });
        }
    }

    class AboutController {
        constructor() {
            this.$about = $("#About");
            this.$about_a = this.$about.find(".anchor");
            if (util.device === "pc") {
                this.$about_a
                    .on("mouseenter", () => this.$about_a.addClass("mHover"))
                    .on("mouseleave", () => this.$about_a.removeClass("mHover"));
            }
        }
    }

    class ProjectController {
        constructor() {
            this.$project = $("#Project");
            this.$list = this.$project.find(".Project__list");
            this.$list_item = this.$list.find(".Project__list__item");
            this.$list_item_a = this.$list_item.find(".anchor");
            this.$movie = $("#ProjectMovie");
            this.$movie_container = this.$movie.find(".ProjectMovie__container");
            this.$movie_image = this.$movie.find(".ProjectMovie__image__item");
            this.$movie_info = $(".ProjectMovie__info");
            this.$movie_info_item = this.$movie_info.find(".ProjectMovie__info__item");
            this.$contents = $(".Contents");
            this.$header = $("#Header");
            this.init_flag = false;

            $(window).on("content--show", () => {
                if (util.displayMode === "pc") {
                    this.initialize();
                } else {
                    $(window).on("displayMode-switch", () => {
                        if (!this.init_flag && util.displayMode === "pc") {
                            this.initialize();
                        }
                    });
                }
            });
        }

        hoverEvent() {
            this.$list_item_a
                .on("mouseenter", (event) => {
                    this.hover_flag = true;
                    clearTimeout(this.delayTimeout);
                    this.$movie_container.removeClass("is-visible");
                    const index = this.$list_item_a.index(event.currentTarget);
                    this.$movie_image.removeClass("is-current").eq(index).addClass("is-current");
                    this.$movie_info_item.removeClass("is-current").eq(index).addClass("is-current");
                    this.videoId = $(event.currentTarget).data("yt");
                    this.ytPlayer.cueVideoById({ videoId: this.videoId });
                    this.$movie.addClass("is-movie_play");
                    this.$project.addClass("is-movie_play");
                    this.$contents.addClass("is-movie_play");
                    this.$header.addClass("is-movie_play");
                    this.$movie_info.addClass("is-movie_play");
                })
                .on("mouseleave", () => {
                    if (this.hover_flag) {
                        this.hover_flag = false;
                        this.$project.removeClass("is-movie_play");
                        this.$contents.removeClass("is-movie_play");
                        this.$header.removeClass("is-movie_play");
                        this.$movie_info.removeClass("is-movie_play");
                        this.delayTimeout = setTimeout(() => {
                            this.$movie.removeClass("is-movie_play");
                            this.$movie_container.removeClass("is-visible");
                            this.stop();
                        }, 350);
                    }
                });
        }

        setMovieInfo() {
            const targetWidth = 3000;
            this.$movie_info_item.each(function() {
                $(this).find(".cloneTarget").each(function() {
                    const currentWidth = $(this).width();
                    if (currentWidth < targetWidth) {
                        const cloneCount = Math.ceil(targetWidth / currentWidth) - 1;
                        const originalHtml = $(this).html();
                        for (let i = 0; i < cloneCount; i++) {
                            $(this).append(originalHtml);
                        }
                    }
                    const duration = ($(this).width() / targetWidth) * $(this).data("duration");
                    $(this).css("animation-duration", `${duration}ms`);
                    $(this).clone().appendTo($(this).parent());
                });
            });
        }

        setAPI() {
            const tag = $("<script>");
            const firstScriptTag = $("script").eq(0);
            tag.attr("src", "https://www.youtube.com/iframe_api");
            firstScriptTag.before(tag);
            window.onYouTubeIframeAPIReady = () => this.setVideo();
        }

        setVideo() {
            this.hover_flag = false;
            this.ytPlayer = new YT.Player("ProjectMovie__yt", {
                width: "100%",
                height: "100%",
                playerVars: { showinfo: 0, rel: 0, controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3, modestbranding: 1, playsinline: 1, autoplay: 0, mute: 1, loop: 0 },
                events: {
                    onReady: (event) => {
                        this.target = event.target;
                    },
                    onStateChange: (event) => {
                        this.state = event.data;
                        if (this.state === YT.PlayerState.CUED && this.hover_flag) this.play();
                        if (this.state === YT.PlayerState.ENDED) this.target.seekTo(0).playVideo();
                        if (this.state === YT.PlayerState.PLAYING) this.$movie_container.addClass("is-visible");
                    },
                },
            });
        }

        play() {
            this.target.playVideo();
        }
        pause() {
            this.target.pauseVideo();
        }
        stop() {
            this.target.stopVideo();
        }
        getState() {
            return this.state;
        }
        getID() {
            this.$open.on("click", (event) => {
                this.videoId = $(event.currentTarget).data("yt");
            });
        }
        initialize() {
            this.init_flag = true;
            this.hoverEvent();
            this.setAPI();
            this.setMovieInfo();
        }
    }

    class ProjectMoreController {
        constructor() {
            this.$project = $("#Project");
            this.$listWrapper = this.$project.find(".Project__listWrapper");
            this.$list = this.$listWrapper.find(".Project__list");
            this.$list_item = this.$list.find(".Project__list__item:gt(7)");
            this.$more = this.$listWrapper.find(".Project__more");

            if (this.$list_item.length) {
                this.$more.find(".anchor").on("click", () => {
                    this.$listWrapper.css("height", this.$list.outerHeight(true) + parseInt(this.$listWrapper.css("padding-bottom")));
                    this.$listWrapper.addClass("is-open");
                    setTimeout(() => {
                        this.$listWrapper.css({ height: this.$list.outerHeight(true) });
                    }, 10);
                    $(window).on("resize", () => {
                        this.$listWrapper.css("height", "auto");
                    });
                });
            }
        }
    }

    class BusinessController {
        constructor() {
            this.$business = $("#Business");
            this.$business_list = this.$business.find(".Business__list");
            this.$business_list_item = this.$business_list.find(".Business__list__item");
            this.$business_images = this.$business.find(".Business__images .list");
            this.$business_images_item = this.$business_images.find(".list__item");

            this.scrollTrigger();

            new $.fInview(this.$business_list_item, {
                rootMargin: "-50% 0%",
                threshold: 0,
                infinite: true,
                enter_callback: (entry) => {
                    const $target = $(entry.target);
                    this.$business_list
                        .css({ "background-color": $target.data("bg"), color: $target.data("color") })
                        .removeClass((index, className) => (className.match(/\bis-\S+/g) || []).join(" "))
                        .addClass(`is-item_${this.$business_list_item.index($target) + 1}`);
                },
                leave_callback: () => {},
            });
        }

        scrollTrigger() {
            app.mm.add(app.mm_conditions, (context) => {
                const { isDesktop } = context.conditions;
                if (isDesktop) {
                    this.$business_list_item.each((index, element) => {
                        const imageItem = this.$business_images_item.eq(index + 1);
                        gsap.to(imageItem, {
                            height: "100%",
                            scale: "1",
                            scrollTrigger: {
                                trigger: $(element),
                                start: "top top",
                                end: "bottom top",
                                scrub: 0,
                                scroller: app.$scroller,
                            },
                        });
                    });
                }
                return () => {};
            });
        }
    }

    class NewsPickerController {
        constructor() {
            this.$slider = $(".News__pick");
            if (this.$slider.length) {
                this.swiper = new Swiper(".News__pick", {
                    speed: 700,
                    navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
                    loop: true,
                    slidesPerView: "auto",
                    centeredSlides: true,
                    touchEventsTarget: true,
                });

                $(".swiper-button-prev")
                    .on("mouseenter", () => this.$slider.addClass("is-hover--prev"))
                    .on("mouseleave", () => this.$slider.removeClass("is-hover--prev"));

                $(".swiper-button-next")
                    .on("mouseenter", () => this.$slider.addClass("is-hover--next"))
                    .on("mouseleave", () => this.$slider.removeClass("is-hover--next"));
            }
        }
    }

    class CategoryNavController {
        constructor(options) {
            this.$nav = options ? options.target : $(".c-categoryNav");
            this.$categoryList = this.$nav.find(".categoryList");
            this.$categoryList_item = this.$categoryList.find(".categoryList__item");

            if (util.displayMode === "sp") {
                this.width = 0;
                this.$categoryList_item.each((i, el) => {
                    this.width += $(el).outerWidth(true);
                });

                if (this.width >= this.$categoryList.width()) {
                    this.$nav.addClass("is-slide");
                    const initSwiper = () => {
                        this.swiper = new Swiper(".c-categoryNav .categoryListWrapper", {
                            speed: 300,
                            loop: true,
                            freeMode: { momentumRatio: 0.5, momentumVelocityRatio: 0.7 },
                            slidesPerView: "auto",
                            centeredSlides: false,
                            initialSlide: this.$categoryList.data("init"),
                        });
                        $(window).on("fonts-loaded", () => {
                            if (util.displayMode === "sp") {
                                this.swiper.update();
                                this.swiper.slideToLoop(this.swiper.realIndex, 0);
                            }
                        });
                    };

                    $(window).on("content--show", initSwiper);
                    $(window).on("displayMode-switch", () => {
                        if (util.displayMode === "pc") {
                            this.swiper.destroy(false, true);
                        } else {
                            initSwiper();
                        }
                    });
                }
            }
        }
    }

    class MouseStalker {
        constructor(options) {
            if (util.device === "pc") {
                this.option = options || { isWhite: false };
                $(".Wrapper").append('<div id="mouseStalker"><p class="text"></p></div>');
                const $stalker = $("#mouseStalker");
                const $text = $stalker.find(".text");

                if (this.option.isWhite) {
                    $stalker.addClass("is-white");
                }

                this.posX = 0;
                this.posY = 0;

                $(window).on("mousemove", (e) => {
                    this.posX = e.clientX;
                    this.posY = e.clientY;
                    $stalker.css("transform", `translate3d(${this.posX}px, ${this.posY}px, 0)`);
                });

                $("[data-cursor]").each(function() {
                    const element = this;
                    $(element)
                        .on("mouseover", () => {
                            $text.text($(element).data("cursor") || "");
                            $stalker.addClass("is-hover");
                        })
                        .on("mouseout", () => $stalker.removeClass("is-hover is-mousedown"))
                        .on("mousedown", () => $stalker.addClass("is-mousedown"))
                        .on("mouseup", () => $stalker.removeClass("is-mousedown"));
                });
            }
        }
    }

    class GalleryModalController {
        constructor() {
            this.$modal = $("#GalleryModal");
            this.$slider = this.$modal.find(".swiper-wrapper");
            this.$slider_slide = this.$slider.find(".swiper-slide");
            this.$mouseStalker = $("#mouseStalker");
            this.flag = false;

            $(window).on("content--show", () => {
                this.slider();
                this.parallax();

                $.fModal({
                    duration: 330,
                    change_duration: 0,
                    scroll_top: true,
                    before_open: (event, index) => {
                        this.flag = true;
                        this.$slider_slide.eq(index).addClass("swiper-slide-active");
                        this.swiper.slideToLoop(index, 0);
                        this.$mouseStalker.addClass("is-white");
                        setTimeout(() => this.$modal.addClass("is-open"), 10);
                    },
                    after_close: () => {
                        this.$mouseStalker.removeClass("is-white");
                        this.$modal.removeClass("is-open");
                    },
                    before_close: () => {
                        this.flag = false;
                    },
                    open_classname: "GalleryModal--open",
                    close_classname: "GalleryModal--close",
                    page_classname: "Wrapper",
                    modal_classname: "GalleryModal",
                    modal_cont_classname: "GalleryModal__container",
                    modal_cont_item_classname: "GalleryModal__container__item",
                    load_classname: "GalleryModal-load",
                    prev_classname: "GalleryModal-prev",
                    next_classname: "GalleryModal-next",
                    nav_classname: "GalleryModal-nav",
                });

                new $.fInview($(".GalleryImages"), {
                    rootMargin: "0%",
                    threshold: 0,
                    infinite: false,
                    enter_callback: () => this.preLoad(),
                });
            });
        }

        preLoad() {
            this.$modal.find(".lazy_modal").each(function() {
                $(this).attr("src", $(this).data("original"));
            });
        }

        slider() {
            this.swiper = new Swiper(".GalleryModal .swiper", {
                speed: 580,
                navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
                loop: true,
                slidesPerView: "auto",
                centeredSlides: true,
                touchEventsTarget: true,
            });
        }

        parallax() {
            const $galleryImages = $(".GalleryImages");
            app.mm.add(app.mm_conditions, (context) => {
                const { isDesktop } = context.conditions;
                const speed = isDesktop ? $galleryImages.data("parallax-speed") : $galleryImages.data("parallax-speed-sp");
                gsap.to($galleryImages, {
                    x: speed,
                    ease: "none",
                    scrollTrigger: {
                        trigger: $galleryImages,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1,
                        scroller: app.$scroller,
                    },
                });
                return () => {};
            });
        }
    }

    class PcMenuModalController {
        constructor() {
            this.$modal = $("#PcMenuModal");
            this.$modal_container = this.$modal.find(".PcMenuModal__container");
            this.$modal_close = this.$modal.find(".closeButton");
            this.$modal_links = this.$modal.find(".PcMenuModal__links");
            this.flag = false;

            $(window).on("content--show", () => {
                this.scrollEvents();
                this.hoverEvents();

                $.fModal({
                    duration: 500,
                    change_duration: 0,
                    scroll_top: true,
                    before_open: () => {
                        this.flag = true;
                        const scrollTop = app.locoScroll ? app.locoScroll.scroll.instance.scroll.y : $(window).scrollTop();
                        this.$modal_close.css("margin-top", -1 * scrollTop);
                        setTimeout(() => {
                            if (this.locoScroll) {
                                this.locoScroll.scrollTo(0, { duration: 0 });
                            } else {
                                this.$modal_container.scrollTop(0);
                            }
                            this.$modal.addClass("is-open");
                        }, 10);
                    },
                    before_close: () => {
                        this.flag = false;
                        this.$modal.removeClass("is-open");
                    },
                    after_close: () => {
                        if (this.locoScroll) {
                            this.locoScroll.scrollTo(0, { duration: 0 });
                        } else {
                            this.$modal_container.scrollTop(0);
                        }
                        this.$modal_links.removeClass("is-hover");
                    },
                    open_classname: "PcMenuModal--open",
                    close_classname: "PcMenuModal--close",
                    page_classname: "Wrapper",
                    modal_classname: "PcMenuModal",
                    modal_cont_classname: "PcMenuModal__container",
                    modal_cont_item_classname: "PcMenuModal__container__item",
                });
            });

            $(window).on("displayMode-switch", () => {
                if (util.displayMode === "sp" && this.flag) {
                    this.$modal_close.find(".PcMenuModal--close").trigger("click");
                }
            });
        }

        scrollEvents() {
            if (util.device === "pc" && util.displayMode === "pc") {
                this.locoScroll = new LocomotiveScroll({
                    el: document.querySelector(".PcMenuModal__container"),
                    smooth: true,
                    multiplier: 0.7,
                    lerp: 0.18,
                    reloadOnContextChange: true,
                    scrollbarContainer: document.querySelector(".PcMenuModal__container"),
                });

                let resizeTimer = false;
                $(window).on("resize", () => {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(() => {
                        this.locoScroll.scrollTo(0, {
                            duration: 0,
                            disableLerp: true,
                            callback: () => this.locoScroll.update(),
                        });
                    }, 200);
                });
            }
        }

        hoverEvents() {
            if (util.device === "pc") {
                const getHoverPosition = ($element) => {
                    const offset = $element.offset();
                    const mouseX = app.mouseStalker.posX - offset.left;
                    const mouseY = app.mouseStalker.posY - offset.top;
                    const isSubPage = $element.hasClass("hoverArea--subPage");
                    return {
                        x: (mouseX / $element.width()) * 100 / 3,
                        y: (mouseY / $element.height()) * 100 / (isSubPage ? 1 : 2),
                    };
                };

                const onEnter = ($element) => {
                    const pos = getHoverPosition($element);
                    const $image = $element.find(".image");
                    gsap.set($image, { xPercent: pos.x, yPercent: pos.y });
                    $element.addClass("is-hover");
                };

                const onMove = ($element) => {
                    const pos = getHoverPosition($element);
                    const $image = $element.find(".image");
                    gsap.to($image, 1.1, { xPercent: pos.x, yPercent: pos.y });
                };

                const onLeave = ($element) => {
                    $element.removeClass("is-hover");
                };

                this.$modal_links
                    .find(".list__item .anchor")
                    .on("mouseenter", () => this.$modal_links.addClass("is-hover"))
                    .on("mouseleave", () => this.$modal_links.removeClass("is-hover"));

                this.$modal_links
                    .find(".list__item .hoverArea")
                    .on("mouseenter", (e) => onEnter($(e.currentTarget)))
                    .on("mousemove", (e) => onMove($(e.currentTarget)))
                    .on("mouseleave", (e) => onLeave($(e.currentTarget)));
            }
        }
    }

    new MainVisualController();
    new AboutController();
    new ProjectController();
    new ProjectMoreController();
    new BusinessController();
    new CategoryNavController({ target: $(".News__list .c-categoryNav") });
    new NewsPickerController();
    app.mouseStalker = new MouseStalker();
    new GalleryModalController();
    new PcMenuModalController();

    $(window).on("content--show", () => {
        $(".Wrapper").addClass("is-enter");
    });
})();
