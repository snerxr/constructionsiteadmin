import { getSupabase } from './supabase.js';

class AdminDashboard {
    constructor() {
        this.supabase = getSupabase();
        this.allRecords = [];
        this.filteredRecords = [];
        this.init();
    }

    async init() {
        // Add logout button to header
        this.addLogoutButton();
        this.setupEventListeners();
        await this.loadRecords();
    }

    addLogoutButton() {
        const logoutContainer = document.getElementById('logoutContainer');
        if (logoutContainer && window.authSystem) {
            const logoutButton = window.authSystem.addLogoutButton();
            logoutContainer.appendChild(logoutButton);
        }
    }

    setupEventListeners() {
        // Menu button
        const menuButton = document.getElementById('menuButton');
        if (menuButton) {
            menuButton.addEventListener('click', () => this.openMenuModal());
        }

        // Search input
        const searchName = document.getElementById('searchName');
        if (searchName) {
            searchName.addEventListener('input', () => this.filterRecords());
        }

        // Date filter
        const dateFilter = document.getElementById('dateFilter');
        if (dateFilter) {
            dateFilter.addEventListener('change', () => this.filterRecords());
        }

        // Export button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportToExcel());
        }

        // Employee stats button
        const employeeStatsBtn = document.getElementById('employeeStatsBtn');
        if (employeeStatsBtn) {
            employeeStatsBtn.addEventListener('click', () => this.openEmployeeStatsModal());
        }

        // Menu modal close
        const closeMenuModal = document.getElementById('closeMenuModal');
        if (closeMenuModal) {
            closeMenuModal.addEventListener('click', () => this.closeMenuModal());
        }

        // Employee stats modal close
        const closeEmployeeStatsModal = document.getElementById('closeEmployeeStatsModal');
        if (closeEmployeeStatsModal) {
            closeEmployeeStatsModal.addEventListener('click', () => this.closeEmployeeStatsModal());
        }

        // Record modal close
        const closeRecordModal = document.getElementById('closeRecordModal');
        if (closeRecordModal) {
            closeRecordModal.addEventListener('click', () => this.closeRecordModal());
        }

        // Photo modal close
        const closePhotoModal = document.getElementById('closePhotoModal');
        if (closePhotoModal) {
            closePhotoModal.addEventListener('click', () => this.closePhotoModal());
        }

        // Close modals on backdrop click
        const menuModal = document.getElementById('menuModal');
        if (menuModal) {
            menuModal.addEventListener('click', (e) => {
                if (e.target === menuModal) {
                    this.closeMenuModal();
                }
            });
        }

        const recordModal = document.getElementById('recordModal');
        if (recordModal) {
            recordModal.addEventListener('click', (e) => {
                if (e.target === recordModal) {
                    this.closeRecordModal();
                }
            });
        }

        const employeeStatsModal = document.getElementById('employeeStatsModal');
        if (employeeStatsModal) {
            employeeStatsModal.addEventListener('click', (e) => {
                if (e.target === employeeStatsModal) {
                    this.closeEmployeeStatsModal();
                }
            });
        }

