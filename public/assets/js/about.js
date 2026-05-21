(function() {
    "use strict";
    if (!Array.prototype.find) {
        Object.defineProperty(Array.prototype, 'find', {
            value: function(predicate) {
                if (this == null) {
                    throw new TypeError('"this" is null or not defined');
                }
                var o = Object(this);
                var len = o.length >>> 0;
                if (typeof predicate !== 'function') {
                    throw new TypeError('predicate must be a function');
                }
                var thisArg = arguments[1];
                var k = 0;
                while (k < len) {
                    var kValue = o[k];
                    if (predicate.call(thisArg, kValue, k, o)) {
                        return kValue;
                    }
                    k++;
                }
                return undefined;
            }
        });
    }
    
    (function() {
        var nativeToString = Object.prototype.toString;
        var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

        Object.prototype.toString = function() {
            if (hasToStringTag && this && typeof this === 'object' && Symbol.toStringTag in this) {
                 return '[object ' + this[Symbol.toStringTag] + ']';
            }
            return nativeToString.call(this);
        };
    })();


    var ValueSection = (function() {
        function ValueSection() {
            if (!(this instanceof ValueSection)) {
                throw new TypeError("Cannot call a class as a function");
            }

            var self = this;
            self.$value = $("#Value");
            self.$value_intro = $(".SectContents__block__intro");
            self.$value_intro_list = self.$value_intro.find(".list");
            self.$value_intro_images = self.$value_intro.find(".images");

            self.scrollTrigger();

            $(window).on("content--show", function() {
                self.preLoad();
            });
        }

        ValueSection.prototype = {
            constructor: ValueSection,

            scrollTrigger: function() {
                this.$value_intro_list.each(function(index) {
                    var listElement = this;
                    app.mm.add(app.mm_conditions, function(context) {
                        var conditions = context.conditions;
                        var isDesktop = conditions.isDesktop;
                        var isMobile = conditions.isMobile;
                        var reduceMotion = conditions.reduceMotion;

                        if (isDesktop) {
                            gsap.to($(listElement), {
                                x: "-10rem",
                                ease: "none",
                                scrollTrigger: {
                                    trigger: $(listElement),
                                    start: "top bottom",
                                    end: "bottom top",
                                    scrub: 0.7,
                                    scroller: app.$scroller
                                }
                            });
                        } else {
                            gsap.to($(listElement), {
                                x: "-5.5rem",
                                ease: "none",
                                scrollTrigger: {
                                    trigger: $(listElement),
                                    start: "top bottom",
                                    end: "bottom top",
                                    scrub: 1,
                                    scroller: app.$scroller
                                }
                            });
                        }
                        return function() {};
                    });
                });

                this.$value_intro_images.find(".image").each(function(index) {
                    gsap.to($(this), {
                        x: $(this).data("parallax") + "%",
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
            },

            preLoad: function() {
                this.$value_intro.find(".lazy_custom").each(function() {
                    $(this).attr("src", $(this).data("original"));
                });
            }
        };

        return ValueSection;
    })();

    var NavController = (function() {
        function NavController() {
            if (!(this instanceof NavController)) {
                throw new TypeError("Cannot call a class as a function");
            }

            var self = this;
            self.$nav = $(".SectContents__nav");
            self.$nav_innerNav = self.$nav.find(".innerNav");
            self.$value = $("#Value");

            new $.fInview(self.$value, {
                rootMargin: "-90% 0% 0%",
                threshold: 0,
                infinite: true,
                enter_callback: function(target) {
                    self.$nav_innerNav.addClass("is-onValue");
                },
                leave_callback: function() {
                    self.$nav_innerNav.removeClass("is-onValue");
                }
            });
        }
        
        return NavController;

    })();

    new ValueSection();
    new NavController();

})();

function toggleText(button) {
    var moreText = document.getElementById("more-text");
    if (button.textContent.trim() === "Read More") {
      moreText.style.maxHeight = moreText.scrollHeight + "px";
      button.textContent = "Read Less";
    } else {
      moreText.style.maxHeight = "0";
      button.textContent = "Read More";
    }
  }

window.addEventListener('load', function() {
  if (window.location.hash=='#FRC') {
    setTimeout(function() {
        document.querySelectorAll(".innerNav__list__item")[document.querySelectorAll(".innerNav__list__item").length-1].childNodes[0].click();
    }, 500);
  }
});