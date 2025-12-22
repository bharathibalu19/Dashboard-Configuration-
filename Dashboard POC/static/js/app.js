// ================================
// GLOBALS
// ================================
let grid;
let draggedType = null;
// let orders = [];
// let orders = JSON.parse(localStorage.getItem("orders")) || [];
document.addEventListener("DOMContentLoaded", () => {
  renderTable();
});

document.addEventListener("DOMContentLoaded", () => {
  grid = GridStack.init({
    cellHeight: 50,
    margin: 10,
    float: true,
    draggable: {
    handle: '.drag-handle'
  },
  
  resizable: {
    handles: 'se'
  }
  }, "#configGrid");
  // 👇 ADD THIS AFTER INIT
  grid.on('resizestop', (event, el) => {
    if (
      el.dataset.type &&
      ["bar", "line", "pie", "area", "scatter"].includes(el.dataset.type)
    ) {
      renderChart(el);
    }
  });
  loadDashboard();
  // LEFT PANEL DRAG
  document.querySelectorAll(".widget-item").forEach(item => {
    item.addEventListener("dragstart", e => {
      draggedType = item.dataset.type;
    });
  });

  // GRID DROP
  const gridEl = document.getElementById("configGrid");

  gridEl.addEventListener("dragover", e => {
    e.preventDefault();
  });
  window.addEventListener('resize', () => {
  if (grid) grid.resize();
});
  gridEl.addEventListener("drop", e => {
    e.preventDefault();
    if (!draggedType) return;

    addWidgetFromDrop(draggedType);
    draggedType = null;
  });
});

// ================================
// VIEW TOGGLING
// ================================
function openConfigure() {
  document.getElementById("dashboardView").style.display = "none";
  // document.getElementById("configureView").style.display = "block";
   const view = document.getElementById("configureView");
  view.style.display = "flex";
  setTimeout(() => {
    grid.resize();
    grid.engine.maxRow = 100; 
  }, 0);
}

function closeConfigure() {
  document.getElementById("configureView").style.display = "none";
  document.getElementById("dashboardView").style.display = "block";
}




function openCreateOrder() {
  document.getElementById("orderModal").style.display = "flex";
}

function closeCreateOrder() {
  document.getElementById("orderModal").style.display = "none";
  document.getElementById("orderForm").reset();
}

const qty = document.getElementById("quantity");
const price = document.getElementById("unitPrice");
const total = document.getElementById("totalAmount");

function updateTotal() {
  const q = parseInt(qty.value) || 0;
  const p = parseFloat(price.value) || 0;
  total.value = `$ ${(q * p).toFixed(2)}`;
}

qty.addEventListener("input", updateTotal);
price.addEventListener("input", updateTotal);

function validate(id) {
  const field = document.getElementById(id);
  if (!field || field.value.trim() === "") {
    field.style.border = "1px solid red";
    return false;
  }
  field.style.border = "1px solid #ccc";
  return true;
}

// let orders = JSON.parse(localStorage.getItem("orders")) || [];

// function submitOrder() {
//   console.log("Submit clicked");

//   const firstName = document.getElementById("firstName");
//   const lastName = document.getElementById("lastName");
//   const email = document.getElementById("email");
//   const phone = document.getElementById("phone");
//   const street = document.getElementById("street");
//   const city = document.getElementById("city");
//   const state = document.getElementById("state");
//   const postal = document.getElementById("postal");
//   const country = document.getElementById("country");
//   const product = document.getElementById("product");
//   const quantity = document.getElementById("quantity");
//   const unitPrice = document.getElementById("unitPrice");
//   const status = document.getElementById("status");
//   const createdBy = document.getElementById("createdBy");

//   // 🔴 BASIC VALIDATION
//   if (
//     !firstName.value || !lastName.value || !email.value ||
//     !phone.value || !street.value || !city.value ||
//     !state.value || !postal.value || !country.value ||
//     !product.value || !status.value || !createdBy.value
//   ) {
//     alert("Please fill all required fields");
//     return;
//   }

