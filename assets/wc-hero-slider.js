(function () {
  // Idempotent init required for Shopify section lifecycle
  const initHeroSlider = (slider) => {
    if (slider.dataset.initialized === "true") return;
    slider.dataset.initialized = "true";

    const track = slider.querySelector("[data-slider-track]");
    const slides = slider.querySelectorAll("[data-slide]");
    const prev = slider.querySelector("[data-prev]");
    const next = slider.querySelector("[data-next]");
    const dotsWrapper = slider.querySelector("[data-dots]");

    if (!track || slides.length === 0) return;

    let index = 0;
    let autoplayTimer = null;

    const autoplayEnabled = slider.dataset.autoplay === "true";
    const autoplaySpeed = Number(slider.dataset.autoplaySpeed || 5) * 1000;

    function update() {
      track.style.transform = `translateX(-${index * 100}%)`;

      // Prevent inactive slides from receiving focus (a11y)
      slides.forEach((slide, i) => {
        const isActive = i === index;
        slide.setAttribute("aria-hidden", String(!isActive));
        slide.tabIndex = isActive ? 0 : -1;
      });

      // Reflect current slide state for assistive tech
      dotsWrapper?.querySelectorAll("button").forEach((dot, i) => {
        const isActive = i === index;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-current", isActive ? "true" : "false");
      });
    }

    function startAutoplay() {
      if (!autoplayEnabled) return;
      stopAutoplay(); // Ensure a single active timer
      autoplayTimer = setInterval(() => {
        index = (index + 1) % slides.length;
        update();
      }, autoplaySpeed);
    }

    function stopAutoplay() {
      if (!autoplayTimer) return;
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }

    // Dots are generated once to avoid duplication on section reload
    if (dotsWrapper && dotsWrapper.children.length === 0) {
      slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
        dot.setAttribute("aria-controls", slider.id || "");
        dot.addEventListener("click", () => {
          index = i;
          update();
          startAutoplay();
        });
        dotsWrapper.appendChild(dot);
      });
    }

    prev?.addEventListener("click", () => {
      index = (index - 1 + slides.length) % slides.length;
      update();
      startAutoplay();
    });

    next?.addEventListener("click", () => {
      index = (index + 1) % slides.length;
      update();
      startAutoplay();
    });

    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    const threshold = 50;

    slider.addEventListener(
      "touchstart",
      (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
        stopAutoplay(); // Avoid conflict between swipe and autoplay
      },
      { passive: true },
    );

    slider.addEventListener(
      "touchmove",
      (e) => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
      },
      { passive: true },
    );

    slider.addEventListener("touchend", () => {
      if (!isDragging) return;

      const diff = currentX - startX;

      if (Math.abs(diff) > threshold) {
        index =
          diff < 0
            ? (index + 1) % slides.length
            : (index - 1 + slides.length) % slides.length;
        update();
      }

      isDragging = false;
      startAutoplay();
    });

    update();
    startAutoplay();

    // Desktop-only behavior, safe to ignore on touch devices
    slider.addEventListener("mouseenter", stopAutoplay);
    slider.addEventListener("mouseleave", startAutoplay);

    // Enable keyboard navigation when slider is focused
    slider.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        index = (index + 1) % slides.length;
        update();
        startAutoplay();
      }

      if (e.key === "ArrowLeft") {
        index = (index - 1 + slides.length) % slides.length;
        update();
        startAutoplay();
      }
    });
  };

  const initAllHeroSliders = () => {
    document.querySelectorAll("[data-slider]").forEach(initHeroSlider);
  };

  document.addEventListener("DOMContentLoaded", initAllHeroSliders);

  // Required for dynamic section rendering in Shopify Editor
  document.addEventListener("shopify:section:load", (event) => {
    event.target.querySelectorAll("[data-slider]").forEach(initHeroSlider);
  });
})();
