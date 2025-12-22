// ================================
// GLOBALS
// ================================
let grid;
let activeWidgetBody = null;

// ================================
// INIT
// ================================
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("configGrid")) {
    grid = GridStack.init(
  {
    cellHeight: 120,
    margin: 10,
    float: true,
    draggable: true,          // ✅ enable drag
    resizable: true,          // ✅ optional but good
    placeholderClass: "grid-stack-placeholder"
  },
  "#configGrid"
);

    loadDashboard();
  }
});



// ================================
// VIEW TOGGLING (FIGMA FLOW)
// ================================
function openConfigure() {
  document.getElementById("dashboardView").style.display = "none";
  document.getElementById("configureView").style.display = "block";

  // grid.enableMove(true);
  // grid.enableResize(true);
}

function closeConfigure() {
  document.getElementById("configureView").style.display = "none";
  document.getElementById("dashboardView").style.display = "block";

  // renderDashboardView();
}

function saveAndExit() {
  saveConfig();
  closeConfigure();
}

// ================================
// EMPTY DASHBOARD STATE
// ================================
function renderDashboardView() {
  const hasWidgets = grid.engine.nodes.length > 0;
  document.getElementById("emptyState").style.display =
    hasWidgets ? "none" : "block";
}

// ================================
// DATE FILTER (WORKS IN BOTH VIEWS)
// ================================
function getSelectedFilter() {
  return (
    document.getElementById("dateFilterConfig")?.value ||
    document.getElementById("dateFilter")?.value ||
    "All time"
  );
}

function reloadWidgets() {
  grid.engine.nodes.forEach(n => {
    const body = n.el.querySelector(".widget-body");
    const type = n.el
      .querySelector(".widget-header strong")
      .innerText.toLowerCase();

    if (type.includes("bar")) loadChart(body.id, "bar");
    if (type.includes("line")) loadChart(body.id, "line");
    if (type.includes("pie")) loadChart(body.id, "pie");
    if (type.includes("kpi")) loadKPI(body.id);
    if (type.includes("table")) loadTable(body.id);
  });
}

// ================================
// ADD WIDGET (FROM LIBRARY)
// ================================

function addWidget(type) {
  const id = `kpi-${Date.now()}`;

  const item = document.createElement("div");
  item.classList.add("grid-stack-item");
  item.setAttribute("gs-w", "3");
  item.setAttribute("gs-h", "2");

  item.innerHTML = `
    <div class="grid-stack-item-content widget">
      <div class="widget-header">
        <strong>KPI Value</strong>
        <div class="widget-actions">
          <button onclick="openSettings('${id}')">⚙</button>
          <button onclick="removeWidget(this)">🗑</button>
        </div>
      </div>
      <div class="widget-body" id="${id}">
        <h2>₹ 0</h2>
        <p>Total Revenue</p>
      </div>
    </div>
  `;

  // ✅ append FIRST
  document.getElementById("configGrid").appendChild(item);

  // ✅ then register with GridStack
  grid.makeWidget(item);

  loadKPI(id);
}

// function addWidget(type) {
//   const config = {
//     type: type,
//     x: 0,
//     y: 0,
//     w: 4,
//     h: 2,
//     title: type.toUpperCase()
//   };

//   addWidgetFromConfig(config);
// }

// ================================
// ADD WIDGET FROM SAVED CONFIG
// ================================
function addWidgetFromConfig(config) {
  const id = `${config.type}-${Date.now()}`;

  const item = document.createElement("div");
  item.classList.add("grid-stack-item");
  item.setAttribute("gs-x", config.x);
  item.setAttribute("gs-y", config.y);
  item.setAttribute("gs-w", config.w);
  item.setAttribute("gs-h", config.h);

  item.innerHTML = `
    <div class="grid-stack-item-content">
      <div class="widget-header">
        <strong>${config.title}</strong>
        <div class="widget-actions">
          <button onclick="openSettings('${id}')">⚙</button>
          <button onclick="removeWidget(this)">🗑</button>
        </div>
      </div>
      <div class="widget-body" id="${id}"></div>
    </div>
  `;

  document.getElementById("configGrid").appendChild(item);
  grid.makeWidget(item);   // ✅ REQUIRED

  if (config.type === "kpi") loadKPI(id);
  if (config.type === "bar") loadChart(id, "bar");
  if (config.type === "line") loadChart(id, "line");
  if (config.type === "pie") loadChart(id, "pie");
  if (config.type === "table") loadTable(id);
}