//   if (quantity.value < 1) {
//     alert("Quantity must be at least 1");
//     return;
//   }

//   const order = {
//     firstName: firstName.value,
//     lastName: lastName.value,
//     email: email.value,
//     phone: phone.value,
//     street: street.value,
//     city: city.value,
//     state: state.value,
//     postal: postal.value,
//     country: country.value,
//     product: product.value,
//     quantity: quantity.value,
//     unitPrice: unitPrice.value,
//     totalAmount: (quantity.value * unitPrice.value).toFixed(2),
//     status: status.value,
//     createdBy: createdBy.value
//   };

//   // ✅ SAVE
//   orders.push(order);
//   localStorage.setItem("orders", JSON.stringify(orders));
//   if (editIndex !== null) {
//   orders[editIndex] = order; // UPDATE
//   editIndex = null;
//   showToast("Order updated successfully");
// } else {
//   orders.push(order); // CREATE
//   showToast("Order created successfully");
// }

//   console.log("Order saved", orders);

//   // ✅ UPDATE UI
//   renderTable();
//   showToast();
//   closeCreateOrder();
//   showTableTab();
// }
let orders = JSON.parse(localStorage.getItem("orders")) || [];
let editIndex = null;

function submitOrder() {
  const order = {
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim(),
    email: email.value.trim(),
    phone: phone.value.trim(),
    street: street.value.trim(),
    city: city.value.trim(),
    state: state.value.trim(),
    postal: postal.value.trim(),
    country: country.value,
    product: product.value,
    quantity: Number(quantity.value),
    unitPrice: Number(unitPrice.value),
    totalAmount: Number(quantity.value) * Number(unitPrice.value),
    status: status.value,
    createdBy: createdBy.value
  };

  // validation
  for (let key in order) {
    if (!order[key]) {
      alert("Fill all fields");
      return;
    }
  }

  if (editIndex !== null) {
    orders[editIndex] = order;
    editIndex = null;
  } else {
    orders.push(order);
  }

  // save frontend
  localStorage.setItem("orders", JSON.stringify(orders));

  // save backend
  fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order)
  });

  renderTable();
  closeCreateOrder();
  showToast();
}


function deleteOrder(index) {
  if (!confirm("Are you sure you want to delete this order?")) return;

  orders.splice(index, 1);
  localStorage.setItem("orders", JSON.stringify(orders));
  renderTable();
  showToast("Order deleted successfully");
}
// let editIndex = null;
function editOrder(index) {
  editIndex = index;
  const o = orders[index];

  document.getElementById("firstName").value = o.firstName;
  document.getElementById("lastName").value = o.lastName;
  document.getElementById("email").value = o.email;
  document.getElementById("phone").value = o.phone;
  document.getElementById("street").value = o.street;
  document.getElementById("city").value = o.city;
  document.getElementById("state").value = o.state;
  document.getElementById("postal").value = o.postal;
  document.getElementById("country").value = o.country;
  document.getElementById("product").value = o.product;
  document.getElementById("quantity").value = o.quantity;
  document.getElementById("unitPrice").value = o.unitPrice;
  document.getElementById("totalAmount").value = `$${o.totalAmount}`;
  document.getElementById("status").value = o.status;
  document.getElementById("createdBy").value = o.createdBy;

  openCreateOrder(); // open modal
}

function openCreateOrder() {
  document.getElementById("orderModal").style.display = "flex";
}

function closeCreateOrder() {
  document.getElementById("orderModal").style.display = "none";
  document.getElementById("orderForm").reset();
}


function saveConfig() {
  const layout = grid.engine.nodes.map(n => ({
    type: n.el.dataset.type,
    x: n.x,
    y: n.y,
    w: n.w,
    h: n.h,
    title: n.el.querySelector(".widget-title")?.innerText || "Untitled",
    chartConfig: n.el.dataset.chartConfig || null
  }));

  fetch("/api/dashboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(layout)
  }).then(() => {
    alert("Dashboard saved successfully");
  });
}

function showDashboardTab() {
  document.getElementById("dashboardTab").style.display = "block";
  document.getElementById("tableTab").style.display = "none";
}

