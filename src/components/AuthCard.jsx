import React, { useState, useEffect, useRef } from "react";
import { iniciarSesion, verificarYRefrescarSesion } from "../scripts/login.js";
import { registrarUsuario, validarTokenInvitacion } from "../scripts/registro.js";
import {
  animateEntrance,
  animateTabEnter,
  shakeElement,
  animateModalOpen,
  animateModalClose,
  animateAmbientBackground,
  animateStepTransition,
} from "../animaciones/animaIncRe.js";

export default function AuthCard() {
  const [mode, setMode] = useState("login"); // 'login' | 'register'

  // Estados de Login
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("vendedor");
  const [rememberSession, setRememberSession] = useState(false);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Estados de Registro & Stepper (1 a 3)
  const [regStep, setRegStep] = useState(1); // 1: Validación, 2: Datos, 3: Seguridad
  const [regToken, setRegToken] = useState("");
  const [tokenStatus, setTokenStatus] = useState({ valid: false, text: "" });
  const [regName, setRegName] = useState("");
  const [regLastname, setRegLastname] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [isSubmittingRegister, setIsSubmittingRegister] = useState(false);

  // Modal de Notificación / Feedback
  const [modal, setModal] = useState({
    isOpen: false,
    icon: "check_circle",
    bgClass: "bg-tertiary-container",
    textClass: "text-on-tertiary-container",
    title: "",
    message: "",
    action: null,
  });

  // Referencias para animaciones GSAP
  const cardRef = useRef(null);
  const panelLeftRef = useRef(null);
  const panelRightRef = useRef(null);
  const leftContentRef = useRef(null);
  const formContentRef = useRef(null);
  const loginFormRef = useRef(null);
  const registerFormRef = useRef(null);
  const stepContainerRef = useRef(null);
  const modalContainerRef = useRef(null);
  const modalContentRef = useRef(null);

  // Referencias para los orbes de degradado ambiental
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);
  const orb4Ref = useRef(null);
  const rightOrb1Ref = useRef(null);
  const rightOrb2Ref = useRef(null);

  // Auto-redirigir al Dashboard si ya existe una sesión activa y válida (sesión persistente sin volver a loguearse)
  useEffect(() => {
    verificarYRefrescarSesion().then((res) => {
      if (res && res.valid) {
        window.location.href = "/DashPrincipal";
      }
    });
  }, []);

  // Entrada inicial
  useEffect(() => {
    if (cardRef.current) {
      animateEntrance(cardRef.current);
    }

    // Iniciar animación continua de degradado ambiental moderno
    const leftOrbs = [orb1Ref.current, orb2Ref.current, orb3Ref.current, orb4Ref.current].filter(Boolean);
    const rightOrbs = [rightOrb1Ref.current, rightOrb2Ref.current].filter(Boolean);

    const cleanupLeft = animateAmbientBackground(leftOrbs);
    const cleanupRight = animateAmbientBackground(rightOrbs);

    return () => {
      cleanupLeft();
      cleanupRight();
    };
  }, []);

  // Animación del modal cuando cambia isOpen
  useEffect(() => {
    if (modal.isOpen) {
      animateModalOpen(modalContainerRef.current, modalContentRef.current);
    }
  }, [modal.isOpen]);

  // Cálculo de fortaleza de contraseña
  const calculatePasswordStrength = (pwd) => {
    if (!pwd || pwd.length === 0) {
      return { score: 0, text: "Sin contraseña", color: "bg-outline" };
    }
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score >= 4) {
      return { score: 4, text: "Excelente (12+ caracteres)", color: "bg-on-tertiary-container" };
    }
    if (score === 3) {
      return { score: 3, text: "Buena (Nivel seguro)", color: "bg-tertiary-fixed-dim" };
    }
    if (score === 2) {
      return { score: 2, text: "Aceptable (Básica)", color: "bg-secondary" };
    }
    return { score: 1, text: "Débil (Recomendamos símbolos y mayúsculas)", color: "bg-error" };
  };

  const pwdStrength = calculatePasswordStrength(regPassword);

  // Generación automática del usuario corporativo en tiempo real:
  // 2 primeras letras del nombre + 3 primeras letras del apellido
  useEffect(() => {
    const cleanStr = (str) =>
      (str || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");

    const namePart = cleanStr(regName).slice(0, 2);
    const lastnamePart = cleanStr(regLastname).slice(0, 3);

    setRegUsername(namePart + lastnamePart);
  }, [regName, regLastname]);

  // Manejo y sanitización del campo de teléfono (solo números, '+' inicial, espacios y guiones)
  const handlePhoneChange = (e) => {
    const rawVal = e.target.value;
    let sanitized = "";
    if (rawVal.startsWith("+")) {
      sanitized = "+" + rawVal.slice(1).replace(/[^0-9\s\-]/g, "");
    } else {
      sanitized = rawVal.replace(/[^0-9\s\-]/g, "");
    }
    setRegPhone(sanitized);
  };

  // Bloqueo de teclas alfabéticas u otros símbolos en el campo de teléfono
  const handlePhoneKeyDown = (e) => {
    const allowedKeys = [
      "Backspace",
      "Tab",
      "Enter",
      "Escape",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Delete",
      "Home",
      "End",
    ];
    if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
      return;
    }
    if (e.key === "+" && e.target.selectionStart === 0 && !e.target.value.includes("+")) {
      return;
    }
    if (/^[0-9\s\-]$/.test(e.key)) {
      return;
    }
    e.preventDefault();
  };

  // Cambio de Tab instantáneo con transición fluida del contenido
  const handleTabChange = (newMode) => {
    if (mode === newMode) return;

    setMode(newMode);
    if (newMode === "login") {
      setRegStep(1);
    }

    requestAnimationFrame(() => {
      animateTabEnter(
        leftContentRef.current,
        formContentRef.current,
        newMode === "register" ? "next" : "prev"
      );
    });
  };

  // Navegación entre pasos del Stepper (Paso 1, 2 y 3)
  const handleNextStep = (e) => {
    if (e) e.preventDefault();

    if (regStep === 1) {
      if (!regToken.trim()) {
        shakeElement(stepContainerRef.current);
        openModal(
          "error",
          "bg-error-container",
          "text-on-error-container",
          "Token Requerido",
          "Por favor ingrese el Token de Invitación institucional provisto por su supervisor para continuar."
        );
        return;
      }
      animateStepTransition(stepContainerRef.current, "next", () => {
        setRegStep(2);
      });
    } else if (regStep === 2) {
      if (!regName.trim() || !regLastname.trim() || !regEmail.trim()) {
        shakeElement(stepContainerRef.current);
        openModal(
          "error",
          "bg-error-container",
          "text-on-error-container",
          "Datos Incompletos",
          "Por favor complete su nombre, apellido y correo corporativo para avanzar al último paso."
        );
        return;
      }
      if (regName.trim().length < 2 || regLastname.trim().length < 3) {
        shakeElement(stepContainerRef.current);
        openModal(
          "error",
          "bg-error-container",
          "text-on-error-container",
          "Filiación Insuficiente",
          "El nombre debe contener al menos 2 letras y el apellido al menos 3 letras para generar su usuario corporativo."
        );
        return;
      }

      // Validación estricta de teléfono
      const phoneDigits = regPhone.replace(/\D/g, "");
      if (!regPhone.trim()) {
        shakeElement(stepContainerRef.current);
        openModal(
          "error",
          "bg-error-container",
          "text-on-error-container",
          "Teléfono Requerido",
          "Por favor ingrese su número de teléfono corporativo o móvil."
        );
        return;
      }
      if (phoneDigits.length < 7 || phoneDigits.length > 15) {
        shakeElement(stepContainerRef.current);
        openModal(
          "error",
          "bg-error-container",
          "text-on-error-container",
          "Teléfono Inválido",
          "El número telefónico debe contener entre 7 y 15 dígitos numéricos (no se permiten letras ni símbolos no autorizados)."
        );
        return;
      }

      animateStepTransition(stepContainerRef.current, "next", () => {
        setRegStep(3);
      });
    }
  };

  const handlePrevStep = () => {
    if (regStep > 1) {
      animateStepTransition(stepContainerRef.current, "prev", () => {
        setRegStep((prev) => prev - 1);
      });
    }
  };

  // Validación de Token al escribir
  const handleTokenChange = async (e) => {
    const value = e.target.value;
    setRegToken(value);
    if (value.trim().length >= 5) {
      const res = await validarTokenInvitacion(value);
      setTokenStatus({
        valid: res.valid,
        text: res.valid ? "Verificado ✓" : "Inválido ✗",
      });
    } else {
      setTokenStatus({ valid: false, text: "Pendiente" });
    }
  };

  // Envío del Formulario de Login
  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      shakeElement(loginFormRef.current);
      openModal(
        "error",
        "bg-error-container",
        "text-on-error-container",
        "Campos Incompletos",
        "Por favor ingrese su usuario o correo institucional y su contraseña corporativa."
      );
      return;
    }

    setIsSubmittingLogin(true);
    const result = await iniciarSesion({
      identifier: loginIdentifier,
      password: loginPassword,
      role: selectedRole,
      rememberSession,
    });
    setIsSubmittingLogin(false);

    if (result.success) {
      // Limpiar campos de login al enviar
      setLoginIdentifier("");
      setLoginPassword("");

      openModal(
        "check_circle",
        "bg-tertiary-container",
        "text-on-tertiary-container",
        "Inicio de Sesión Exitoso",
        result.message || "Accediendo al entorno de trabajo con credenciales autorizadas.",
        () => {
          window.location.href = "/DashPrincipal";
        }
      );
    } else {
      shakeElement(loginFormRef.current);
      openModal(
        "error",
        "bg-error-container",
        "text-on-error-container",
        "Error de Acceso",
        result.message || "Las credenciales introducidas no coinciden con nuestros registros."
      );
    }
  };

  // Envío del Formulario de Registro
  const handleRegisterSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!regPassword.trim() || regPassword.length < 8) {
      shakeElement(stepContainerRef.current);
      openModal(
        "error",
        "bg-error-container",
        "text-on-error-container",
        "Contraseña Inválida",
        "La contraseña debe contener al menos 8 caracteres para cumplir la directiva de seguridad."
      );
      return;
    }

    if (regPassword !== regConfirmPassword) {
      shakeElement(stepContainerRef.current);
      openModal(
        "error",
        "bg-error-container",
        "text-on-error-container",
        "Discrepancia en Contraseña",
        "Las claves introducidas no coinciden. Por favor, verifíquelas e intente nuevamente."
      );
      return;
    }

    if (!acceptedPolicies) {
      shakeElement(stepContainerRef.current);
      openModal(
        "info",
        "bg-secondary-fixed",
        "text-secondary",
        "Políticas Obligatorias",
        "Debe aceptar la directiva de seguridad y trazabilidad de datos corporativa."
      );
      return;
    }

    setIsSubmittingRegister(true);
    const result = await registrarUsuario({
      token: regToken,
      name: regName,
      lastname: regLastname,
      phone: regPhone,
      email: regEmail,
      username: regUsername,
      password: regPassword,
      acceptedPolicies,
    });
    setIsSubmittingRegister(false);

    if (result.success) {
      const registeredUsername = regUsername;

      // Limpiar todos los campos de registro al enviar
      setRegToken("");
      setTokenStatus({ valid: false, text: "" });
      setRegName("");
      setRegLastname("");
      setRegPhone("");
      setRegEmail("");
      setRegUsername("");
      setRegPassword("");
      setRegConfirmPassword("");
      setAcceptedPolicies(false);
      setRegStep(1);

      openModal(
        "mark_email_read",
        "bg-surface-container-high",
        "text-secondary",
        "Registro de Usuario Solicitado",
        result.message || `El usuario corporativo @${registeredUsername} ha sido registrado.`,
        () => {
          handleTabChange("login");
        }
      );
    } else {
      shakeElement(stepContainerRef.current);
      openModal(
        "error",
        "bg-error-container",
        "text-on-error-container",
        "Error en Solicitud",
        result.message || "No se pudo completar el registro de usuario."
      );
    }
  };

  // Modal helpers
  const openModal = (icon, bgClass, textClass, title, message, action = null) => {
    setModal({
      isOpen: true,
      icon,
      bgClass,
      textClass,
      title,
      message,
      action,
    });
  };

  const closeModal = () => {
    animateModalClose(modalContainerRef.current, modalContentRef.current, () => {
      setModal((prev) => ({ ...prev, isOpen: false }));
      if (typeof modal.action === "function") {
        modal.action();
      }
    });
  };

  const handleForgotPassword = () => {
    openModal(
      "forward_to_inbox",
      "bg-surface-container-high",
      "text-secondary",
      "Recuperación de Acceso",
      "Se ha emitido un enlace de restablecimiento con token efímero a su correo corporativo institucional: " +
        (loginIdentifier || "usuario@stockcontrol.com")
    );
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto my-auto items-center justify-center p-3 sm:p-6 lg:p-8">
      <div
        ref={cardRef}
        className="w-full grid grid-cols-1 md:grid-cols-12 rounded-2xl shadow-xl overflow-hidden bg-surface-container-lowest border border-surface-container transition-all"
      >
        {/* ======================================================== */}
        {/* COLUMNA IZQUIERDA: HERO & IDENTIDAD CORPORATIVA          */}
        {/* ======================================================== */}
        <div
          ref={panelLeftRef}
          className="col-span-1 md:col-span-5 bg-primary text-on-primary p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden"
        >
          {/* Capa de degradado ambiental animado moderno con GSAP */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Gradiente radial base sutil */}
            <div className="absolute inset-0 bg-radial-[at_30%_20%] from-secondary-container/15 via-primary to-primary opacity-90 pointer-events-none"></div>

            {/* Orbe 1: Azul Eléctrico (Superior Derecho) */}
            <div
              ref={orb1Ref}
              className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-secondary-container/30 blur-[75px] will-change-transform pointer-events-none"
            ></div>

            {/* Orbe 2: Esmeralda / Turquesa Corporativo (Centro Izquierdo) */}
            <div
              ref={orb2Ref}
              className="absolute top-1/3 -left-20 w-72 h-72 rounded-full bg-on-tertiary-container/25 blur-[85px] will-change-transform pointer-events-none"
            ></div>

            {/* Orbe 3: Azul Zafiro Profundo (Inferior Derecho) */}
            <div
              ref={orb3Ref}
              className="absolute -bottom-16 right-4 w-72 h-72 rounded-full bg-secondary/25 blur-[80px] will-change-transform pointer-events-none"
            ></div>

            {/* Orbe 4: Brillo Menta Sutil (Centro) */}
            <div
              ref={orb4Ref}
              className="absolute top-2/3 left-1/4 w-60 h-60 rounded-full bg-tertiary-fixed-dim/20 blur-[70px] will-change-transform pointer-events-none"
            ></div>
          </div>

          {mode === "login" ? (
            /* Vista Izquierda: Modo Login */
            <div ref={leftContentRef} className="relative z-10 flex flex-col justify-between h-full gap-8">
              <div>
                {/* Logo & Brand Header */}
                <div className="flex items-center gap-3.5 mb-8">
                  <div className="w-11 h-11 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary shadow-md shrink-0">
                    <span className="material-symbols-outlined text-[26px]">layers</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-md text-[19px] font-bold text-on-primary tracking-tight">
                        Control de Stock
                      </span>
                      <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
                    </div>
                    <span
                      className="font-label-sm text-[10px] uppercase tracking-wider text-surface-variant font-semibold"
                      style={{ color: "rgb(133, 144, 166)", letterSpacing: "0.55px" }}
                    >
                      ENTERPRISE JR
                    </span>
                  </div>
                </div>

                {/* Título & Descripción */}
                <div className="space-y-3">
                  <h1 className="font-headline-lg text-[22px] sm:text-[24px] text-on-primary font-bold leading-snug">
                    Gestión Operativa de Máxima Precisión
                  </h1>
                  <p className="font-body-md text-[13px] sm:text-[14px] text-surface-variant leading-relaxed">
                    Sistema integral de inventario en tiempo real, trazabilidad de gastos operacionales y terminales de venta sincronizados.
                  </p>
                </div>
              </div>

              {/* Status Footer */}
              <div className="relative z-10 pt-5 mt-auto flex flex-wrap items-center justify-between gap-3 text-label-sm font-label-sm text-surface-variant border-t border-on-primary-container/20">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-on-tertiary-container animate-pulse"></span>
                  <span className="font-medium">Núcleo Operacional v1.0.4 Activo</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary-container/60 text-[11px] font-medium">
                  <span className="material-symbols-outlined text-[14px]">terminal</span>
                  <span>Sucursal Central</span>
                </div>
              </div>
            </div>
          ) : (
            /* Vista Izquierda: Modo Registro / Alta */
            <div ref={leftContentRef} className="relative z-10 flex flex-col justify-between h-full gap-8">
              <div className="space-y-6">
                {/* Logo & Brand Header */}
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary shadow-md shrink-0">
                    <span className="material-symbols-outlined text-[26px]">layers</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-headline-md text-[19px] font-bold text-on-primary tracking-tight">
                        Control de Stock
                      </span>
                      <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
                    </div>
                    <span className="font-label-sm text-[10px] uppercase tracking-wider text-on-primary-container font-semibold">
                      ENTERPRISE JR
                    </span>
                  </div>
                </div>

                {/* Subtitle & Badge */}
                <div className="space-y-2.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container text-tertiary-fixed text-[11px] font-semibold w-fit">
                    <span className="material-symbols-outlined text-[15px]">verified_user</span>
                    Validación de Personal Activo
                  </div>
                  <h1 className="font-headline-lg text-[22px] text-on-primary tracking-tight font-bold leading-snug">
                    Alta y Activación de Cuenta Corporativa
                  </h1>
                  <p className="font-body-md text-[13px] text-on-primary-container leading-relaxed">
                    Valide su invitación institucional provista por el Administrador y configure sus credenciales de acceso seguro.
                  </p>
                </div>

                {/* Pasos de Validación en Panel Izquierdo sincronizados con el Stepper */}
                <div className="space-y-3 pt-1">
                  {/* Paso 1: Invitación */}
                  <div
                    className={`flex items-start gap-3 p-3 rounded-xl backdrop-blur-sm transition-all duration-300 border ${
                      regStep === 1
                        ? "bg-secondary-container/25 border-secondary-container/50 shadow-xs ring-1 ring-secondary/30"
                        : regStep > 1
                        ? "bg-tertiary-container/30 border-on-tertiary-container/30"
                        : "bg-primary-container/40 border-on-primary-container/10 opacity-60"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[13px] shrink-0 mt-0.5 transition-colors ${
                        regStep > 1
                          ? "bg-on-tertiary-container text-white"
                          : regStep === 1
                          ? "bg-secondary text-on-secondary shadow-xs"
                          : "bg-secondary-container/20 text-secondary-fixed"
                      }`}
                    >
                      {regStep > 1 ? (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      ) : (
                        "1"
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-[13px] text-on-primary font-semibold flex items-center gap-1.5">
                        Invitación Preautorizada
                        {regStep === 1 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary-container animate-pulse"></span>
                        )}
                      </span>
                      <span className="font-body-sm text-[11px] text-on-primary-container mt-0.5 leading-snug">
                        Su cuenta debe haber sido dada de alta previamente por un usuario con rol Jefe / Admin.
                      </span>
                    </div>
                  </div>

                  {/* Paso 2: Perfil & Datos */}
                  <div
                    className={`flex items-start gap-3 p-3 rounded-xl backdrop-blur-sm transition-all duration-300 border ${
                      regStep === 2
                        ? "bg-secondary-container/25 border-secondary-container/50 shadow-xs ring-1 ring-secondary/30"
                        : regStep > 2
                        ? "bg-tertiary-container/30 border-on-tertiary-container/30"
                        : "bg-primary-container/40 border-on-primary-container/10 opacity-60"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[13px] shrink-0 mt-0.5 transition-colors ${
                        regStep > 2
                          ? "bg-on-tertiary-container text-white"
                          : regStep === 2
                          ? "bg-secondary text-on-secondary shadow-xs"
                          : "bg-secondary-container/20 text-secondary-fixed"
                      }`}
                    >
                      {regStep > 2 ? (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      ) : (
                        "2"
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-[13px] text-on-primary font-semibold flex items-center gap-1.5">
                        Definición de Perfil
                        {regStep === 2 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary-container animate-pulse"></span>
                        )}
                      </span>
                      <span className="font-body-sm text-[11px] text-on-primary-container mt-0.5 leading-snug">
                        Asignación automática de facultades operativas (Vendedor POS, Administrativo o Supervisión).
                      </span>
                    </div>
                  </div>

                  {/* Paso 3: Seguridad */}
                  <div
                    className={`flex items-start gap-3 p-3 rounded-xl backdrop-blur-sm transition-all duration-300 border ${
                      regStep === 3
                        ? "bg-secondary-container/25 border-secondary-container/50 shadow-xs ring-1 ring-secondary/30"
                        : "bg-primary-container/40 border-on-primary-container/10 opacity-60"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[13px] shrink-0 mt-0.5 transition-colors ${
                        regStep === 3
                          ? "bg-secondary text-on-secondary shadow-xs"
                          : "bg-secondary-container/20 text-secondary-fixed"
                      }`}
                    >
                      3
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-[13px] text-on-primary font-semibold flex items-center gap-1.5">
                        Seguridad Criptográfica
                        {regStep === 3 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary-container animate-pulse"></span>
                        )}
                      </span>
                      <span className="font-body-sm text-[11px] text-on-primary-container mt-0.5 leading-snug">
                        Creación de clave robusta con cumplimiento estricto y soporte de doble factor (2FA).
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Badges de Seguridad */}
              <div className="relative z-10 pt-4 mt-auto border-t border-on-primary-container/20 flex flex-wrap items-center justify-between gap-3 text-on-primary-container font-label-sm text-[11px]">
              
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-secondary-fixed">lock</span>
                  <span>Cifrado TLS 1.3 End-to-End</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* COLUMNA DERECHA: FORMULARIOS INTERACTIVOS                */}
        {/* ======================================================== */}
        <div
          ref={panelRightRef}
          className="col-span-1 md:col-span-7 bg-surface-container-lowest p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden"
        >
          {/* Capa de degradado ambiental suave en panel derecho con GSAP */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              ref={rightOrb1Ref}
              className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-secondary-container/8 blur-[90px] will-change-transform pointer-events-none"
            ></div>
            <div
              ref={rightOrb2Ref}
              className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-on-tertiary-container/6 blur-[100px] will-change-transform pointer-events-none"
            ></div>
          </div>

          <div className="relative z-10">
            {/* Pestañas de Navegación del Menú (Responsive & Espacioso) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-surface-container">
              <div className="flex p-1.5 bg-surface-container/70 rounded-xl gap-1.5 w-full sm:w-auto">
                <button
                  type="button"
                  id="tab-login"
                  onClick={() => handleTabChange("login")}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-label-md text-[13px] transition-all cursor-pointer text-center flex items-center justify-center gap-2 ${
                    mode === "login"
                      ? "bg-surface-container-lowest text-primary shadow-xs font-semibold"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low font-medium"
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px]">login</span>
                  <span>Iniciar Sesión</span>
                </button>
                <button
                  type="button"
                  id="tab-register"
                  onClick={() => handleTabChange("register")}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-label-md text-[13px] transition-all cursor-pointer flex items-center justify-center gap-2 text-center ${
                    mode === "register"
                      ? "bg-surface-container-lowest text-primary shadow-xs font-semibold"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low font-medium"
                  }`}
                >
                  {mode === "register" && (
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  )}
                  <span>Primer Acceso / Registro</span>
                </button>
              </div>

              <div className="hidden sm:inline-flex items-center gap-1.5 font-label-sm text-[12px] text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-lg border border-surface-container shrink-0">
                <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
                <span className="font-medium">Acceso Seguro</span>
              </div>
            </div>

            {/* Contenedor dinámico del Formulario Activo con Transición Acelerada por Hardware */}
            <div ref={formContentRef}>
              {/* ========================================== */}
              {/* VISTA 1: FORMULARIO DE INICIO DE SESIÓN    */}
              {/* ========================================== */}
            {mode === "login" && (
              <form
                ref={loginFormRef}
                onSubmit={handleLoginSubmit}
                className="space-y-5"
                id="view-login"
              >
                <div className="space-y-1">
                  <h2 className="font-headline-md text-[19px] sm:text-[20px] text-on-surface font-bold">
                    Credenciales de Acceso
                  </h2>
                  <p className="font-body-sm text-[13px] text-on-surface-variant">
                    Ingrese su usuario corporativo e identifique su nivel operativo
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Campo: Usuario / Email */}
                  <div>
                    <label className="block font-label-sm text-[12px] text-on-surface font-semibold mb-1.5">
                      Usuario / Correo Electrónico
                    </label>
                    <div className="relative flex items-center group">
                      <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-outline group-focus-within:text-secondary pointer-events-none transition-colors">
                        alternate_email
                      </span>
                      <input
                        type="text"
                        id="login-identifier"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="usuario@stockcontrol.com"
                        className="w-full h-11 pl-11 pr-4 bg-surface-container-low hover:bg-surface-container-lowest focus:bg-surface-container-lowest border border-surface-container hover:border-outline/40 focus:border-secondary focus:ring-2 focus:ring-secondary/20 rounded-xl text-on-surface font-body-md text-body-md placeholder:text-outline transition-all shadow-2xs"
                        required
                      />
                    </div>
                  </div>

                  {/* Campo: Contraseña */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block font-label-sm text-[12px] text-on-surface font-semibold">
                        Contraseña de Seguridad
                      </label>
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="font-label-sm text-[12px] text-secondary hover:underline cursor-pointer font-medium"
                      >
                        ¿Olvidó su contraseña?
                      </button>
                    </div>
                    <div className="relative flex items-center group">
                      <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-outline group-focus-within:text-secondary pointer-events-none transition-colors">
                        lock
                      </span>
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        id="login-password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Ingrese su clave"
                        className="w-full h-11 pl-11 pr-11 bg-surface-container-low hover:bg-surface-container-lowest focus:bg-surface-container-lowest border border-surface-container hover:border-outline/40 focus:border-secondary focus:ring-2 focus:ring-secondary/20 rounded-xl text-on-surface font-body-md text-body-md placeholder:text-outline transition-all shadow-2xs"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-2.5 w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                        aria-label="Alternar visibilidad de contraseña"
                      >
                        <span className="material-symbols-outlined text-[19px]">
                          {showLoginPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Selección de Rol Operativo */}
                <div className="pt-1">
                  <label className="block font-label-sm text-[12px] text-on-surface font-semibold mb-2 flex items-center justify-between">
                    <span>Rol Operativo (Diagrama de Flujo)</span>
                    <span className="font-label-sm text-[11px] text-on-surface-variant font-normal">
                      Nivel jerárquico
                    </span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Opción 1: Vendedor */}
                    <label className="cursor-pointer group">
                      <input
                        type="radio"
                        name="user-role"
                        value="vendedor"
                        checked={selectedRole === "vendedor"}
                        onChange={() => setSelectedRole("vendedor")}
                        className="peer sr-only"
                      />
                      <div className="p-3 rounded-xl border border-surface-container bg-surface-container-low peer-checked:border-secondary peer-checked:bg-secondary-container peer-checked:text-on-secondary-container transition-all flex flex-col h-full shadow-2xs hover:bg-surface-container">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-label-sm text-[12px] font-semibold">1. Vendedor</span>
                          <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
                        </div>
                        <p className="font-body-sm text-[11px] leading-snug opacity-80">
                          Restringido: Registro de ventas y consulta rápida de disponibilidad.
                        </p>
                      </div>
                    </label>

                    {/* Opción 2: Administrativo */}
                    <label className="cursor-pointer group">
                      <input
                        type="radio"
                        name="user-role"
                        value="administrativo"
                        checked={selectedRole === "administrativo"}
                        onChange={() => setSelectedRole("administrativo")}
                        className="peer sr-only"
                      />
                      <div className="p-3 rounded-xl border border-surface-container bg-surface-container-low peer-checked:border-secondary peer-checked:bg-secondary-container peer-checked:text-on-secondary-container transition-all flex flex-col h-full shadow-2xs hover:bg-surface-container">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-label-sm text-[12px] font-semibold">2. Administrativo</span>
                          <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                        </div>
                        <p className="font-body-sm text-[11px] leading-snug opacity-80">
                          Operativo: Inventario, altas, gastos y ventas. Sin gestión de usuarios.
                        </p>
                      </div>
                    </label>

                    {/* Opción 3: Jefe / Admin */}
                    <label className="cursor-pointer group">
                      <input
                        type="radio"
                        name="user-role"
                        value="admin"
                        checked={selectedRole === "admin"}
                        onChange={() => setSelectedRole("admin")}
                        className="peer sr-only"
                      />
                      <div className="p-3 rounded-xl border border-surface-container bg-surface-container-low peer-checked:border-secondary peer-checked:bg-secondary-container peer-checked:text-on-secondary-container transition-all flex flex-col h-full shadow-2xs hover:bg-surface-container">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-label-sm text-[12px] font-semibold">3. Jefe / Admin</span>
                          <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                        </div>
                        <p className="font-body-sm text-[11px] leading-snug opacity-80">
                          Permisos totales: Auditoría integral, parámetros y asignación de roles.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      id="remember-session"
                      checked={rememberSession}
                      onChange={(e) => setRememberSession(e.target.checked)}
                      className="w-4 h-4 rounded bg-surface-container text-secondary focus:ring-secondary/20 cursor-pointer"
                    />
                    <span className="font-label-sm text-[12px] text-on-surface-variant select-none">
                      Recordar estación de trabajo
                    </span>
                  </label>
                  <span className="font-label-sm text-[11px] text-tertiary-fixed-dim bg-tertiary-container px-2.5 py-0.5 rounded-full font-semibold">
                    Caja Activa
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingLogin}
                  className="w-full h-11 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-70 mt-2"
                >
                  <span>{isSubmittingLogin ? "Verificando Credenciales..." : "Ingresar al Sistema"}</span>
                  <span className="material-symbols-outlined text-[19px]">arrow_forward</span>
                </button>
              </form>
            )}

            {/* ======================================================== */}
            {/* VISTA 2: FORMULARIO DE REGISTRO EN 3 PASOS (STEPPER)     */}
            {/* ======================================================== */}
            {mode === "register" && (
              <div id="view-register" className="space-y-4">
                {/* Barra de Progreso del Stepper (Pasos 1 a 3) */}
                <div className="mb-4">
                  <div className="flex items-center justify-between relative px-2 sm:px-4">
                    {/* Línea conectora de fondo */}
                    <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-surface-container -z-0"></div>
                    {/* Línea conectora de progreso animada */}
                    <div
                      className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-secondary transition-all duration-300 -z-0"
                      style={{
                        width: regStep === 1 ? "0%" : regStep === 2 ? "50%" : "calc(100% - 3rem)",
                      }}
                    ></div>

                    {/* Paso 1: Invitación */}
                    <button
                      type="button"
                      onClick={() => regStep > 1 && handlePrevStep()}
                      className={`relative z-10 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full text-[11px] sm:text-[12px] font-semibold transition-all ${
                        regStep === 1
                          ? "bg-secondary text-on-secondary shadow-xs ring-4 ring-secondary/20"
                          : regStep > 1
                          ? "bg-tertiary-container text-on-tertiary-container cursor-pointer hover:opacity-90"
                          : "bg-surface-container text-on-surface-variant opacity-70"
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold">
                        {regStep > 1 ? (
                          <span className="material-symbols-outlined text-[13px]">check</span>
                        ) : (
                          "1"
                        )}
                      </span>
                      <span>Token</span>
                    </button>

                    {/* Paso 2: Datos Personales */}
                    <button
                      type="button"
                      onClick={() => regStep === 3 && handlePrevStep()}
                      className={`relative z-10 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full text-[11px] sm:text-[12px] font-semibold transition-all ${
                        regStep === 2
                          ? "bg-secondary text-on-secondary shadow-xs ring-4 ring-secondary/20"
                          : regStep > 2
                          ? "bg-tertiary-container text-on-tertiary-container cursor-pointer hover:opacity-90"
                          : "bg-surface-container text-on-surface-variant opacity-70"
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold">
                        {regStep > 2 ? (
                          <span className="material-symbols-outlined text-[13px]">check</span>
                        ) : (
                          "2"
                        )}
                      </span>
                      <span>Datos</span>
                    </button>

                    {/* Paso 3: Seguridad */}
                    <div
                      className={`relative z-10 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full text-[11px] sm:text-[12px] font-semibold transition-all ${
                        regStep === 3
                          ? "bg-secondary text-on-secondary shadow-xs ring-4 ring-secondary/20"
                          : "bg-surface-container text-on-surface-variant opacity-70"
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold">
                        3
                      </span>
                      <span>Seguridad</span>
                    </div>
                  </div>
                </div>

                {/* Contenedor con transición animada entre Pasos */}
                <div ref={stepContainerRef}>
                  {/* ==================================================== */}
                  {/* PASO 1: TOKEN DE INVITACIÓN & ROL PRECONFIGURADO     */}
                  {/* ==================================================== */}
                  {regStep === 1 && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-secondary-fixed/50 font-label-sm text-[11px] font-semibold text-secondary">
                            Paso 1 de 3
                          </span>
                          <span className="text-[12px] text-on-surface-variant">Validación Inicial</span>
                        </div>
                        <h2 className="font-headline-md text-[19px] sm:text-[20px] text-on-surface font-bold">
                          Token de Invitación Corporativa
                        </h2>
                        <p className="font-body-sm text-[13px] text-on-surface-variant">
                          Ingrese su código de autorización institucional para verificar su perfil operativo.
                        </p>
                      </div>

                      {/* Token de Invitación */}
                      <div>
                        <label className="font-label-sm text-[12px] font-semibold text-on-surface flex items-center justify-between mb-1.5">
                          <span>Token de Invitación / Código de Activación</span>
                          <button
                            type="button"
                            onClick={() =>
                              openModal(
                                "help",
                                "bg-surface-container-high",
                                "text-secondary",
                                "Token de Activación",
                                "El token de activación es un código único provisto por su supervisor o Administrador General al formalizar la incorporación."
                              )
                            }
                            className="text-secondary font-medium hover:underline cursor-pointer text-[11px]"
                          >
                            ¿No posee token?
                          </button>
                        </label>
                        <div className="relative flex items-center group">
                          <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-outline group-focus-within:text-secondary pointer-events-none transition-colors">
                            key
                          </span>
                          <input
                            type="text"
                            value={regToken}
                            onChange={handleTokenChange}
                            placeholder="Ej: SC-2024-XXX-0000"
                            className="w-full h-11 pl-11 pr-32 bg-surface-container-low hover:bg-surface-container-lowest focus:bg-surface-container-lowest border border-surface-container hover:border-outline/40 focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface font-numeric-data text-numeric-data font-semibold rounded-xl transition-all shadow-2xs"
                            required
                          />
                          {regToken.trim().length > 0 && tokenStatus.text && (
                            <div
                              className={`absolute right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-label-sm text-[11px] font-semibold ${
                                tokenStatus.valid
                                  ? "bg-tertiary-container/15 text-on-tertiary-container border border-on-tertiary-container/20"
                                  : "bg-error-container/25 text-error border border-error/20"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[15px]">
                                {tokenStatus.valid ? "check_circle" : "cancel"}
                              </span>
                              <span>{tokenStatus.text}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card de Rol Preconfigurado (Solo lectura) */}
                      <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-secondary-fixed/30 border border-secondary/20 text-on-secondary-fixed">
                        <div className="p-2.5 rounded-lg bg-secondary-container text-on-secondary shrink-0 shadow-xs">
                          <span className="material-symbols-outlined text-[22px]">point_of_sale</span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-label-sm text-[11px] uppercase tracking-wider font-bold text-secondary">
                              ROL PRECONFIGURADO
                            </span>
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-secondary text-on-secondary tracking-wide">
                              SOLO LECTURA
                            </span>
                          </div>
                          <span className="font-label-md text-[13px] font-semibold text-on-surface mt-0.5">
                            Vendedor POS (Terminal 01) - Sucursal Central
                          </span>
                          <span className="font-body-sm text-[11px] text-on-surface-variant leading-snug">
                            Facultades y límites operativos asignados conforme a la directiva de Jefatura / Admin.
                          </span>
                        </div>
                      </div>

                      {/* Botones Paso 1 */}
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => handleTabChange("login")}
                          className="h-11 px-5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-[13px] font-medium transition-all cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="flex-1 h-11 rounded-xl bg-secondary hover:bg-secondary-container text-on-secondary font-label-md text-[13px] font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>Siguiente: Datos Personales</span>
                          <span className="material-symbols-outlined text-[19px]">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ==================================================== */}
                  {/* PASO 2: DATOS PERSONALES & USUARIO OPERATIVO        */}
                  {/* ==================================================== */}
                  {regStep === 2 && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-secondary-fixed/50 font-label-sm text-[11px] font-semibold text-secondary">
                            Paso 2 de 3
                          </span>
                          <span className="text-[12px] text-on-surface-variant">Ficha del Colaborador</span>
                        </div>
                        <h2 className="font-headline-md text-[19px] sm:text-[20px] text-on-surface font-bold">
                          Datos de Identidad y Contacto
                        </h2>
                        <p className="font-body-sm text-[13px] text-on-surface-variant">
                          Registre sus datos de filiación y el nombre de usuario operativo asignado.
                        </p>
                      </div>

                      {/* Nombres y Apellidos */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-label-sm text-[12px] text-on-surface font-semibold mb-1.5">
                            Nombre(s)
                          </label>
                          <div className="relative flex items-center group">
                            <span className="material-symbols-outlined absolute left-3.5 text-[19px] text-outline group-focus-within:text-secondary pointer-events-none transition-colors">
                              person
                            </span>
                            <input
                              type="text"
                              value={regName}
                              onChange={(e) => setRegName(e.target.value)}
                              placeholder="Ej. Roberto"
                              className="w-full h-11 pl-11 pr-4 bg-surface-container-low hover:bg-surface-container-lowest focus:bg-surface-container-lowest border border-surface-container hover:border-outline/40 focus:border-secondary focus:ring-2 focus:ring-secondary/20 rounded-xl text-on-surface font-body-md text-body-md placeholder:text-outline transition-all shadow-2xs"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block font-label-sm text-[12px] text-on-surface font-semibold mb-1.5">
                            Apellido(s)
                          </label>
                          <div className="relative flex items-center group">
                            <span className="material-symbols-outlined absolute left-3.5 text-[19px] text-outline group-focus-within:text-secondary pointer-events-none transition-colors">
                              badge
                            </span>
                            <input
                              type="text"
                              value={regLastname}
                              onChange={(e) => setRegLastname(e.target.value)}
                              placeholder="Ej. Valenzuela"
                              className="w-full h-11 pl-11 pr-4 bg-surface-container-low hover:bg-surface-container-lowest focus:bg-surface-container-lowest border border-surface-container hover:border-outline/40 focus:border-secondary focus:ring-2 focus:ring-secondary/20 rounded-xl text-on-surface font-body-md text-body-md placeholder:text-outline transition-all shadow-2xs"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Teléfono y Correo */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-label-sm text-[12px] text-on-surface font-semibold mb-1.5">
                            Teléfono 
                          </label>
                          <div className="relative flex items-center group">
                            <span className="material-symbols-outlined absolute left-3.5 text-[19px] text-outline group-focus-within:text-secondary pointer-events-none transition-colors">
                              call
                            </span>
                            <input
                              type="tel"
                              inputMode="tel"
                              value={regPhone}
                              onChange={handlePhoneChange}
                              onKeyDown={handlePhoneKeyDown}
                              placeholder="+57 300 123 1234"
                              className="w-full h-11 pl-11 pr-4 bg-surface-container-low hover:bg-surface-container-lowest focus:bg-surface-container-lowest border border-surface-container hover:border-outline/40 focus:border-secondary focus:ring-2 focus:ring-secondary/20 rounded-xl text-on-surface font-numeric-data text-numeric-data placeholder:text-outline transition-all shadow-2xs"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block font-label-sm text-[12px] text-on-surface font-semibold mb-1.5">
                            Correo 
                          </label>
                          <div className="relative flex items-center group">
                            <span className="material-symbols-outlined absolute left-3.5 text-[19px] text-outline group-focus-within:text-secondary pointer-events-none transition-colors">
                              mail
                            </span>
                            <input
                              type="email"
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              placeholder="usuario@stockcontrol.com"
                              className="w-full h-11 pl-11 pr-4 bg-surface-container-low hover:bg-surface-container-lowest focus:bg-surface-container-lowest border border-surface-container hover:border-outline/40 focus:border-secondary focus:ring-2 focus:ring-secondary/20 rounded-xl text-on-surface font-body-md text-body-md placeholder:text-outline transition-all shadow-2xs"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Usuario Operativo Asignado (Generado automáticamente) */}
                      <div>
                        <label className="block font-label-sm text-[12px] text-on-surface font-semibold mb-1.5 flex justify-between items-center">
                          <span>Usuario Corporativo Asignado</span>
                          <span className="text-secondary font-label-sm text-[11px] flex items-center gap-1 font-semibold bg-secondary/10 px-2 py-0.5 rounded-md">
                            <span className="material-symbols-outlined text-[13px]">auto_awesome</span> Auto-generado
                          </span>
                        </label>
                        <div className="relative flex items-center group">
                          <span className="absolute left-3.5 text-secondary font-label-md text-label-md font-bold select-none transition-colors">
                            @
                          </span>
                          <input
                            type="text"
                            value={regUsername}
                            readOnly
                            placeholder="Se generará automáticamente (ej: roval)"
                            className="w-full h-11 pl-11 pr-28 bg-surface-container/60 border border-surface-container text-on-surface font-body-md text-body-md font-bold tracking-wide placeholder:text-outline/70 placeholder:font-normal rounded-xl cursor-default select-none transition-all shadow-2xs"
                          />
                          <div className="absolute right-3 flex items-center gap-1 text-[11px] text-on-surface-variant font-medium">
                            <span className="material-symbols-outlined text-[14px] text-outline">lock</span>
                     
                          </div>
                        </div>
                        <p className="text-[11px] text-on-surface-variant mt-1">
                          Generado en tiempo real con las 2 primeras letras del nombre y las 3 primeras del apellido.
                        </p>
                      </div>

                      {/* Botones Paso 2 */}
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="h-11 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-[13px] font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                          <span>Atrás</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="flex-1 h-11 rounded-xl bg-secondary hover:bg-secondary-container text-on-secondary font-label-md text-[13px] font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>Siguiente: Clave de Acceso</span>
                          <span className="material-symbols-outlined text-[19px]">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ==================================================== */}
                  {/* PASO 3: CREDENCIALES & ACTIVACIÓN FINAL              */}
                  {/* ==================================================== */}
                  {regStep === 3 && (
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-secondary-fixed/50 font-label-sm text-[11px] font-semibold text-secondary">
                            Paso 3 de 3
                          </span>
                          <span className="text-[12px] text-on-surface-variant">Seguridad y Activación</span>
                        </div>
                        <h2 className="font-headline-md text-[19px] sm:text-[20px] text-on-surface font-bold">
                          Configuración de Clave Segura
                        </h2>
                        <p className="font-body-sm text-[13px] text-on-surface-variant">
                          Defina su contraseña protegida y confirme la directiva de terminal para activar su turno.
                        </p>
                      </div>

                      {/* Contraseña y Confirmar Contraseña */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-label-sm text-[12px] text-on-surface font-semibold mb-1.5">
                            Contraseña
                          </label>
                          <div className="relative flex items-center group">
                            <span className="material-symbols-outlined absolute left-3.5 text-[19px] text-outline group-focus-within:text-secondary pointer-events-none transition-colors">
                              lock
                            </span>
                            <input
                              type={showRegPassword ? "text" : "password"}
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              placeholder="Mínimo 8 caracteres"
                              className="w-full h-11 pl-11 pr-11 bg-surface-container-low hover:bg-surface-container-lowest focus:bg-surface-container-lowest border border-surface-container hover:border-outline/40 focus:border-secondary focus:ring-2 focus:ring-secondary/20 rounded-xl text-on-surface font-body-md text-body-md placeholder:text-outline transition-all shadow-2xs"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegPassword(!showRegPassword)}
                              className="absolute right-2.5 w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {showRegPassword ? "visibility_off" : "visibility"}
                              </span>
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block font-label-sm text-[12px] text-on-surface font-semibold mb-1.5">
                            Confirmar Contraseña
                          </label>
                          <div className="relative flex items-center group">
                            <span className="material-symbols-outlined absolute left-3.5 text-[19px] text-outline group-focus-within:text-secondary pointer-events-none transition-colors">
                              lock_reset
                            </span>
                            <input
                              type={showRegConfirmPassword ? "text" : "password"}
                              value={regConfirmPassword}
                              onChange={(e) => setRegConfirmPassword(e.target.value)}
                              placeholder="Repita contraseña"
                              className="w-full h-11 pl-11 pr-11 bg-surface-container-low hover:bg-surface-container-lowest focus:bg-surface-container-lowest border border-surface-container hover:border-outline/40 focus:border-secondary focus:ring-2 focus:ring-secondary/20 rounded-xl text-on-surface font-body-md text-body-md placeholder:text-outline transition-all shadow-2xs"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                              className="absolute right-2.5 w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {showRegConfirmPassword ? "visibility_off" : "visibility"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Fortaleza de Clave */}
                      <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-container-low border border-surface-container">
                        <div className="flex items-center justify-between font-label-sm text-[11px]">
                          <span className="text-on-surface-variant font-medium">Fortaleza de Clave</span>
                          <span className="text-on-tertiary-container font-semibold">{pwdStrength.text}</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden flex gap-1">
                          <div
                            className={`h-full w-1/4 rounded-full transition-all ${
                              pwdStrength.score >= 1 ? pwdStrength.color : "bg-transparent"
                            }`}
                          ></div>
                          <div
                            className={`h-full w-1/4 rounded-full transition-all ${
                              pwdStrength.score >= 2 ? pwdStrength.color : "bg-transparent"
                            }`}
                          ></div>
                          <div
                            className={`h-full w-1/4 rounded-full transition-all ${
                              pwdStrength.score >= 3 ? pwdStrength.color : "bg-transparent"
                            }`}
                          ></div>
                          <div
                            className={`h-full w-1/4 rounded-full transition-all ${
                              pwdStrength.score >= 4 ? pwdStrength.color : "bg-transparent"
                            }`}
                          ></div>
                        </div>
                        <span className="text-[10px] text-on-surface-variant leading-tight">
                          Incluye símbolos, mayúsculas y dígitos verificados.
                        </span>
                      </div>

                      {/* Checkbox de Políticas */}
                      <div className="flex items-start gap-2.5 pt-1">
                        <input
                          type="checkbox"
                          id="policyCheck"
                          checked={acceptedPolicies}
                          onChange={(e) => setAcceptedPolicies(e.target.checked)}
                          className="mt-1 w-4 h-4 rounded text-secondary focus:ring-secondary/20 border-outline-variant cursor-pointer shrink-0"
                        />
                        <label
                          htmlFor="policyCheck"
                          className="font-body-sm text-[12px] text-on-surface cursor-pointer select-none leading-snug"
                        >
                          Acepto la directiva de seguridad de datos corporativa, trazabilidad de transacciones y uso de terminales de Control de Stock.
                        </label>
                      </div>

                      {/* Botones Paso 3 */}
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="h-11 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-[13px] font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                          <span>Atrás</span>
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingRegister}
                          className="flex-1 h-11 rounded-xl bg-secondary hover:bg-secondary-container text-on-secondary font-label-md text-[13px] font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                        >
                          <span>{isSubmittingRegister ? "Activando Cuenta..." : "Activar Cuenta e Iniciar Turno"}</span>
                          <span className="material-symbols-outlined text-[19px]">how_to_reg</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
            </div>
          </div>

          {/* Footer del Panel Derecho */}
          <div className="relative z-10 pt-4 mt-6 flex flex-col sm:flex-row items-center justify-between text-on-surface-variant font-body-sm text-[12px] gap-2 border-t border-surface-container">
            {mode === "login" ? (
              <>
                <div className="text-[12px] opacity-75">
                  Protegido por token efímero de estación.
                </div>
                <div className="flex items-center gap-4">
                  <a href="#" className="hover:text-on-surface underline transition-colors">
                    Términos
                  </a>
                  <a href="#" className="hover:text-on-surface underline transition-colors">
                    Mesa de Ayuda
                  </a>
                </div>
              </>
            ) : (
              <div className="w-full flex items-center justify-center gap-1 font-body-sm text-[12px] text-on-surface-variant">
                <span>¿Ya completó su activación inicial?</span>
                <button
                  type="button"
                  onClick={() => handleTabChange("login")}
                  className="text-secondary font-semibold hover:underline cursor-pointer ml-1"
                >
                  Iniciar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL DE FEEDBACK / DIÁLOGO DE NOTIFICACIÓN             */}
      {/* ======================================================== */}
      {modal.isOpen && (
        <div
          ref={modalContainerRef}
          className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            ref={modalContentRef}
            className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl text-center space-y-4 border border-surface-container-high"
          >
            <div
              className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${modal.bgClass} ${modal.textClass}`}
            >
              <span className="material-symbols-outlined text-[28px]">{modal.icon}</span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                {modal.title}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1 leading-relaxed">
                {modal.message}
              </p>
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-all cursor-pointer shadow-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
