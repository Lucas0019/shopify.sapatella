(function () {
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

    function update() {
      track.style.transform = `translateX(-${index * 100}%)`;

      dotsWrapper?.querySelectorAll("button").forEach((dot, i) => {
        dot.classList.toggle("is-active", i === index);
      });
    }

    if (dotsWrapper && dotsWrapper.children.length === 0) {
      slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.addEventListener("click", () => {
          index = i;
          update();
        });
        dotsWrapper.appendChild(dot);
      });
    }

    prev?.addEventListener("click", () => {
      index = (index - 1 + slides.length) % slides.length;
      update();
    });

    next?.addEventListener("click", () => {
      index = (index + 1) % slides.length;
      update();
    });

    update();
  };

  const initAllHeroSliders = () => {
    document.querySelectorAll("[data-slider]").forEach(initHeroSlider);
  };

  document.addEventListener("DOMContentLoaded", initAllHeroSliders);

  document.addEventListener("shopify:section:load", (event) => {
    const section = event.target;
    section.querySelectorAll("[data-slider]").forEach(initHeroSlider);
  });
})();