function showTableTab() {
  document.getElementById("dashboardTab").style.display = "none";
  document.getElementById("tableTab").style.display = "block";
}


function loadDashboard() {
  fetch("/api/dashboard")
    .then(res => res.json())
    .then(layout => {
      if (!Array.isArray(layout)) return;

      grid.removeAll();

      layout.forEach(cfg => {
        const item = document.createElement("div");
        item.className = "grid-stack-item";
        item.dataset.type = cfg.type;
        if (cfg.chartConfig) {
          item.dataset.chartConfig = cfg.chartConfig;
        }


        item.innerHTML = `
          <div class="grid-stack-item-content widget">
            <div class="widget-header">
              <span class="drag-handle">⋮⋮</span>
              <strong class="widget-title">${cfg.title}</strong>
              <div class="widget-actions">
                <button class="settings-btn" onclick="openSettings(this)">⚙️</button>
                <button class="delete-btn" onclick="removeWidget(this,event )">🗑</button>
                
              </div>
            </div>
            <div class="widget-body">
            <h2>0</h2>
            </div>
          </div>
        `;

        document.getElementById("configGrid").appendChild(item);
        grid.makeWidget(item, cfg);

         // 🔥 RENDER CHART AFTER LOAD
        if (cfg.chartConfig) {
          renderChart(item);
        }
      });
    });
}


// ================================
// KPI
// ================================


// ================================
// CHART
// ================================
function loadChart(elId, type) {
  const canvas = document.createElement("canvas");
  document.getElementById(elId).appendChild(canvas);

  new Chart(canvas, {
    type: type,
    data: {
      labels: ["Mon", "Tue", "Wed"],
      datasets: [{
        label: "Orders",
        data: [1200, 1900, 3000],
        backgroundColor: "#22c55e"
      }]
    }
  });
}

function addWidgetFromDrop(type) {
  const item = document.createElement("div");
  item.className = "grid-stack-item";
  item.dataset.type = type;

  // ✅ SAVE CORRECT CHART TYPE
  if (["bar", "line", "pie", "area", "scatter"].includes(type)) {
    item.dataset.chartConfig = JSON.stringify({
      type: type,          // 🔥 THIS IS THE FIX
      xAxis: "month",
      yAxis: "value"
    });
  }

  item.innerHTML = `
    <div class="grid-stack-item-content widget">
      <div class="widget-header">
        <span class="drag-handle">⋮⋮</span>
        <strong class="widget-title">Untitled</strong>
        <div class="widget-actions">
          <button onclick="removeWidget(this,event)">🗑</button>
          <button onclick="openSettings(this)">⚙️</button>
        </div>
      </div>

      <!-- 🔥 REQUIRED -->
      <div class="widget-body">
      <h2>0</h2>
      </div>
    </div>
  `;

  document.getElementById("configGrid").appendChild(item);
  grid.makeWidget(item, { w: 3, h: 2 });

  // if (type === "bar") {
  //   renderChart(item);
  // }
  if (["bar","line","pie","area","scatter"].includes(type)) {
    renderChart(item);
  }
}

function saveAndExit() {
  saveConfig();
  closeConfigure();
}


let activeWidget = null;

