// Tuyến đường - JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // Initialize the application
    initNavigation();
    initCheckbox();
    initButtons();
    initStops();
    initCoordinatorTable();
    initCollapsible();
});

// Collapsible functionality
function initCollapsible() {
    const mapToggle = document.getElementById('mapToggle');
    const mapContent = document.getElementById('mapContent');

    if (mapToggle && mapContent) {
        mapToggle.addEventListener('click', function () {
            // Toggle collapsed state
            this.classList.toggle('collapsed');
            mapContent.classList.toggle('collapsed');
        });
    }
}

// Navigation functionality
function initNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');

    navTabs.forEach(tab => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();

            // Remove active class from all tabs
            navTabs.forEach(t => t.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');
        });
    });
}

// Checkbox functionality
function initCheckbox() {
    const checkboxes = document.querySelectorAll('.checkbox-container input');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            console.log('Chính thức:', this.checked);
        });
    });
}

// Button click handlers
function initButtons() {
    // Add coordinator button
    const addCoordinatorBtn = document.querySelector('.btn-add-coordinator');
    if (addCoordinatorBtn) {
        addCoordinatorBtn.addEventListener('click', function () {
            showAddCoordinatorModal();
        });
    }

    // Back button
    const backBtn = document.querySelector('.btn-secondary');
    if (backBtn) {
        backBtn.addEventListener('click', function () {
            console.log('Quay lại');
            // window.history.back();
        });
    }

    // Update button
    const updateBtn = document.querySelector('.btn-primary');
    if (updateBtn) {
        updateBtn.addEventListener('click', function () {
            saveRouteData();
        });
    }
}

// Stops management with drag-and-drop
function initStops() {
    // Store stops data
    window.stopsData = [
        { id: 1, address: '40 Tô Ký, phường 11, TpHCM', distance: '2.5 km' },
        { id: 2, address: '60 Tô Ký, phường 11, TpHCM', distance: '3.7 km' },
        { id: 3, address: '90 Tô Ký, phường 11, TpHCM', distance: '5.8 km' }
    ];

    // Initialize drag and drop
    initDragAndDrop();

    // Initialize stop action buttons
    initStopActions();

    // Initialize add stop button
    const addStopBtn = document.querySelector('.btn-add-stop');
    if (addStopBtn) {
        addStopBtn.addEventListener('click', function () {
            showCreateStopModal();
        });
    }

    // Initialize optimize button
    const optimizeBtn = document.querySelector('.btn-optimize');
    if (optimizeBtn) {
        optimizeBtn.addEventListener('click', function () {
            optimizeRoute();
        });
    }
}

// Drag and Drop functionality
function initDragAndDrop() {
    const timeline = document.querySelector('.stops-timeline');
    if (!timeline) return;

    const stopItems = timeline.querySelectorAll('.stop-item');

    stopItems.forEach(item => {
        // Drag start
        item.addEventListener('dragstart', function (e) {
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', '');
        });

        // Drag end
        item.addEventListener('dragend', function () {
            this.classList.remove('dragging');
            updateStopNumbers();
        });

        // Drag over
        item.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            const dragging = document.querySelector('.dragging');
            if (dragging && dragging !== this) {
                const rect = this.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;

                if (e.clientY < midY) {
                    timeline.insertBefore(dragging, this);
                } else {
                    // Find next stop-item (skip distance badges)
                    let nextElement = this.nextElementSibling;
                    while (nextElement && !nextElement.classList.contains('stop-item')) {
                        nextElement = nextElement.nextElementSibling;
                    }
                    if (nextElement) {
                        timeline.insertBefore(dragging, nextElement);
                    } else {
                        // Insert at the end but before distance badges
                        const lastStopItem = timeline.querySelector('.stop-item:last-of-type');
                        if (lastStopItem) {
                            lastStopItem.after(dragging);
                        }
                    }
                }
            }
        });
    });
}

// Initialize stop action buttons
function initStopActions() {
    const editBtns = document.querySelectorAll('.stop-action-btn.edit');
    const deleteBtns = document.querySelectorAll('.stop-action-btn.delete');

    editBtns.forEach((btn, index) => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const stopItem = this.closest('.stop-item');
            const address = stopItem.querySelector('.stop-address').textContent;
            editStop(stopItem, address);
        });
    });

    deleteBtns.forEach((btn, index) => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const stopItem = this.closest('.stop-item');
            const address = stopItem.querySelector('.stop-address').textContent;
            deleteStop(stopItem, address);
        });
    });
}

