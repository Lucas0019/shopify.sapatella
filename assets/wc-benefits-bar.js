(function () {
  const benefitsBar = () => {};

  document.addEventListener("DOMContentLoaded", benefitsBar);

  document.addEventListener("shopify:section:load", (event) => {
    const section = event.target;
    if (section.matches("[data-section-type='benefits-bar']")) {
      benefitsBar();
    }
  });
})();