// ================================
// DELETE WIDGET
// ================================
function removeWidget(btn) {
  const item = btn.closest(".grid-stack-item");
  grid.removeWidget(item);
}

// ================================
// SAVE / LOAD DASHBOARD
// ================================
function saveConfig() {
  const layout = grid.engine.nodes.map(n => {
    const content = n.el.querySelector(".grid-stack-item-content");
    return {
      type: content.querySelector(".widget-header strong").innerText.toLowerCase(),
      x: n.x,
      y: n.y,
      w: n.w,
      h: n.h,
      title: content.querySelector(".widget-header strong").innerText
    };
  });

  fetch("/api/dashboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(layout)
  });

  alert("Dashboard saved successfully");
}

function loadDashboard() {
  fetch("/api/dashboard")
    .then(res => res.json())
    .then(layout => {
      if (!Array.isArray(layout)) return;

      grid.removeAll();

      layout.forEach(cfg => addWidgetFromConfig(cfg));
      renderDashboardView();
    });
}

// ================================
// SETTINGS PANEL
// ================================
function openSettings(widgetId) {
  activeWidgetBody = document.getElementById(widgetId);
  const header = activeWidgetBody.previousSibling;

  document.getElementById("widgetTitle").value =
    header.querySelector("strong").innerText;

  document.getElementById("settingsPanel").classList.add("open");
}

function closeSettings() {
  document.getElementById("settingsPanel").classList.remove("open");
}

function saveSettings() {
  const newTitle = document.getElementById("widgetTitle").value;
  activeWidgetBody.previousSibling.querySelector("strong").innerText = newTitle;
  closeSettings();
}

// ================================
// CHART WIDGET (BAR / LINE / PIE)
// ================================
async function loadChart(elId, chartType = "bar") {
  const filter = getSelectedFilter();
  const res = await fetch(`/api/orders?filter=${filter}`);
  const data = await res.json();

  const container = document.getElementById(elId);
  container.innerHTML = "";

  const canvas = document.createElement("canvas");
  container.appendChild(canvas);

  new Chart(canvas, {
    type: chartType,
    data: {
      labels: data.orders.map(o => o.date),
      datasets: [
        {
          label: "Order Amount",
          data: data.orders.map(o => o.amount),
          backgroundColor: "#3b82f6"
        }
      ]
    }
  });
}

// ================================
// KPI WIDGET
// ================================
async function loadKPI(elId) {
  const filter = getSelectedFilter();
  const res = await fetch(`/api/orders?filter=${filter}`);
  const data = await res.json();

  document.getElementById(elId).innerHTML =
    `<h2>₹ ${data.total}</h2><p>Total Revenue</p>`;
}

// ================================
// TABLE WIDGET
// ================================
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

function setActiveTab(index) {
  document.querySelectorAll(".tab").forEach((tab, i) => {
    tab.classList.toggle("active", i === index);
  });
}


async function loadOrdersTable() {
  const res = await fetch("/api/orders?filter=All time");
  const data = await res.json();

  const tbody = document.getElementById("ordersTableBody");
  tbody.innerHTML = "";

  data.orders.forEach(o => {
    tbody.innerHTML += `
      <tr>
        <td>${o.date}</td>
        <td>${o.customer || "N/A"}</td>
        <td>₹ ${o.amount}</td>
      </tr>
    `;
  });
}



// function loadDashboard() {
//   fetch("/api/dashboard")
//     .then(res => res.json())
//     .then(layout => {
//       if (!Array.isArray(layout)) return;

//       grid.removeAll();

//       layout.forEach(cfg => {
//         const id = `${cfg.type}-${Date.now()}`;

//         const item = document.createElement("div");
//         item.className = "grid-stack-item";
//         item.dataset.type = cfg.type;   // ✅ IMPORTANT

