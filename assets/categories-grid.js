(function () {
  const categoriesGrid = () => {
    console.log("Categories Grid script loaded");
  };

  document.addEventListener("DOMContentLoaded", categoriesGrid);

  document.addEventListener("shopify:section:load", (event) => {
    const section = event.target;
    section.querySelectorAll("[data-slider]").forEach(categoriesGrid);
  });
})();