        const photoModal = document.getElementById('photoModal');
        if (photoModal) {
            photoModal.addEventListener('click', (e) => {
                if (e.target === photoModal) {
                    this.closePhotoModal();
                }
            });
        }
    }

    async loadRecords() {
        try {
            this.showLoading(true);

            if (!this.supabase) {
                throw new Error('Supabase not initialized. Please set up your Supabase credentials.');
            }

            const { data, error } = await this.supabase
                .from('employee_checkins')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Failed to load records: ${error.message}`);
            }

            this.allRecords = data || [];
            this.filteredRecords = [...this.allRecords];
            this.updateTotalCounter();
            this.renderRecords();

        } catch (error) {
            console.error('Error loading records:', error);
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    filterRecords() {
        const searchName = document.getElementById('searchName').value.toLowerCase().trim();
        const dateFilter = document.getElementById('dateFilter').value;

        this.filteredRecords = this.allRecords.filter(record => {
            const nameMatch = !searchName || record.employee_name.toLowerCase().includes(searchName);
            const dateMatch = !dateFilter || record.date === this.formatDateForFilter(dateFilter);
            
            return nameMatch && dateMatch;
        });

        this.updateTotalCounter();
        this.renderRecords();
    }

    formatDateForFilter(dateString) {
        // Convert YYYY-MM-DD to MM/DD/YYYY
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }

    updateTotalCounter() {
        const totalCounter = document.getElementById('totalCounter');
        if (totalCounter) {
            totalCounter.textContent = this.filteredRecords.length;
        }
    }

    renderRecords() {
        const container = document.getElementById('recordsContainer');
        const emptyState = document.getElementById('emptyState');

        if (this.filteredRecords.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        container.innerHTML = this.filteredRecords.map(record => `
            <div class="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow" onclick="window.adminDashboard.openRecordModal('${record.id}')">
                <div class="aspect-w-16 aspect-h-9 bg-gray-200">
                    <img 
                        src="${record.photo_url}" 
                        alt="Check-in photo for ${record.employee_name}"
                        class="w-full h-48 object-cover hover:opacity-90 transition-opacity"
                        onclick="event.stopPropagation(); window.adminDashboard.openPhotoModal('${record.photo_url}')"
                    >
                </div>
                <div class="p-4">
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">${record.employee_name}</h3>
                    
                    <div class="space-y-2 text-sm text-gray-600">
                        <div class="flex items-center">
                            <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6m-6 0V7a1 1 0 00-1 1v9a2 2 0 002 2h4a2 2 0 002-2V8a1 1 0 00-1-1V7"></path>
                            </svg>
                            ${record.date} • ${record.time}
                        </div>
                        
                        <div class="flex items-center">
                            <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            ${record.day_of_week}
                        </div>
                        
                        <div class="flex items-start">
                            <svg class="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <span class="break-words">${record.address}</span>
                        </div>
                        
                        <div class="flex items-center text-xs text-gray-500">
                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"></path>
                            </svg>
                            ${record.latitude.toFixed(6)}, ${record.longitude.toFixed(6)}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    openMenuModal() {
        const modal = document.getElementById('menuModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    closeMenuModal() {
        const modal = document.getElementById('menuModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    openEmployeeStatsModal() {
        const modal = document.getElementById('employeeStatsModal');
        const content = document.getElementById('employeeStatsContent');
        
        if (modal && content) {
            // Calculate employee statistics
            const employeeStats = this.calculateEmployeeStats();
            
            content.innerHTML = `
                <div class="mb-6">
                    <div class="bg-construction-50 border border-construction-200 rounded-lg p-4">
                        <div class="flex items-center">
                            <svg class="w-8 h-8 text-construction-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                            <div>
                                <h4 class="text-lg font-semibold text-construction-800">Total Employees: ${employeeStats.length}</h4>
                                <p class="text-construction-600">Total Check-ins: ${this.allRecords.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${employeeStats.map(employee => `
                        <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div class="flex items-center justify-between mb-3">
                                <h5 class="font-semibold text-gray-900 truncate">${employee.name}</h5>
                                <span class="bg-construction-100 text-construction-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                    ${employee.count}
                                </span>
                            </div>
                            <div class="space-y-2 text-sm text-gray-600">
                                <div class="flex items-center">
                                    <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6m-6 0V7a1 1 0 00-1 1v9a2 2 0 002 2h4a2 2 0 002-2V8a1 1 0 00-1-1V7"></path>
                                    </svg>
                                    First Check-in: ${employee.firstCheckin}
                                </div>
                                <div class="flex items-center">
                                    <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    Latest Check-in: ${employee.latestCheckin}
                                </div>
                                <div class="flex items-center">
                                    <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                    Avg per week: ${employee.avgPerWeek}
                                </div>
                            </div>
                            <div class="mt-3 pt-3 border-t border-gray-200">
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-construction-500 h-2 rounded-full" style="width: ${employee.percentage}%"></div>
                                </div>
                                <p class="text-xs text-gray-500 mt-1">${employee.percentage}% of total check-ins</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            // Close menu modal first
            this.closeMenuModal();
            modal.classList.remove('hidden');
        }
    }

    closeEmployeeStatsModal() {
        const modal = document.getElementById('employeeStatsModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    calculateEmployeeStats() {
        const employeeMap = new Map();
        
        // Group records by employee
        this.allRecords.forEach(record => {
            const name = record.employee_name;
            if (!employeeMap.has(name)) {
                employeeMap.set(name, []);
            }
            employeeMap.get(name).push(record);
        });
        
        // Calculate statistics for each employee
        const stats = Array.from(employeeMap.entries()).map(([name, records]) => {
            const sortedRecords = records.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            const firstRecord = sortedRecords[0];
            const latestRecord = sortedRecords[sortedRecords.length - 1];
            
            // Calculate average per week
            const firstDate = new Date(firstRecord.created_at);
            const latestDate = new Date(latestRecord.created_at);
            const daysDiff = Math.max(1, (latestDate - firstDate) / (1000 * 60 * 60 * 24));
            const weeksDiff = Math.max(1, daysDiff / 7);
            const avgPerWeek = (records.length / weeksDiff).toFixed(1);
            
            return {
                name,
                count: records.length,
                firstCheckin: new Date(firstRecord.created_at).toLocaleDateString(),
                latestCheckin: new Date(latestRecord.created_at).toLocaleDateString(),
                avgPerWeek,
                percentage: Math.round((records.length / this.allRecords.length) * 100)
            };
        });
        
        // Sort by check-in count (descending)
        return stats.sort((a, b) => b.count - a.count);
    }

    openRecordModal(recordId) {
        const record = this.filteredRecords.find(r => r.id === recordId);
        if (!record) return;

        const modal = document.getElementById('recordModal');
        const content = document.getElementById('recordModalContent');
        
        if (modal && content) {
            content.innerHTML = `
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Photo Section -->
                    <div>
                        <h4 class="text-lg font-semibold text-gray-900 mb-4">Check-in Photo</h4>
                        <img 
                            src="${record.photo_url}" 
                            alt="Check-in photo for ${record.employee_name}"
                            class="w-full rounded-lg shadow-lg"
                        >
                    </div>
                    
                    <!-- Details Section -->
                    <div>
                        <h4 class="text-lg font-semibold text-gray-900 mb-4">Employee Details</h4>
                        <div class="space-y-4">
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                                <p class="text-lg font-semibold text-gray-900">${record.employee_name}</p>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div class="bg-gray-50 p-4 rounded-lg">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <p class="text-gray-900">${record.date}</p>
                                </div>
                                <div class="bg-gray-50 p-4 rounded-lg">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                    <p class="text-gray-900">${record.time}</p>
                                </div>
                            </div>
                            
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                                <p class="text-gray-900">${record.day_of_week}</p>
                            </div>
                            
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Location Address</label>
                                <p class="text-gray-900">${record.address}</p>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div class="bg-gray-50 p-4 rounded-lg">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                                    <p class="text-gray-900 font-mono text-sm">${record.latitude.toFixed(6)}</p>
                                </div>
                                <div class="bg-gray-50 p-4 rounded-lg">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                                    <p class="text-gray-900 font-mono text-sm">${record.longitude.toFixed(6)}</p>
                                </div>
                            </div>
                            
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Check-in Timestamp</label>
                                <p class="text-gray-900">${new Date(record.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="mt-6 flex space-x-3">
                            <button 
                                onclick="window.open('https://maps.google.com/?q=${record.latitude},${record.longitude}', '_blank')"
                                class="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 flex items-center"
                            >
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                                View on Map
                            </button>
                            
                            <button 
                                onclick="window.adminDashboard.openPhotoModal('${record.photo_url}')"
                                class="bg-construction-600 text-white py-2 px-4 rounded-md hover:bg-construction-700 focus:outline-none focus:ring-2 focus:ring-construction-500 focus:ring-offset-2 transition duration-200 flex items-center"
                            >
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                View Photo
                            </button>
                        </div>
                    </div>
                </div>
            `;
            modal.classList.remove('hidden');
        }
    }

    closeRecordModal() {
        const modal = document.getElementById('recordModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    openPhotoModal(photoUrl) {
        const modal = document.getElementById('photoModal');
        const modalPhoto = document.getElementById('modalPhoto');
        
        if (modal && modalPhoto) {
            modalPhoto.src = photoUrl;
            modal.classList.remove('hidden');
        }
    }

    closePhotoModal() {
        const modal = document.getElementById('photoModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    async exportToExcel() {
        try {
            // Prepare data for export
            const exportData = this.filteredRecords.map(record => ({
                'Employee Name': record.employee_name,
                'Date': record.date,
                'Time': record.time,
                'Day of Week': record.day_of_week,
                'Latitude': record.latitude,
                'Longitude': record.longitude,
                'Address': record.address,
                'Photo URL': record.photo_url,
                'Check-in Time': new Date(record.created_at).toLocaleString()
            }));

            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(exportData);

            // Auto-size columns
            const colWidths = [];
            const headers = Object.keys(exportData[0] || {});
            headers.forEach((header, i) => {
                const maxLength = Math.max(
                    header.length,
                    ...exportData.map(row => String(row[header] || '').length)
                );
                colWidths[i] = { wch: Math.min(maxLength + 2, 50) };
            });
            ws['!cols'] = colWidths;

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Check-in Records');

            // Generate filename with current date
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            const filename = `construction-checkins-${dateStr}.xlsx`;

            // Save file
            XLSX.writeFile(wb, filename);

        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export data. Please try again.');
        }
    }

    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const recordsContainer = document.getElementById('recordsContainer');
        
        if (show) {
            loadingState.classList.remove('hidden');
            recordsContainer.classList.add('hidden');
        } else {
            loadingState.classList.add('hidden');
            recordsContainer.classList.remove('hidden');
        }
    }

    showError(message) {
        const container = document.getElementById('recordsContainer');
        container.innerHTML = `
            <div class="col-span-full bg-red-50 border border-red-200 rounded-md p-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-800">Error Loading Records</h3>
                        <p class="mt-1 text-sm text-red-700">${message}</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize the admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});