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

    class SponsorStats {
        constructor() {
            this.$accordionItems = $('#Occupation .c-accordion__item');
            this.$total = $('[data-sponsor-total]');
            this.$legendCounts = $('[data-sponsor-tier-count]');

            if (!this.$accordionItems.length || !this.$total.length || !this.$legendCounts.length) {
                return;
            }

            this.updateStats();
        }

        updateStats() {
            const counts = {
                platinum: 0,
                gold: 0,
                silver: 0,
                bronze: 0
            };

            this.$accordionItems.each((index, item) => {
                const $item = $(item);
                const tier = $item.find('.summary__text').first().text().trim().toLowerCase().split(' ')[0];
                const $sponsorList = $item.find('.detail__text__table__item').last().find('.content p').first();

                if (!Object.prototype.hasOwnProperty.call(counts, tier) || !$sponsorList.length) {
                    return;
                }

                const entries = ($sponsorList.html() || '')
                    .split(/<br\s*\/?>/i)
                    .map((entry) => $('<div>').html(entry).text().replace(/\s+/g, ' ').trim())
                    .filter(Boolean);

                counts[tier] = entries.length;
            });

            const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
            this.renderDigits(this.$total, total);

            Object.entries(counts).forEach(([tier, count]) => {
                this.$legendCounts.filter(`[data-sponsor-tier-count="${tier}"]`).text(count);
            });
        }

        renderDigits($target, value) {
            $target.empty();

            String(value).split('').forEach((digit) => {
                $('<span>', {
                    class: 'c-numSlot__inner',
                    text: digit
                }).appendTo($target);
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
            this.cardShiftRem = 5;
            this.cardTravelRem = 100;

            this.$container[0].style.setProperty('--sponsor-card-count', this.$slideItems.length);

            this.initScrollAnimation();
            this.addRefreshListeners();
        }

        initScrollAnimation() {
            app.mm.add(app.mm_conditions, (context) => {
                const { isDesktop } = context.conditions;
                if (isDesktop && this.$slideItems.length > 1) {
                    const tl = gsap.timeline();

                    for (let step = 1; step < this.$slideItems.length; step += 1) {
                        const stepPosition = step === 1 ? 0 : '>';

                        tl.to(this.$slide, {
                            x: `-${this.cardShiftRem * step}rem`,
                            duration: 1,
                            ease: 'none'
                        }, stepPosition);

                        this.$slideItems.slice(step).each((index, item) => {
                            tl.to(item, {
                                x: `${this.cardTravelRem * index}rem`,
                                duration: 1,
                                ease: 'none'
                            }, '<');
                        });
                    }

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
                    gsap.set(this.$slide, { clearProps: 'transform' });
                    gsap.set(this.$slideItems, { clearProps: 'transform' });
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
    new SponsorStats();
    new SystemScrollAnimation();

})();