//         item.innerHTML = `
//           <div class="grid-stack-item-content widget">
//             <div class="widget-header">
//               <span class="drag-handle">⋮⋮</span>
//               <strong>${cfg.title}</strong>
//               <div class="widget-actions">
//                 <button onclick="openSettings('${id}', event)">⚙️</button>
//                 <button onclick="removeWidget(this, event)">🗑</button>
//               </div>
//             </div>
//             <div class="widget-body" id="${id}">id</div>
//           </div>
//         `;

//         grid.addWidget(item, cfg);

//         // ✅ Reload correct data
//         if (cfg.type === "bar") loadChart(id, "bar");
//         if (cfg.type === "line") loadChart(id, "line");
//         if (cfg.type === "pie") loadChart(id, "pie");
//         if (cfg.type === "kpi") loadKPI(id);
//         if (cfg.type === "table") loadTable(id);
//       });
//     });
// }


// function openSettings(widgetId) {
//   activeWidget = document.getElementById(widgetId)
//     .closest(".grid-stack-item");

//   const title = activeWidget.querySelector(".widget-title").innerText;
//   document.getElementById("widgetTitle").value = title;

//   document.getElementById("settingsPanel").classList.add("open");
// }




// function saveSettings() {
//   const newTitle = document.getElementById("widgetTitle").value;
//   activeWidget.querySelector(".widget-title").innerText = newTitle;
//   closeSettings();
// }
// function closeSettings() {
//   document.getElementById("settingsPanel").classList.remove("open");
// }

// function openSettings(widgetId) {
//   activeWidget = document.getElementById(widgetId)
//     .closest(".grid-stack-item");

//   document.getElementById("widgetTitle").value =
//     activeWidget.querySelector(".widget-title").innerText || "Untitled";

//   document.getElementById("widgetType").value =
//     activeWidget.dataset.type;

//   document.getElementById("widgetWidth").value =
//     activeWidget?.gridstackNode?.w || 2;

//   document.getElementById("widgetHeight").value =
//     activeWidget?.gridstackNode?.h || 2;


//   document.getElementById("settingsPanel").classList.add("open");
//   document.getElementById("configureView").classList.add("settings-open");
// }

// let activeWidget = null;
// function openSettings(target, event) {
//   if (event) event.stopPropagation();

//   // CASE 1: called with button (this)
//   if (target instanceof HTMLElement) {
//     activeWidget = target.closest(".grid-stack-item");
//   }
//   // CASE 2: called with widgetId string
//   else {
//     const body = document.getElementById(target);
//     activeWidget = body?.closest(".grid-stack-item");
//   }

//   if (!activeWidget) {
//     console.error("Active widget not found");
//     return;
//   }

//   // Fill settings panel fields
//   document.getElementById("widgetTitle").value =
//     activeWidget.querySelector(".widget-title")?.innerText || "Untitled";

//   document.getElementById("widgetType").value =
//     activeWidget.dataset.type || "";

//   document.getElementById("widgetWidth").value =
//     activeWidget.gridstackNode?.w || 2;

//   document.getElementById("widgetHeight").value =
//     activeWidget.gridstackNode?.h || 2;


//   if (config.type === "table") {
//     document.getElementById("tableSettings").style.display = "block";

//     document.getElementById("tableColumns").value = config.columns || [];
//     document.getElementById("tableSortBy").value = config.sortBy || "";
//     document.getElementById("tableSortOrder").value = config.sortOrder || "asc";
//     document.getElementById("tablePagination").value = config.pagination || 5;
//   }

//   document.getElementById("settingsPanel").classList.add("open");
//   // document.getElementById("settingsPanel").classList.add("open");
//   document.getElementById("configureView").classList.add("settings-open");
// }

// / function openSettings(btn) {
  // activeWidget = btn.closest(".grid-stack-item");

  // const type = activeWidget.dataset.type || "bar";
  // const title = activeWidget.querySelector(".widget-title")?.innerText || "Untitled";

  // // Fill settings form
  // document.getElementById("widgetTitle").value = title;
  // document.getElementById("widgetType").value = type;

  // document.getElementById("widgetWidth").value =
  //   activeWidget.gridstackNode?.w || 4;

  // document.getElementById("widgetHeight").value =
  //   activeWidget.gridstackNode?.h || 4;

  // // Show panel
  // document.getElementById("settingsPanel").classList.add("open");
  // document.getElementById("configureView").classList.add("settings-open");