// Update stop numbers after reordering
function updateStopNumbers() {
    const timeline = document.querySelector('.stops-timeline');
    if (!timeline) return;

    const stopItems = timeline.querySelectorAll('.stop-item');
    const totalStops = stopItems.length;

    stopItems.forEach((item, index) => {
        const numberEl = item.querySelector('.stop-number');
        if (numberEl) {
            numberEl.textContent = index + 1;
        }

        // Update marker style for last item
        const marker = item.querySelector('.stop-marker');
        if (marker) {
            marker.classList.remove('last');
            if (index === totalStops - 1) {
                marker.classList.add('last');
            }
        }

        // Remove last-stop class and add to the actual last one
        item.classList.remove('last-stop');
        if (index === totalStops - 1) {
            item.classList.add('last-stop');
        }
    });

    // Update summary
    updateStopsSummary(totalStops);
}

// Update stops summary info
function updateStopsSummary(count) {
    const countElements = document.querySelectorAll('.stops-count, .summary-item strong');
    if (countElements[0]) {
        countElements[0].textContent = count + ' điểm';
    }

    const summaryItems = document.querySelectorAll('.summary-item');
    if (summaryItems[0]) {
        const strongEl = summaryItems[0].querySelector('strong');
        if (strongEl) {
            strongEl.textContent = count + ' điểm dừng';
        }
    }
}

// Edit a stop
function editStop(stopItem, currentAddress) {
    const newAddress = prompt('Sửa địa chỉ điểm dừng:', currentAddress);

    if (newAddress && newAddress.trim() && newAddress !== currentAddress) {
        const addressEl = stopItem.querySelector('.stop-address');
        if (addressEl) {
            addressEl.textContent = newAddress.trim();
        }
        console.log('Đã cập nhật điểm dừng:', currentAddress, '->', newAddress);
    }
}

// Delete a stop
function deleteStop(stopItem, address) {
    if (confirm(`Bạn có chắc muốn xóa điểm dừng "${address}"?`)) {
        // Find and remove the distance badge before this stop (if exists)
        const prevElement = stopItem.previousElementSibling;
        if (prevElement && prevElement.classList.contains('distance-badge')) {
            prevElement.remove();
        }

        stopItem.remove();
        updateStopNumbers();
        console.log('Đã xóa điểm dừng:', address);
    }
}

// Optimize route
function optimizeRoute() {
    // Simulate route optimization
    const btn = document.querySelector('.btn-optimize');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
                <circle cx="12" cy="12" r="10"></circle>
            </svg>
            Đang tối ưu...
        `;

        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                Tối ưu lộ trình
            `;
            alert('Đã tối ưu hóa thứ tự các điểm dừng!');
        }, 1500);
    }
}

function showCreateStopModal() {
    const address = prompt('Nhập địa chỉ điểm dừng mới:');

    if (address && address.trim()) {
        addNewStop(address.trim());
    }
}

