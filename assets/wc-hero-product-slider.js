(function () {
  const initializeHeroProductSlider = (sliderContainer) => {
    if (!sliderContainer) return;

    const sliderTrack = sliderContainer.querySelector(
      ".hero-product-slider-track",
    );
    const productCards = Array.from(
      sliderContainer.querySelectorAll(".hero-product-card"),
    );
    const prevArrow = sliderContainer.querySelector(
      ".hero-product-slider-arrow--prev",
    );
    const nextArrow = sliderContainer.querySelector(
      ".hero-product-slider-arrow--next",
    );
    const dotsContainer = sliderContainer.parentElement.querySelector(
      ".hero-product-slider-dots",
    );

    let currentSlideIndex = 0;
    let cardsVisible = getCardsVisible();
    let totalSlides = Math.max(0, productCards.length - cardsVisible + 1);

    function getCardsVisible() {
      const width = window.innerWidth;
      if (width < 768) return 1;
      return 2;
    }

    function getMaxSlideIndex() {
      return Math.max(0, productCards.length - cardsVisible);
    }

    function updateSliderPosition() {
      const cardWidthPercent = 100 / cardsVisible;
      const offsetPercentage = currentSlideIndex * cardWidthPercent;
      sliderTrack.style.transform = `translateX(-${offsetPercentage}%)`;

      updateNavigationArrows();
      updateSlideDots();
    }

    function updateNavigationArrows() {
      if (prevArrow) prevArrow.disabled = currentSlideIndex === 0;
      if (nextArrow)
        nextArrow.disabled = currentSlideIndex >= getMaxSlideIndex();
    }

    function createSlideDots() {
      if (!dotsContainer) return;

      dotsContainer.innerHTML = "";

      for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement("button");
        dot.className = "hero-product-slider-dot";
        dot.setAttribute("aria-label", `Slide ${i + 1}`);

        if (i === currentSlideIndex) dot.classList.add("active");

        dot.addEventListener("click", () => {
          currentSlideIndex = i;
          updateSliderPosition();
        });

        dotsContainer.appendChild(dot);
      }
    }

    function updateSlideDots() {
      dotsContainer
        ?.querySelectorAll(".hero-product-slider-dot")
        .forEach((dot, index) => {
          dot.classList.toggle("active", index === currentSlideIndex);
        });
    }

    function goToPreviousSlide() {
      if (currentSlideIndex > 0) {
        currentSlideIndex--;
        updateSliderPosition();
      }
    }

    function goToNextSlide() {
      if (currentSlideIndex < getMaxSlideIndex()) {
        currentSlideIndex++;
        updateSliderPosition();
      }
    }

    prevArrow?.addEventListener("click", goToPreviousSlide);
    nextArrow?.addEventListener("click", goToNextSlide);

    let touchStartX = 0;
    sliderTrack.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    sliderTrack.addEventListener("touchend", (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > 50) {
        diff > 0 ? goToNextSlide() : goToPreviousSlide();
      }
    });

    sliderContainer.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") goToPreviousSlide();
      if (e.key === "ArrowRight") goToNextSlide();
    });

    productCards.forEach((card) => {
      initializeWishlist(card);
      initializeSizeSelector(card);
      initializeAddToCart(card);

      card.addEventListener("click", (e) => {
        if (
          e.target.closest(".hero-product-card__add-to-cart") ||
          e.target.closest(".hero-product-card__wishlist") ||
          e.target.closest(".hero-product-size-selector__option") ||
          e.target.closest(".hero-product-size-selector__arrow")
        )
          return;

        const productLink = card.querySelector(".hero-product-card__title a");
        if (productLink) window.location.href = productLink.href;
      });
    });

    function initializeWishlist(card) {
      const wishlistButton = card.querySelector(".hero-product-card__wishlist");
      if (!wishlistButton) return;

      wishlistButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        wishlistButton.classList.toggle("active");

        const productId = card.dataset.productId;
        const isActive = wishlistButton.classList.contains("active");

        let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");

        if (isActive && !wishlist.includes(productId)) wishlist.push(productId);
        if (!isActive) wishlist = wishlist.filter((id) => id !== productId);

        localStorage.setItem("wishlist", JSON.stringify(wishlist));
      });
    }

    function initializeSizeSelector(card) {
      const sizeOptions = card.querySelectorAll(
        ".hero-product-size-selector__option",
      );
      const prevBtn = card.querySelector(
        ".hero-product-size-selector__arrow--prev",
      );
      const nextBtn = card.querySelector(
        ".hero-product-size-selector__arrow--next",
      );
      const track = card.querySelector(".hero-product-size-selector__track");

      let activeIndex = 0;
      const visibleOptions = 3;

      const updateSizeTrack = () => {
        const optionWidth = sizeOptions[0]?.offsetWidth || 45;
        const gap = 8;
        track.style.transform = `translateX(-${activeIndex * (optionWidth + gap)}px)`;

        prevBtn.disabled = activeIndex === 0;
        nextBtn.disabled = activeIndex >= sizeOptions.length - visibleOptions;
      };

      sizeOptions.forEach((option, i) => {
        option.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          if (!option.disabled) {
            sizeOptions.forEach((o) => o.classList.remove("active"));
            option.classList.add("active");
            activeIndex = i;
            updateSizeTrack();
          }
        });
      });

      prevBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (activeIndex > 0) {
          activeIndex--;
          updateSizeTrack();
        }
      });

      nextBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (activeIndex < sizeOptions.length - visibleOptions) {
          activeIndex++;
          updateSizeTrack();
        }
      });

      updateSizeTrack();
    }

    function initializeAddToCart(card) {
      const addToCartButton = card.querySelector(
        ".hero-product-card__add-to-cart",
      );
      if (!addToCartButton) return;

      addToCartButton.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const selectedSize = card.querySelector(
          ".hero-product-size-selector__option.active",
        );
        const variantId = selectedSize?.dataset.variantId;

        if (!variantId) return alert("Por favor, selecione um tamanho");

        addToCartButton.classList.add("loading");
        addToCartButton.disabled = true;

        try {
          await fetch("/cart/add.js", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: [{ id: variantId, quantity: 1 }] }),
          });

          window.location.href = "/cart";
        } catch (error) {
          console.error("Erro ao adicionar ao carrinho:", error);
          alert("Erro ao adicionar ao carrinho. Tente novamente.");
          addToCartButton.classList.remove("loading");
          addToCartButton.disabled = false;
        }
      });
    }

    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    window.addEventListener(
      "resize",
      debounce(() => {
        cardsVisible = getCardsVisible();
        currentSlideIndex = Math.min(currentSlideIndex, getMaxSlideIndex());
        totalSlides = getMaxSlideIndex() + 1;

        createSlideDots();
        updateSliderPosition();
      }, 250),
    );

    createSlideDots();
    updateSliderPosition();
  };

  const initAllSliders = () => {
    document
      .querySelectorAll(".hero-product-slider-section")
      .forEach((section) => {
        const sliderContainer = section.querySelector(
          ".hero-product-slider-container",
        );
        if (sliderContainer) {
          initializeHeroProductSlider(sliderContainer);
        }
      });
  };

  document.addEventListener("DOMContentLoaded", initAllSliders);

  document.addEventListener("shopify:section:load", (event) => {
    const section = event.target.querySelector(".hero-product-slider-section");
    if (section) {
      const sliderContainer = section.querySelector(
        ".hero-product-slider-container",
      );
      if (sliderContainer) {
        initializeHeroProductSlider(sliderContainer);
      }
    }
  });
})();
