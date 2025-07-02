// EmailJS Configuration
const EMAILJS_CONFIG = {
  serviceId: "service_neuwe88",
  templateId: "template_xr9mozn",
  publicKey: "PkdJgcdPVxft1urrI",
}

// Global Variables
let currentStep = 1
let selectedPackage = {
  id: "1",
  title: "100 Diamantes + 10 Bono",
  price: "Bs 108",
}

const formData = {
  phone: "",
  playerId: "",
  bank: "",
  holderPhone: "",
  holderCedula: "",
  paymentDate: "",
  reference: "",
  acceptTerms: false,
}

// Initialize when page loads
window.addEventListener("load", () => {
  console.log("Página cargada")

  // Initialize EmailJS
  emailjs.init(EMAILJS_CONFIG.publicKey)

  // Set today's date
  const dateInput = document.getElementById("paymentDate")
  if (dateInput) {
    dateInput.valueAsDate = new Date()
  }

  console.log("Inicialización completa")
})

// Select Package Function
function selectPackage(id, title, price) {
  console.log("Paquete seleccionado:", { id, title, price })

  selectedPackage = { id, title, price }

  // Update visual selection
  document.querySelectorAll(".package-card").forEach((card) => {
    card.classList.remove("selected")
  })
  event.currentTarget.classList.add("selected")

  // Update amount in step 3
  document.getElementById("amountValue").textContent = price
  document.getElementById("selectedPackageTitle").textContent = title

  // Auto advance to next step
  setTimeout(() => {
    nextStep()
  }, 500)
}

// Navigation Functions
function nextStep() {
  if (currentStep < 3) {
    currentStep++
    updateStepDisplay()
    updateProgress()
  }
}

function previousStep() {
  if (currentStep > 1) {
    currentStep--
    updateStepDisplay()
    updateProgress()
  }
}

function updateStepDisplay() {
  // Hide all step contents
  document.querySelectorAll(".step-content").forEach((content) => {
    content.classList.remove("active")
  })

  // Show current step content
  document.getElementById(`content${currentStep}`).classList.add("active")
}

function updateProgress() {
  // Update step indicators
  for (let i = 1; i <= 3; i++) {
    const step = document.getElementById(`step${i}`)
    const line = document.getElementById(`line${i}`)

    if (i < currentStep) {
      step.classList.add("completed")
      step.classList.remove("active")
      if (line) line.classList.add("active")
    } else if (i === currentStep) {
      step.classList.add("active")
      step.classList.remove("completed")
    } else {
      step.classList.remove("active", "completed")
      if (line) line.classList.remove("active")
    }
  }
}

// Form Handlers
function handleUserForm(event) {
  event.preventDefault()

  formData.phone = document.getElementById("phone").value
  formData.playerId = document.getElementById("playerId").value

  if (formData.phone && formData.playerId) {
    nextStep()
  }
}

// Copy Functions
function copyText(text) {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast("Copiado al portapapeles")
      })
      .catch(() => {
        fallbackCopy(text)
      })
  } else {
    fallbackCopy(text)
  }
}

function fallbackCopy(text) {
  const textArea = document.createElement("textarea")
  textArea.value = text
  textArea.style.position = "fixed"
  textArea.style.left = "-999999px"
  document.body.appendChild(textArea)
  textArea.select()

  try {
    document.execCommand("copy")
    showToast("Copiado al portapapeles")
  } catch (err) {
    showToast("Error al copiar")
  }

  document.body.removeChild(textArea)
}

function copyAmount() {
  const amount = document.getElementById("amountValue").textContent
  copyText(amount)
}

function copyAllInfo() {
  const info = `RIF: J-502785477
Celular: 0412-6425335
Banco: 0102 BANCO DE VENEZUELA
Monto: ${selectedPackage.price}`

  copyText(info)
}

// Toast Notification
function showToast(message) {
  const existingToast = document.querySelector(".toast")
  if (existingToast) {
    existingToast.remove()
  }

  const toast = document.createElement("div")
  toast.className = "toast"
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #059669;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 3000;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `
  toast.textContent = message

  document.body.appendChild(toast)

  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove()
    }
  }, 3000)
}

// Modal Functions
function showTerms() {
  document.getElementById("termsModal").classList.add("show")
}

function closeTerms() {
  document.getElementById("termsModal").classList.remove("show")
}

function showSuccess() {
  document.getElementById("responsePhone").textContent = formData.phone
  document.getElementById("successModal").classList.add("show")
}

function closeSuccess() {
  document.getElementById("successModal").classList.remove("show")
  resetForm()
}

function showLoading() {
  document.getElementById("loadingOverlay").classList.add("show")
}

function hideLoading() {
  document.getElementById("loadingOverlay").classList.remove("show")
}

// Submit Order
async function submitOrder(event) {
  event.preventDefault()

  // Get form data
  formData.bank = document.getElementById("bank").value
  formData.holderCedula = document.getElementById("holderCedula").value
  formData.holderPhone = document.getElementById("holderPhone").value
  formData.paymentDate = document.getElementById("paymentDate").value
  formData.reference = document.getElementById("reference").value
  formData.acceptTerms = document.getElementById("acceptTerms").checked

  // Validate form
  if (!validateForm()) {
    return
  }

  showLoading()

  try {
    // Prepare email data
    const emailData = {
      package_title: selectedPackage.title,
      package_price: selectedPackage.price,
      user_phone: formData.phone,
      user_player_id: formData.playerId,
      payment_bank: formData.bank,
      holder_cedula: formData.holderCedula,
      holder_phone: formData.holderPhone,
      payment_date: formData.paymentDate,
      payment_reference: formData.reference,
      order_date: new Date().toLocaleString("es-VE"),
    }

    console.log("Enviando email con datos:", emailData)

    // Send email using EmailJS
    const response = await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, emailData)

    console.log("Email enviado exitosamente:", response)
    hideLoading()
    showSuccess()
  } catch (error) {
    console.error("Error al enviar email:", error)
    hideLoading()
    alert("Error al procesar el pedido. Por favor, inténtelo de nuevo.")
  }
}

// Validate Form
function validateForm() {
  const requiredFields = [
    { id: "bank", name: "Banco" },
    { id: "holderCedula", name: "Cédula" },
    { id: "holderPhone", name: "Teléfono" },
    { id: "paymentDate", name: "Fecha de Pago" },
    { id: "reference", name: "Referencia" },
  ]

  for (const field of requiredFields) {
    const element = document.getElementById(field.id)
    if (!element.value.trim()) {
      alert(`Por favor, complete el campo: ${field.name}`)
      element.focus()
      return false
    }
  }

  if (!document.getElementById("acceptTerms").checked) {
    alert("Debe aceptar los términos y condiciones")
    return false
  }

  return true
}

// Reset Form
function resetForm() {
  currentStep = 1
  selectedPackage = {
    id: "1",
    title: "100 Diamantes + 10 Bono",
    price: "Bs 108",
  }

  // Reset form fields
  document.querySelectorAll("input").forEach((input) => {
    if (input.type !== "date") {
      input.value = ""
    }
    if (input.type === "checkbox") {
      input.checked = false
    }
  })

  // Reset package selection
  document.querySelectorAll(".package-card").forEach((card) => {
    card.classList.remove("selected")
  })

  // Reset display
  updateStepDisplay()
  updateProgress()

  // Set today's date again
  document.getElementById("paymentDate").valueAsDate = new Date()
}

// Close modals when clicking outside
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.classList.remove("show")
  }
})
