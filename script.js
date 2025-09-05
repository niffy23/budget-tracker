// ===== DOM Elements =====
const form = document.getElementById("transaction-form");
const balanceEl = document.getElementById("balanceSummary");
const incomeEl = document.getElementById("incomeSummary");
const expensesEl = document.getElementById("expensesSummary");
const transactionList = document.getElementById("transaction-list");
const clearAllBtn = document.getElementById("clear-all");
const monthFilter = document.getElementById("monthFilter");
const darkModeToggle = document.getElementById("darkModeToggle");
const logoutBtn = document.getElementById("logout");
const exportBtn = document.getElementById("export-csv");
const welcomeUser = document.getElementById("welcomeUser");

// ===== User Handling =====
let currentUser = localStorage.getItem("currentUser");
if (!currentUser) {
  window.location.href = "login.html"; // redirect if not logged in
}
welcomeUser.textContent = `👋 Welcome, ${currentUser}`;

// Load transactions for this user
let transactions = JSON.parse(localStorage.getItem(`transactions_${currentUser}`)) || [];

// ===== Add Transaction =====
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const description = document.getElementById("description").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;

  if (description.trim() === "" || isNaN(amount) || amount <= 0) {
    alert("Please enter a valid description and amount");
    return;
  }

  const transaction = {
    id: Date.now(),
    description,
    amount,
    type,
    category,
    date: new Date().toISOString(),
  };

  transactions.push(transaction);
  saveTransactions();
  renderTransactions();
  updateTotals();
  renderCharts();

  form.reset();
});

// ===== Render Transactions =====
function renderTransactions() {
  transactionList.innerHTML = "";
  transactions.filter(isInSelectedMonth).forEach((t) => {
    const li = document.createElement("li");
    li.classList.add(t.type);
    const txDate = new Date(t.date).toLocaleDateString();
    li.innerHTML = `
      <span>
        <strong>${t.description}</strong> - $${t.amount.toFixed(2)}<br>
        <em>(${t.type}, ${t.category})</em> - <small>${txDate}</small>
      </span>
      <button class="delete-btn" onclick="deleteTransaction(${t.id})">X</button>
    `;
    transactionList.appendChild(li);
  });
}

// ===== Delete Transaction =====
function deleteTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  saveTransactions();
  renderTransactions();
  updateTotals();
  renderCharts();
}

// ===== Update Totals =====
function updateTotals() {
  let income = 0;
  let expenses = 0;

  transactions.forEach((t) => {
    if (t.type === "income") {
      income += t.amount;
    } else {
      expenses += t.amount;
    }
  });

  const balance = income - expenses;
  balanceEl.textContent = balance.toFixed(2);
  incomeEl.textContent = income.toFixed(2);
  expensesEl.textContent = expenses.toFixed(2);
}

// ===== Save to LocalStorage =====
function saveTransactions() {
  localStorage.setItem(`transactions_${currentUser}`, JSON.stringify(transactions));
}

// ===== Clear All Transactions =====
clearAllBtn.addEventListener("click", function () {
  if (confirm("Are you sure you want to clear all transactions?")) {
    transactions = [];
    saveTransactions();
    renderTransactions();
    updateTotals();
    renderCharts();
  }
});

// ===== Chart.js Setup =====
let expensesChart;
let incomeExpensesChart;

function renderCharts() {
  // Group expenses by category
  let categories = {};
  transactions.forEach((t) => {
    if (t.type === "expense") {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    }
  });

  const expenseData = {
    labels: Object.keys(categories),
    datasets: [
      {
        data: Object.values(categories),
        backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff"],
      },
    ],
  };

  if (expensesChart) expensesChart.destroy();
  expensesChart = new Chart(document.getElementById("expensesChart"), {
    type: "pie",
    data: expenseData,
  });

  // Income vs Expenses Bar Chart
  let totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  let totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const incomeExpenseData = {
    labels: ["Income", "Expenses"],
    datasets: [
      {
        data: [totalIncome, totalExpense],
        backgroundColor: ["green", "red"],
      },
    ],
  };

  if (incomeExpensesChart) incomeExpensesChart.destroy();
  incomeExpensesChart = new Chart(document.getElementById("incomeExpensesChart"), {
    type: "bar",
    data: incomeExpenseData,
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
    },
  });
}

// ===== Month Filter =====
monthFilter.addEventListener("change", () => {
  renderTransactions();
  updateTotals();
  renderCharts();
});

function isInSelectedMonth(transaction) {
  if (!monthFilter.value) return true;
  const [year, month] = monthFilter.value.split("-");
  const txDate = new Date(transaction.date);
  return (
    txDate.getFullYear() === parseInt(year) &&
    txDate.getMonth() + 1 === parseInt(month)
  );
}

// ===== Dark Mode Toggle =====
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
});

// Load Dark Mode Preference
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode");
}

// ===== Export to CSV =====
exportBtn.addEventListener("click", () => {
  if (transactions.length === 0) {
    alert("No transactions to export!");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Description,Amount,Type,Category,Date\n";

  transactions.forEach((t) => {
    const row = `${t.description},${t.amount},${t.type},${t.category},${new Date(
      t.date
    ).toLocaleDateString()}`;
    csvContent += row + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "transactions.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// ===== Logout =====
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
});

// ===== Initial Load =====
renderTransactions();
updateTotals();
renderCharts();
