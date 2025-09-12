document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#clients-table tbody");
  const overlay = document.getElementById("loading-overlay");
  const form = document.getElementById("client-form");

  // Modal
  const modal = document.getElementById("modal-confirm");
  const btnYes = document.getElementById("confirm-yes");
  const btnNo = document.getElementById("confirm-no");
  let clientIndex = null;

  // 🔗  URL de App Script
  const API_URL = "https://script.google.com/macros/s/AKfycbzDmvEV3mMfr1IkVRVgLaLM8P2Tz2RXE2x1qCLAShQGtEneqd5VIU8RJYkZAV-TS1Hawg/exec";

  // --- Cargar clientes pendientes ---
  async function loadClients() {
    overlay.style.display = "flex";
    try {
      const res = await fetch(`${API_URL}?action=getPendientes`);
      const data = await res.json();

      tableBody.innerHTML = "";
      data.forEach((row, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${row.Empresa}</td>
          <td>${row.Poliza}</td>
          <td>${row.FechaVencimiento}</td>
          <td>${row.Estado}</td>
          <td><button data-index="${index}" class="pay-btn">Marcar Pagado</button></td>
        `;
        tableBody.appendChild(tr);
      });

      // Asignar evento a los botones
      document.querySelectorAll(".pay-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          clientIndex = e.target.getAttribute("data-index");
          modal.style.display = "flex";
        });
      });

    } catch (err) {
      console.error(err);
    } finally {
      overlay.style.display = "none";
    }
  }

  // --- Confirmar pago ---
  btnYes.addEventListener("click", async () => {
    overlay.style.display = "flex";

    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "marcarPagado", index: clientIndex })
      });
      modal.style.display = "none";
      loadClients();
    } catch (err) {
      console.error(err);
    } finally {
      overlay.style.display = "none";
    }
  });

  btnNo.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // --- Agregar nuevo cliente ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    overlay.style.display = "flex";

    const empresa = document.getElementById("empresa").value;
    const poliza = document.getElementById("poliza").value;
    const fechaVenc = document.getElementById("fechaVencimiento").value;

    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addClient",
          empresa,
          poliza,
          fechaVenc
        })
      });

      form.reset();
      loadClients();
    } catch (err) {
      console.error(err);
    } finally {
      overlay.style.display = "none";
    }
  });

  loadClients();
});
