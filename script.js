document.addEventListener("DOMContentLoaded", () => {
  const PRODUCT_PRICE = 199;

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

  document.querySelectorAll(".accordion__trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const item = trigger.closest(".accordion__item");
      const panel = item.querySelector(".accordion__panel");
      const isOpen = item.classList.contains("is-open");

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

  const lightbox = document.getElementById("lightbox");
  const lightboxContent = lightbox?.querySelector(".lightbox__content");
  const lightboxClose = document.getElementById("lightboxClose");

  if (lightbox && lightboxContent && lightboxClose) {
    document.querySelectorAll("[data-lightbox]").forEach((el) => {
      el.addEventListener("click", () => {
        lightboxContent.innerHTML = "";

        const img = el.querySelector("img");
        if (img) {
          const clonedImg = img.cloneNode(true);
          lightboxContent.appendChild(clonedImg);
        } else {
          const label = el.querySelector(".media-placeholder__label");
          const span = document.createElement("span");
          span.textContent = label ? label.textContent : "Image";
          lightboxContent.appendChild(span);
        }

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
  }

  const playBtn = document.querySelector(".media-placeholder__play");
  if (playBtn) {
    playBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const realVideo = playBtn.closest(".media-placeholder").querySelector("video");
      if (realVideo) {
        realVideo.play();
        playBtn.style.display = "none";
      }
    });
  }

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

  document.querySelectorAll(".js-scroll-to-order").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("order").scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => document.getElementById("fullName")?.focus(), 600);
    });
  });

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

  const orderForm = document.getElementById("orderForm");
  const orderSuccess = document.getElementById("orderSuccess");
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

    const submitBtn = orderForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "جاري إرسال الطلب...";

    const payload = {
      product: orderForm.product.value,
      fullName: fullName.value.trim(),
      phone: cleanPhone,
      city: city.value.trim(),
      address: address.value.trim(),
      quantity: qtyInput.value,
      total: PRODUCT_PRICE * parseInt(qtyInput.value, 10)
    };

    fetch("https://script.google.com/macros/s/AKfycbzOq7qlCNY46jQqYkpVn5bBvb757u2ZU0hvMafrQ87MbZ-mwTaNxl0JS46RTiZGyroq/exec", {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(payload)
    })
      .then(() => {
        orderForm.reset();
        qtyInput.value = 1;
        updateTotal();

        orderSuccess.hidden = false;
        orderSuccess.scrollIntoView({ behavior: "smooth", block: "center" });

        submitBtn.disabled = false;
        submitBtn.textContent = "تأكيد الطلب";
      })
      .catch(() => {
        alert("حدث خطأ أثناء إرسال الطلب. المرجو المحاولة مرة أخرى أو التواصل معنا عبر واتساب.");
        submitBtn.disabled = false;
        submitBtn.textContent = "تأكيد الطلب";
      });
  });

  orderForm.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("input", () => field.classList.remove("is-invalid"));
  });
});
