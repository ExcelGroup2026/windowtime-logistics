// ============================================
// Queue Input Injector - Inject form into bundled app
// ============================================

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('📋 Queue Injector: Initializing...');

  // Create queue input container
  const container = document.createElement('div');
  container.id = 'queue-injector-container';
  container.style.cssText = `
    max-width: 900px;
    margin: 0 auto 30px;
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  `;

  // Queue input form HTML
  container.innerHTML = `
    <h2 style="color: #333; margin-bottom: 20px; font-size: 20px;">📝 บันทึก Queue Data</h2>

    <form id="injected-queueForm" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <div style="display: flex; flex-direction: column;">
        <label style="font-weight: 600; margin-bottom: 8px; color: #333; font-size: 14px;">
          Date <span style="color: red;">*</span>
        </label>
        <input type="date" id="injected-date" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;" required>
      </div>

      <div style="display: flex; flex-direction: column;">
        <label style="font-weight: 600; margin-bottom: 8px; color: #333; font-size: 14px;">
          Queue No. (Q) <span style="color: red;">*</span>
        </label>
        <input type="text" id="injected-queueNo" placeholder="Q001" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;" required>
      </div>

      <div style="display: flex; flex-direction: column;">
        <label style="font-weight: 600; margin-bottom: 8px; color: #333; font-size: 14px;">
          Customer PO No. <span style="color: red;">*</span>
        </label>
        <input type="text" id="injected-poNo" placeholder="PO-2026-001" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;" required>
      </div>

      <div style="display: flex; flex-direction: column;">
        <label style="font-weight: 600; margin-bottom: 8px; color: #333; font-size: 14px;">
          Destination <span style="color: red;">*</span>
        </label>
        <input type="text" id="injected-destination" placeholder="Location" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;" required>
      </div>

      <div style="display: flex; flex-direction: column; grid-column: 1 / -1;">
        <label style="font-weight: 600; margin-bottom: 8px; color: #333; font-size: 14px;">
          Description <span style="color: red;">*</span>
        </label>
        <textarea id="injected-description" placeholder="Describe" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; min-height: 80px; font-family: inherit;" required></textarea>
      </div>

      <div style="display: flex; flex-direction: column;">
        <label style="font-weight: 600; margin-bottom: 8px; color: #333; font-size: 14px;">
          Qty <span style="color: red;">*</span>
        </label>
        <input type="number" id="injected-qty" placeholder="0" min="0" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;" required>
      </div>

      <div style="display: flex; flex-direction: column;">
        <label style="font-weight: 600; margin-bottom: 8px; color: #333; font-size: 14px;">
          Fleet Type <span style="color: red;">*</span>
        </label>
        <select id="injected-fleetType" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;" required>
          <option value="">-- Select --</option>
          <option value="Own Fleet">Own Fleet</option>
          <option value="Subcontractor">Subcontractor</option>
        </select>
      </div>

      <div style="display: flex; flex-direction: column;">
        <label style="font-weight: 600; margin-bottom: 8px; color: #333; font-size: 14px;">
          Subcontractor Company <span style="color: red;">*</span>
        </label>
        <input type="text" id="injected-subcompany" placeholder="Company" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;" required>
      </div>

      <div style="display: flex; flex-direction: column;">
        <label style="font-weight: 600; margin-bottom: 8px; color: #333; font-size: 14px;">
          Truck Plate No. <span style="color: red;">*</span>
        </label>
        <input type="text" id="injected-truckPlate" placeholder="ABC-1234" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;" required>
      </div>

      <div style="display: flex; flex-direction: column;">
        <label style="font-weight: 600; margin-bottom: 8px; color: #333; font-size: 14px;">
          Driver Name <span style="color: red;">*</span>
        </label>
        <input type="text" id="injected-driverName" placeholder="Name" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;" required>
      </div>

      <div style="display: flex; flex-direction: column;">
        <label style="font-weight: 600; margin-bottom: 8px; color: #333; font-size: 14px;">
          Truck Type <span style="color: red;">*</span>
        </label>
        <select id="injected-truckType" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;" required>
          <option value="">-- Select --</option>
          <option value="4W">4W</option>
          <option value="6W">6W</option>
          <option value="10W">10W</option>
        </select>
      </div>

      <div style="display: flex; flex-direction: column;">
        <label style="font-weight: 600; margin-bottom: 8px; color: #333; font-size: 14px;">
          Window Start <span style="color: red;">*</span>
        </label>
        <input type="time" id="injected-windowStart" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;" required>
      </div>

      <div style="display: flex; flex-direction: column;">
        <label style="font-weight: 600; margin-bottom: 8px; color: #333; font-size: 14px;">
          Window End <span style="color: red;">*</span>
        </label>
        <input type="time" id="injected-windowEnd" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;" required>
      </div>

      <div style="display: flex; flex-direction: column;">
        <label style="font-weight: 600; margin-bottom: 8px; color: #333; font-size: 14px;">
          Dock No. <span style="color: red;">*</span>
        </label>
        <input type="text" id="injected-dockNo" placeholder="Dock-01" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;" required>
      </div>

      <div style="display: flex; flex-direction: column;">
        <label style="font-weight: 600; margin-bottom: 8px; color: #333; font-size: 14px;">
          Status <span style="color: red;">*</span>
        </label>
        <select id="injected-status" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;" required>
          <option value="">-- Select --</option>
          <option value="Scheduled">Scheduled</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div style="display: flex; flex-direction: column; grid-column: 1 / -1;">
        <label style="font-weight: 600; margin-bottom: 8px; color: #333; font-size: 14px;">
          Cancel Reason <span style="color: red;">*</span>
        </label>
        <textarea id="injected-cancelReason" placeholder="Reason" style="padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; min-height: 60px; font-family: inherit;" required></textarea>
      </div>

      <div style="display: flex; gap: 10px; justify-content: center; grid-column: 1 / -1; margin-top: 20px;">
        <button type="submit" style="padding: 12px 30px; background: #2f7cf6; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
          💾 Save Queue
        </button>
        <button type="reset" style="padding: 12px 30px; background: #e0e0e0; color: #333; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
          Clear
        </button>
      </div>

      <div id="injected-statusMessage" style="grid-column: 1 / -1; margin-top: 20px; padding: 15px; border-radius: 4px; text-align: center; font-weight: 600; display: none;"></div>
    </form>
  `;

  // Try to inject at the beginning of main content area
  const mainContent = document.querySelector('[role="main"]') ||
                      document.querySelector('main') ||
                      document.querySelector('.main-content') ||
                      document.body;

  if (mainContent && mainContent.firstChild) {
    mainContent.insertBefore(container, mainContent.firstChild);
  } else {
    document.body.insertBefore(container, document.body.firstChild);
  }

  console.log('✅ Queue form injected');

  // Set today's date
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('injected-date').value = today;

  // Handle form submission
  document.getElementById('injected-queueForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const statusMsg = document.getElementById('injected-statusMessage');
    statusMsg.style.display = 'block';
    statusMsg.style.background = '#cce5ff';
    statusMsg.style.color = '#004085';
    statusMsg.textContent = '⏳ Saving...';

    try {
      const formData = {
        'Date': document.getElementById('injected-date').value,
        'Queue No. (Q)': document.getElementById('injected-queueNo').value,
        'Customer PO No.': document.getElementById('injected-poNo').value,
        'Ship To Name / Destination': document.getElementById('injected-destination').value,
        'Description': document.getElementById('injected-description').value,
        'Qty': document.getElementById('injected-qty').value,
        'Fleet Type (Own Fleet/Subcontractor)': document.getElementById('injected-fleetType').value,
        'Subcontractor Company': document.getElementById('injected-subcompany').value,
        'Truck Plate No.': document.getElementById('injected-truckPlate').value,
        'Driver Name': document.getElementById('injected-driverName').value,
        'Truck Type (4W/6W/10W)': document.getElementById('injected-truckType').value,
        'Window Start': document.getElementById('injected-windowStart').value,
        'Window End': document.getElementById('injected-windowEnd').value,
        'Dock No.': document.getElementById('injected-dockNo').value,
        'Status': document.getElementById('injected-status').value,
        'Cancel Reason': document.getElementById('injected-cancelReason').value
      };

      console.log('📤 Sending:', formData);

      if (window.sheetAPI) {
        const result = await window.sheetAPI.saveSheet('Queues', [formData]);
        console.log('✅ Saved:', result);

        statusMsg.style.background = '#d4edda';
        statusMsg.style.color = '#155724';
        statusMsg.textContent = '✅ Saved successfully! Check Google Sheets.';

        document.getElementById('injected-queueForm').reset();
        document.getElementById('injected-date').value = today;

        setTimeout(() => {
          statusMsg.style.display = 'none';
        }, 5000);
      } else {
        throw new Error('sheetAPI not ready');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      statusMsg.style.background = '#f8d7da';
      statusMsg.style.color = '#721c24';
      statusMsg.textContent = `❌ Error: ${error.message}`;
    }
  });
});
