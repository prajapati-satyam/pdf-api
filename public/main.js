class PDFCryptoPro {
    constructor() {
        this.currentOperation = null;
        this.selectedFiles = [];
        this.maxSingleFileSize = 100 * 1024 * 1024; // 100MB
        this.maxBulkFiles = 100;
        this.init();
    }

    init() {
        this.bindEvents();
        this.showMainInterface();
    }

    bindEvents() {
        // Operation buttons
        document.getElementById('encrypt-btn').addEventListener('click', () => this.selectOperation('encrypt'));
        document.getElementById('decrypt-btn').addEventListener('click', () => this.selectOperation('decrypt'));
        document.getElementById('bulk-encrypt-btn').addEventListener('click', () => this.selectOperation('bulk-encrypt'));

        // File inputs and drop zones
        this.setupFileHandling();

        // Password toggle
        document.getElementById('toggle-password').addEventListener('click', this.togglePasswordVisibility.bind(this));

        // Process button
        document.getElementById('process-btn').addEventListener('click', this.processFiles.bind(this));

        // Reset button
        document.getElementById('reset-btn').addEventListener('click', this.reset.bind(this));

        // Prevent default drag behaviors globally
        this.preventDefaultDragBehaviors();
    }

    setupFileHandling() {
        // Single file handling
        const singleDropZone = document.getElementById('single-drop-zone');
        const singleFileInput = document.getElementById('single-file-input');

        singleDropZone.addEventListener('click', () => singleFileInput.click());
        singleDropZone.addEventListener('dragover', (e) => this.handleDragOver(e, 'single'));
        singleDropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e, 'single'));
        singleDropZone.addEventListener('drop', (e) => this.handleDrop(e, 'single'));
        singleFileInput.addEventListener('change', (e) => this.handleSingleFileSelect(e));

        // Bulk file handling
        const bulkDropZone = document.getElementById('bulk-drop-zone');
        const bulkFileInput = document.getElementById('bulk-file-input');

        bulkDropZone.addEventListener('click', () => bulkFileInput.click());
        bulkDropZone.addEventListener('dragover', (e) => this.handleDragOver(e, 'bulk'));
        bulkDropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e, 'bulk'));
        bulkDropZone.addEventListener('drop', (e) => this.handleDrop(e, 'bulk'));
        bulkFileInput.addEventListener('change', (e) => this.handleBulkFileSelect(e));

        // Remove file buttons
        document.getElementById('remove-single-file').addEventListener('click', this.removeSingleFile.bind(this));
        document.getElementById('remove-bulk-files').addEventListener('click', this.removeBulkFiles.bind(this));
    }

    preventDefaultDragBehaviors() {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    showMainInterface() {
        const mainInterface = document.getElementById('main-interface');
        setTimeout(() => {
            mainInterface.classList.remove('opacity-0', 'scale-95');
            mainInterface.classList.add('opacity-100', 'scale-100');
        }, 400);
    }

    selectOperation(operation) {
        this.currentOperation = operation;
        this.selectedFiles = [];
        
        // Update UI based on operation
        const title = document.getElementById('interface-title');
        const subtitle = document.getElementById('interface-subtitle');
        const singleDropZone = document.getElementById('single-drop-zone');
        const bulkDropZone = document.getElementById('bulk-drop-zone');
        
        // Hide all drop zones first
        singleDropZone.classList.add('hidden');
        bulkDropZone.classList.add('hidden');
        
        // Reset displays
        document.getElementById('single-file-display').classList.add('hidden');
        document.getElementById('bulk-files-display').classList.add('hidden');
        
        if (operation === 'encrypt') {
            title.textContent = 'Encrypt PDF';
            subtitle.textContent = 'Upload an unlocked PDF to add password protection';
            singleDropZone.classList.remove('hidden');
            this.showToast('success', 'Encrypt Mode', 'Ready to encrypt your PDF file with password protection');
        } else if (operation === 'decrypt') {
            title.textContent = 'Decrypt PDF';
            subtitle.textContent = 'Upload a locked PDF to remove password protection';
            singleDropZone.classList.remove('hidden');
            this.showToast('success', 'Decrypt Mode', 'Ready to decrypt your password-protected PDF');
        } else if (operation === 'bulk-encrypt') {
            title.textContent = 'Bulk Encrypt PDFs';
            subtitle.textContent = 'Upload multiple PDFs to encrypt them all at once';
            bulkDropZone.classList.remove('hidden');
            this.showToast('success', 'Bulk Encrypt Mode', 'Ready to encrypt up to 100 PDF files simultaneously');
        }

        // Add visual feedback to selected operation
        this.highlightSelectedOperation(operation);
    }

    highlightSelectedOperation(operation) {
        // Remove previous highlights
        document.querySelectorAll('.operation-card').forEach(card => {
            card.classList.remove('ring-2', 'ring-purple-500', 'ring-green-500', 'ring-cyan-500');
        });

        // Add highlight to selected operation
        const buttonMap = {
            'encrypt': 'encrypt-btn',
            'decrypt': 'decrypt-btn',
            'bulk-encrypt': 'bulk-encrypt-btn'
        };

        const colorMap = {
            'encrypt': 'ring-purple-500',
            'decrypt': 'ring-green-500',
            'bulk-encrypt': 'ring-cyan-500'
        };

        const selectedButton = document.getElementById(buttonMap[operation]);
        selectedButton.classList.add('ring-2', colorMap[operation]);
    }

    handleDragOver(e, type) {
        e.preventDefault();
        const dropZone = type === 'single' ? document.getElementById('single-drop-zone') : document.getElementById('bulk-drop-zone');
        const activeClass = type === 'single' ? 'drop-zone-active' : 'drop-zone-bulk-active';
        dropZone.classList.add(activeClass);
    }

    handleDragLeave(e, type) {
        e.preventDefault();
        const dropZone = type === 'single' ? document.getElementById('single-drop-zone') : document.getElementById('bulk-drop-zone');
        const activeClass = type === 'single' ? 'drop-zone-active' : 'drop-zone-bulk-active';
        dropZone.classList.remove(activeClass);
    }

    handleDrop(e, type) {
        e.preventDefault();
        const dropZone = type === 'single' ? document.getElementById('single-drop-zone') : document.getElementById('bulk-drop-zone');
        const activeClass = type === 'single' ? 'drop-zone-active' : 'drop-zone-bulk-active';
        dropZone.classList.remove(activeClass);
        
        const files = Array.from(e.dataTransfer.files);
        
        if (type === 'single') {
            this.validateAndSetSingleFile(files[0]);
        } else {
            this.validateAndSetBulkFiles(files);
        }
    }

    handleSingleFileSelect(e) {
        const file = e.target.files[0];
        this.validateAndSetSingleFile(file);
    }

    handleBulkFileSelect(e) {
        const files = Array.from(e.target.files);
        this.validateAndSetBulkFiles(files);
    }

    validateAndSetSingleFile(file) {
        if (!file) return;

        const validation = this.validateFile(file);
        if (!validation.valid) {
            this.showToast('error', 'Invalid File', validation.message);
            this.addInvalidFileEffect('single-drop-zone');
            return;
        }

        this.selectedFiles = [file];
        this.displaySingleFile(file);
        this.showPasswordSection();
        this.showToast('success', 'File Selected', `${file.name} is ready for processing`);
    }

    validateAndSetBulkFiles(files) {
        if (!files || files.length === 0) return;

        if (files.length > this.maxBulkFiles) {
            this.showToast('error', 'Too Many Files', `Maximum ${this.maxBulkFiles} files allowed for bulk processing`);
            this.addInvalidFileEffect('bulk-drop-zone');
            return;
        }

        const validFiles = [];
        const invalidFiles = [];

        files.forEach(file => {
            const validation = this.validateFile(file);
            if (validation.valid) {
                validFiles.push(file);
            } else {
                invalidFiles.push({ file, reason: validation.message });
            }
        });

        if (invalidFiles.length > 0) {
            const invalidCount = invalidFiles.length;
            const validCount = validFiles.length;
            
            if (validCount === 0) {
                this.showToast('error', 'No Valid Files', `All ${invalidCount} files are invalid. Please check file types and sizes.`);
                this.addInvalidFileEffect('bulk-drop-zone');
                return;
            } else {
                this.showToast('warning', 'Some Files Skipped', `${invalidCount} invalid files skipped. Processing ${validCount} valid files.`);
            }
        }

        this.selectedFiles = validFiles;
        this.displayBulkFiles(validFiles);
        this.showPasswordSection();
        this.showToast('success', 'Files Selected', `${validFiles.length} PDF files ready for bulk encryption`);
    }

    validateFile(file) {
        if (file.type !== 'application/pdf') {
            return { valid: false, message: 'Only PDF files are supported' };
        }

        if (file.size > this.maxSingleFileSize) {
            return { valid: false, message: `File size must be less than ${this.formatFileSize(this.maxSingleFileSize)}` };
        }

        if (file.size === 0) {
            return { valid: false, message: 'File appears to be empty' };
        }

        return { valid: true };
    }

    displaySingleFile(file) {
        const fileName = document.getElementById('single-file-name');
        const fileSize = document.getElementById('single-file-size');
        const fileDisplay = document.getElementById('single-file-display');
        const dropZone = document.getElementById('single-drop-zone');

        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);
        
        fileDisplay.classList.remove('hidden');
        dropZone.classList.add('hidden');
    }

    displayBulkFiles(files) {
        const filesCount = document.getElementById('bulk-files-count');
        const filesList = document.getElementById('bulk-files-list');
        const filesDisplay = document.getElementById('bulk-files-display');
        const dropZone = document.getElementById('bulk-drop-zone');

        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        filesCount.textContent = `${files.length} files selected • Total: ${this.formatFileSize(totalSize)}`;
        
        // Clear previous list
        filesList.innerHTML = '';
        
        // Add each file to the list
        files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-white font-medium truncate">${file.name}</p>
                        <p class="text-gray-400 text-sm">${this.formatFileSize(file.size)}</p>
                    </div>
                </div>
                <button class="remove-file-btn text-gray-400 hover:text-red-400 transition-colors p-1 rounded" data-index="${index}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            `;
            
            // Add remove functionality
            const removeBtn = fileItem.querySelector('.remove-file-btn');
            removeBtn.addEventListener('click', () => this.removeFileFromBulk(index));
            
            filesList.appendChild(fileItem);
        });
        
        filesDisplay.classList.remove('hidden');
        dropZone.classList.add('hidden');
    }

    removeFileFromBulk(index) {
        this.selectedFiles.splice(index, 1);
        
        if (this.selectedFiles.length === 0) {
            this.removeBulkFiles();
        } else {
            this.displayBulkFiles(this.selectedFiles);
            this.showToast('info', 'File Removed', `${this.selectedFiles.length} files remaining`);
        }
    }

    removeSingleFile() {
        this.selectedFiles = [];
        document.getElementById('single-file-input').value = '';
        document.getElementById('single-file-display').classList.add('hidden');
        document.getElementById('single-drop-zone').classList.remove('hidden');
        this.hidePasswordSection();
        this.showToast('info', 'File Removed', 'Select another file to continue');
    }

    removeBulkFiles() {
        this.selectedFiles = [];
        document.getElementById('bulk-file-input').value = '';
        document.getElementById('bulk-files-display').classList.add('hidden');
        document.getElementById('bulk-drop-zone').classList.remove('hidden');
        this.hidePasswordSection();
        this.showToast('info', 'Files Removed', 'Select files to continue');
    }

    showPasswordSection() {
        document.getElementById('password-section').classList.remove('hidden');
        document.getElementById('process-btn').classList.remove('hidden');
        
        // Update process button text based on operation
        const processBtn = document.getElementById('process-btn-text');
        const operationText = {
            'encrypt': 'Encrypt PDF',
            'decrypt': 'Decrypt PDF',
            'bulk-encrypt': 'Encrypt All PDFs'
        };
        processBtn.textContent = operationText[this.currentOperation] || 'Process Files';
        
        // Focus on password input
        setTimeout(() => {
            document.getElementById('password').focus();
        }, 200);
    }

    hidePasswordSection() {
        document.getElementById('password-section').classList.add('hidden');
        document.getElementById('process-btn').classList.add('hidden');
        document.getElementById('reset-btn').classList.add('hidden');
        document.getElementById('progress-section').classList.add('hidden');
        document.getElementById('password').value = '';
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const eyeClosed = document.getElementById('eye-closed');
        const eyeOpen = document.getElementById('eye-open');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeClosed.classList.add('hidden');
            eyeOpen.classList.remove('hidden');
        } else {
            passwordInput.type = 'password';
            eyeClosed.classList.remove('hidden');
            eyeOpen.classList.add('hidden');
        }
    }

    async processFiles() {
        const password = document.getElementById('password').value.trim();
        
        if (this.selectedFiles.length === 0) {
            this.showToast('error', 'No Files Selected', 'Please select PDF files first');
            return;
        }

        if (!password) {
            this.showToast('error', 'Password Required', 'Please enter a password for encryption/decryption');
            document.getElementById('password').focus();
            return;
        }


        this.setLoadingState(true);
        this.showProgressSection();
        
        try {
            if (this.currentOperation === 'bulk-encrypt') {
                await this.processBulkFiles(password);
            } else {
                await this.processSingleFile(password);
            }
        } catch (error) {
            console.error('Processing error:', error);
            this.showToast('error', 'Processing Failed', error.message || 'An unexpected error occurred during processing');
            this.setLoadingState(false);
            this.hideProgressSection();
        }
    }

    async processSingleFile(password) {
        const formData = new FormData();
        formData.append('test', this.selectedFiles[0]);

        const endpoint = this.currentOperation === 'encrypt' 
            ? '/api/v1/upload/encrypt' 
            : '/api/v1/upload/decrypt';

        this.updateProgress(25, 'Uploading file to server...');

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'x-password': password
            },
            body: formData
        });

        this.updateProgress(75, 'Processing file...');

        if (!response.ok) {
            if (response.status === 400) {
                try {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Processing failed');
                } catch (parseError) {
                    throw new Error('Invalid server response');
                }
            }
            throw new Error(`Server error: ${response.status} - ${response.statusText}`);
        }

        this.updateProgress(90, 'Preparing download...');

        // Handle file download with validation
        const blob = await response.blob();
        
        // Validate response content
        if (!this.validateResponseBlob(blob, 'pdf')) {
            throw new Error('Invalid Password');
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        const originalName = this.selectedFiles[0].name.replace('.pdf', '');
        const suffix = this.currentOperation === 'encrypt' ? '_encrypted' : '_decrypted';
        
        a.href = url;
        a.download = `${originalName}${suffix}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        this.updateProgress(100, 'Complete!');

        const successMessage = this.currentOperation === 'encrypt' 
            ? 'PDF encrypted successfully! Download started.'
            : 'PDF decrypted successfully! Download started.';

        this.showToast('success', 'Success!', successMessage);
        this.setLoadingState(false);
        this.showResetButton();
    }

    async processBulkFiles(password) {
        const formData = new FormData();
        
        // Append all files with the 'test' field name
        this.selectedFiles.forEach(file => {
            formData.append('test', file);
        });

        this.updateProgress(20, `Uploading ${this.selectedFiles.length} files to server...`);

        const response = await fetch('/api/v1/upload/bulk/encrypt', {
            method: 'POST',
            headers: {
                'x-password': password
            },
            body: formData
        });

        this.updateProgress(60, 'Processing all files...');

        if (!response.ok) {
            if (response.status === 400) {
                try {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Bulk processing failed');
                } catch (parseError) {
                    throw new Error('Invalid server response');
                }
            }
            throw new Error(`Server error: ${response.status} - ${response.statusText}`);
        }

        this.updateProgress(85, 'Preparing ZIP download...');

        // Handle ZIP file download with validation
        const blob = await response.blob();
        
        // Validate response content
        if (!this.validateResponseBlob(blob, 'zip')) {
            throw new Error('Server returned invalid ZIP file or error response');
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        a.href = url;
        a.download = `encrypted_pdfs_${timestamp}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        this.updateProgress(100, 'Complete!');

        this.showToast('success', 'Bulk Encryption Complete!', `${this.selectedFiles.length} PDFs encrypted and downloaded as ZIP file`);
        this.setLoadingState(false);
        this.showResetButton();
    }

    validateResponseBlob(blob, expectedType) {
        // Check if blob is empty
        if (!blob || blob.size === 0) {
            console.error('Received empty blob from server');
            return false;
        }

        // Check content type
        const contentType = blob.type.toLowerCase();
        
        if (expectedType === 'pdf') {
            // Valid PDF content types
            const validPdfTypes = ['application/pdf'];
            if (!validPdfTypes.includes(contentType)) {
                console.error('Invalid content type for PDF:', contentType);
                // Try to check if it's a JSON error response
                this.checkForJsonError(blob);
                return false;
            }
        } else if (expectedType === 'zip') {
            // Valid ZIP content types
            const validZipTypes = ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'];
            if (!validZipTypes.includes(contentType)) {
                console.error('Invalid content type for ZIP:', contentType);
                // Try to check if it's a JSON error response
                this.checkForJsonError(blob);
                return false;
            }
        }

        return true;
    }

    async checkForJsonError(blob) {
        try {
            const text = await blob.text();
            const errorData = JSON.parse(text);
            if (errorData.message) {
                throw new Error(errorData.message);
            }
        } catch (parseError) {
            // If it's not JSON, it might be some other error format
            console.error('Server returned unexpected content type and format');
        }
    }

    addInvalidFileEffect(elementId) {
        const element = document.getElementById(elementId);
        element.classList.add('drop-zone-invalid');
        setTimeout(() => {
            element.classList.remove('drop-zone-invalid');
        }, 1000);
    }

    showProgressSection() {
        document.getElementById('progress-section').classList.remove('hidden');
        this.updateProgress(0, 'Initializing...');
    }

    hideProgressSection() {
        document.getElementById('progress-section').classList.add('hidden');
    }

    updateProgress(percentage, text) {
        const progressBar = document.getElementById('progress-bar');
        const progressPercentage = document.getElementById('progress-percentage');
        const progressText = document.getElementById('progress-text');

        progressBar.style.width = `${percentage}%`;
        progressPercentage.textContent = `${percentage}%`;
        progressText.textContent = text;
    }

    setLoadingState(loading) {
        const processBtn = document.getElementById('process-btn');
        const btnText = document.getElementById('process-btn-text');
        const btnLoader = document.getElementById('process-btn-loader');
        const loaderText = document.getElementById('process-btn-loader-text');

        if (loading) {
            processBtn.disabled = true;
            processBtn.classList.add('btn-loading');
            btnText.classList.add('hidden');
            btnLoader.classList.remove('hidden');
            
            // Update loader text based on operation
            const loaderTexts = {
                'encrypt': 'Encrypting...',
                'decrypt': 'Decrypting...',
                'bulk-encrypt': 'Bulk Encrypting...'
            };
            loaderText.textContent = loaderTexts[this.currentOperation] || 'Processing...';
        } else {
            processBtn.disabled = false;
            processBtn.classList.remove('btn-loading');
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
        }
    }

    showResetButton() {
        document.getElementById('reset-btn').classList.remove('hidden');
    }

    reset() {
        this.currentOperation = null;
        this.selectedFiles = [];
        
        // Reset UI
        document.getElementById('interface-title').textContent = 'Select Operation';
        document.getElementById('interface-subtitle').textContent = 'Choose an operation to secure your PDF documents';
        
        // Hide all sections
        document.getElementById('single-drop-zone').classList.add('hidden');
        document.getElementById('bulk-drop-zone').classList.add('hidden');
        document.getElementById('single-file-display').classList.add('hidden');
        document.getElementById('bulk-files-display').classList.add('hidden');
        this.hidePasswordSection();
        
        // Clear inputs
        document.getElementById('single-file-input').value = '';
        document.getElementById('bulk-file-input').value = '';
        
        // Remove operation highlights
        document.querySelectorAll('.operation-card').forEach(card => {
            card.classList.remove('ring-2', 'ring-purple-500', 'ring-green-500', 'ring-cyan-500');
        });
        
        this.showToast('info', 'Reset Complete', 'Select an operation to start over');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showToast(type, title, message, duration = 5000) {
        const toastContainer = document.getElementById('toast-container');
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type} toast-enter`;
        
        // Create unique ID for this toast
        const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        toast.id = toastId;
        
        // Create toast content
        toast.innerHTML = `
            <div class="toast-icon">
                ${this.getToastIcon(type)}
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
            <div class="toast-progress"></div>
        `;

        // Add to container
        toastContainer.appendChild(toast);

        // Show toast with animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Close button functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.removeToast(toast);
        });

        // Auto remove after duration
        const autoRemoveTimer = setTimeout(() => {
            this.removeToast(toast);
        }, duration);

        // Store timer on toast for potential early removal
        toast.autoRemoveTimer = autoRemoveTimer;

        // Limit number of toasts
        const toasts = toastContainer.querySelectorAll('.toast');
        if (toasts.length > 5) {
            this.removeToast(toasts[0]);
        }

        // Add click to dismiss functionality
        toast.addEventListener('click', (e) => {
            if (e.target !== closeBtn && !closeBtn.contains(e.target)) {
                this.removeToast(toast);
            }
        });
    }

    removeToast(toast) {
        if (toast && toast.parentNode) {
            // Clear auto-remove timer if it exists
            if (toast.autoRemoveTimer) {
                clearTimeout(toast.autoRemoveTimer);
            }
            
            toast.classList.remove('show');
            toast.classList.add('toast-exit');
            
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    getToastIcon(type) {
        const icons = {
            success: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
                      </svg>`,
            error: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
                   </svg>`,
            warning: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                     </svg>`,
            info: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>`
        };
        return icons[type] || icons.info;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new PDFCryptoPro();
});

// Add some global utility functions for enhanced UX
window.addEventListener('beforeunload', (e) => {
    const app = window.pdfCryptoApp;
    if (app && app.selectedFiles && app.selectedFiles.length > 0) {
        e.preventDefault();
        e.returnValue = 'You have selected files. Are you sure you want to leave?';
    }
});

// Store app instance globally for potential debugging
// document.addEventListener('DOMContentLoaded', () => {
//     window.pdfCryptoApp = new PDFCryptoPro();
// });