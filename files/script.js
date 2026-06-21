/* ============================================================
   MINI SHOP — SCRIPT.JS
   Interactions : reveal au scroll, accordéon FAQ, zoom image,
   stepper quantité + calcul total, validation formulaire,
   CTA sticky mobile.

   🔁 À REMPLACER :
     - PRODUCT_PRICE : le prix réel du produit (sert au calcul du total)
     - L'URL d'envoi du formulaire (voir bloc "ENVOI DU FORMULAIRE")
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ----------------------------------------------------------
     1. PRIX PRODUIT (utilisé pour le calcul du total commande)
     🔁 À REMPLACER par le prix réel (en DH, nombre entier)
     ---------------------------------------------------------- */
  const PRODUCT_PRICE = 299;

  /* ----------------------------------------------------------
     2. REVEAL AU SCROLL (apparition douce des sections)
     ---------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ----------------------------------------------------------
     3. ACCORDÉON FAQ
     ---------------------------------------------------------- */
  document.querySelectorAll(".accordion__trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const item = trigger.closest(".accordion__item");
      const panel = item.querySelector(".accordion__panel");
      const isOpen = item.classList.contains("is-open");

      // Ferme les autres items ouverts (comportement accordéon classique)
      document.querySelectorAll(".accordion__item.is-open").forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove("is-open");
          openItem.querySelector(".accordion__trigger").setAttribute("aria-expanded", "false");
          openItem.querySelector(".accordion__panel").style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
        panel.style.maxHeight = null;
      } else {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });

  /* ----------------------------------------------------------
     4. ZOOM IMAGE / LIGHTBOX
     Clic sur une image placeholder (ou vraie image plus tard)
     → ouverture d'une vue agrandie en plein écran.
     ---------------------------------------------------------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxContent = lightbox.querySelector(".lightbox__content");
  const lightboxClose = document.getElementById("lightboxClose");

  document.querySelectorAll("[data-lightbox]").forEach((el) => {
    el.addEventListener("click", () => {
      const label = el.querySelector(".media-placeholder__label");
      lightboxContent.innerHTML = "";
      // 🔁 Quand vous remplacerez les placeholders par de vraies images,
      // clonez plutôt l'élément <img> ici au lieu du texte du label.
      const span = document.createElement("span");
      span.textContent = label ? label.textContent : "Image";
      lightboxContent.appendChild(span);

      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });
  });

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  /* ----------------------------------------------------------
     5. VIDÉO PLACEHOLDER — bouton "play"
     🔁 Une fois la vraie vidéo intégrée (balise <video>), ce bloc
     peut être adapté pour lancer video.play() au clic.
     ---------------------------------------------------------- */
  const playBtn = document.querySelector(".media-placeholder__play");
  if (playBtn) {
    playBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const realVideo = playBtn.closest(".media-placeholder").querySelector("video");
      if (realVideo) {
        realVideo.play();
        playBtn.style.display = "none";
      } else {
        alert("🔁 Remplacez ce placeholder par votre vraie vidéo produit.");
      }
    });
  }

  /* ----------------------------------------------------------
     6. STEPPER QUANTITÉ + CALCUL DU TOTAL
     ---------------------------------------------------------- */
  const qtyInput = document.getElementById("quantity");
  const orderTotalEl = document.getElementById("orderTotal");

  function updateTotal() {
    const qty = parseInt(qtyInput.value, 10) || 1;
    const total = qty * PRODUCT_PRICE;
    orderTotalEl.textContent = total.toLocaleString("fr-FR") + " DH";
  }

  document.querySelectorAll(".stepper__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const step = parseInt(btn.dataset.step, 10);
      let value = parseInt(qtyInput.value, 10) || 1;
      value = Math.min(10, Math.max(1, value + step));
      qtyInput.value = value;
      updateTotal();
    });
  });
  if (qtyInput) updateTotal();

  /* ----------------------------------------------------------
     7. BOUTONS "COMMANDER MAINTENANT" → scroll fluide vers le formulaire
     ---------------------------------------------------------- */
  document.querySelectorAll(".js-scroll-to-order").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("order").scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => document.getElementById("fullName")?.focus(), 600);

      // 🔁 ÉVÉNEMENT TRACKING : décommentez si Meta Pixel / GA sont actifs
      // if (window.fbq) fbq('track', 'InitiateCheckout');
      // if (window.gtag) gtag('event', 'begin_checkout');
    });
  });

  /* ----------------------------------------------------------
     8. CTA STICKY MOBILE — masqué quand le formulaire est visible
     ---------------------------------------------------------- */
  const stickyCta = document.getElementById("stickyCta");
  const orderSection = document.getElementById("order");
  if (stickyCta && orderSection && "IntersectionObserver" in window) {
    const stickyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          stickyCta.classList.toggle("is-hidden", entry.isIntersecting);
        });
      },
      { threshold: 0.25 }
    );
    stickyObserver.observe(orderSection);
  }

  /* ----------------------------------------------------------
     9. VALIDATION + ENVOI DU FORMULAIRE DE COMMANDE
     ---------------------------------------------------------- */
  const orderForm = document.getElementById("orderForm");
  const orderSuccess = document.getElementById("orderSuccess");

  // Format simplifié des numéros marocains : 0[5-7]XXXXXXXX
  const PHONE_REGEX = /^0[5-7][0-9]{8}$/;

  function setFieldError(field, hasError) {
    field.classList.toggle("is-invalid", hasError);
  }

  orderForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const fullName = orderForm.fullName;
    const phone = orderForm.phone;
    const city = orderForm.city;
    const address = orderForm.address;

    let isValid = true;

    setFieldError(fullName, fullName.value.trim().length < 3);
    if (fullName.value.trim().length < 3) isValid = false;

    const cleanPhone = phone.value.replace(/\s+/g, "");
    setFieldError(phone, !PHONE_REGEX.test(cleanPhone));
    if (!PHONE_REGEX.test(cleanPhone)) isValid = false;

    setFieldError(city, city.value.trim().length < 2);
    if (city.value.trim().length < 2) isValid = false;

    setFieldError(address, address.value.trim().length < 5);
    if (address.value.trim().length < 5) isValid = false;

    if (!isValid) {
      orderForm.querySelector(".is-invalid")?.focus();
      return;
    }

    /* --------------------------------------------------------
       🔁 ENVOI DU FORMULAIRE
       Remplacez ce bloc par votre intégration réelle :
       - Google Sheets (via Apps Script Web App)
       - Votre backend / CRM COD (ex: YouCan, Sendcloud, etc.)
       - Une simple requête fetch() vers votre endpoint

       Exemple :
       fetch("https://votre-endpoint.com/commande", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(Object.fromEntries(new FormData(orderForm)))
       });
    -------------------------------------------------------- */

    // 🔁 ÉVÉNEMENT TRACKING : décommentez si Meta Pixel / GA sont actifs
    // if (window.fbq) fbq('track', 'Purchase', { currency: "MAD", value: PRODUCT_PRICE * parseInt(qtyInput.value, 10) });
    // if (window.gtag) gtag('event', 'purchase');

    orderForm.reset();
    qtyInput.value = 1;
    updateTotal();

    orderSuccess.hidden = false;
    orderSuccess.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  // Retire le style d'erreur dès que l'utilisateur corrige le champ
  orderForm.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("input", () => field.classList.remove("is-invalid"));
  });

});