function openSettings(btn) {
  activeWidget = btn.closest(".grid-stack-item");
  const type = activeWidget.dataset.type;

  // hide all
  document.getElementById("kpiSettings").style.display = "none";
  document.getElementById("chartSettings").style.display = "none";

  if (type === "kpi") {
  document.getElementById("kpiSettings").style.display = "block";

    document.getElementById("kpiTitle").value =
      activeWidget.querySelector(".widget-title")?.innerText || "Untitled";
  }

  if (["bar","line","pie","scatter"].includes(type)) {
    document.getElementById("chartSettings").style.display = "block";

    document.getElementById("chartTitle").value =
      activeWidget.querySelector(".widget-title").innerText;

    document.getElementById("chartType").value = type;
    document.getElementById("chartWidth").value =
      activeWidget.gridstackNode?.w || 4;
    document.getElementById("chartHeight").value =
      activeWidget.gridstackNode?.h || 4;
  }

  document.getElementById("settingsPanel").classList.add("open");
}
function saveSettings() {
  if (!activeWidget) return;

  const type = activeWidget.dataset.type;
  if (["bar", "line", "area", "scatter", "pie"].includes(type)) {

  const title = document.getElementById("chartTitle").value;
  const newType = document.getElementById("chartType").value;

  let chartConfig = JSON.parse(activeWidget.dataset.chartConfig || "{}");

  chartConfig.type = newType;

  if (newType === "pie") {
    chartConfig.labelField = "month";   // example
    chartConfig.valueField = "value";
  } else {
    chartConfig.xAxis = document.getElementById("xAxis").value;
    chartConfig.yAxis = document.getElementById("yAxis").value;
  }

  activeWidget.dataset.chartConfig = JSON.stringify(chartConfig);
  activeWidget.dataset.type = newType;

  activeWidget.querySelector(".widget-title").innerText = title;

  grid.update(activeWidget, {
    w: activeWidget.gridstackNode.w,
    h: activeWidget.gridstackNode.h
  });

  // renderChart(activeWidget);
  grid.update(activeWidget, { w, h });

    // 🔥 RE-RENDER
    setTimeout(() => {
      renderChart(activeWidget);
    }, 50);
  }

  exitWidgetSettings();
  showToast("Chart updated successfully");
}





