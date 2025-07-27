(function() {
    'use strict';
    class MouseStalker {
        constructor(options = { isWhite: false }) {
            if (util.device !== 'pc') {
                return;
            }

            this.options = options;
            this.stalkerElement = null;
            this.textElement = null;
            this.posX = 0;
            this.posY = 0;

            this.createStalkerElement();
            this.addEventListeners();
        }

        createStalkerElement() {
            $('.Wrapper').append('<div id="mouseStalker"><p class="text"></p></div>');
            this.stalkerElement = $('#mouseStalker');
            this.textElement = this.stalkerElement.find('.text');

            if (this.options.isWhite) {
                this.stalkerElement.addClass('is-white');
            }
        }

        addEventListeners() {
            $(window).on('mousemove', (e) => {
                this.posX = e.clientX;
                this.posY = e.clientY;
                this.stalkerElement.css('transform', `translate3d(${this.posX}px, ${this.posY}px, 0)`);
            });

            $('[data-cursor]').each((index, el) => {
                const element = $(el);
                element.on('mouseover', () => {
                    const cursorText = element.data('cursor');
                    this.textElement.text(cursorText || '');
                    this.stalkerElement.addClass('is-hover');
                });
                element.on('mouseout', () => {
                    this.stalkerElement.removeClass('is-hover is-mousedown');
                });
                element.on('mousedown', () => {
                    this.stalkerElement.addClass('is-mousedown');
                });
                element.on('mouseup', () => {
                    this.stalkerElement.removeClass('is-mousedown');
                });
            });
        }
    }


    class ParallaxImages {
        constructor() {
            this.$imagesContainer = $('.SectContents__parallaxImages');
            if (!this.$imagesContainer.length) return;

            this.$imageItems = this.$imagesContainer.find('.SectContents__parallaxImages__item');
            this.initScrollEffect();
        }

        initScrollEffect() {
            app.mm.add(app.mm_conditions, (context) => {
                const { isDesktop } = context.conditions;

                if (isDesktop) {
                    gsap.to(this.$imageItems, {
                        x: '0%',
                        y: '0%',
                        ease: 'none',
                        scrollTrigger: {
                            trigger: this.$imagesContainer,
                            start: 'top+=20% bottom',
                            end: 'bottom-=25% bottom',
                            scrub: true,
                            scroller: app.$scroller,
                        },
                    });
                }
            });
        }
    }

    class OfficeSlider {
        constructor() {
            this.$slider = $('#Office .swiper');
            if (!this.$slider.length) return;

            this.swiper = new Swiper(this.$slider[0], {
                speed: 700,
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                loop: true,
                slidesPerView: 'auto',
                centeredSlides: true,
                touchEventsTarget: true,
            });

            this.addHoverListeners();
        }

        addHoverListeners() {
            $('.swiper-button-prev').on('mouseenter', () => this.$slider.addClass('is-hover--prev'))
                .on('mouseleave', () => this.$slider.removeClass('is-hover--prev'));

            $('.swiper-button-next').on('mouseenter', () => this.$slider.addClass('is-hover--next'))
                .on('mouseleave', () => this.$slider.removeClass('is-hover--next'));
        }
    }

    class Accordion {
        constructor(selector) {
            this.$accordionBox = $(selector);
            if (!this.$accordionBox.length) return;

            this.$openers = this.$accordionBox.find('.anchor');
            this.addEventListeners();
            this.addResizeListener();
        }

        addEventListeners() {
            this.$openers.on('click', (e) => {
                if ($(e.target).is('a')) {
                    return;
                }

                const opener = $(e.currentTarget);
                const detail = opener.find('.detail');
                const detailText = detail.find('.detail__text');
                const isOpen = opener.hasClass('is-open');

                opener.toggleClass('is-open');

                const targetHeight = isOpen ? 0 : detailText.outerHeight();

                if (app.locoScroll) {
                    gsap.to(detail, {
                        height: targetHeight,
                        duration: 0.5,
                        ease: 'power3.out',
                        onUpdate: () => app.locoScroll.update(),
                        onComplete: () => {
                            app.locoScroll.update();
                            $(window).trigger('accordion--complete');
                        }
                    });
                } else {
                    detail.css('height', targetHeight);
                    detail.on('transitionend webkitTransitionEnd', (event) => {
                         if (event.originalEvent.propertyName === 'height') {
                             $(window).trigger('accordion--complete');
                         }
                    });
                }
            });
        }
        
        addResizeListener() {
            let resizeTimeout = false;
            $(window).on('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    this.$openers.each(function() {
                        if ($(this).hasClass('is-open')) {
                            const detail = $(this).find('.detail');
                            const detailText = detail.find('.detail__text');
                            detail.css('height', detailText.outerHeight());
                            if (app.locoScroll) {
                                app.locoScroll.update();
                            }
                        }
                    });
                }, 200);
            });
        }
    }

    class AccordionDeepLink {
        constructor() {
            $(window).on('content--show', () => {
                if (!app.urlParam || !app.urlParam.match(/recruit_/)) {
                    return;
                }

                const $target = $('#' + app.urlParam);
                if (!$target.length) return;

                const $opener = $target.find('.anchor');
                const $detail = $opener.find('.detail');
                const $detailText = $detail.find('.detail__text');
                
                $target.addClass('is-init');
                $opener.addClass('is-open');

                const targetHeight = $detailText.outerHeight();

                if (app.locoScroll) {
                    gsap.to($detail, {
                        height: targetHeight,
                        duration: 0,
                        onComplete: () => {
                            app.locoScroll.update();
                            $(window).trigger('accordion--complete');
                            $target.removeClass('is-init');
                        }
                    });
                } else {
                    $detail.css('height', targetHeight);
                    setTimeout(() => $target.removeClass('is-init'), 10);
                }
            });
        }
    }

    class SystemScrollAnimation {
        constructor() {
            this.$container = $('#System .SectContents__block__wrapper');
            if (!this.$container.length) return;

            this.$slide = this.$container.find('.slide');
            this.$slideItems = this.$slide.find('.slide__item');
            this.triggerEvent = null;

            this.initScrollAnimation();
            this.addRefreshListeners();
        }

        initScrollAnimation() {
            app.mm.add(app.mm_conditions, (context) => {
                const { isDesktop } = context.conditions;
                if (isDesktop) {
                    const tl = gsap.timeline();

                    tl.fromTo(this.$slideItems.eq(1), { x: '100rem' }, { x: '0rem', ease: 'none' })
                      .to(this.$slide, { x: '-5rem', ease: 'none' }, '<')
                      .fromTo(this.$slideItems.eq(2), { x: '200rem' }, { x: '100rem', ease: 'none' }, '<')
                      .fromTo(this.$slideItems.eq(3), { x: '300rem' }, { x: '200rem', ease: 'none' }, '<')

                      .fromTo(this.$slideItems.eq(2), { x: '100rem' }, { x: '0rem', ease: 'none' })
                      .fromTo(this.$slideItems.eq(3), { x: '200rem' }, { x: '100rem', ease: 'none' }, '<')
                      .to(this.$slide, { x: '-10rem', ease: 'none' }, '<')

                      .fromTo(this.$slideItems.eq(3), { x: '100rem' }, { x: '0rem', ease: 'none' })
                      .to(this.$slide, { x: '-15rem', ease: 'none' }, '<');

                    this.triggerEvent = ScrollTrigger.create({
                        animation: tl,
                        trigger: this.$container,
                        start: 'top top',
                        end: 'bottom bottom',
                        scrub: true,
                        scroller: app.$scroller
                    });
                }
                
                return () => {
                    if (this.triggerEvent) {
                        this.triggerEvent.kill();
                        this.triggerEvent = null;
                    }
                };
            });
        }
        
        addRefreshListeners() {
            $(window).on('accordion--complete', () => {
                if (util.displayMode === 'pc' && this.triggerEvent) {
                    this.triggerEvent.refresh();
                }
            });

            if (util.device === 'pc') {
                let resizeTimeout = false;
                $(window).on('resize', () => {
                    clearTimeout(resizeTimeout);
                    if (util.displayMode === 'pc' && this.triggerEvent) {
                        resizeTimeout = setTimeout(() => {
                           this.triggerEvent.refresh();
                        }, 200);
                    }
                });
            }
        }
    }
    
    new MouseStalker();
    new ParallaxImages();
    new OfficeSlider();
    new Accordion('#Occupation .SectContents__block__main .c-accordion');
    new AccordionDeepLink();
    new SystemScrollAnimation();

})();