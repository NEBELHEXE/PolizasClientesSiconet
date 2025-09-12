const API_URL = "https://script.google.com/macros/s/AKfycbzeNTypxdRbf2JrDh89_mKlnIbyArgjTrcP-ICEiw6IfhUjgKAV9M-_cs610W-airUBYQ/exec";

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#clientes-table tbody");
  const overlay = document.getElementById("loading-overlay");

  const modal = document.getElementById("modal");
  const openModalBtn = document.getElementById("openModalBtn");
  const closeModalBtn = document.querySelector(".close");
  const form = document.getElementById("add-client-form");

  // --- Modal ---
  openModalBtn.addEventListener("click", () => modal.style.display = "flex");
  closeModalBtn.addEventListener("click", () => modal.style.display = "none");
  window.addEventListener("click", e => { if(e.target === modal) modal.style.display = "none"; });

  // --- Cargar clientes ---
  async function loadClientes() {
    overlay.style.display = "flex";
    tableBody.innerHTML = "";

    try {
      const res = await fetch(`${API_URL}?action=getPendientes`);
      const data = await res.json();

      if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4">✅ No hay pagos pendientes</td></tr>`;
      } else {
        data.forEach((cliente, index) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${cliente.Empresa}</td>
            <td>${cliente.Poliza}</td>
            <td>${cliente.FechaVencimiento}</td>
            <td><button class="btn-pagado" data-index="${index}">Marcar Pagado</button></td>
          `;
          tableBody.appendChild(row);
        });

        // --- Botones marcar pagado ---
        document.querySelectorAll(".btn-pagado").forEach(btn => {
          btn.addEventListener("click", async () => {
            if (!confirm("¿Marcar este cliente como pagado?")) return;
            const index = parseInt(btn.dataset.index);
            await fetch(API_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "marcarPagado", index })
            });
            loadClientes();
          });
        });
      }

    } catch (error) {
      console.error("Error cargando clientes:", error);
    }

    overlay.style.display = "none";
  }

  // --- Agregar cliente ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const empresa = document.getElementById("empresa").value;
    const poliza = document.getElementById("poliza").value;
    const fecha = document.getElementById("fecha").value;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addClient", empresa, poliza, fechaVenc: fecha })
      });
      const result = await res.json();
      if(result.status === "ok") {
        form.reset();
        modal.style.display = "none";
        loadClientes();
      } else {
        alert("Error: " + result.msg);
      }
    } catch (error) {
      console.error("Error al agregar cliente:", error);
    }
  });

  // --- Inicial ---
  loadClientes();
});