function renderTableWidget(widget, config) {
  const body = widget.querySelector(".widget-body");
  body.innerHTML = "<table class='table-widget'></table>";

  fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config)
  })
  .then(res => res.json())
  .then(data => {
    const table = body.querySelector("table");

    // Header
    let thead = "<tr>";
    config.columns.forEach(col => {
      thead += `<th>${col}</th>`;
    });
    thead += "</tr>";

    // Rows
    let rows = "";


    data.forEach(row => {
      rows += "<tr>";
      config.columns.forEach(col => {
        rows += `<td>${row[col]}</td>`;
      });
      rows += "</tr>";
    });

    table.innerHTML = thead + rows;
  });
}
function renderChart(widget) {
  const body = widget.querySelector(".widget-body");
  body.innerHTML = "";

  const canvas = document.createElement("canvas");
  body.appendChild(canvas);

  const config = JSON.parse(widget.dataset.chartConfig || "{}");

  let chartData;

  // 🔥 PIE CHART
  if (config.type === "pie") {
    chartData = {
      labels: ["Jan", "Feb", "Mar", "Apr"],
      datasets: [{
        data: [1200, 1900, 1500, 2200],
        backgroundColor: [
          "#3b82f6",
          "#22c55e",
          "#f97316",
          "#ef4444"
        ]
      }]
    };
  }
  // 🔥 BAR / LINE / AREA
  else {
    chartData = {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [{
        label: "Value",
        data: [1200, 1900, 1500, 2200, 1800, 2600],
        backgroundColor:
          config.type === "line" ? "transparent" : "rgba(59,130,246,0.5)",
        borderColor: "#3b82f6",
        borderWidth: 2,
        fill: config.type === "area",
        tension: config.type === "line" ? 0.4 : 0
      }]
    };
  }

  new Chart(canvas, {
    type: config.type,
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}


function discardSettings() {
  // closeSettings();
  // closeConfigure();
  exitWidgetSettings();
}
function saveSettingsToBackend() {
  const layout = grid.engine.nodes.map(n => ({
    id: n.el.id || null,
    type: n.el.dataset.type,
    title: n.el.querySelector(".widget-title").innerText,
    x: n.x,
    y: n.y,
    w: n.w,
    h: n.h,
    metric: n.el.dataset.metric || null,
    aggregation: n.el.dataset.aggregation || null
  }));

  fetch("/api/dashboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(layout)
  });
}
function exitWidgetSettings() {
  // Close right-side panel
  document.getElementById("settingsPanel").classList.remove("open");

  // Remove dim / lock state
  document.getElementById("configureView").classList.remove("settings-open");

  // Clear active widget
  activeWidget = null;
}

function reloadWidgetData(widget) {
  const type = widget.dataset.type;
  const metric = widget.dataset.metric;
  const aggregation = widget.dataset.aggregation;

  const body = widget.querySelector(".widget-body");

  if (type === "kpi") {
    body.innerHTML = `<h2>${aggregation.toUpperCase()} ${metric}</h2>`;
  }

  // later: charts / tables API calls here
}



///table tab
async function loadTable(elId) {
  const filter = getSelectedFilter();
  const res = await fetch(`/api/orders?filter=${filter}`);
  const data = await res.json();

  let html = "<table><tr><th>Date</th><th>Amount</th></tr>";
  data.orders.forEach(o => {
    html += `<tr><td>${o.date}</td><td>${o.amount}</td></tr>`;
  });
  html += "</table>";

  document.getElementById(elId).innerHTML = html;
}
function showDashboardTab() {
  document.getElementById("dashboardTab").style.display = "block";
  document.getElementById("tableTab").style.display = "none";

  setActiveTab(0);
}
function showTableTab() {
  document.getElementById("dashboardTab").style.display = "none";
  document.getElementById("tableTab").style.display = "block";

  loadOrdersTable();
  setActiveTab(1);
}

function discardSettings() {
  document.getElementById("discardModal").classList.add("open");
}

function closeDiscardModal() {
  document.getElementById("discardModal").classList.remove("open");
}

function confirmDiscard() {
  closeDiscardModal();
  exitWidgetSettings();
}
let toastTimer = null;

// function showToast(message) {
//   const toast = document.getElementById("toast");
//   toast.querySelector(".toast-message").innerText = message;

//   toast.classList.add("show");

//   clearTimeout(toastTimer);
//   toastTimer = setTimeout(hideToast, 3000);
// }
// function showToast() {
//   const toast = document.getElementById("toast");
//   toast.classList.add("show");

//   setTimeout(() => {
//     toast.classList.remove("show");
//   }, 3000);
// }
function showToast() {
  const toast = document.getElementById("toast");
  toast.innerText = "Order created successfully";
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

const tableSection = document.getElementById("tableSection");
const emptyState = document.getElementById("emptyState");

function loadOrders() {
  fetch("/api/orders")
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) {
        emptyState.style.display = "block";
        tableSection.style.display = "none";
      } else {
        emptyState.style.display = "none";
        tableSection.style.display = "block";
        renderTable(data);
      }
    });
}
// function renderTable(data) {
//   const tbody = document.getElementById("orderRows");
//   tbody.innerHTML = "";

//   data.forEach(order => {
//     const row = `
//       <tr>
//         <td>${order.first_name} ${order.last_name}</td>
//         <td>${order.product}</td>
//         <td>${order.quantity}</td>
//         <td>$${order.total_amount}</td>
//         <td>${order.status}</td>
//       </tr>
//     `;
//     tbody.innerHTML += row;
//   });
// }



// function renderTable() {
//   const tbody = document.getElementById("orderRows");
//   const emptyState = document.getElementById("emptyState");
//   const tableSection = document.getElementById("tableSection");

//   tbody.innerHTML = "";

//   if (orders.length === 0) {
//     emptyState.style.display = "block";
//     tableSection.style.display = "none";
//     return;
//   }

//   emptyState.style.display = "none";
//   tableSection.style.display = "block";

//   orders.forEach(o => {
//     tbody.innerHTML += `
//       <tr>
//         <td>${o.firstName}</td>
//         <td>${o.lastName}</td>
//         <td>${o.email}</td>
//         <td>${o.phone}</td>
//         <td>${o.street}</td>
//         <td>${o.city}</td>
//         <td>${o.state}</td>
//         <td>${o.postal}</td>
//         <td>${o.country}</td>
//         <td>${o.product}</td>
//         <td>${o.quantity}</td>
//         <td>$${o.unitPrice}</td>
//         <td>$${o.totalAmount}</td>
//         <td>${o.status}</td>
//         <td>${o.createdBy}</td>
//       </tr>
//     `;
//   });
// }

