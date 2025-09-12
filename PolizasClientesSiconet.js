const API_URL = "https://script.google.com/macros/s/AKfycbzeNTypxdRbf2JrDh89_mKlnIbyArgjTrcP-ICEiw6IfhUjgKAV9M-_cs610W-airUBYQ/exec"; // Reemplazar con tu URL

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#clientes-table tbody");
  const overlay = document.getElementById("loading-overlay");
  const form = document.getElementById("add-client-form");

  // 🔹 Cargar todos los clientes pendientes
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

        // Agregar listeners a botones
        document.querySelectorAll(".btn-pagado").forEach(btn => {
          btn.addEventListener("click", async () => {
            const index = btn.dataset.index;
            const confirmAction = confirm("¿Marcar este cliente como pagado?");
            if (!confirmAction) return;

            await marcarPagado(index);
            loadClientes(); // recargar lista
          });
        });
      }
    } catch (error) {
      console.error("Error cargando clientes:", error);
    }

    overlay.style.display = "none";
  }

  // 🔹 Marcar cliente como pagado usando índice
  async function marcarPagado(index) {
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "marcarPagado", index })
      });
    } catch (error) {
      console.error("Error al marcar pagado:", error);
    }
  }

  // 🔹 Agregar nuevo cliente
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const empresa = document.getElementById("empresa").value;
    const poliza = document.getElementById("poliza").value;
    const fechaVenc = document.getElementById("fecha").value;

    if (!empresa || !poliza || !fechaVenc) {
      alert("Por favor completa todos los campos");
      return;
    }

    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addClient", empresa, poliza, fechaVenc })
      });

      form.reset();
      loadClientes();
    } catch (error) {
      console.error("Error al agregar cliente:", error);
    }
  });

  // 🔹 Inicial
  loadClientes();
});