//   activeWidget = btn.closest(".grid-stack-item");
//   const type = activeWidget.dataset.type;

//   // Hide all sections first
//   document.getElementById("kpiSettings").style.display = "none";
//   document.getElementById("chartSettings").style.display = "none";
//   document.getElementById("tableSettings").style.display = "none";

//   // KPI
//   if (type === "kpi") {
//     document.getElementById("kpiSettings").style.display = "block";
//     document.getElementById("kpiTitle").value =
//       activeWidget.querySelector(".widget-title").innerText || "Untitled";
//   }

//   // CHARTS
//   if (["bar", "line", "area", "scatter"].includes(type)) {
//     document.getElementById("chartSettings").style.display = "block";
//     document.getElementById("chartTitle").value =
//       activeWidget.querySelector(".widget-title").innerText || "Untitled";

//     document.getElementById("chartType").value = type;
//     document.getElementById("chartWidth").value =
//       activeWidget.gridstackNode?.w || 4;
//     document.getElementById("chartHeight").value =
//       activeWidget.gridstackNode?.h || 4;
//   }

//   // TABLE (next phase)
//   if (type === "table") {
//     document.getElementById("tableSettings").style.display = "block";
//   }

//   document.getElementById("settingsPanel").classList.add("open");
//   document.getElementById("configureView").classList.add("settings-open");
// }


// async function submitOrder() {

//   const requiredFields = [
//     "firstName","lastName","email","phone","street",
//     "city","state","postal","country","product",
//     "status","createdBy"
//   ];

//   let valid = true;
//   requiredFields.forEach(id => {
//     if (!validate(id)) valid = false;
//   });

//   if (qty.value < 1) {
//     alert("Quantity must be at least 1");
//     return;
//   }

//   if (!valid) return;

//   const data = {
//     first_name: document.getElementById("firstName").value,
//     last_name: document.getElementById("lastName").value,
//     email: document.getElementById("email").value,
//     phone: document.getElementById("phone").value,
//     address: `${street.value}, ${city.value}, ${state.value}, ${postal.value}, ${country.value}`,
//     product: document.getElementById("product").value,
//     quantity: parseInt(qty.value),
//     unit_price: parseFloat(price.value),
//     total_amount: parseInt(qty.value) * parseFloat(price.value),
//     status: document.getElementById("status").value,
//     created_by: document.getElementById("createdBy").value
//   };

//   const res = await fetch("/api/orders", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data)
//   });

//   if (res.ok) {
//     showToast();
//     closeCreateOrder();
//     loadOrders();
//   }
// }

// ================================
// ADD WIDGET (LIBRARY CLICK)
// ================================
// function addWidget(type) {
//   const id = `${type}-${Date.now()}`;

//   const item = document.createElement("div");
//   item.className = "grid-stack-item";
//   item.dataset.type = type;   // ✅ REQUIRED

//   item.innerHTML = `
//     <div class="grid-stack-item-content widget">
//       <div class="widget-header">
//         <span class="drag-handle">⋮⋮</span>
//         <strong>${type.toUpperCase()}</strong>
//         <div class="widget-actions">
//           <button onclick="openSettings('${id}', event)">⚙️</button>
//           <button onclick="removeWidget(this, event)">Delete</button>
//         </div>
//       </div>
//       <div class="widget-body" id="${id}"></div>
//     </div>
//   `;

//   grid.addWidget(item, { w: 4, h: 2 });

//   if (type === "bar") loadChart(id, "bar");
//   if (type === "line") loadChart(id, "line");
//   if (type === "pie") loadChart(id, "pie");
//   if (type === "kpi") loadKPI(id);
//   if (type === "table") loadTable(id);
// }



// ================================
// SAVE / LOAD
// ================================
// function saveConfig() {
//   const layout = grid.engine.nodes.map(n => {
//     return {
//       type: n.el.dataset.type,   // ✅ THIS FIXES CHART SAVE
//       x: n.x,
//       y: n.y,
//       w: n.w,
//       h: n.h,
//       title: n.el.querySelector(".widget-header strong").innerText
//     };
//   });

//   fetch("/api/dashboard", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(layout)
//   });

//   alert("Dashboard saved");
// }