function renderTable() {
  const emptyState = document.getElementById("ordersEmptyState");
  const tableSection = document.getElementById("tableSection");
  const tbody = document.getElementById("orderRows");

  tbody.innerHTML = "";

  if (orders.length === 0) {
    emptyState.style.display = "block";
    tableSection.style.display = "none";
    return;
  }

  emptyState.style.display = "none";
  tableSection.style.display = "block";

  orders.forEach(o => {
    tbody.innerHTML += `
      <tr>
        <td>${o.firstName}</td>
        <td>${o.lastName}</td>
        <td>${o.email}</td>
        <td>${o.phone}</td>
        <td>${o.street}</td>
        <td>${o.city}</td>
        <td>${o.state}</td>
        <td>${o.postal}</td>
        <td>${o.country}</td>
        <td>${o.product}</td>
        <td>${o.quantity}</td>
        <td>$${o.unitPrice}</td>
        <td>$${o.totalAmount}</td>
        <td>${o.status}</td>
        <td>${o.createdBy}</td>
        
      </tr>
      
    `;
  });
}

function hideToast() {
  document.getElementById("toast").classList.remove("show");
}
function loadOrders() {
  fetch("/api/orders")
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) {
        document.getElementById("emptyState").style.display = "block";
        document.getElementById("tableSection").style.display = "none";
      } else {
        document.getElementById("emptyState").style.display = "none";
        document.getElementById("tableSection").style.display = "block";
        renderTable(data);
      }
    });
}

// ================================
// REMOVE WIDGET
// ================================
function removeWidget(btn, e) {
  e.stopPropagation();

  widgetToDelete = btn.closest(".grid-stack-item");

  const title =
    widgetToDelete.querySelector(".widget-title")?.innerText || "this";

  document.getElementById("deleteMessage").innerHTML =
    `Are you sure you want to delete the <b>${title}</b> widget?`;

  document.getElementById("deleteModal").classList.add("open");
}
function closeDeleteModal() {
  document.getElementById("deleteModal").classList.remove("open");
  widgetToDelete = null;
}
function confirmDelete() {
  if (!widgetToDelete) return;

  grid.removeWidget(widgetToDelete);
  widgetToDelete = null;

  closeDeleteModal();

  // ✅ Success toast
  showToast("Done! Your widget has been removed");
}

// Clear previous errors for a empty filed inputs
function clearValidationErrors() {
  document.querySelectorAll(".field-error").forEach(el =>
    el.classList.remove("field-error")
  );

  document.querySelectorAll(".error-text").forEach(el =>
    el.classList.remove("show")
  );
}
function validateWidgetSettings() {
  let isValid = true;

  const title = document.getElementById("widgetTitle");
  const metric = document.getElementById("widgetMetric");
  const width = document.getElementById("widgetWidth");
  const height = document.getElementById("widgetHeight");
  const aggregation = document.getElementById("widgetAggregation");
  const format = document.getElementById("widgetFormat");

  clearValidationErrors();

  if (!title.value.trim()) {
    title.classList.add("field-error");
    document.getElementById("titleError").classList.add("show");
    isValid = false;
  }

  if (!metric.value) {
    metric.classList.add("field-error");
    document.getElementById("metricError").classList.add("show");
    isValid = false;
  }

  if (!width.value) {
    width.classList.add("field-error");
    document.getElementById("widthError").classList.add("show");
    isValid = false;
  }

  if (!height.value) {
    height.classList.add("field-error");
    document.getElementById("heightError").classList.add("show");
    isValid = false;
  }

  if (!aggregation.value) {
    aggregation.classList.add("field-error");
    document.getElementById("aggregationError").classList.add("show");
    isValid = false;
  }

  if (!format.value) {
    format.classList.add("field-error");
    document.getElementById("formatError").classList.add("show");
    isValid = false;
  }

  return isValid;
}
document.addEventListener("DOMContentLoaded", () => {
  loadOrders();
});
