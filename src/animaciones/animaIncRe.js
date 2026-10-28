import gsap from "gsap";

/**
 * Animación de entrada inicial para la tarjeta contenedora principal.
 * Sin forzar opacity: 0 sobre elementos ya renderizados en HTML/SSR.
 * @param {HTMLElement} cardElement 
 */
export function animateEntrance(cardElement) {
  if (!cardElement) return;

  // Garantizar visibilidad inmediata y limpiar transformaciones para máxima fluidez
  gsap.set(cardElement, { opacity: 1, clearProps: "transform" });
  const elements = cardElement.querySelectorAll(".animate-stagger-item");
  if (elements.length > 0) {
    gsap.set(elements, { opacity: 1, clearProps: "transform" });
  }
}

/**
 * Transición suave y optimizada al alternar entre la vista de Login y la vista de Registro.
 * @param {HTMLElement} panelLeftContent Contenido dinámico del panel izquierdo
 * @param {HTMLElement} formContent Contenedor del formulario activo
 * @param {'next' | 'prev'} direction
 */
export function animateTabEnter(panelLeftContent, formContent, direction = "next") {
  const deltaX = direction === "next" ? 14 : -14;

  if (formContent) {
    gsap.killTweensOf(formContent);
    gsap.fromTo(
      formContent,
      { opacity: 0, x: deltaX },
      {
        opacity: 1,
        x: 0,
        duration: 0.2,
        ease: "power2.out",
        clearProps: "transform,opacity",
      }
    );
  }

  if (panelLeftContent) {
    gsap.killTweensOf(panelLeftContent);
    gsap.fromTo(
      panelLeftContent,
      { opacity: 0.3, y: 6 },
      {
        opacity: 1,
        y: 0,
        duration: 0.2,
        ease: "power2.out",
        clearProps: "transform,opacity",
      }
    );
  }
}

/**
 * Transición suave entre pasos del Stepper de Registro con GSAP.
 * @param {HTMLElement} stepElement Contenedor del paso activo
 * @param {'next' | 'prev'} direction Dirección del cambio
 * @param {Function} callback Función para cambiar el estado del paso
 */
export function animateStepTransition(stepElement, direction = "next", callback) {
  if (!stepElement) {
    if (typeof callback === "function") callback();
    return;
  }

  const outX = direction === "next" ? -18 : 18;
  const inX = direction === "next" ? 18 : -18;

  gsap.killTweensOf(stepElement);
  gsap.to(stepElement, {
    opacity: 0,
    x: outX,
    duration: 0.12,
    ease: "power2.in",
    onComplete: () => {
      if (typeof callback === "function") callback();
      gsap.fromTo(
        stepElement,
        { opacity: 0, x: inX },
        {
          opacity: 1,
          x: 0,
          duration: 0.2,
          ease: "power2.out",
          clearProps: "transform,opacity",
        }
      );
    },
  });
}

/**
 * Efecto de sacudida (shake) para alertar errores en campos o validaciones.
 * @param {HTMLElement} element 
 */
export function shakeElement(element) {
  if (!element) return;
  gsap.fromTo(
    element,
    { x: 0 },
    {
      x: 10,
      duration: 0.08,
      repeat: 5,
      yoyo: true,
      ease: "power1.inOut",
      onComplete: () => {
        gsap.set(element, { x: 0 });
      }
    }
  );
}

/**
 * Animación de apertura para el modal de feedback / notificación.
 * @param {HTMLElement} modalContainer 
 * @param {HTMLElement} modalContent 
 */
export function animateModalOpen(modalContainer, modalContent) {
  if (!modalContainer || !modalContent) return;

  gsap.killTweensOf([modalContainer, modalContent]);
  
  gsap.fromTo(
    modalContainer,
    { opacity: 0 },
    { opacity: 1, duration: 0.25, ease: "power2.out" }
  );

  gsap.fromTo(
    modalContent,
    { scale: 0.92, opacity: 0, y: 16 },
    { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: "back.out(1.6)" }
  );
}

/**
 * Animación de cierre para el modal.
 * @param {HTMLElement} modalContainer 
 * @param {HTMLElement} modalContent 
 * @param {Function} onComplete 
 */
export function animateModalClose(modalContainer, modalContent, onComplete) {
  if (!modalContainer || !modalContent) {
    if (onComplete) onComplete();
    return;
  }

  const tl = gsap.timeline({
    onComplete: () => {
      if (typeof onComplete === "function") onComplete();
    }
  });

  tl.to(modalContent, {
    scale: 0.95,
    opacity: 0,
    y: 8,
    duration: 0.18,
    ease: "power2.in"
  }).to(
    modalContainer,
    { opacity: 0, duration: 0.18, ease: "power2.in" },
    "<0.05"
  );
}

/**
 * Anima un conjunto de orbes de luz ambiental para crear un degradado vivo,
 * continuo y moderno con GSAP.
 * @param {Array<HTMLElement>} orbs
 * @returns {Function} Función de limpieza para matar las animaciones activas
 */
export function animateAmbientBackground(orbs) {
  if (!orbs || orbs.length === 0) return () => {};

  const ctx = gsap.context(() => {
    // Configuración de movimiento orgánico individual para cada orbe
    const configs = [
      {
        x: [0, 45, -30, 20, 0],
        y: [0, -40, 35, -20, 0],
        scale: [1, 1.2, 0.95, 1.15, 1],
        opacity: [0.22, 0.35, 0.2, 0.3, 0.22],
        duration: 12,
      },
      {
        x: [0, -50, 25, -35, 0],
        y: [0, 45, -30, 50, 0],
        scale: [1, 0.9, 1.25, 1.05, 1],
        opacity: [0.18, 0.28, 0.15, 0.32, 0.18],
        duration: 16,
      },
      {
        x: [0, 35, -45, 15, 0],
        y: [0, -35, -15, 40, 0],
        scale: [1, 1.15, 0.85, 1.1, 1],
        opacity: [0.15, 0.25, 0.18, 0.3, 0.15],
        duration: 14,
      },
      {
        x: [0, -25, 40, -15, 0],
        y: [0, 30, -40, 20, 0],
        scale: [1, 1.25, 1, 0.9, 1],
        opacity: [0.12, 0.22, 0.15, 0.25, 0.12],
        duration: 10,
      },
    ];

    orbs.forEach((orb, i) => {
      if (!orb) return;
      const conf = configs[i % configs.length];

      // Animación continua con Timeline en bucle infinito
      const tl = gsap.timeline({ repeat: -1, yoyo: true });

      tl.to(orb, {
        x: conf.x[1],
        y: conf.y[1],
        scale: conf.scale[1],
        opacity: conf.opacity[1],
        duration: conf.duration * 0.3,
        ease: "sine.inOut",
      })
        .to(orb, {
          x: conf.x[2],
          y: conf.y[2],
          scale: conf.scale[2],
          opacity: conf.opacity[2],
          duration: conf.duration * 0.35,
          ease: "sine.inOut",
        })
        .to(orb, {
          x: conf.x[3],
          y: conf.y[3],
          scale: conf.scale[3],
          opacity: conf.opacity[3],
          duration: conf.duration * 0.35,
          ease: "sine.inOut",
        });
    });
  });

  return () => ctx.revert();
}
