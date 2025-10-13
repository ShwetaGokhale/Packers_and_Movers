    document.addEventListener('DOMContentLoaded', function () {
        // --- Common UI Elements and Utilities ---
        const successPopup = document.getElementById('successPopup');
        const consignmentForm = document.getElementById('consignmentForm');
        const goodsInfoHiddenInput = document.getElementById('{{ form.goods_info.id_for_label }}');
        const totalFareHiddenInput = document.getElementById('{{ form.total_fare.id_for_label }}'); // NEW: Get the hidden total_fare input
        const cnidInputField = document.getElementById('id_cn_note_id');
        const truckFreightInput = document.getElementById('{{ form.Truck_Freight.id_for_label }}');
        let totalFareSummaryInput = document.getElementById('totalFareSummary'); // Retrieve at load time

        // Global arrays to hold fetched master data
        let goodsItemsData = [];
        let allConsignees = [];
        let allConsigners = [];
        let allVehicles = []; // Store all fetched vehicles
        let allLocations = []; // Store all fetched locations

        // Custom Confirmation Modal elements
        const confirmationModalOverlay = document.getElementById('confirmationModalOverlay');
        const confirmationMessage = document.getElementById('confirmationMessage');
        const confirmYesBtn = document.getElementById('confirmYesBtn');
        const confirmNoBtn = document.getElementById('confirmNoBtn');
        let confirmCallback = null;

        // Function to show custom confirmation modal
        function showConfirmationModal(message, callback) {
            confirmationMessage.textContent = message;
            confirmCallback = callback;
            confirmationModalOverlay.style.display = 'flex';
        }

        // Event listeners for custom confirmation modal buttons
        confirmYesBtn.addEventListener('click', () => {
            if (confirmCallback) {
                confirmCallback(true);
            }
            confirmationModalOverlay.style.display = 'none';
        });

        confirmNoBtn.addEventListener('click', () => {
            if (confirmCallback) {
                confirmCallback(false);
            }
            confirmationModalOverlay.style.display = 'none';
        });

        // Function to get CSRF token
        function getCookie(name) {
            let cookieValue = null;
            if (document.cookie && document.cookie !== '') {
                const cookies = document.cookie.split(';');
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i].trim();
                    if (cookie.substring(0, name.length + 1) === (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }
        const csrftoken = getCookie('csrftoken');

        // --- Show/Hide Success Popup ---
        function showSuccessPopup(message) {
            console.log("Success:", message);
            successPopup.textContent = message;
            successPopup.style.display = 'block'; // Make it visible
            successPopup.classList.add('show'); // Add 'show' class to trigger animation
            setTimeout(() => {
                successPopup.classList.remove('show'); // Remove 'show' class to trigger reverse animation
                setTimeout(() => {
                    successPopup.style.display = 'none'; // Hide it completely after animation
                }, 500); // This should match the transition duration
            }, 3000); // Display for 3 seconds
        }


        // --- Fetch and Display Next CNID (Remains for main form) ---
        async function fetchAndDisplayNextCNID() {
            try {
                const response = await fetch('/dapple/consignments/get_next_cnid/', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    if (cnidInputField) { // Added null check
                        cnidInputField.value = data.next_cn_id;
                    }
                } else {
                    console.error('Error fetching next CNID:', data.message || 'Unknown error');
                    if (cnidInputField) { // Added null check
                        cnidInputField.value = 'Error';
                    }
                }
            }
            catch (error) {
                console.error('Network error fetching next CNID:', error);
                if (cnidInputField) { // Added null check
                    cnidInputField.value = 'N/A';
                }
            }
        }

        // --- Reusable Searchable Dropdown Function ---
        function setupSearchableDropdown(
            searchInputId,
            hiddenInputId,
            dropdownListId,
            dropdownIconId,
            dataArray, // Array of objects, e.g., [{id: 1, name: 'Vehicle A'}, ...]
            displayKey, // Key for display text, e.g., 'vehicle_number', 'consignee_name'
            idKey // Key for ID, e.g., 'id'
        ) {
            const searchInput = document.getElementById(searchInputId);
            const hiddenInput = document.getElementById(hiddenInputId);
            const dropdownList = document.getElementById(dropdownListId);
            const dropdownIcon = document.getElementById(dropdownIconId);
            let currentFocusedItemIndex = -1; // Index of the currently focused item

            if (!searchInput || !hiddenInput || !dropdownList || !dropdownIcon) {
                console.warn(`Missing elements for searchable dropdown: ${searchInputId}`);
                return;
            }

            function renderFilteredList(searchTerm) {
                dropdownList.innerHTML = '';
                const ul = document.createElement('ul');

                const lowerCaseSearchTerm = searchTerm.toLowerCase();
                const filteredData = dataArray.filter(item =>
                    item[displayKey].toLowerCase().includes(lowerCaseSearchTerm)
                );

                if (filteredData.length === 0 && searchTerm !== '') {
                    const li = document.createElement('li');
                    li.textContent = `No matching ${displayKey.replace('_name', '').replace('_number', '').toLowerCase()} found.`;
                    li.style.color = '#777';
                    li.style.textAlign = 'center';
                    ul.appendChild(li);
                } else {
                    filteredData.forEach((item, index) => {
                        const li = document.createElement('li');
                        li.textContent = item[displayKey];
                        li.setAttribute('data-id', item[idKey]);
                        li.setAttribute('data-value', item[displayKey]);

                        li.addEventListener('click', function() {
                            selectItemFromDropdown(this.dataset.id, this.dataset.value);
                        });
                        ul.appendChild(li);
                    });
                }
                dropdownList.appendChild(ul);

                // Show or hide the dropdown based on results and search term
                if (filteredData.length > 0) { // Always show if there are results
                    dropdownList.style.display = 'block';
                    dropdownIcon.classList.add('open');
                } else if (searchTerm === '' && dataArray.length > 0 && searchInput === document.activeElement) {
                     // If empty search term and input is focused, show all initially
                     dropdownList.style.display = 'block';
                     dropdownIcon.classList.add('open');
                }
                else {
                    dropdownList.style.display = 'none';
                    dropdownIcon.classList.remove('open');
                }
                currentFocusedItemIndex = -1; // Reset focused item
            }

            function selectItemFromDropdown(id, value) {
                searchInput.value = value;
                hiddenInput.value = id;
                dropdownList.style.display = 'none';
                dropdownIcon.classList.remove('open');
                searchInput.focus(); // Keep focus on the input after selection
            }

            // Initial setup for existing value (e.g., on edit page load)
            const initialId = hiddenInput.value;
            if (initialId) {
                const preSelected = dataArray.find(item => item[idKey] == initialId);
                if (preSelected) {
                    searchInput.value = preSelected[displayKey];
                }
            }


            // Event Listeners for the custom search input
            searchInput.addEventListener('input', function() {
                renderFilteredList(this.value);
            });

            searchInput.addEventListener('focus', function() {
                renderFilteredList(this.value); // Show options on focus
            });

            // Handle dropdown icon click
            dropdownIcon.addEventListener('click', function() {
                if (dropdownList.style.display === 'block') {
                    dropdownList.style.display = 'none';
                    dropdownIcon.classList.remove('open');
                } else {
                    renderFilteredList(''); // Show all on icon click
                    searchInput.focus(); // Focus input when icon is clicked to open
                }
            });

            searchInput.addEventListener('blur', function() {
                setTimeout(() => {
                    // Only hide if the related target (where focus went) is not within the dropdown list
                    if (!dropdownList.contains(document.activeElement)) {
                        dropdownList.style.display = 'none';
                        dropdownIcon.classList.remove('open');
                        const selectedId = hiddenInput.value;
                        const enteredText = searchInput.value;
                        const foundMatch = dataArray.some(item => item[idKey] == selectedId && item[displayKey] === enteredText);
                        if (!foundMatch && enteredText !== '') {
                            // If text is present but doesn't perfectly match a known item, clear the hidden ID.
                            hiddenInput.value = '';
                        }
                    }
                }, 150); // Short delay
            });

            searchInput.addEventListener('keydown', function(e) {
                const items = Array.from(dropdownList.querySelectorAll('li'));
                if (items.length === 0) return;

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    currentFocusedItemIndex = (currentFocusedItemIndex + 1) % items.length;
                    items.forEach((item, idx) => {
                        item.classList.toggle('selected', idx === currentFocusedItemIndex);
                    });
                    items[currentFocusedItemIndex].scrollIntoView({ block: 'nearest' });
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    currentFocusedItemIndex = (currentFocusedItemIndex - 1 + items.length) % items.length;
                    items.forEach((item, idx) => {
                        item.classList.toggle('selected', idx === currentFocusedItemIndex);
                    });
                    items[currentFocusedItemIndex].scrollIntoView({ block: 'nearest' });
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (currentFocusedItemIndex > -1 && items[currentFocusedItemIndex]) {
                        items[currentFocusedItemIndex].click(); // Simulate a click on the selected item
                    } else if (items.length === 1 && this.value.toLowerCase() === items[0].textContent.toLowerCase()) {
                        items[0].click();
                    }
                }
            });

            // Handle clicks outside the dropdown to close it
            document.addEventListener('click', function(event) {
                const isClickInsideSearchWrapper = searchInput.closest('.custom-searchable-select-wrapper').contains(event.target);
                const isClickInsideDropdownList = dropdownList.contains(event.target);

                if (!isClickInsideSearchWrapper && !isClickInsideDropdownList) {
                    dropdownList.style.display = 'none';
                    dropdownIcon.classList.remove('open');
                    const selectedId = hiddenInput.value;
                    const enteredText = searchInput.value;
                    const foundMatch = dataArray.some(item => item[idKey] == selectedId && item[displayKey] === enteredText);
                    if (!foundMatch && enteredText !== '') {
                        hiddenInput.value = '';
                    }
                }
            });
            // Return the selection function for external use (e.g., from modal)
            return selectItemFromDropdown;
        }


        // --- Vehicle Management ---
        const addVehicleBtn = document.getElementById('addVehicleBtn');
        const vehicleModalOverlay = document.getElementById('vehicleModalOverlay');
        const closeVehicleModalBtn = document.getElementById('closeVehicleModalBtn');
        const addNewVehicleBtn = document.getElementById('addNewVehicleBtn');
        const newVehicleNoInput = document.getElementById('newVehicleNo');
        const newVehicleDateInput = document.getElementById('newVehicleDate');
        const vehicleTableBody = document.getElementById('vehicleTableBody');
        const vehicleSearchInput = document.getElementById('vehicleSearchInput');
        const vehicleIdHiddenInput = document.getElementById('{{ form.Vehicle_No.id_for_label }}');
        const vehicleDropdownList = document.getElementById('vehicleDropdownList');
        const vehicleDropdownIcon = document.getElementById('vehicleDropdownIcon');
        const vehicleLoadingIndicator = document.getElementById('vehicleLoading');
        const vehicleMessage = document.getElementById('vehicleMessage');

        let selectVehicleGlobal; // To store the returned selection function

        async function fetchAndRenderVehicles() {
            if (vehicleLoadingIndicator) vehicleLoadingIndicator.style.display = 'block';

            try {
                const response = await fetch('/dapple/vehicles/get/', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    allVehicles = data.vehicles; // Store all fetched vehicles
                    renderVehicles(allVehicles); // Render for modal table

                    // Setup searchable dropdown for main form
                    selectVehicleGlobal = setupSearchableDropdown(
                        'vehicleSearchInput',
                        '{{ form.Vehicle_No.id_for_label }}',
                        'vehicleDropdownList',
                        'vehicleDropdownIcon',
                        allVehicles,
                        'vehicle_number',
                        'id'
                    );
                } else {
                    const errorMessage = data.message || (data.errors ? JSON.stringify(data.errors) : 'Unknown error');
                    console.error('Error fetching vehicles:', data.errors || data.message);
                }
            }
            catch (error) {
                console.error('Network error fetching vehicles:', error);
            } finally {
                if (vehicleLoadingIndicator) vehicleLoadingIndicator.style.display = 'none';
            }
        }

        function renderVehicles(vehicles) {
            if (vehicleTableBody) vehicleTableBody.innerHTML = '';

            if (vehicles.length === 0) {
                if (vehicleTableBody) vehicleTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No vehicles added yet.</td></tr>';
            } else {
                let sNo = 1;
                vehicles.forEach(vehicle => {
                    const row = vehicleTableBody.insertRow();
                    row.insertCell(0).textContent = sNo++;
                    row.insertCell(1).textContent = vehicle.vehicle_number;
                    row.insertCell(2).textContent = vehicle.date_added;

                    const actionsCell = row.insertCell(3);
                    actionsCell.classList.add('actions');

                    const selectRowBtn = document.createElement('button');
                    selectRowBtn.innerHTML = '<i class="fa-solid fa-pencil"></i>';
                    selectRowBtn.classList.add('table-action-btn', 'select-btn');
                    selectRowBtn.title = `Select ${vehicle.vehicle_number}`;
                    selectRowBtn.setAttribute('data-vehicle-id', vehicle.id);
                    selectRowBtn.setAttribute('data-vehicle-number', vehicle.vehicle_number);
                    actionsCell.appendChild(selectRowBtn);

                    const deleteBtn = document.createElement('button');
                    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
                    deleteBtn.classList.add('table-action-btn', 'delete-btn');
                    deleteBtn.title = `Delete ${vehicle.vehicle_number}`;
                    deleteBtn.setAttribute('data-vehicle-id', vehicle.id);
                    actionsCell.appendChild(deleteBtn);
                });
                attachVehicleTableButtonListeners();
            }
        }

        function attachVehicleTableButtonListeners() {
            document.querySelectorAll('#vehicleTableBody .select-btn').forEach(button => {
                button.onclick = function () {
                    const selectedId = this.getAttribute('data-vehicle-id');
                    const selectedNum = this.getAttribute('data-vehicle-number');
                    if (selectVehicleGlobal) {
                        selectVehicleGlobal(selectedId, selectedNum); // Use the global selection function
                    }
                    if (vehicleModalOverlay) vehicleModalOverlay.style.display = 'none'; // Close modal
                };
            });

            document.querySelectorAll('#vehicleTableBody .delete-btn').forEach(button => {
                button.onclick = async function () {
                    const vehicleId = this.getAttribute('data-vehicle-id');
                    showConfirmationModal("Are you sure you want to delete this vehicle?", async (confirmed) => {
                        if (confirmed) {
                            console.log(`Attempting to delete vehicle ID: ${vehicleId}`);
                            await deleteVehicle(vehicleId);
                        }
                    });
                };
            });
        }

        async function addNewVehicle() {
            const vehicleNo = newVehicleNoInput ? newVehicleNoInput.value.trim() : '';
            const dateAdded = newVehicleDateInput ? newVehicleDateInput.value : '';

            if (!vehicleNo || !dateAdded) {
                console.error("Vehicle Number and Date are required.");
                showSuccessPopup("Error: Vehicle Number and Date are required.");
                return;
            }

            if (vehicleLoadingIndicator) vehicleLoadingIndicator.style.display = 'block';
            if (addNewVehicleBtn) addNewVehicleBtn.disabled = true;

            try {
                const payload = { vehicle_number: vehicleNo, date_added: dateAdded };
                console.log("Sending vehicle payload:", payload);
                const response = await fetch('/dapple/vehicles/add/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                    body: JSON.stringify(payload)
                });
                const data = await response.json();
                console.log("Received vehicle response:", data);

                if (response.ok && data.success) {
                    showSuccessPopup("Vehicle added successfully!");
                    if (newVehicleNoInput) newVehicleNoInput.value = '';
                    if (newVehicleDateInput) newVehicleDateInput.value = new Date().toISOString().slice(0, 10);
                    if (vehicleModalOverlay) vehicleModalOverlay.style.display = 'none';
                    await fetchAndRenderVehicles(); // Re-fetch all vehicles to update the autocomplete list
                    if (selectVehicleGlobal) {
                        selectVehicleGlobal(data.vehicle.id, data.vehicle.vehicle_number); // Select the newly added vehicle
                    }
                } else {
                    let errorDetail = 'Unknown error';
                    if (data.message) errorDetail = data.message;
                    else if (data.errors) {
                        try {
                            const errors = JSON.parse(data.errors);
                            let errorMessages = [];
                            for (const field in errors) {
                                errors[field].forEach(err => { errorMessages.push(`${field}: ${err.message || err.code}`); });
                            }
                            errorDetail = errorMessages.join('; ');
                        } catch (e) {
                            errorDetail = data.errors;
                        }
                    }
                    console.error('Error adding vehicle:', data.errors || data.message || data);
                    showSuccessPopup(`Error adding vehicle: ${errorDetail}`);
                }
            }
            catch (error) {
                console.error('Network error adding vehicle:', error);
                showSuccessPopup(`Network error adding vehicle: ${error.message}`);
            } finally {
                if (vehicleLoadingIndicator) vehicleLoadingIndicator.style.display = 'none';
                if (addNewVehicleBtn) addNewVehicleBtn.disabled = false;
            }
        }

        async function deleteVehicle(vehicleId) {
            if (vehicleLoadingIndicator) vehicleLoadingIndicator.style.display = 'block';

            try {
                const response = await fetch(`/dapple/vehicles/delete/${vehicleId}/`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    showSuccessPopup("Vehicle deleted successfully!");
                    await fetchAndRenderVehicles(); // Re-fetch and re-render all vehicles
                    if (vehicleIdHiddenInput.value == vehicleId) { // Check if the deleted vehicle was selected
                        vehicleSearchInput.value = '';
                        vehicleIdHiddenInput.value = ''; // Clear selection
                    }
                } else {
                    const errorMessage = data.message || (data.errors ? JSON.stringify(data.errors) : 'Unknown error');
                    console.error('Error deleting vehicle:', errorMessage);
                    showSuccessPopup(`Error deleting vehicle: ${errorMessage}`);
                }
            }
            catch (error) {
                console.error('Error deleting vehicle:', error);
                showSuccessPopup(`Network error deleting vehicle: ${error.message}`);
            } finally {
                if (vehicleLoadingIndicator) vehicleLoadingIndicator.style.display = 'none';
            }
        }


        // --- Consignee Management ---
        const addConsigneeBtn = document.getElementById('addConsigneeBtn');
        const consigneeModalOverlay = document.getElementById('consigneeModalOverlay');
        const closeConsigneeModalBtn = document.getElementById('closeConsigneeModalBtn');
        const addNewConsigneeBtn = document.getElementById('addNewConsigneeBtn');
        const newConsigneeNameInput = document.getElementById('newConsigneeName');
        const newConsigneeDateInput = document.getElementById('newConsigneeDate');
        const newConsigneeAddressInput = document.getElementById('newConsigneeAddress');
        const consigneeTableBody = document.getElementById('consigneeTableBody');
        const consigneeSearchInput = document.getElementById('consigneeSearchInput');
        const consigneeIdHiddenInput = document.getElementById('{{ form.consignee.id_for_label }}');
        const consigneeDropdownList = document.getElementById('consigneeDropdownList');
        const consigneeDropdownIcon = document.getElementById('consigneeDropdownIcon');
        const consigneeLoadingIndicator = document.getElementById('consigneeLoading');

        let selectConsigneeGlobal;

        async function fetchAndRenderConsignees() {
            if (consigneeLoadingIndicator) consigneeLoadingIndicator.style.display = 'block';

            try {
                const response = await fetch('/dapple/consignees/get/', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    allConsignees = data.consignees; // Store fetched data globally
                    renderConsignees(allConsignees); // Render for modal table

                    // Setup searchable dropdown for main form
                    selectConsigneeGlobal = setupSearchableDropdown(
                        'consigneeSearchInput',
                        '{{ form.consignee.id_for_label }}',
                        'consigneeDropdownList',
                        'consigneeDropdownIcon',
                        allConsignees,
                        'consignee_name',
                        'id'
                    );
                } else {
                    const errorMessage = data.message || (data.errors ? JSON.stringify(data.errors) : 'Unknown error');
                    console.error('Error fetching consignees:', data.errors || data.message);
                }
            }
            catch (error) {
                console.error('Network error fetching consignees:', error);
            } finally {
                if (consigneeLoadingIndicator) consigneeLoadingIndicator.style.display = 'none';
            }
        }

        function renderConsignees(consignees) {
            if (consigneeTableBody) consigneeTableBody.innerHTML = '';

            if (consignees.length === 0) {
                if (consigneeTableBody) consigneeTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No consignees added yet.</td></tr>';
            } else {
                let sNo = 1;
                consignees.forEach(consignee => {
                    const row = consigneeTableBody.insertRow();
                    row.insertCell(0).textContent = sNo++;
                    row.insertCell(1).textContent = consignee.consignee_name;
                    row.insertCell(2).textContent = consignee.date_added;
                    row.insertCell(3).textContent = consignee.consignee_address;

                    const actionsCell = row.insertCell(4);
                    actionsCell.classList.add('actions');

                    const selectRowBtn = document.createElement('button');
                    selectRowBtn.innerHTML = '<i class="fa-solid fa-pencil"></i>';
                    selectRowBtn.classList.add('table-action-btn', 'select-btn');
                    selectRowBtn.title = `Select ${consignee.consignee_name}`;
                    selectRowBtn.setAttribute('data-consignee-id', consignee.id);
                    selectRowBtn.setAttribute('data-consignee-name', consignee.consignee_name);
                    selectRowBtn.setAttribute('data-consignee-date', consignee.date_added);
                    selectRowBtn.setAttribute('data-consignee-address', consignee.consignee_address);
                    actionsCell.appendChild(selectRowBtn);

                    const deleteBtn = document.createElement('button');
                    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
                    deleteBtn.classList.add('table-action-btn', 'delete-btn');
                    deleteBtn.title = `Delete ${consignee.consignee_name}`;
                    deleteBtn.setAttribute('data-consignee-id', consignee.id);
                    actionsCell.appendChild(deleteBtn);
                });

                attachConsigneeTableButtonListeners();
            }
        }

        function attachConsigneeTableButtonListeners() {
            document.querySelectorAll('#consigneeTableBody .select-btn').forEach(button => {
                button.onclick = function () {
                    const selectedId = this.getAttribute('data-consignee-id');
                    const selectedName = this.getAttribute('data-consignee-name');
                    const selectedDate = this.getAttribute('data-consignee-date');
                    const selectedAddress = this.getAttribute('data-consignee-address');

                    if (newConsigneeNameInput) newConsigneeNameInput.value = selectedName;
                    if (newConsigneeDateInput) newConsigneeDateInput.value = selectedDate;
                    if (newConsigneeAddressInput) newConsigneeAddressInput.value = selectedAddress;
                    if (selectConsigneeGlobal) {
                        selectConsigneeGlobal(selectedId, selectedName); // Use the global selection function
                    }
                };
            });

            document.querySelectorAll('#consigneeTableBody .delete-btn').forEach(button => {
                button.onclick = async function () {
                    const consigneeId = this.getAttribute('data-consignee-id');
                    showConfirmationModal("Are you sure you want to delete this consignee?", async (confirmed) => {
                        if (confirmed) {
                            console.log(`Attempting to delete consignee ID: ${consigneeId}`);
                            await deleteConsignee(consigneeId);
                        }
                    });
                };
            });
        }

        async function addNewConsignee() {
            const consigneeName = newConsigneeNameInput ? newConsigneeNameInput.value.trim() : '';
            const dateAdded = newConsigneeDateInput ? newConsigneeDateInput.value : '';
            const consigneeAddress = newConsigneeAddressInput ? newConsigneeAddressInput.value.trim() : '';

            if (!consigneeName || !dateAdded || !consigneeAddress) {
                console.error("Consignee Name, Date, and Address are required.");
                showSuccessPopup("Error: Consignee Name, Date, and Address are required.");
                return;
            }

            if (consigneeLoadingIndicator) consigneeLoadingIndicator.style.display = 'block';
            if (addNewConsigneeBtn) addNewConsigneeBtn.disabled = true;

            try {
                const response = await fetch('/dapple/consignees/add/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                    body: JSON.stringify({ consignee_name: consigneeName, date_added: dateAdded, consignee_address: consigneeAddress })
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    showSuccessPopup("Consignee added successfully!");
                    if (newConsigneeNameInput) newConsigneeNameInput.value = '';
                    if (newConsigneeDateInput) newConsigneeDateInput.value = new Date().toISOString().slice(0, 10);
                    if (consigneeModalOverlay) consigneeModalOverlay.style.display = 'none';
                    if (newConsigneeAddressInput) newConsigneeAddressInput.value = '';
                    await fetchAndRenderConsignees();
                    if (selectConsigneeGlobal) {
                        selectConsigneeGlobal(data.consignee.id, data.consignee.consignee_name);
                    }
                } else {
                    let errorDetail = 'Unknown error';
                    if (data.message) errorDetail = data.message;
                    else if (data.errors) {
                        try {
                            const errors = JSON.parse(data.errors);
                            let errorMessages = [];
                            for (const field in errors) {
                                errors[field].forEach(err => { errorMessages.push(`${field}: ${err.message || err.code}`); });
                            }
                            errorDetail = errorMessages.join('; ');
                        } catch (e) {
                            errorDetail = data.errors;
                        }
                    }
                    console.error('Error adding consignee:', data.errors || data.message || data);
                    showSuccessPopup(`Error adding consignee: ${errorDetail}`);
                }
            }
            catch (error) {
                console.error('Error adding consignee:', error);
                showSuccessPopup(`Network error adding consignee: ${error.message}`);
            } finally {
                if (consigneeLoadingIndicator) consigneeLoadingIndicator.style.display = 'none';
                if (addNewConsigneeBtn) addNewConsigneeBtn.disabled = false;
            }
        }

        async function deleteConsignee(consigneeId) {
            if (consigneeLoadingIndicator) consigneeLoadingIndicator.style.display = 'block';

            try {
                const response = await fetch(`/dapple/consignees/delete/${consigneeId}/`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    showSuccessPopup("Consignee deleted successfully!");
                    fetchAndRenderConsignees();
                    if (consigneeIdHiddenInput.value == consigneeId) {
                        consigneeSearchInput.value = '';
                        consigneeIdHiddenInput.value = '';
                    }
                } else {
                    const errorMessage = data.message || (data.errors ? JSON.stringify(data.errors) : 'Unknown error');
                    console.error('Error deleting consignee:', errorMessage);
                    showSuccessPopup(`Error deleting consignee: ${errorMessage}`);
                }
            }
            catch (error) {
                console.error('Error deleting consignee:', error);
                showSuccessPopup(`Network error deleting consignee: ${error.message}`);
            } finally {
                if (consigneeLoadingIndicator) consigneeLoadingIndicator.style.display = 'none';
            }
        }


        // --- Consigner Management ---
        const addConsignerBtn = document.getElementById('addConsignerBtn');
        const consignerModalOverlay = document.getElementById('consignerModalOverlay');
        const closeConsignerModalBtn = document.getElementById('closeConsignerModalBtn');
        const addNewConsignerBtn = document.getElementById('addNewConsignerBtn');
        const newConsignerNameInput = document.getElementById('newConsignerName');
        const newConsignerDateInput = document.getElementById('newConsignerDate');
        const newConsignerAddressInput = document.getElementById('newConsignerAddress');
        const consignerTableBody = document.getElementById('consignerTableBody');
        const consignerSearchInput = document.getElementById('consignerSearchInput');
        const consignerIdHiddenInput = document.getElementById('{{ form.consigner.id_for_label }}');
        const consignerDropdownList = document.getElementById('consignerDropdownList');
        const consignerDropdownIcon = document.getElementById('consignerDropdownIcon');
        const consignerLoadingIndicator = document.getElementById('consignerLoading');

        let selectConsignerGlobal;

        async function fetchAndRenderConsigners() {
            if (consignerLoadingIndicator) consignerLoadingIndicator.style.display = 'block';

            try {
                const response = await fetch('/dapple/consigners/get/', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    allConsigners = data.consigners; // Store fetched data globally
                    renderConsigners(allConsigners); // Render for modal table

                    // Setup searchable dropdown for main form
                    selectConsignerGlobal = setupSearchableDropdown(
                        'consignerSearchInput',
                        '{{ form.consigner.id_for_label }}',
                        'consignerDropdownList',
                        'consignerDropdownIcon',
                        allConsigners,
                        'consigner_name',
                        'id'
                    );
                } else {
                    const errorMessage = data.message || (data.errors ? JSON.stringify(data.errors) : 'Unknown error');
                    console.error('Error fetching consigners:', data.errors || data.message);
                }
            }
            catch (error) {
                console.error('Network error fetching consigners:', error);
            } finally {
                if (consignerLoadingIndicator) consignerLoadingIndicator.style.display = 'none';
            }
        }

        function renderConsigners(consigners) {
            if (consignerTableBody) consignerTableBody.innerHTML = '';

            if (consigners.length === 0) {
                if (consignerTableBody) consignerTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No consigners added yet.</td></tr>';
            } else {
                let sNo = 1;
                consigners.forEach(consigner => {
                    const row = consignerTableBody.insertRow();
                    row.insertCell(0).textContent = sNo++;
                    row.insertCell(1).textContent = consigner.consigner_name;
                    row.insertCell(2).textContent = consigner.date_added;
                    row.insertCell(3).textContent = consigner.consigner_address;

                    const actionsCell = row.insertCell(4);
                    actionsCell.classList.add('actions');

                    const selectRowBtn = document.createElement('button');
                    selectRowBtn.innerHTML = '<i class="fa-solid fa-pencil"></i>';
                    selectRowBtn.classList.add('table-action-btn', 'select-btn');
                    selectRowBtn.title = `Select ${consigner.consigner_name}`;
                    selectRowBtn.setAttribute('data-consigner-id', consigner.id);
                    selectRowBtn.setAttribute('data-consigner-name', consigner.consigner_name);
                    selectRowBtn.setAttribute('data-consigner-date', consigner.date_added);
                    selectRowBtn.setAttribute('data-consigner-address', consigner.consigner_address);
                    actionsCell.appendChild(selectRowBtn);

                    const deleteBtn = document.createElement('button');
                    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
                    deleteBtn.classList.add('table-action-btn', 'delete-btn');
                    deleteBtn.title = `Delete ${consigner.consigner_name}`;
                    deleteBtn.setAttribute('data-consigner-id', consigner.id);
                    actionsCell.appendChild(deleteBtn);
                });

                attachConsignerTableButtonListeners();
            }
        }

        function attachConsignerTableButtonListeners() {
            document.querySelectorAll('#consignerTableBody .select-btn').forEach(button => {
                button.onclick = function () {
                    const selectedId = this.getAttribute('data-consigner-id');
                    const selectedName = this.getAttribute('data-consigner-name');
                    const selectedDate = this.getAttribute('data-consigner-date');
                    const selectedAddress = this.getAttribute('data-consigner-address');

                    if (newConsignerNameInput) newConsignerNameInput.value = selectedName;
                    if (newConsignerDateInput) newConsignerDateInput.value = selectedDate;
                    if (newConsignerAddressInput) newConsignerAddressInput.value = selectedAddress;
                    if (selectConsignerGlobal) {
                        selectConsignerGlobal(selectedId, selectedName);
                    }
                };
            });

            document.querySelectorAll('#consignerTableBody .delete-btn').forEach(button => {
                button.onclick = async function () {
                    const consignerId = this.getAttribute('data-consigner-id');
                    showConfirmationModal("Are you sure you want to delete this consigner?", async (confirmed) => {
                        if (confirmed) {
                            console.log(`Attempting to delete consigner ID: ${consignerId}`);
                            await deleteConsigner(consignerId);
                        }
                    });
                };
            });
        }

        async function addNewConsigner() {
            const consignerName = newConsignerNameInput ? newConsignerNameInput.value.trim() : '';
            const dateAdded = newConsignerDateInput ? newConsignerDateInput.value : '';
            const consignerAddress = newConsignerAddressInput ? newConsignerAddressInput.value.trim() : '';

            if (!consignerName || !dateAdded || !consignerAddress) {
                console.error("Consigner Name, Date, and Address are required.");
                showSuccessPopup("Error: Consigner Name, Date, and Address are required.");
                return;
            }

            if (consignerLoadingIndicator) consignerLoadingIndicator.style.display = 'block';
            if (addNewConsignerBtn) addNewConsignerBtn.disabled = true;

            try {
                const response = await fetch('/dapple/consigners/add/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                    body: JSON.stringify({ consigner_name: consignerName, date_added: dateAdded, consigner_address: consignerAddress })
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    showSuccessPopup("Consigner added successfully!");
                    if (newConsignerNameInput) newConsignerNameInput.value = '';
                    if (newConsignerDateInput) newConsignerDateInput.value = new Date().toISOString().slice(0, 10);
                    if (consignerModalOverlay) consignerModalOverlay.style.display = 'none';
                    if (newConsignerAddressInput) newConsignerAddressInput.value = '';
                    await fetchAndRenderConsigners();
                    if (selectConsignerGlobal) {
                        selectConsignerGlobal(data.consigner.id, data.consigner.consigner_name);
                    }
                } else {
                    let errorDetail = 'Unknown error';
                    if (data.message) errorDetail = data.message;
                    else if (data.errors) {
                        try {
                            const errors = JSON.parse(data.errors);
                            let errorMessages = [];
                            for (const field in errors) {
                                errors[field].forEach(err => { errorMessages.push(`${field}: ${err.message || err.code}`); });
                            }
                            errorDetail = errorMessages.join('; ');
                        } catch (e) {
                            errorDetail = data.errors;
                        }
                    }
                    console.error('Error adding consigner:', data.errors || data.message || data);
                    showSuccessPopup(`Error adding consigner: ${errorDetail}`);
                }
            }
            catch (error) {
                console.error('Error adding consigner:', error);
                showSuccessPopup(`Network error adding consigner: ${error.message}`);
            } finally {
                if (consignerLoadingIndicator) consignerLoadingIndicator.style.display = 'none';
                if (addNewConsignerBtn) addNewConsignerBtn.disabled = false;
            }
        }

        async function deleteConsigner(consignerId) {
            if (consignerLoadingIndicator) consignerLoadingIndicator.style.display = 'block';

            try {
                const response = await fetch(`/dapple/consigners/delete/${consignerId}/`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    showSuccessPopup("Consigner deleted successfully!");
                    fetchAndRenderConsigners();
                    if (consignerIdHiddenInput.value == consignerId) {
                        consignerSearchInput.value = '';
                        consignerIdHiddenInput.value = '';
                    }
                } else {
                    const errorMessage = data.message || (data.errors ? JSON.stringify(data.errors) : 'Unknown error');
                    console.error('Error deleting consigner:', errorMessage);
                    showSuccessPopup(`Error deleting consigner: ${errorMessage}`);
                }
            }
            catch (error) {
                console.error('Error deleting consigner:', error);
                showSuccessPopup(`Network error deleting consigner: ${error.message}`);
            } finally {
                if (consignerLoadingIndicator) consignerLoadingIndicator.style.display = 'none';
            }
        }


        // --- Location Management (NEW) ---
        const addFromLocationBtn = document.getElementById('addFromLocationBtn');
        const addToLocationBtn = document.getElementById('addToLocationBtn');
        const locationModalOverlay = document.getElementById('locationModalOverlay');
        const closeLocationModalBtn = document.getElementById('closeLocationModalBtn');
        const addNewLocationBtn = document.getElementById('addNewLocationBtn');
        const newLocationNameInput = document.getElementById('newLocationName');
        const newLocationDateInput = document.getElementById('newLocationDate');
        const locationTableBody = document.getElementById('locationTableBody');
        const fromLocationSearchInput = document.getElementById('fromLocationSearchInput');
        const fromLocationIdHiddenInput = document.getElementById('{{ form.from_location.id_for_label }}');
        const fromLocationDropdownList = document.getElementById('fromLocationDropdownList');
        const fromLocationDropdownIcon = document.getElementById('fromLocationDropdownIcon');
        const toLocationSearchInput = document.getElementById('toLocationSearchInput');
        const toLocationIdHiddenInput = document.getElementById('{{ form.To_Location.id_for_label }}');
        const toLocationDropdownList = document.getElementById('toLocationDropdownList');
        const toLocationDropdownIcon = document.getElementById('toLocationDropdownIcon');
        const locationLoadingIndicator = document.getElementById('locationLoading');

        let selectFromLocationGlobal;
        let selectToLocationGlobal;

        async function fetchAndRenderLocations() {
            if (locationLoadingIndicator) locationLoadingIndicator.style.display = 'block';

            try {
                const response = await fetch('/dapple/locations/get/', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    allLocations = data.locations; // Store fetched data globally
                    renderLocations(allLocations); // Render for modal table

                    // Setup searchable dropdown for main form's From Location
                    selectFromLocationGlobal = setupSearchableDropdown(
                        'fromLocationSearchInput',
                        '{{ form.from_location.id_for_label }}',
                        'fromLocationDropdownList',
                        'fromLocationDropdownIcon',
                        allLocations,
                        'location_name',
                        'id'
                    );
                    // Setup searchable dropdown for main form's To Location
                    selectToLocationGlobal = setupSearchableDropdown(
                        'toLocationSearchInput',
                        '{{ form.To_Location.id_for_label }}',
                        'toLocationDropdownList',
                        'toLocationDropdownIcon',
                        allLocations,
                        'location_name',
                        'id'
                    );

                } else {
                    const errorMessage = data.message || (data.errors ? JSON.stringify(data.errors) : 'Unknown error');
                    console.error('Error fetching locations:', data.errors || data.message);
                }
            }
            catch (error) {
                console.error('Network error fetching locations:', error);
            } finally {
                if (locationLoadingIndicator) locationLoadingIndicator.style.display = 'none';
            }
        }

        function renderLocations(locations) {
            if (locationTableBody) locationTableBody.innerHTML = '';

            if (locations.length === 0) {
                if (locationTableBody) locationTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No locations added yet.</td></tr>';
            } else {
                let sNo = 1;
                locations.forEach(location => {
                    const row = locationTableBody.insertRow();
                    row.insertCell(0).textContent = sNo++;
                    row.insertCell(1).textContent = location.location_name;
                    row.insertCell(2).textContent = location.date_added;

                    const actionsCell = row.insertCell(3);
                    actionsCell.classList.add('actions');

                    const selectRowBtn = document.createElement('button');
                    selectRowBtn.innerHTML = '<i class="fa-solid fa-pencil"></i>';
                    selectRowBtn.classList.add('table-action-btn', 'select-btn');
                    selectRowBtn.title = `Select ${location.location_name}`;
                    selectRowBtn.setAttribute('data-location-id', location.id);
                    selectRowBtn.setAttribute('data-location-name', location.location_name);
                    selectRowBtn.setAttribute('data-location-date', location.date_added);
                    actionsCell.appendChild(selectRowBtn);

                    const deleteBtn = document.createElement('button');
                    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
                    deleteBtn.classList.add('table-action-btn', 'delete-btn');
                    deleteBtn.title = `Delete ${location.location_name}`;
                    deleteBtn.setAttribute('data-location-id', location.id);
                    actionsCell.appendChild(deleteBtn);
                });
                attachLocationTableButtonListeners();
            }
        }

        function attachLocationTableButtonListeners() {
            document.querySelectorAll('#locationTableBody .select-btn').forEach(button => {
                button.onclick = function () {
                    const selectedId = this.getAttribute('data-location-id');
                    const selectedName = this.getAttribute('data-location-name');
                    const selectedDate = this.getAttribute('data-location-date');

                    if (newLocationNameInput) newLocationNameInput.value = selectedName;
                    if (newLocationDateInput) newLocationDateInput.value = selectedDate;
                    if (selectFromLocationGlobal) selectFromLocationGlobal(selectedId, selectedName);
                    if (selectToLocationGlobal) selectToLocationGlobal(selectedId, selectedName);
                };
            });

            document.querySelectorAll('#locationTableBody .delete-btn').forEach(button => {
                button.onclick = async function () {
                    const locationId = this.getAttribute('data-location-id');
                    showConfirmationModal("Are you sure you want to delete this location?", async (confirmed) => {
                        if (confirmed) {
                            console.log(`Attempting to delete location ID: ${locationId}`);
                            await deleteLocation(locationId);
                        }
                    });
                };
            });
        }

        async function addNewLocation() {
            const locationName = newLocationNameInput ? newLocationNameInput.value.trim() : '';
            const dateAdded = newLocationDateInput ? newLocationDateInput.value : '';

            if (!locationName || !dateAdded) {
                console.error("Location Name and Date are required.");
                showSuccessPopup("Error: Location Name and Date are required.");
                return;
            }

            if (locationLoadingIndicator) locationLoadingIndicator.style.display = 'block';
            if (addNewLocationBtn) addNewLocationBtn.disabled = true;

            try {
                const payload = { location_name: locationName, date_added: dateAdded };
                console.log("Sending location payload:", payload);
                const response = await fetch('/dapple/locations/add/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                    body: JSON.stringify(payload)
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    showSuccessPopup("Location added successfully!");
                    if (newLocationNameInput) newLocationNameInput.value = '';
                    if (newLocationDateInput) newLocationDateInput.value = new Date().toISOString().slice(0, 10);
                    if (locationModalOverlay) locationModalOverlay.style.display = 'none';
                    await fetchAndRenderLocations(); // Re-fetch to update allLocations and then re-init dropdowns
                    if (selectFromLocationGlobal) selectFromLocationGlobal(data.location.id, data.location.location_name);
                    if (selectToLocationGlobal) selectToLocationGlobal(data.location.id, data.location.location_name);
                } else {
                    let errorDetail = 'Unknown error';
                    if (data.message) errorDetail = data.message;
                    else if (data.errors) {
                        try {
                            const errors = JSON.parse(data.errors);
                            let errorMessages = [];
                            for (const field in errors) {
                                errors[field].forEach(err => { errorMessages.push(`${field}: ${err.message || err.code}`); });
                            }
                            errorDetail = errorMessages.join('; ');
                        } catch (e) {
                            errorDetail = data.errors;
                        }
                    }
                    console.error('Error adding location:', data.errors || data.message || data);
                    showSuccessPopup(`Error adding location: ${errorDetail}`);
                }
            }
            catch (error) {
                console.error('Network error adding location:', error);
                showSuccessPopup(`Network error adding location: ${error.message}`);
            } finally {
                if (locationLoadingIndicator) locationLoadingIndicator.style.display = 'none';
                if (addNewLocationBtn) addNewLocationBtn.disabled = false;
            }
        }

        async function deleteLocation(locationId) {
            if (locationLoadingIndicator) locationLoadingIndicator.style.display = 'block';

            try {
                const response = await fetch(`/dapple/locations/delete/${locationId}/`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    showSuccessPopup("Location deleted successfully!");
                    fetchAndRenderLocations();
                    if (fromLocationIdHiddenInput.value == locationId) {
                        fromLocationSearchInput.value = '';
                        fromLocationIdHiddenInput.value = '';
                    }
                    if (toLocationIdHiddenInput.value == locationId) {
                        toLocationSearchInput.value = '';
                        toLocationIdHiddenInput.value = '';
                    }
                } else {
                    const errorMessage = data.message || (data.errors ? JSON.stringify(data.errors) : 'Unknown error');
                    console.error('Error deleting location:', errorMessage);
                    showSuccessPopup(`Error deleting location: ${errorMessage}`);
                }
            }
            catch (error) {
                console.error('Error deleting location:', error);
                showSuccessPopup(`Network error deleting location: ${error.message}`);
            } finally {
                if (locationLoadingIndicator) locationLoadingIndicator.style.display = 'none';
            }
        }


        // --- Goods Information Table Management ---
        const goodsTableBody = document.getElementById('goodsTableBody');
        const addGoodsItemBtn = document.getElementById('addGoodsItemBtn');

        function renderGoodsItemsTable() {
            if (!goodsTableBody) return; // Ensure goodsTableBody exists

            goodsTableBody.innerHTML = '';

            // If no actual goods items exist, show an example row
            if (goodsItemsData.length === 0) {
                const row = goodsTableBody.insertRow();
                row.innerHTML = `
            <tr class="example-row" style="background-color: #fff3cd;">
                <td><input type="text" placeholder="Unit" disabled></td>
                <td><input type="number" placeholder="Quantity" disabled value="0"></td> <!-- Added default value -->
                <td><input type="number" placeholder="Rate" disabled value="0"></td>     <!-- Added default value -->
                <td><input type="number" placeholder="Amount" disabled value="0"></td>  <!-- Added default value -->
                <td><input type="text" placeholder="From Party" disabled></td>
                <td><input type="text" placeholder="To Party" disabled></td>
                <td style="text-align: center; color: #999;">Example</td>
            </tr>
        `;
                return; // Do not render other items or total row if no data
            }

            // Render existing goods items
            goodsItemsData.forEach((item, index) => {
                // Calculate GI Amount dynamically
                const quantity = parseFloat(item.quantity) || 0;
                const rate = parseFloat(item.rate) || 0;
                const giAmount = (quantity * rate).toFixed(2);

                const fromPartyOptions = allConsignees.map(consignee =>
                    `<option value="${consignee.id}" ${item.from_party == consignee.id ? 'selected' : ''}>${consignee.consignee_name}</option>`
                ).join('');

                const toPartyOptions = allConsigners.map(consigner =>
                    `<option value="${consigner.id}" ${item.to_party == consigner.id ? 'selected' : ''}>${consigner.consigner_name}</option>`
                ).join('');

                const row = goodsTableBody.insertRow();
                row.innerHTML = `
                        <td>
                            <select data-field="unit" data-index="${index}">
                                <option value="">Select</option>
                                <option value="kg" ${item.unit === 'kg' ? 'selected' : ''}>10 KG</option>
                                <option value="kg" ${item.unit === 'kg' ? 'selected' : ''}>15 KG</option>
                                <option value="kg" ${item.unit === 'kg' ? 'selected' : ''}>20 KG</option>
                            </select>
                        </td>
                        <td><input type="number" value="${item.quantity || 0}" data-field="quantity" data-index="${index}"></td>
                        <td><input type="number" value="${item.rate || 0}" data-field="rate" data-index="${index}"></td>
                        <td><input type="text" value="${giAmount}" disabled class="gi-amount-display" data-index="${index}"></td>
                        <td>
                            <select data-field="from_party" data-index="${index}">
                                <option value="">Select Consignee</option>
                                ${fromPartyOptions}
                            </select>
                        </td>
                        <td>
                            <select data-field="to_party" data-index="${index}">
                                <option value="">Select Consigner</option>
                                ${toPartyOptions}
                            </select>
                        </td>
                        <td style="white-space: nowrap;">
                            <button type="button" class="table-action-btn edit-goods-item-btn" data-index="${index}" title="Edit Item">
                                <i class="fa-solid fa-pencil"></i>
                            </button>
                            <button type="button" class="table-action-btn remove-goods-item-btn" data-index="${index}" title="Remove Item">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    `;

                // Update item on input/change
                row.querySelectorAll('input:not(.gi-amount-display), select').forEach(inputOrSelect => {
                    inputOrSelect.addEventListener('input', function () { // 'input' event works for both input and select elements
                        const itemIndex = parseInt(this.dataset.index);
                        const field = this.dataset.field;
                        
                        // Explicitly handle numeric fields to ensure they are numbers
                        if (field === 'quantity' || field === 'rate') {
                            goodsItemsData[itemIndex][field] = parseFloat(this.value) || 0;
                        } else if (field === 'from_party' || field === 'to_party') {
                            // This sends the ID (or null if empty string). Backend converts null/ID to name or empty string.
                            goodsItemsData[itemIndex][field] = this.value === '' ? null : this.value;
                        } else {
                            goodsItemsData[itemIndex][field] = this.value;
                        }

                        // Recalculate GI Amount if quantity or rate changed
                        if (field === 'quantity' || field === 'rate') {
                            const updatedQuantity = parseFloat(goodsItemsData[itemIndex].quantity) || 0;
                            const updatedRate = parseFloat(goodsItemsData[itemIndex].rate) || 0;
                            const updatedGI = (updatedQuantity * updatedRate); // Keep as number
                            const giField = goodsTableBody.rows[index].querySelector('.gi-amount-display');
                            if (giField) {
                                giField.value = updatedGI.toFixed(2); // Display as string with 2 decimal places
                                // Store the raw number in goodsItemsData, not a fixed-decimal string
                                goodsItemsData[itemIndex].amount = updatedGI; 
                            }
                        }
                        updateGoodsInfoHiddenField(); // Update hidden field on every input/change
                        updateGIAmountTotals(); // Call to update Total Fare Summary whenever GI Amount changes
                    });
                });

                row.querySelector('.edit-goods-item-btn').addEventListener('click', function () {
                    const itemIndex = parseInt(this.dataset.index);
                    const firstInput = goodsTableBody.rows[itemIndex].querySelector('input[data-field="quantity"]');
                    if (firstInput) {
                        firstInput.focus();
                    }
                });

                row.querySelector('.remove-goods-item-btn').addEventListener('click', function () {
                    const itemIndex = parseInt(this.dataset.index);
                    showConfirmationModal("Are you sure you want to remove this goods item?", (confirmed) => {
                        if (confirmed) {
                            console.log(`Removing goods item at index: ${itemIndex}`);
                            goodsItemsData.splice(itemIndex, 1);
                            updateGoodsInfoHiddenField();
                            renderGoodsItemsTable();
                            updateGIAmountTotals(); // Call to update Total Fare Summary when item is removed
                        }
                    });
                });
            });

            // Add the Total Fare summary row at the end of the tbody
            // Only add if goods items exist (excluding the example row)
            if (goodsItemsData.length > 0) {
                const totalFareRow = goodsTableBody.insertRow();
                totalFareRow.id = 'totalFareRow'; // Add an ID for easy selection
                totalFareRow.innerHTML = `
                    <td colspan="3" style="text-align: right; font-weight: bold; padding-right: 10px;">Total Fare:</td>
                    <td><input type="text" id="totalFareSummary" value="0.00" disabled style="width: calc(100% - 16px);"></td>
                    <td colspan="3"></td> <!-- Span for From Party, To Party, and Actions -->
                `;
                // Re-assign the global totalFareSummaryInput variable to the newly created element
                totalFareSummaryInput = document.getElementById('totalFareSummary');
                totalFareRow.style.display = ''; // Ensure it's shown if there are goods
            }

            updateGIAmountTotals(); // Call to update Total Fare Summary when table is rendered (e.g., on page load, data fetch)
        }

        function addGoodsItemRow() {
            const currentCnid = cnidInputField ? cnidInputField.value : ''; // Added null check
            if (!currentCnid || currentCnid === 'Error' || currentCnid === 'N/A') {
                showSuccessPopup("Please ensure a valid CNID is present before adding goods items. Refresh the page if needed.");
                return;
            }

            goodsItemsData.push({
                cnid: currentCnid, // Use current CNID
                unit: '',
                quantity: 0,   // Default to 0 for numbers
                rate: 0,       // Default to 0 for numbers
                amount: 0,     // Default to 0 for numbers
                from_party: null, // Default to null for FKs (ID will be sent as null/empty string)
                to_party: null    // Default to null for FKs (ID will be sent as null/empty string)
            });
            updateGoodsInfoHiddenField();
            renderGoodsItemsTable();
            // Remove the example row after the first actual item is added
            const exampleRow = document.querySelector('.goods-info-table .example-row');
            if (exampleRow && goodsItemsData.length > 0) {
                exampleRow.remove();
            }
            const newRowIndex = goodsItemsData.length - 1;
            // Focus on the first relevant input of the new row
            const newRowFirstInput = goodsTableBody.rows[newRowIndex].querySelector('input[data-field="quantity"]');
            if (newRowFirstInput) {
                newRowFirstInput.focus();
            }
            updateGIAmountTotals();
        }

        function updateGoodsInfoHiddenField() {
            if (goodsInfoHiddenInput) { // Added null check
                // Ensure all numeric values are numbers, and FKs are null or their ID
                // Note: The backend will handle conversion of null ID to empty string for CharField
                // Filter out items that are essentially empty (all values are default/null)
                const filteredGoodsData = goodsItemsData.filter(item => {
                    const quantity = parseFloat(item.quantity) || 0;
                    const rate = parseFloat(item.rate) || 0;
                    const unit = item.unit || '';
                    const fromParty = item.from_party || null;
                    const toParty = item.to_party || null;

                    // An item is considered "not empty" if any of its core fields are non-default
                    return quantity > 0 || rate > 0 || unit !== '' || fromParty !== null || toParty !== null;
                }).map(item => ({
                    ...item,
                    quantity: parseFloat(item.quantity) || 0,
                    rate: parseFloat(item.rate) || 0,
                    amount: parseFloat(item.amount) || 0,
                    from_party: item.from_party, // Send as is (null or ID)
                    to_party: item.to_party       // Send as is (null or ID)
                }));
                goodsInfoHiddenInput.value = JSON.stringify(filteredGoodsData);
            }
        }

        // Function to calculate total GI Amount and update Total Fare Summary
        function updateGIAmountTotals() {
            let totalGIAmount = 0;
            goodsItemsData.forEach(item => {
                // Ensure to sum only for items that are not considered empty for total fare calculation
                const quantity = parseFloat(item.quantity) || 0;
                const rate = parseFloat(item.rate) || 0;
                totalGIAmount += (quantity * rate);
            });

            const totalFareRow = document.getElementById('totalFareRow');
            if (totalFareSummaryInput && totalFareRow) {
                totalFareSummaryInput.value = totalGIAmount.toFixed(2);
                if (totalFareHiddenInput) { // Added null check
                    totalFareHiddenInput.value = totalGIAmount.toFixed(2);
                }

                // Show or hide the total fare row based on whether there are any actual goods items
                // or if there's any calculated amount
                // The filter logic for display should match the filter logic for sending to backend.
                const hasActualGoods = goodsItemsData.some(item => {
                    const quantity = parseFloat(item.quantity) || 0;
                    const rate = parseFloat(item.rate) || 0;
                    const unit = item.unit || '';
                    const fromParty = item.from_party || null;
                    const toParty = item.to_party || null;
                    return quantity > 0 || rate > 0 || unit !== '' || fromParty !== null || toParty !== null;
                });

                if (hasActualGoods || totalGIAmount > 0) {
                    totalFareRow.style.display = ''; // Show the row
                } else {
                    totalFareRow.style.display = 'none'; // Hide the row
                }
            }
        }


        // --- Event Listeners for Modals ---
        if (addVehicleBtn) {
            addVehicleBtn.addEventListener('click', function () {
                if (vehicleModalOverlay) vehicleModalOverlay.style.display = 'flex';
                fetchAndRenderVehicles(); // Fetch for the modal's table
            });
        }

        if (closeVehicleModalBtn) {
            closeVehicleModalBtn.addEventListener('click', function () {
                if (vehicleModalOverlay) vehicleModalOverlay.style.display = 'none';
            });
        }

        if (addNewVehicleBtn) {
            addNewVehicleBtn.addEventListener('click', addNewVehicle);
        }

        // Consignee Modal Event Listeners
        if (addConsigneeBtn) {
            addConsigneeBtn.addEventListener('click', function () {
                if (consigneeModalOverlay) consigneeModalOverlay.style.display = 'flex';
                if (newConsigneeNameInput) newConsigneeNameInput.value = '';
                if (newConsigneeDateInput) newConsigneeDateInput.value = new Date().toISOString().slice(0, 10);
                if (newConsigneeAddressInput) newConsigneeAddressInput.value = '';
                fetchAndRenderConsignees();
            });
        }

        if (closeConsigneeModalBtn) {
            closeConsigneeModalBtn.addEventListener('click', function () {
                if (consigneeModalOverlay) consigneeModalOverlay.style.display = 'none';
            });
        }

        if (addNewConsigneeBtn) {
            addNewConsigneeBtn.addEventListener('click', addNewConsignee);
        }

        // Consigner Modal Event Listeners
        if (addConsignerBtn) {
            addConsignerBtn.addEventListener('click', function () {
                if (consignerModalOverlay) consignerModalOverlay.style.display = 'flex';
                if (newConsignerNameInput) newConsignerNameInput.value = '';
                if (newConsignerDateInput) newConsignerDateInput.value = new Date().toISOString().slice(0, 10);
                if (newConsignerAddressInput) newConsignerAddressInput.value = '';
                fetchAndRenderConsigners();
            });
        }

        if (closeConsignerModalBtn) {
            closeConsignerModalBtn.addEventListener('click', function () {
                if (consignerModalOverlay) consignerModalOverlay.style.display = 'none';
            });
        }

        if (addNewConsignerBtn) {
            addNewConsignerBtn.addEventListener('click', addNewConsigner);
        }

        // Location Modal Event Listeners
        if (addFromLocationBtn) {
            addFromLocationBtn.addEventListener('click', function () {
                if (locationModalOverlay) locationModalOverlay.style.display = 'flex';
                if (newLocationNameInput) newLocationNameInput.value = '';
                if (newLocationDateInput) newLocationDateInput.value = new Date().toISOString().slice(0, 10);
                fetchAndRenderLocations();
            });
        }

        if (addToLocationBtn) {
            addToLocationBtn.addEventListener('click', function () {
                if (locationModalOverlay) locationModalOverlay.style.display = 'flex';
                if (newLocationNameInput) newLocationNameInput.value = '';
                if (newLocationDateInput) newLocationDateInput.value = new Date().toISOString().slice(0, 10);
                fetchAndRenderLocations();
            });
        }

        if (closeLocationModalBtn) {
            closeLocationModalBtn.addEventListener('click', function () {
                if (locationModalOverlay) locationModalOverlay.style.display = 'none';
            });
        }

        if (addNewLocationBtn) {
            addNewLocationBtn.addEventListener('click', addNewLocation);
        }

        // Event listener for adding new goods item row
        if (addGoodsItemBtn) {
            addGoodsItemBtn.addEventListener('click', addGoodsItemRow);
        }

        // --- Form Submission Interception ---
        if (consignmentForm) {
            consignmentForm.addEventListener('submit', function (event) {
                event.preventDefault(); // Prevent default form submission

                // Collect data from goods table and ensure correct types
                const currentGoodsData = [];
                let totalFareCalculated = 0;

                if (goodsTableBody) {
                    goodsTableBody.querySelectorAll('tr:not(.example-row)').forEach(row => {
                        const unitInput = row.querySelector('[data-field="unit"]');
                        const quantityInput = row.querySelector('[data-field="quantity"]');
                        const rateInput = row.querySelector('[data-field="rate"]');
                        const giAmountDisplay = row.querySelector('.gi-amount-display');
                        const fromPartySelect = row.querySelector('[data-field="from_party"]');
                        const toPartySelect = row.querySelector('[data-field="to_party"]');

                        const unit = unitInput ? unitInput.value : '';
                        const quantity = parseFloat(quantityInput ? quantityInput.value : '0') || 0;
                        const rate = parseFloat(rateInput ? rateInput.value : '0') || 0;
                        const amount = parseFloat(giAmountDisplay ? giAmountDisplay.value : '0') || 0;
                        
                        const fromParty = fromPartySelect && fromPartySelect.value !== '' ? parseInt(fromPartySelect.value) : null; // Parse to int or null
                        const toParty = toPartySelect && toPartySelect.value !== '' ? parseInt(toPartySelect.value) : null; // Parse to int or null

                        currentGoodsData.push({
                            cnid: cnidInputField.value, // Add cnid to each goods item
                            unit: unit,
                            quantity: quantity,
                            rate: rate,
                            amount: amount,
                            from_party: fromParty,
                            to_party: toParty
                        });
                        totalFareCalculated += amount;
                    });
                }

                const filteredGoodsData = currentGoodsData.filter(item => {
                    const quantity = parseFloat(item.quantity) || 0;
                    const rate = parseFloat(item.rate) || 0;
                    const unit = item.unit || '';
                    const fromParty = item.from_party || null;
                    const toParty = item.to_party || null;

                    return quantity > 0 || rate > 0 || unit !== '' || fromParty !== null || toParty !== null;
                });


                if (goodsInfoHiddenInput) {
                    goodsInfoHiddenInput.value = JSON.stringify(filteredGoodsData);
                }
                if (totalFareHiddenInput) {
                    totalFareHiddenInput.value = totalFareCalculated.toFixed(2);
                }

                const formData = new FormData(consignmentForm);
                const payload = {};
                // Iterate over form elements to build the payload
                for (const [key, value] of formData.entries()) {
                    if (key === '{{ form.Vehicle_No.name }}' || key === '{{ form.consignee.name }}' ||
                        key === '{{ form.consigner.name }}' || key === '{{ form.from_location.name }}' ||
                        key === '{{ form.To_Location.name }}') {
                        // These are the hidden ID fields for the custom dropdowns
                        payload[key] = value ? parseInt(value) : null;
                    } else if (key === 'cn_note_id') {
                        payload[key] = parseInt(value);
                    } else if (['Truck_Freight', 'Advance_Amount', 'Balance_Amount', 'Innam', 'Extra_TF', 'total_fare'].includes(key)) {
                        payload[key] = parseFloat(value) || 0.00;
                    } else if (key !== 'goods_info') { // goods_info will be handled separately
                        payload[key] = value;
                    }
                }
                
                // Add goods_info as JSON string
                if (goodsInfoHiddenInput) {
                    payload['goods_info'] = goodsInfoHiddenInput.value;
                }
                
                // Log the final payload for debugging
                console.log("Final Payload for submission:", payload);


                fetch(consignmentForm.action, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken,
                    },
                    body: JSON.stringify(payload),
                })
                    .then(response => {
                        const contentType = response.headers.get("content-type");
                        if (contentType && contentType.indexOf("application/json") !== -1) {
                            return response.json();
                        } else {
                            console.error("Server did not return JSON. Response:", response.text());
                            throw new TypeError("Oops, server did not return JSON!");
                        }
                    })
                    .then(data => {
                        if (data.success) {
                            showSuccessPopup("Consignment Form saved successfully!");
                            // Clear form fields
                            if (cnidInputField) cnidInputField.value = '';
                            const cnNoInput = document.getElementById('{{ form.Cn_No.id_for_label }}');
                            if (cnNoInput) cnNoInput.value = '';

                            // Clear custom searchable dropdowns
                            if (vehicleSearchInput) vehicleSearchInput.value = '';
                            if (vehicleIdHiddenInput) vehicleIdHiddenInput.value = '';
                            if (consigneeSearchInput) consigneeSearchInput.value = '';
                            if (consigneeIdHiddenInput) consigneeIdHiddenInput.value = '';
                            if (consignerSearchInput) consignerSearchInput.value = '';
                            if (consignerIdHiddenInput) consignerIdHiddenInput.value = '';
                            if (fromLocationSearchInput) fromLocationSearchInput.value = '';
                            if (fromLocationIdHiddenInput) fromLocationIdHiddenInput.value = '';
                            if (toLocationSearchInput) toLocationSearchInput.value = '';
                            if (toLocationIdHiddenInput) toLocationIdHiddenInput.value = '';


                            const bookingDateInput = document.getElementById('{{ form.Booking_Date.id_for_label }}');
                            if (bookingDateInput) bookingDateInput.value = '';
                            const loadingDateInput = document.getElementById('{{ form.Loading_Date.id_for_label }}');
                            if (loadingDateInput) loadingDateInput.value = '';
                            const unloadingDateInput = document.getElementById('{{ form.Unloading_Date.id_for_label }}');
                            if (unloadingDateInput) unloadingDateInput.value = '';

                            const truckFreightInputElement = document.getElementById('{{ form.Truck_Freight.id_for_label }}');
                            if (truckFreightInputElement) truckFreightInputElement.value = '';
                            const advanceAmountInput = document.getElementById('{{ form.Advance_Amount.id_for_label }}');
                            if (advanceAmountInput) advanceAmountInput.value = '';
                            const balanceAmountInput = document.getElementById('{{ form.Balance_Amount.id_for_label }}');
                            if (balanceAmountInput) balanceAmountInput.value = '';
                            const innamInput = document.getElementById('{{ form.Innam.id_for_label }}');
                            if (innamInput) innamInput.value = '';
                            const extraTfInput = document.getElementById('{{ form.Extra_TF.id_for_label }}');
                            if (extraTfInput) extraTfInput.value = '';

                            if (totalFareSummaryInput) {
                                totalFareSummaryInput.value = '0.00';
                            }
                            if (totalFareHiddenInput) {
                                totalFareHiddenInput.value = '0.00';
                            }

                            fetchAndDisplayNextCNID();
                            goodsItemsData = [];
                            renderGoodsItemsTable();
                        } else {
                            let errorMessages = "Error saving form: ";
                            if (data.errors) {
                                try {
                                    const errors = JSON.parse(data.errors);
                                    for (const field in errors) {
                                        if (Array.isArray(errors[field])) {
                                            errors[field].forEach(err => {
                                                errorMessages += `\n${field}: ${err.message || err.code || err}`;
                                            });
                                        } else {
                                            errorMessages += `\n${field}: ${errors[field]}`;
                                        }
                                    }
                                } catch (e) {
                                    errorMessages += data.errors;
                                }
                            } else if (data.message) {
                                errorMessages += data.message;
                            }
                            console.error('Form submission error:', errorMessages);
                            showSuccessPopup(`Error saving form: ${errorMessages}`);
                        }
                    })
                    .catch(error => {
                        console.error('Network error during form submission:', error);
                        showSuccessPopup(`Network error during form submission: ${error.message}`);
                    });
            });
        }


        // --- Smooth Scrolling for Master Dropdown Links ---
        document.querySelectorAll('.dropdown-content a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();

                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                    targetElement.style.transition = 'outline 0.3s ease-in-out';
                    targetElement.style.outline = '2px solid #6a1b9a';
                    setTimeout(() => {
                        targetElement.style.outline = 'none';
                    }, 2000);
                }
            });
        });


        // Initial fetches on page load for the main form's dropdowns
        fetchAndRenderVehicles(); // This now populates allVehicles and initializes its searchable dropdown
        fetchAndRenderConsignees(); // Fetch consignee data and init its searchable dropdown
        fetchAndRenderConsigners(); // Fetch consigner data and init its searchable dropdown
        fetchAndRenderLocations(); // Fetch location data and init its searchable dropdowns
        fetchAndDisplayNextCNID(); // Ensure CNID is fetched at page load

        // Initial render of the goods information table (will be empty initially)
        renderGoodsItemsTable(); // This will also trigger initial Total Fare summary calculation
    });
