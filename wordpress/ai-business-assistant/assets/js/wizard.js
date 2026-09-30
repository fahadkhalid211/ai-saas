/**
 * Crescelo Onboarding Wizard Client Logic
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        var data = window.CresceloWizardData || {};
        var currentStep = 1;
        var scanData = null;
        var assistantId = data.currentAssistantId || '';

        // Elements
        var stepItems = document.querySelectorAll('.step-item');
        var panes = document.querySelectorAll('.wizard-pane');

        function goToStep(step) {
            currentStep = step;
            stepItems.forEach(function (el) {
                var s = parseInt(el.getAttribute('data-step'), 10);
                el.classList.remove('active', 'completed');
                if (s === step) el.classList.add('active');
                else if (s < step) el.classList.add('completed');
            });

            panes.forEach(function (p) {
                p.classList.remove('active');
            });
            var targetPane = document.getElementById('pane-step-' + step);
            if (targetPane) targetPane.classList.add('active');
        }

        // Selection Cards highlight
        document.querySelectorAll('.selection-card').forEach(function (card) {
            card.addEventListener('click', function () {
                var radio = card.querySelector('input[type="radio"]');
                if (radio) {
                    var name = radio.getAttribute('name');
                    document.querySelectorAll('input[name="' + name + '"]').forEach(function (r) {
                        r.closest('.selection-card').classList.remove('selected');
                    });
                    radio.checked = true;
                    card.classList.add('selected');
                }
            });
        });

        // Navigation Back Buttons
        document.querySelectorAll('.btn-back').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var goto = parseInt(btn.getAttribute('data-goto'), 10);
                if (goto) goToStep(goto);
            });
        });

        // ================= STEP 1 -> STEP 2: SCAN =================
        var btnToStep2 = document.getElementById('btn-to-step-2');
        if (btnToStep2) {
            btnToStep2.addEventListener('click', function () {
                goToStep(2);
                runSiteScan();
            });
        }

        function runSiteScan() {
            var statusText = document.getElementById('scanner-status-text');
            var metrics = document.getElementById('discovery-metrics');
            var nextBtn = document.getElementById('btn-to-step-3');

            statusText.textContent = 'Inspecting WordPress database and WooCommerce catalog...';

            var formData = new FormData();
            formData.append('action', 'crescelo_wizard_scan');
            formData.append('nonce', data.nonce);

            fetch(data.ajaxUrl, {
                method: 'POST',
                body: formData
            })
            .then(function (res) { return res.json(); })
            .then(function (response) {
                if (!response.success) {
                    statusText.textContent = 'Scan encountered an issue: ' + (response.data?.error || 'Unknown error');
                    return;
                }

                scanData = response.data;
                statusText.textContent = 'Scan complete! Reviewing discovered catalog and content.';

                // Update metric counters
                document.getElementById('metric-pages').textContent = scanData.pages?.count || 0;
                document.getElementById('metric-products').textContent = scanData.woocommerce?.total_products || 0;
                document.getElementById('metric-categories').textContent = scanData.woocommerce?.categories?.length || 0;
                document.getElementById('metric-docs').textContent = scanData.documents?.count || 0;

                metrics.style.display = 'grid';
                nextBtn.disabled = false;

                // Pre-populate Step 3 lists
                populateStep3(scanData);
            })
            .catch(function (err) {
                statusText.textContent = 'Failed to connect to database: ' + err.message;
            });
        }

        var btnToStep3 = document.getElementById('btn-to-step-3');
        if (btnToStep3) {
            btnToStep3.addEventListener('click', function () {
                goToStep(3);
            });
        }

        // ================= STEP 3: CURATE & POPULATE =================
        function populateStep3(scan) {
            // Products
            var prodGroup = document.getElementById('group-products');
            var prodLabel = document.getElementById('count-products-label');
            var prodCatsContainer = document.getElementById('items-product-categories');
            prodCatsContainer.innerHTML = '';

            if (scan.woocommerce?.active && scan.woocommerce.total_products > 0) {
                prodLabel.textContent = scan.woocommerce.total_products;
                if (scan.woocommerce.categories && scan.woocommerce.categories.length > 0) {
                    scan.woocommerce.categories.forEach(function (cat) {
                        var lbl = document.createElement('label');
                        lbl.innerHTML = '<input type="checkbox" class="cat-item-check" data-cat-id="' + cat.id + '" checked /> ' +
                            escapeHtml(cat.name) + ' (' + cat.count + ' items)';
                        prodCatsContainer.appendChild(lbl);
                    });
                } else {
                    prodCatsContainer.innerHTML = '<div style="color:#64748b;">All published products selected.</div>';
                }
            } else {
                prodGroup.style.display = 'none';
            }

            // Pages
            var pagesLabel = document.getElementById('count-pages-label');
            var pagesList = document.getElementById('items-pages-list');
            pagesList.innerHTML = '';
            pagesLabel.textContent = scan.pages?.count || 0;

            if (scan.pages?.samples && scan.pages.samples.length > 0) {
                scan.pages.samples.forEach(function (p) {
                    var lbl = document.createElement('label');
                    lbl.innerHTML = '<input type="checkbox" class="page-item-check" value="' + p.id + '" checked /> ' +
                        escapeHtml(p.title || p.slug);
                    pagesList.appendChild(lbl);
                });
            } else {
                pagesList.innerHTML = '<div style="color:#64748b;">No published pages found.</div>';
            }

            // Documents
            var docsGroup = document.getElementById('group-docs');
            var docsLabel = document.getElementById('count-docs-label');
            var docsList = document.getElementById('items-docs-list');
            docsList.innerHTML = '';

            if (scan.documents?.count > 0) {
                docsLabel.textContent = scan.documents.count;
                scan.documents.samples.forEach(function (d) {
                    var lbl = document.createElement('label');
                    lbl.innerHTML = '<input type="checkbox" class="doc-item-check" value="' + d.id + '" checked /> ' +
                        escapeHtml(d.title);
                    docsList.appendChild(lbl);
                });
            } else {
                docsGroup.style.display = 'none';
            }
        }

        // ================= STEP 4: REGISTRATION & ASYNC BATCH SYNC =================
        var btnStartSync = document.getElementById('btn-start-sync');
        if (btnStartSync) {
            btnStartSync.addEventListener('click', function () {
                goToStep(4);
                startAssistantRegistrationAndSync();
            });
        }

        function appendLog(text, level) {
            var log = document.getElementById('sync-terminal-log');
            var line = document.createElement('div');
            line.className = 'log-line ' + (level || 'info');
            line.textContent = text;
            log.appendChild(line);
            log.scrollTop = log.scrollHeight;
        }

        function updateProgress(percent, label) {
            var fill = document.getElementById('sync-progress-fill');
            var percLabel = document.getElementById('sync-percent-label');
            var statLabel = document.getElementById('sync-status-label');

            fill.style.width = percent + '%';
            percLabel.textContent = Math.round(percent) + '%';
            if (label) statLabel.textContent = label;
        }

        function startAssistantRegistrationAndSync() {
            var websiteType = document.querySelector('input[name="website_type"]:checked')?.value || 'woocommerce';
            var objective = document.querySelector('input[name="objective"]:checked')?.value || 'sales';
            var hostUrl = document.getElementById('crescelo-host-url')?.value || 'http://localhost:3000';
            var apiKey = document.getElementById('crescelo-api-key')?.value || '';

            var features = [];
            if (document.getElementById('feat-add-to-cart')?.checked) features.push('add_to_cart');
            if (document.getElementById('feat-live-stock')?.checked) features.push('live_stock');
            if (document.getElementById('feat-comparison')?.checked) features.push('comparison');
            if (document.getElementById('feat-booking')?.checked) features.push('booking');
            if (document.getElementById('feat-lead-capture')?.checked) features.push('lead_capture');

            appendLog('[AUTH] Connecting to Crescelo SaaS engine at ' + hostUrl + '...', 'info');
            updateProgress(10, 'Registering AI Assistant...');

            var regData = new FormData();
            regData.append('action', 'crescelo_wizard_register');
            regData.append('nonce', data.nonce);
            regData.append('website_type', websiteType);
            regData.append('objective', objective);
            regData.append('host_url', hostUrl);
            regData.append('api_key', apiKey);
            features.forEach(function (f) { regData.append('features[]', f); });

            fetch(data.ajaxUrl, { method: 'POST', body: regData })
            .then(function (res) { return res.json(); })
            .then(function (res) {
                if (!res.success) {
                    appendLog('[ERROR] Registration failed: ' + (res.data?.error || 'Unknown error'), 'error');
                    return;
                }

                assistantId = res.data.assistantId;
                appendLog('[SUCCESS] Assistant provisioned: ' + assistantId + ' (' + res.data.assistantName + ')', 'success');
                updateProgress(25, 'Beginning content batch synchronization...');

                // Run batch synchronization sequence
                runSyncSequence();
            })
            .catch(function (err) {
                appendLog('[ERROR] Connection exception: ' + err.message, 'error');
            });
        }

        function runSyncSequence() {
            var queue = [];

            // 1. Sync WooCommerce products if enabled
            if (document.getElementById('check-all-products')?.checked && scanData?.woocommerce?.total_products > 0) {
                queue.push({ type: 'products', total: scanData.woocommerce.total_products, limit: 15 });
            }

            // 2. Sync Pages
            if (document.getElementById('check-all-pages')?.checked && scanData?.pages?.count > 0) {
                queue.push({ type: 'pages', total: scanData.pages.count, limit: 15 });
            }

            // 3. Sync Documents
            if (document.getElementById('check-all-docs')?.checked && scanData?.documents?.count > 0) {
                queue.push({ type: 'documents', total: scanData.documents.count, limit: 15 });
            }

            var currentQueueIdx = 0;

            function processNextQueueItem() {
                if (currentQueueIdx >= queue.length) {
                    // All finished!
                    updateProgress(100, 'Training complete!');
                    appendLog('[DONE] All selected content indexed and vectorized successfully.', 'success');
                    document.getElementById('btn-to-step-5').disabled = false;
                    return;
                }

                var qItem = queue[currentQueueIdx];
                var offset = 0;

                function sendBatch() {
                    appendLog('[SYNC] Indexing ' + qItem.type + ' (batch starting at ' + offset + ')...', 'info');

                    var batchData = new FormData();
                    batchData.append('action', 'crescelo_wizard_sync_batch');
                    batchData.append('nonce', data.nonce);
                    batchData.append('batch_type', qItem.type);
                    batchData.append('offset', offset);
                    batchData.append('limit', qItem.limit);

                    fetch(data.ajaxUrl, { method: 'POST', body: batchData })
                    .then(function (r) { return r.json(); })
                    .then(function (resp) {
                        if (!resp.success) {
                            appendLog('[WARN] Batch notice: ' + (resp.data?.error || 'Retrying...'), 'warn');
                        } else {
                            var processed = resp.data.processedCount || 0;
                            var chunks = resp.data.totalChunks || 0;
                            appendLog('[CHUNK] Generated & stored ' + chunks + ' embeddings for ' + processed + ' ' + qItem.type + '.', 'success');

                            var estProgress = 25 + Math.min(70, Math.round(((offset + processed) / Math.max(1, qItem.total)) * 70));
                            updateProgress(estProgress, 'Indexing ' + qItem.type + '...');

                            if (resp.data.hasMore && resp.data.nextOffset) {
                                offset = resp.data.nextOffset;
                                sendBatch();
                                return;
                            }
                        }

                        // Next in queue
                        currentQueueIdx++;
                        processNextQueueItem();
                    })
                    .catch(function (e) {
                        appendLog('[WARN] Batch communication glitch: ' + e.message, 'warn');
                        currentQueueIdx++;
                        processNextQueueItem();
                    });
                }

                sendBatch();
            }

            processNextQueueItem();
        }

        // ================= STEP 5: FINALIZE =================
        var btnToStep5 = document.getElementById('btn-to-step-5');
        if (btnToStep5) {
            btnToStep5.addEventListener('click', function () {
                goToStep(5);
                document.getElementById('display-assistant-id').textContent = assistantId;

                var finData = new FormData();
                finData.append('action', 'crescelo_wizard_finish');
                finData.append('nonce', data.nonce);

                fetch(data.ajaxUrl, { method: 'POST', body: finData });
            });
        }

        var btnFinishAll = document.getElementById('btn-finish-all');
        if (btnFinishAll) {
            btnFinishAll.addEventListener('click', function () {
                window.location.reload();
            });
        }

        var btnReRun = document.getElementById('btn-re-run-wizard');
        if (btnReRun) {
            btnReRun.addEventListener('click', function () {
                goToStep(1);
            });
        }

        function escapeHtml(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }
    });
})();