function addNewStop(address) {
    const timeline = document.querySelector('.stops-timeline');
    if (!timeline) return;

    const stopItems = timeline.querySelectorAll('.stop-item');
    const newId = stopItems.length + 1;

    // Add to data
    window.stopsData.push({ id: newId, address: address, distance: 'N/A' });

    // Create new stop element
    const stopItem = document.createElement('div');
    stopItem.className = 'stop-item';
    stopItem.draggable = true;
    stopItem.innerHTML = `
        <div class="stop-drag-handle" title="Kéo để sắp xếp">
            <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="9" cy="6" r="1.5"></circle>
                <circle cx="15" cy="6" r="1.5"></circle>
                <circle cx="9" cy="12" r="1.5"></circle>
                <circle cx="15" cy="12" r="1.5"></circle>
                <circle cx="9" cy="18" r="1.5"></circle>
                <circle cx="15" cy="18" r="1.5"></circle>
            </svg>
        </div>
        <div class="stop-marker">
            <div class="stop-number">${newId}</div>
            <div class="stop-connector"></div>
        </div>
        <div class="stop-content">
            <div class="stop-address">${address}</div>
            <div class="stop-meta">
                <span class="stop-distance">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                    Đang tính...
                </span>
            </div>
        </div>
        <div class="stop-actions">
            <button class="stop-action-btn edit" title="Chỉnh sửa">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            </button>
            <button class="stop-action-btn delete" title="Xóa">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
    `;

    // Add distance badge before the new stop
    const distanceBadge = document.createElement('div');
    distanceBadge.className = 'distance-badge';
    distanceBadge.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span>~? phút • ? km</span>
    `;

    timeline.appendChild(distanceBadge);
    timeline.appendChild(stopItem);

    // Add event listeners to new element
    stopItem.addEventListener('dragstart', function (e) {
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    });

    stopItem.addEventListener('dragend', function () {
        this.classList.remove('dragging');
        updateStopNumbers();
    });

    stopItem.addEventListener('dragover', function (e) {
        e.preventDefault();
        const dragging = document.querySelector('.dragging');
        if (dragging && dragging !== this) {
            const rect = this.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            if (e.clientY < midY) {
                timeline.insertBefore(dragging, this);
            }
        }
    });

    const editBtn = stopItem.querySelector('.stop-action-btn.edit');
    const deleteBtn = stopItem.querySelector('.stop-action-btn.delete');

    editBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        editStop(stopItem, address);
    });

    deleteBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        deleteStop(stopItem, address);
    });

    updateStopNumbers();
    console.log('Đã thêm điểm dừng:', address);
}

// Coordinator table management
function initCoordinatorTable() {
    // Initialize edit and delete buttons
    const editBtns = document.querySelectorAll('.edit-btn');
    const deleteBtns = document.querySelectorAll('.delete-btn');

    editBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const row = this.closest('tr');
            const name = row.cells[0].textContent;
            editCoordinator(name);
        });
    });

    deleteBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const row = this.closest('tr');
            const name = row.cells[0].textContent;
            deleteCoordinator(row, name);
        });
    });
}

function showAddCoordinatorModal() {
    const name = prompt('Nhập họ tên điều phối viên:');

    if (name && name.trim()) {
        const email = prompt('Nhập email điều phối viên:');

        if (email && email.trim()) {
            addNewCoordinator(name.trim(), email.trim());
        }
    }
}

function addNewCoordinator(name, email) {
    const tableBody = document.querySelector('.coordinator-table tbody');

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${name}</td>
        <td>${email}</td>
        <td class="action-cell">
            <button class="action-btn edit-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            </button>
            <button class="action-btn delete-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </td>
    `;

    tableBody.appendChild(newRow);

    // Add event listeners to new buttons
    const editBtn = newRow.querySelector('.edit-btn');
    const deleteBtn = newRow.querySelector('.delete-btn');

    editBtn.addEventListener('click', function () {
        editCoordinator(name);
    });

    deleteBtn.addEventListener('click', function () {
        deleteCoordinator(newRow, name);
    });

    console.log('Đã thêm điều phối viên:', name, email);
}

function editCoordinator(name) {
    const newName = prompt('Sửa họ tên điều phối viên:', name);

    if (newName && newName.trim() && newName !== name) {
        console.log('Đã cập nhật điều phối viên:', name, '->', newName);
        // Update the name in the table
        const rows = document.querySelectorAll('.coordinator-table tbody tr');
        rows.forEach(row => {
            if (row.cells[0].textContent === name) {
                row.cells[0].textContent = newName;
            }
        });
    }
}

function deleteCoordinator(row, name) {
    if (confirm(`Bạn có chắc muốn xóa điều phối viên "${name}"?`)) {
        row.remove();
        console.log('Đã xóa điều phối viên:', name);
    }
}

// Save route data
function saveRouteData() {
    const routeData = {
        projectName: 'Giao hàng miền Nam',
        routeName: 'Tuyến TpHCM',
        routeCode: '12391',
        distance: 160,
        description: '',
        pickupPoint: '1 Nguyễn Văn Khối, phường 12, TpHCM',
        deliveryPoint: '19 Huỳnh Thị Hai, phường 11, TpHCM',
        isOfficial: document.querySelector('.checkbox-container input').checked,
        stops: window.stopsData
    };

    console.log('Lưu dữ liệu tuyến đường:', routeData);
    alert('Đã cập nhật tuyến đường thành công!');
}
