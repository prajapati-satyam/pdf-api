class PDFCryptoPro {
    constructor() {
        this.currentOperation = null;
        this.selectedFiles = [];
        this.maxSingleFileSize = 100 * 1024 * 1024;
        this.maxBulkFiles = 100;
        this.init();
    }
init() {
        this.bindEvents();
        this.updateAadhaarUIState(); // Add this line to set initial state
        setTimeout(() => {
            const mainInt = document.getElementById('main-interface');
            mainInt.classList.remove('opacity-0', 'scale-95');
            mainInt.classList.add('opacity-100', 'scale-100');
        }, 100);
    }

    bindEvents() {
        // Operation Buttons
        document.querySelectorAll('.operation-card').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const op = e.currentTarget.getAttribute('data-op');
                this.selectOperation(op, e.currentTarget);
            });
        });
        // Open modal from the Aadhaar section directly
        document.getElementById('inline-setup-cred-btn').addEventListener('click', () => {
            document.getElementById('credentials-modal').classList.remove('hidden');
        });

        // Dropzones
        const singleDrop = document.getElementById('single-drop-zone');
        const bulkDrop = document.getElementById('bulk-drop-zone');
        const singleInput = document.getElementById('single-file-input');
        const bulkInput = document.getElementById('bulk-file-input');

        singleDrop.addEventListener('click', () => singleInput.click());
        bulkDrop.addEventListener('click', () => bulkInput.click());
        singleInput.addEventListener('change', (e) => this.handleFileSelect(e, 'single'));
        bulkInput.addEventListener('change', (e) => this.handleFileSelect(e, 'bulk'));

        // Drag events
        [singleDrop, bulkDrop].forEach(dz => {
            dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add(dz.id === 'single-drop-zone' ? 'drop-zone-active' : 'drop-zone-bulk-active'); });
            dz.addEventListener('dragleave', (e) => { e.preventDefault(); dz.classList.remove('drop-zone-active', 'drop-zone-bulk-active'); });
            dz.addEventListener('drop', (e) => {
                e.preventDefault(); dz.classList.remove('drop-zone-active', 'drop-zone-bulk-active');
                if(dz.id === 'single-drop-zone') this.validateAndSetSingleFile(e.dataTransfer.files[0]);
                else this.validateAndSetBulkFiles(Array.from(e.dataTransfer.files));
            });
        });

        document.getElementById('remove-single-file').addEventListener('click', () => this.resetFiles());
        document.getElementById('remove-bulk-files').addEventListener('click', () => this.resetFiles());
        document.getElementById('process-btn').addEventListener('click', () => this.processFiles());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetAll());

        // Split Options logic
        document.getElementsByName('split-choice').forEach(radio => {
            radio.addEventListener('change', (e) => {
                document.getElementById('split-range-inputs').classList.toggle('hidden', e.target.value !== 'range');
                document.getElementById('split-page-inputs').classList.toggle('hidden', e.target.value !== 'pagenumbers');
            });
        });

        // Aadhaar options logic
        document.getElementById('aadhaar-use-cred').addEventListener('change', (e) => {
            document.getElementById('aadhaar-password-div').classList.toggle('hidden', e.target.checked);
        });

        // Credentials Modal
        document.getElementById('open-settings-btn').addEventListener('click', () => document.getElementById('credentials-modal').classList.remove('hidden'));
        document.getElementById('close-settings-btn').addEventListener('click', () => document.getElementById('credentials-modal').classList.add('hidden'));
        document.getElementById('save-cred-btn').addEventListener('click', () => this.handleCredentials('save'));
        document.getElementById('clear-cred-btn').addEventListener('click', () => this.handleCredentials('clear'));

        // Global Paste Event (Ctrl+V)
        document.addEventListener('paste', (e) => {
            if(!this.currentOperation) return;
            const items = (e.clipboardData || e.originalEvent.clipboardData).items;
            const pdfFiles = [];
            for (let index in items) {
                const item = items[index];
                if (item.kind === 'file' && item.type === 'application/pdf') {
                    pdfFiles.push(item.getAsFile());
                }
            }
            if(pdfFiles.length > 0) {
                if (['bulk-encrypt', 'bulk-decrypt', 'merge'].includes(this.currentOperation)) {
                    this.validateAndSetBulkFiles(pdfFiles);
                } else {
                    this.validateAndSetSingleFile(pdfFiles[0]);
                }
            }
        });
    }

    selectOperation(op, buttonElement) {
        this.currentOperation = op;
        this.resetFiles();
        
        // UI Highlights
        document.querySelectorAll('.operation-card').forEach(card => card.classList.remove('active-op'));
        if(buttonElement) buttonElement.classList.add('active-op');

        const titleMap = {
            'encrypt': 'Encrypt PDF', 'decrypt': 'Decrypt PDF', 'bulk-encrypt': 'Bulk Encrypt',
            'bulk-decrypt': 'Bulk Decrypt', 'split': 'Split PDF', 'merge': 'Merge PDFs', 'unlock-aadhaar': 'Unlock Aadhaar'
        };
        document.getElementById('interface-title').textContent = titleMap[op];
        document.getElementById('interface-subtitle').textContent = "Upload file(s) to continue";

        // Show/Hide relevant drop zones
        const isBulk = ['bulk-encrypt', 'bulk-decrypt', 'merge'].includes(op);
        document.getElementById('single-drop-zone').classList.toggle('hidden', isBulk);
        document.getElementById('bulk-drop-zone').classList.toggle('hidden', !isBulk);

        // Scroll down slightly on mobile so the dropzone is visible
        if (window.innerWidth <= 768) {
            document.getElementById('main-interface').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    handleFileSelect(e, type) {
        if(type === 'single') this.validateAndSetSingleFile(e.target.files[0]);
        else this.validateAndSetBulkFiles(Array.from(e.target.files));
    }

    validateAndSetSingleFile(file) {
        if (!file || file.type !== 'application/pdf') return this.showToast('error', 'Invalid', 'Only PDF files allowed');
        this.selectedFiles = [file];
        document.getElementById('single-file-name').textContent = file.name;
        document.getElementById('single-file-size').textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB';
        document.getElementById('single-drop-zone').classList.add('hidden');
        document.getElementById('single-file-display').classList.remove('hidden');
        this.showOptions();
    }

    validateAndSetBulkFiles(files) {
        const validFiles = files.filter(f => f.type === 'application/pdf');
        if (validFiles.length === 0) return this.showToast('error', 'Error', 'No valid PDFs found');
        if (validFiles.length > this.maxBulkFiles) return this.showToast('error', 'Limit Exceeded', `Max ${this.maxBulkFiles} files`);

        this.selectedFiles = validFiles;
        document.getElementById('bulk-files-count').textContent = `${validFiles.length} files`;
        const list = document.getElementById('bulk-files-list');
        list.innerHTML = '';
        validFiles.forEach((f, i) => {
            list.innerHTML += `<div class="file-item">
                <span class="truncate pr-4">${f.name}</span>
                <button onclick="window.pdfCryptoApp.removeFile(${i})" class="text-red-400 p-1">✕</button>
            </div>`;
        });
        document.getElementById('bulk-drop-zone').classList.add('hidden');
        document.getElementById('bulk-files-display').classList.remove('hidden');
        this.showOptions();
    }

    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        if(this.selectedFiles.length === 0) this.resetFiles();
        else this.validateAndSetBulkFiles(this.selectedFiles);
    }

    showOptions() {
        const op = this.currentOperation;
        document.getElementById('process-btn').classList.remove('hidden');
        document.getElementById('process-btn-text').textContent = "Process File(s)";

        // Hide all option sections first
        ['password-section', 'split-section', 'aadhaar-section'].forEach(id => document.getElementById(id).classList.add('hidden'));

        if (['encrypt', 'decrypt', 'bulk-encrypt', 'bulk-decrypt'].includes(op)) {
            document.getElementById('password-section').classList.remove('hidden');
        } else if (op === 'split') {
            document.getElementById('split-section').classList.remove('hidden');
        } else if (op === 'unlock-aadhaar') {
            document.getElementById('aadhaar-section').classList.remove('hidden');
            
            // Credential check logic
            const hasInfo = localStorage.getItem('info') === 'true';
            const credCheckbox = document.getElementById('aadhaar-use-cred');
            const pwdDiv = document.getElementById('aadhaar-password-div');
            const labelWrapper = credCheckbox.closest('label');

            if (!hasInfo) {
                // Disable checkbox if no credentials exist
                credCheckbox.checked = false;
                credCheckbox.disabled = true;
                pwdDiv.classList.remove('hidden');
                labelWrapper.classList.add('opacity-50', 'cursor-not-allowed');
                labelWrapper.title = "No credentials saved. Please add them in 'Manage Credentials'.";
            } else {
                // Enable checkbox if credentials exist
                credCheckbox.disabled = false;
                credCheckbox.checked = true;
                pwdDiv.classList.add('hidden');
                labelWrapper.classList.remove('opacity-50', 'cursor-not-allowed');
                labelWrapper.title = "";
            }
        }
    }

    resetFiles() {
        this.selectedFiles = [];
        document.getElementById('single-file-input').value = '';
        document.getElementById('bulk-file-input').value = '';
        ['single-file-display', 'bulk-files-display', 'password-section', 'split-section', 'aadhaar-section', 'process-btn', 'progress-section'].forEach(id => {
            document.getElementById(id).classList.add('hidden');
        });
        const isBulk = ['bulk-encrypt', 'bulk-decrypt', 'merge'].includes(this.currentOperation);
        if(this.currentOperation) {
            document.getElementById('single-drop-zone').classList.toggle('hidden', isBulk);
            document.getElementById('bulk-drop-zone').classList.toggle('hidden', !isBulk);
        }
    }

    resetAll() {
        this.currentOperation = null;
        document.querySelectorAll('.operation-card').forEach(c => c.classList.remove('active-op'));
        document.getElementById('interface-title').textContent = 'Select Operation';
        document.getElementById('interface-subtitle').textContent = 'Choose an operation to secure your PDF documents';
        this.resetFiles();
        document.getElementById('single-drop-zone').classList.add('hidden');
        document.getElementById('bulk-drop-zone').classList.add('hidden');
        document.getElementById('reset-btn').classList.add('hidden');
    }
    updateAadhaarUIState() {
        const hasInfo = localStorage.getItem('info') === 'true';
        const checkbox = document.getElementById('aadhaar-use-cred');
        const label = document.getElementById('aadhaar-cred-label');
        const pwdDiv = document.getElementById('aadhaar-password-div');
        const inlineBtn = document.getElementById('inline-setup-cred-btn');

        if (hasInfo) {
            // Credentials exist: Enable checkbox, check it, hide manual input
            checkbox.disabled = false;
            checkbox.checked = true;
            label.classList.remove('opacity-50', 'cursor-not-allowed');
            label.classList.add('cursor-pointer');
            pwdDiv.classList.add('hidden');
            inlineBtn.textContent = 'Manage Credentials';
        } else {
            // No credentials: Disable checkbox, uncheck it, show manual input
            checkbox.disabled = true;
            checkbox.checked = false;
            label.classList.add('opacity-50', 'cursor-not-allowed');
            label.classList.remove('cursor-pointer');
            pwdDiv.classList.remove('hidden');
            inlineBtn.textContent = 'Set Credentials';
        }
    }

    // --- Credentials API Handlers ---
    async handleCredentials(action) {
        if(action === 'clear') {
            try {
                const res = await fetch('/api/v1/clear', { method: 'POST' });
                if(res.ok) {
                    localStorage.removeItem('info');
                    document.getElementById('cred-name').value = '';
                    document.getElementById('cred-dob').value = '';
                    this.updateAadhaarUIState(); // Refresh UI here
                    this.showToast('success', 'Cleared', 'Credentials removed.');
                }
            } catch (e) { this.showToast('error', 'Error', 'Failed to clear credentials'); }
            return;
        }

        // Save or update
        const name = document.getElementById('cred-name').value.trim();
        const dob = document.getElementById('cred-dob').value.trim();
        if(!name || !dob) return this.showToast('error', 'Missing Data', 'Please enter Name and DOB.');

        const endpoint = localStorage.getItem('info') ? '/api/v1/change-cookies' : '/api/v1/set-cookies';
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullname: name, dob: dob })
            });
            if(res.ok) {
                localStorage.setItem('info', 'true');
                this.updateAadhaarUIState(); // Refresh UI here
                this.showToast('success', 'Saved', 'Credentials stored securely.');
                document.getElementById('credentials-modal').classList.add('hidden');
            } else {
                throw new Error("Server error");
            }
        } catch (e) {
            this.showToast('error', 'Error', 'Failed to save credentials.');
        }
    }

    // --- Processing Router ---
    async processFiles() {
        if (this.selectedFiles.length === 0) return;
        
        document.getElementById('process-btn').disabled = true;
        document.getElementById('progress-section').classList.remove('hidden');

        try {
            switch(this.currentOperation) {
                case 'encrypt': await this.doStandardAPI('/api/v1/upload/encrypt', 'pdf'); break;
                case 'decrypt': await this.doStandardAPI('/api/v1/upload/decrypt', 'pdf'); break;
                case 'bulk-encrypt': await this.doStandardAPI('/api/v1/upload/bulk/encrypt', 'zip'); break;
                case 'bulk-decrypt': await this.doStandardAPI('/api/v1/upload/bulk/decrypt', 'zip'); break;
                case 'split': await this.doSplitAPI(); break;
                case 'merge': await this.doMergeAPI(); break;
                case 'unlock-aadhaar': await this.doAadhaarAPI(); break;
            }
            this.showToast('success', 'Success', 'Processing completed successfully.');
            document.getElementById('reset-btn').classList.remove('hidden');
        } catch (error) {
            this.showToast('error', 'Failed', error.message || 'Processing failed');
        } finally {
            document.getElementById('process-btn').disabled = false;
            document.getElementById('progress-section').classList.add('hidden');
        }
    }

    // Handlers for specific API Calls
    async doStandardAPI(endpoint, expectedFormat) {
        const password = document.getElementById('password').value.trim();
        if (!password) throw new Error('Password required');

        const fd = new FormData();
        this.selectedFiles.forEach(f => fd.append('test', f));

        const res = await fetch(endpoint, { method: 'POST', headers: { 'x-password': password }, body: fd });
        await this.handleResponseDownload(res, expectedFormat);
    }

    async doSplitAPI() {
        const choice = document.querySelector('input[name="split-choice"]:checked').value;
        const headers = { 'choice': choice };

        if (choice === 'range') {
            const start = document.getElementById('split-range-start').value;
            const end = document.getElementById('split-range-end').value;
            if(!start || !end) throw new Error("Enter both start and end pages");
            headers['range'] = `${start},${end}`;
        } else if (choice === 'pagenumbers') {
            const pages = document.getElementById('split-pages').value.replace(/\s+/g, '');
            if(!pages) throw new Error("Enter comma separated pages");
            headers['pagenumbers'] = pages;
        } else {
            headers['splitall'] = 'true';
        }

        const fd = new FormData();
        fd.append('test', this.selectedFiles[0]);

        const res = await fetch('/api/v1/upload/split', { method: 'POST', headers, body: fd });
        await this.handleResponseDownload(res, 'zip');
    }

    async doMergeAPI() {
        const fd = new FormData();
        this.selectedFiles.forEach(f => fd.append('test', f));
        const res = await fetch('/api/v1/upload/merge', { method: 'POST', body: fd });
        await this.handleResponseDownload(res, 'pdf');
    }

    async doAadhaarAPI() {
        const useCred = document.getElementById('aadhaar-use-cred').checked;
        const headers = { default: useCred ? 'true' : 'false' };

        if (useCred) {
            headers['password'] = '';
        } else {
            const pwd = document.getElementById('aadhaar-custom-pwd').value.toUpperCase();
            if(!/^[A-Z]{4}\d{4}$/.test(pwd)) throw new Error("Password must be exactly 4 letters followed by 4 numbers");
            headers['password'] = pwd;
        }

        const fd = new FormData();
        fd.append('test', this.selectedFiles[0]);

        const res = await fetch('/api/v1/upload/unlock/adhar', { method: 'POST', headers, body: fd });
        await this.handleResponseDownload(res, 'pdf');
    }

    // Common file downloader
    async handleResponseDownload(response, type) {
        if (!response.ok) {
            const errorText = await response.json().catch(() => ({ message: 'Server error' }));
            throw new Error(errorText.message);
        }
        // const filename = response.headers.get('content-disposition');
        // const filenamearr = filename.split(' ');
        // const filenamearr2 = filenamearr[1].split('=');
        // const filenamearr3 = String(filenamearr2[1]);
        // console.log(filenamearr3);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // console.log(new Date().toTimeString());
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        a.download = type === 'zip' ? `processed_${timestamp}.zip` : `processed_${timestamp}.pdf`;
        // a.download = type === 'zip' ? `${filenamearr3}_${new Date().toDateString()}.zip` : `${filenamearr3}${new Date().toDateString()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }

    showToast(type, title, msg) {
        const container = document.getElementById('toast-container');
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        t.innerHTML = `<strong>${title}:</strong> <span class="ml-2">${msg}</span>`;
        container.appendChild(t);
        setTimeout(() => t.classList.add('show'), 50);
        setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 4000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.pdfCryptoApp = new PDFCryptoPro();
});