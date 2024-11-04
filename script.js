// DOM Elements
const expenseForm = document.getElementById('expense-form');
const expenseList = document.getElementById('expense-list');
const totalAmountEl = document.getElementById('total-amount');
const expenseSummaryList = document.getElementById('expense-summary-list');
const expenseChartCtx = document.getElementById('expenseChart').getContext('2d');
const sortAscBtn = document.getElementById('sort-asc');
const sortDescBtn = document.getElementById('sort-desc');
const filterStartDate = document.getElementById('filter-start-date');
const filterEndDate = document.getElementById('filter-end-date');
const applyFilterBtn = document.getElementById('apply-filter');
const resetFilterBtn = document.getElementById('reset-filter');

// Initialize Expense Array from localStorage or empty array
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let expenseChart; // Will hold the chart instance

// Handle Form Submit
expenseForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('expense-name').value.trim();
  const amount = parseFloat(document.getElementById('expense-amount').value);
  const category = document.getElementById('expense-category').value;
  const date = document.getElementById('expense-date').value || new Date().toISOString().split('T')[0];

  if (!name || amount <= 0 || !category) {
    alert("Please fill in all required fields correctly.");
    return;
  }

  const expense = { id: Date.now(), name, amount, category, date };
  expenses.push(expense);
  saveExpenses();
  renderExpenses();
  renderExpenseSummary();
  expenseForm.reset();
});

// Render Expenses List
function renderExpenses(sortByDate = false, sortOrder = 'asc', filter = false) {
  expenseList.innerHTML = '';
  let totalAmount = 0;

  let filteredExpenses = [...expenses];

  // Apply Date Filtering if filter is true
  if (filter) {
    const startDate = new Date(filterStartDate.value);
    const endDate = new Date(filterEndDate.value);

    filteredExpenses = filteredExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return (!isNaN(startDate) ? expenseDate >= startDate : true) && 
             (!isNaN(endDate) ? expenseDate <= endDate : true);
    });
  }

  // Apply Sorting if required
  if (sortByDate) {
    filteredExpenses.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }

  filteredExpenses.forEach(expense => {
    totalAmount += expense.amount;

    const li = document.createElement('li');
    li.innerHTML = `
      <span>${expense.name} - $${expense.amount} - ${expense.category} - ${expense.date}</span>
      <div>
        <button class="edit-btn" onclick="editExpense(${expense.id})">Edit</button>
        <button class="delete-btn" onclick="deleteExpense(${expense.id})">Delete</button>
      </div>
    `;
    expenseList.appendChild(li);
  });

  totalAmountEl.textContent = totalAmount.toFixed(2);
}

// Save Expenses to localStorage
function saveExpenses() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Edit Expense
function editExpense(id) {
  const expense = expenses.find(exp => exp.id === id);
  if (!expense) return;

  document.getElementById('expense-name').value = expense.name;
  document.getElementById('expense-amount').value = expense.amount;
  document.getElementById('expense-category').value = expense.category;
  document.getElementById('expense-date').value = expense.date;

  deleteExpense(id); // Delete current record and re-add after editing
}

// Delete Expense
function deleteExpense(id) {
  expenses = expenses.filter(exp => exp.id !== id);
  saveExpenses();
  renderExpenses();
  renderExpenseSummary();
}

// Render Expense Summary by Category
function renderExpenseSummary() {
  const categories = {};

  // Aggregate expenses by category
  expenses.forEach(expense => {
    if (categories[expense.category]) {
      categories[expense.category] += expense.amount;
    } else {
      categories[expense.category] = expense.amount;
    }
  });

  // Render the summary list
  expenseSummaryList.innerHTML = '';
  Object.keys(categories).forEach(category => {
    const li = document.createElement('li');
    li.textContent = `${category}: $${categories[category].toFixed(2)}`;
    expenseSummaryList.appendChild(li);
  });

  // Update the pie chart
  renderExpenseChart(categories);
}

// Render Expense Chart (Pie)
function renderExpenseChart(categories) {
  const labels = Object.keys(categories);
  const data = Object.values(categories);

  if (expenseChart) {
    expenseChart.destroy();
  }

  expenseChart = new Chart(expenseChartCtx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        label: 'Expenses by Category',
        data,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        hoverOffset: 4
      }]
    }
  });
}

// Date Sorting Handlers
sortAscBtn.addEventListener('click', () => renderExpenses(true, 'asc'));
sortDescBtn.addEventListener('click', () => renderExpenses(true, 'desc'));

// Date Filter Handlers
applyFilterBtn.addEventListener('click', () => renderExpenses(false, 'asc', true));
resetFilterBtn.addEventListener('click', () => {
  filterStartDate.value = '';
  filterEndDate.value = '';
  renderExpenses();
});

// Initial Rendering
renderExpenses();
renderExpenseSummary();
