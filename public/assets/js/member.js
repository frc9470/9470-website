(function() {
    'use strict';
    var LoopTitle = (function() {
        function LoopTitleClass() {
            var self = this;
            self.$list = $(".SectContents__list");
            self.$list_item = self.$list.find(".SectContents__list__item");
            self.$nameEn = self.$list_item.find(".name-en");
            self.$nameEn_box = self.$nameEn.find(".box");

            $(window).on("content--show", function() {
                self.$nameEn.each(function() {
                    self.loopTitle({
                        target: $(this).find(".box"),
                        speed: 28000,
                        speed_sp: 28000
                    });
                });
            });
        }

        LoopTitleClass.prototype.loopTitle = function(options) {
            var target = options.target;
            var baseDuration = 1000;
            var pcSpeed = options.speed;
            var spSpeed = options.speed_sp;
            var itemWidth = target.eq(0).width();

            var setAnimationDuration = function() {
                var duration;
                if (util.displayMode === "pc") {
                    duration = (itemWidth / baseDuration) * pcSpeed;
                } else {
                    duration = spSpeed ? (itemWidth / baseDuration) * spSpeed : (itemWidth / baseDuration) * pcSpeed * 1.3;
                }
                target.css("animation-duration", duration + "ms");
            };

            setAnimationDuration();

            var resizeTimeout = false;
            var eventType = (util.device === "pc") ? "resize" : "sp-resize";

            $(window).on(eventType, function() {
                if (resizeTimeout !== false) {
                    clearTimeout(resizeTimeout);
                }
                resizeTimeout = setTimeout(function() {
                    itemWidth = target.eq(0).width();
                    setAnimationDuration();
                }, 200);
            });
        };

        return LoopTitleClass;
    }());

    var HoverImageSlider = (function() {
        function HoverImageSliderClass(options) {
            var self = this;
            self.flag = false;
            self.$slider = options.target;
            self.$slider_item = self.$slider.find(".hoverImage__item");
            self.now = 0;
            self.intervalTime = options.interval;
            self.delay = options.delay ? options.delay : 0;

            if (self.$slider_item.length <= 1) {
                return;
            }

            $(window).on("content--show", function() {
                self.$slider.parents(".anchor").on("mouseenter", function() {
                    self.play();
                }).on("mouseleave", function() {
                    self.pause();
                });
            });
        }

        HoverImageSliderClass.prototype.intervalManager = function(time) {
            var self = this;
            clearTimeout(self.interval);
            self.interval = setTimeout(function() {
                self.next();
            }, time || self.intervalTime);
        };

        HoverImageSliderClass.prototype.change = function(previousIndex) {
            var self = this;
            self.$itemCurrent = self.$slider_item.eq(self.now);
            self.$itemBefore = self.$slider_item.eq(previousIndex);

            self.$itemBefore.css("z-index", 0);
            self.$itemCurrent.css("z-index", 1).addClass("is-current");

            self.$itemCurrent.on("transitionend webkitTransitionEnd", function() {
                self.$itemBefore.removeClass("is-current is-init");
                self.flag = false;
                self.intervalManager();
            });
        };

        HoverImageSliderClass.prototype.next = function() {
            var self = this;
            var previousIndex = self.now;
            if (self.flag) {
                return;
            }
            self.flag = true;
            if (self.now >= self.$slider_item.length - 1) {
                self.now = -1;
            }
            self.now++;
            self.change(previousIndex);
        };

        HoverImageSliderClass.prototype.play = function() {
            var self = this;
            self.flag = false;
            self.delayTimer = setTimeout(function() {
                self.intervalManager();
            }, self.delay);
        };

        HoverImageSliderClass.prototype.pause = function() {
            var self = this;
            self.flag = true;
            clearTimeout(self.delayTimer);
            clearTimeout(self.interval);
            if (self.$itemBefore) {
                self.$itemBefore.removeClass("is-current");
            }
        };

        return HoverImageSliderClass;
    }());

    var ContentManager = (function() {
        function ContentManagerClass() {
            var self = this;
            self.$contents = $("#SectContents");
            self.$nav = self.$contents.find(".c-categoryNav");
            self.$nav_item = self.$nav.find(".categoryList__item");
            self.$nav_anchor = self.$nav_item.find(".anchor");
            self.$list = self.$contents.find(".SectContents__list");
            self.$list_item = self.$contents.find(".SectContents__list__item");
            self.$more = self.$contents.find(".SectContents__more");

            self.currentCategory = "";
            self.max = (util.displayMode === "pc") ? 18 : 12;
            self.inview = new $.fInview(document.querySelectorAll(".SectContents__list__item"), {
                rootMargin: "-12% 50%"
            });

            app.sort = false;
            app.readMore = false;

            self.sortEventHandler();

            $(window).on("sort--start", function() {
                self.sortNavChange("", app.sort);
                self.sortListChange("", app.sort);
            });

            $(window).on("viewMore--open", function() {
                self.moreView(true);
            });
        }

        ContentManagerClass.prototype.moreViewEventHandler = function() {
            var self = this;
            self.$more.find(".anchor").on("click", function() {
                self.moreView();
            });
        };

        ContentManagerClass.prototype.moreView = function(isInstant) {
            var self = this;
            var $itemsToShow;

            if (self.currentCategory !== "All") {
                $itemsToShow = self.$contents.find(".SectContents__list__item[data-category=" + self.currentCategory + "]:gt(" + (self.max - 1) + ")");
            } else {
                $itemsToShow = self.$contents.find(".SectContents__list__item:gt(" + (self.max - 1) + ")");
            }

            $itemsToShow.removeClass("is-hidden");

            if (!isInstant) {
                gsap.fromTo($itemsToShow, 0.65, { y: -55 }, { y: 0, ease: "power3.out" });
            }

            self.$more.addClass("is-hidden");

            if (app.locoScroll) {
                app.locoScroll.update();
            }
            app.readMore = true;
        };

        ContentManagerClass.prototype.sortEventHandler = function() {
            var self = this;
            $(document).on("click", ".categoryList__item .anchor", function() {
                var anchor = this;
                self.sortNavChange(this);
                gsap.to(self.$list, {
                    overwrite: true,
                    keyframes: [{
                        duration: 0.2,
                        opacity: 0,
                        onComplete: function() {
                            self.sortListChange(anchor);
                            self.$list_item.removeClass("fInview--enter");
                            self.inview = new $.fInview(document.querySelectorAll(".SectContents__list__item"), {
                                rootMargin: "-12% 50%"
                            });
                        }
                    }, {
                        duration: 0,
                        y: 35
                    }, {
                        duration: 0.5,
                        delay: 0.15,
                        ease: "power3.out",
                        opacity: 1,
                        y: 0
                    }]
                });
            });

            self.sortListChange(self.$nav.find(".categoryList__item.is-current").find(".anchor"));
            self.moreViewEventHandler();
        };

        ContentManagerClass.prototype.sortListChange = function(target, category) {
            var self = this;
            self.currentCategory = $(target).data("sort");
            if (category) {
                self.currentCategory = category;
            }

            var $visibleItems, totalInCategory, $lastImageItem, totalImageItems;

            if (self.currentCategory !== "All") {
                $visibleItems = self.$contents.find(".SectContents__list__item[data-category=" + self.currentCategory + "]:lt(" + self.max + ")");
                totalInCategory = self.$contents.find(".SectContents__list__item[data-category=" + self.currentCategory + "]").length;
                $lastImageItem = self.$contents.find(".SectContents__list__item--image[data-category=" + self.currentCategory + "]:last");
                totalImageItems = self.$contents.find(".SectContents__list__item--image[data-category=" + self.currentCategory + "]").length;
            } else {
                $visibleItems = self.$contents.find(".SectContents__list__item:lt(" + self.max + ")");
                totalInCategory = self.$list_item.length;
                $lastImageItem = self.$contents.find(".SectContents__list__item--image:last");
                totalImageItems = self.$contents.find(".SectContents__list__item--image").length;
            }

            self.$list_item.not($visibleItems).addClass("is-hidden");
            $visibleItems.removeClass("is-hidden");

            if (totalInCategory > 18) {
                self.$more.removeClass("is-hidden");
            } else {
                self.$more.addClass("is-hidden");
            }

            var remainderPC = totalImageItems % 3;
            var classPC = "";
            var classSP = "";

            if (remainderPC === 1) {
                classPC = "fraction--2";
            } else if (remainderPC === 2) {
                classPC = "fraction--1";
            }

            if (totalImageItems % 2 === 1) {
                classSP = "fraction_sp";
            }

            self.$list_item.removeClass("fraction--1 fraction--2 fraction_sp");
            $lastImageItem.addClass(classPC + " " + classSP);

            if (app.locoScroll) {
                app.locoScroll.update();
            }
            app.sort = self.currentCategory;
            app.readMore = false;
        };

        ContentManagerClass.prototype.sortNavChange = function(target, category) {
            var $item;
            if (category) {
                $item = $('.categoryList__item .anchor[data-sort="' + category + '"]').parents(".categoryList__item");
            } else {
                $item = $('.categoryList__item .anchor[data-sort="' + $(target).data("sort") + '"]').parents(".categoryList__item");
            }
            $item.addClass("is-current");
            this.$nav.find(".categoryList__item").not($item).removeClass("is-current");
        };

        return ContentManagerClass;
    }());

    var CategoryNavSlider = (function() {
        function CategoryNavSliderClass(options) {
            var self = this;
            self.$nav = options ? options.target : $(".c-categoryNav");
            self.$categoryList = self.$nav.find(".categoryList");
            self.$categoryList_item = self.$categoryList.find(".categoryList__item");

            if (util.displayMode === "sp") {
                self.width = 0;
                self.$categoryList_item.each(function() {
                    self.width += $(this).outerWidth(true);
                });

                if (self.width < self.$categoryList.width()) {
                    return;
                }

                self.$nav.addClass("is-slide");

                var initSwiper = function() {
                    self.swiper = new Swiper(".c-categoryNav .categoryListWrapper", {
                        speed: 300,
                        loop: true,
                        freeMode: {
                            momentumRatio: 0.5,
                            momentumVelocityRatio: 0.7,
                        },
                        slidesPerView: "auto",
                        centeredSlides: false,
                        initialSlide: self.$categoryList.data("init")
                    });

                    $(window).on("fonts-loaded", function() {
                        if (util.displayMode === "sp") {
                            self.swiper.update();
                            self.swiper.slideToLoop(self.swiper.realIndex, 0);
                        }
                    });
                };

                $(window).on("content--show", function() {
                    initSwiper();
                });

                $(window).on("displayMode-switch", function() {
                    if (util.displayMode === "pc") {
                        if(self.swiper) {
                             self.swiper.destroy(false, true);
                        }
                    } else {
                        initSwiper();
                    }
                });
            }
        }
        return CategoryNavSliderClass;
    }());

    new LoopTitle();

    $(".SectContents__list__item .hoverImage--slide").each(function() {
        new HoverImageSlider({
            target: $(this),
            interval: 800
        });
    });

    new ContentManager();
    new CategoryNavSlider();

}());