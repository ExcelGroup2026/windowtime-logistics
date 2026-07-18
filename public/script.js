// ===== Data Model =====
class DeliveryApp {
  constructor() {
    this.allDeliveries = [];
    this.filteredDeliveries = [];
    this.currentDate = new Date();
    this.selectedDelivery = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setDefaultDate();
    this.loadDeliveries();
    this.updateUI();
  }

  setupEventListeners() {
    const dateInput = document.getElementById('dateInput');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const truckFilter = document.getElementById('truckFilter');
    const exportBtn = document.getElementById('exportBtn');
    const closeModal = document.getElementById('closeModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    dateInput.addEventListener('change', (e) => this.handleDateChange(e));
    searchInput.addEventListener('input', (e) => this.handleSearch(e));
    statusFilter.addEventListener('change', (e) => this.handleFilter());
    truckFilter.addEventListener('change', (e) => this.handleFilter());
    exportBtn.addEventListener('click', () => this.exportToCSV());
    closeModal.addEventListener('click', () => this.closeModal());
    closeModalBtn.addEventListener('click', () => this.closeModal());

    document.getElementById('detailsModal').addEventListener('click', (e) => {
      if (e.target.id === 'detailsModal') this.closeModal();
    });
  }

  setDefaultDate() {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    document.getElementById('dateInput').value = dateString;
    this.currentDate = today;
    this.updateDateInfo();
  }

  updateDateInfo() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = this.currentDate.toLocaleDateString('th-TH', options);
    document.getElementById('dateInfo').textContent = dateStr;
  }

  handleDateChange(e) {
    const date = new Date(e.target.value);
    this.currentDate = date;
    this.updateDateInfo();
    this.loadDeliveries();
    this.updateUI();
  }

  handleSearch(e) {
    const query = e.target.value.toLowerCase();
    this.filteredDeliveries = this.allDeliveries.filter((delivery) => {
      const customer = delivery.customer.toLowerCase();
      const destination = delivery.destination.toLowerCase();
      return customer.includes(query) || destination.includes(query);
    });
    this.applyFilters();
  }

  handleFilter() {
    this.applyFilters();
  }

  applyFilters() {
    const statusFilter = document.getElementById('statusFilter').value;
    const truckFilter = document.getElementById('truckFilter').value;

    this.filteredDeliveries = this.allDeliveries.filter((delivery) => {
      const matchStatus = !statusFilter || delivery.status === statusFilter;
      const matchTruck = !truckFilter || delivery.truck === truckFilter;
      return matchStatus && matchTruck;
    });

    // Also filter by search if active
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    if (searchQuery) {
      this.filteredDeliveries = this.filteredDeliveries.filter((delivery) => {
        return (
          delivery.customer.toLowerCase().includes(searchQuery) ||
          delivery.destination.toLowerCase().includes(searchQuery)
        );
      });
    }

    this.renderTable();
    this.updateStats();
  }

  loadDeliveries() {
    const day = this.currentDate.getDate();
    const pool = [
      ['บจก. เอก-ชัย', 'วังน้อย', '10W'],
      ['บจก. บิ๊กซี', 'สุวรรณภูมิ', '4 ล้อ'],
      ['บจก. เทสโก้', 'RDC บางนา', '6W'],
      ['บมจ. แม็คโคร', 'มีนบุรี', '10W'],
      ['บจก. ไทยเบฟ', 'วังน้อย', '4W'],
      ['บจก. โฮมโปร', 'สุวรรณภูมิ', '6W'],
      ['บจก. ดูโฮม', 'สระบุรี', '10W'],
      ['บจก. เซ็นทรัล', 'RDC บางนา', '4W'],
      ['บจก. ซีพี', 'บ้านชุม', '6W'],
      ['บจก. ออกซี่', 'ลาดกระบัง', '10W'],
    ];

    const isPast = day < 8;
    this.allDeliveries = [];

    for (let i = 0; i < pool.length; i++) {
      const customer = pool[(i + day) % pool.length];
      const startTime = 8 * 60 + i * 45;
      const endTime = startTime + 30;

      this.allDeliveries.push({
        id: i + 1,
        number: i + 1,
        customer: customer[0],
        destination: customer[1],
        truck: customer[2],
        timeWindow: `${this.formatTime(startTime)}–${this.formatTime(endTime)}`,
        status: isPast ? 'completed' : i < 3 ? 'in-progress' : 'scheduled',
      });
    }

    this.filteredDeliveries = [...this.allDeliveries];
  }

  formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  renderTable() {
    const tbody = document.getElementById('deliveriesBody');
    const emptyState = document.getElementById('emptyState');

    if (this.filteredDeliveries.length === 0) {
      tbody.innerHTML = '<tr class="no-data"><td colspan="7">No deliveries found</td></tr>';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';
    tbody.innerHTML = this.filteredDeliveries
      .map((delivery) => this.createTableRow(delivery))
      .join('');

    // Add click handlers to view buttons
    tbody.querySelectorAll('.btn-view').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = parseInt(btn.dataset.id);
        const delivery = this.allDeliveries.find((d) => d.id === id);
        this.showDeliveryDetails(delivery);
      });
    });
  }

  createTableRow(delivery) {
    const statusClass = delivery.status.replace('-', '-');
    const statusEmoji = {
      scheduled: '📋',
      'in-progress': '🚚',
      completed: '✅',
    };

    return `
      <tr>
        <td class="col-no">${delivery.number}</td>
        <td class="col-time">${delivery.timeWindow}</td>
        <td class="col-customer">${delivery.customer}</td>
        <td class="col-dest">${delivery.destination}</td>
        <td class="col-truck">${delivery.truck}</td>
        <td class="col-status">
          <span class="status-badge ${delivery.status}">
            ${statusEmoji[delivery.status]} ${this.statusLabel(delivery.status)}
          </span>
        </td>
        <td class="col-actions">
          <button class="btn btn-small btn-primary btn-view" data-id="${delivery.id}" title="View Details">
            👁️
          </button>
        </td>
      </tr>
    `;
  }

  statusLabel(status) {
    const labels = {
      scheduled: 'Scheduled',
      'in-progress': 'In Progress',
      completed: 'Completed',
    };
    return labels[status] || status;
  }

  updateStats() {
    const total = this.allDeliveries.length;
    const completed = this.allDeliveries.filter((d) => d.status === 'completed').length;
    const inProgress = this.allDeliveries.filter((d) => d.status === 'in-progress').length;
    const scheduled = this.allDeliveries.filter((d) => d.status === 'scheduled').length;

    document.getElementById('totalDeliveries').textContent = total;
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('inProgressCount').textContent = inProgress;
    document.getElementById('scheduledCount').textContent = scheduled;
  }

  showDeliveryDetails(delivery) {
    this.selectedDelivery = delivery;
    const modal = document.getElementById('detailsModal');
    const modalBody = document.getElementById('modalBody');

    const statusEmoji = {
      scheduled: '📋 Scheduled',
      'in-progress': '🚚 In Progress',
      completed: '✅ Completed',
    };

    modalBody.innerHTML = `
      <div class="detail-row">
        <span class="detail-label">Delivery #</span>
        <span class="detail-value">${delivery.number}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Customer</span>
        <span class="detail-value">${delivery.customer}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Destination</span>
        <span class="detail-value">${delivery.destination}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Time Window</span>
        <span class="detail-value">${delivery.timeWindow}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Truck Type</span>
        <span class="detail-value">${delivery.truck}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status</span>
        <span class="detail-value">${statusEmoji[delivery.status]}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date</span>
        <span class="detail-value">${this.currentDate.toLocaleDateString('th-TH')}</span>
      </div>
    `;

    const updateBtn = document.getElementById('updateStatusBtn');
    updateBtn.onclick = () => this.showStatusUpdate();

    modal.classList.add('active');
  }

  showStatusUpdate() {
    if (!this.selectedDelivery) return;

    const delivery = this.selectedDelivery;
    const statuses = ['scheduled', 'in-progress', 'completed'];
    const currentIndex = statuses.indexOf(delivery.status);
    const nextIndex = (currentIndex + 1) % statuses.length;

    delivery.status = statuses[nextIndex];

    // Update in filtered list
    const filtered = this.filteredDeliveries.find((d) => d.id === delivery.id);
    if (filtered) filtered.status = delivery.status;

    this.renderTable();
    this.updateStats();
    this.showDeliveryDetails(delivery);
  }

  closeModal() {
    const modal = document.getElementById('detailsModal');
    modal.classList.remove('active');
  }

  exportToCSV() {
    const deliveries = this.filteredDeliveries.length > 0 ? this.filteredDeliveries : this.allDeliveries;

    if (deliveries.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['#', 'Time Window', 'Customer', 'Destination', 'Truck', 'Status', 'Date'];
    const rows = deliveries.map((d) => [
      d.number,
      d.timeWindow,
      d.customer,
      d.destination,
      d.truck,
      this.statusLabel(d.status),
      this.currentDate.toLocaleDateString('th-TH'),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) => {
            if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const fileName = `deliveries_${this.currentDate.toISOString().split('T')[0]}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  updateUI() {
    this.renderTable();
    this.updateStats();
  }
}

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
  new DeliveryApp();
});
