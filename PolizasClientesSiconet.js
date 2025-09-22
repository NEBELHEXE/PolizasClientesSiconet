const API_URL = "https://script.google.com/macros/s/AKfycbyWT6jxmPddFKk89AbGkOZSiGzYwdCPhesJcZ8rDdwpO1aAtx4OxkexK4UtYVEWluCGZQ/exec"; // Reemplazar con la URL publicada

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#clientes-table tbody");
  const overlay = document.getElementById("loading-overlay");
  const form = document.getElementById("add-client-form");

  // 🔹 Cargar clientes pendientes
  async function loadClientes() {
    overlay.style.display = "block";
    tableBody.innerHTML = "";

    try {
      const res = await fetch(`${API_URL}?action=getPendientes`);
      const data = await res.json();

      if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4">✅ No hay pagos pendientes este mes</td></tr>`;
      } else {
        data.forEach(cliente => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${cliente.empresa}</td>
            <td>${cliente.poliza}</td>
            <td>${cliente.fecha}</td>
            <td><button class="btn-pagado" data-empresa="${cliente.empresa}">Marcar Pagado</button></td>
          `;
          tableBody.appendChild(row);
        });

        // Agregar listeners a botones
        document.querySelectorAll(".btn-pagado").forEach(btn => {
          btn.addEventListener("click", async () => {
            await marcarPagado(btn.dataset.empresa);
            loadClientes(); // recargar lista
          });
        });
      }
    } catch (error) {
      console.error("Error cargando clientes:", error);
    }

    overlay.style.display = "none";
  }

  // 🔹 Marcar cliente como pagado
  async function marcarPagado(empresa) {
    try {
      await fetch(`${API_URL}?action=marcarPagado&empresa=${encodeURIComponent(empresa)}`, {
        method: "POST"
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
    const fecha = document.getElementById("fecha").value;

    try {
      await fetch(`${API_URL}?action=agregarCliente&empresa=${encodeURIComponent(empresa)}&poliza=${encodeURIComponent(poliza)}&fecha=${fecha}`, {
        method: "POST"
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

// JavaScript para manejar la animación del mensaje de carga
    document.getElementById('add-client-form').addEventListener('submit', function(event) {
      event.preventDefault(); // Evita el envío real del formulario para la demo
      const loadingMessage = document.getElementById('loading-message');
      loadingMessage.classList.add('show');
      setTimeout(() => {
        loadingMessage.classList.remove('show');
        // Aquí iría la lógica para agregar el cliente
      }, 2000); // Oculta el mensaje después de 2 segundos
    });
