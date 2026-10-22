/**
 * Crescelo Onboarding Wizard & Website Scraper Client Logic
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        var data = window.CresceloWizardData || {};
        var currentStep = 1;
        var scanData = null;
        var assistantId = data.currentAssistantId || '';
        var activeScraperAborted = false;

        // Elements for Wizard
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

            if (!statusText) return;

            statusText.textContent = 'Discovering registered post types, content, and WooCommerce catalog...';

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
                statusText.textContent = 'Scan complete! Reviewing discovered post types and content.';

                // Update metric counters dynamically
                if (metrics) {
                    var pagesCount = scanData.pages?.count || 0;
                    var postsCount = scanData.posts?.count || 0;
                    var prodCount  = scanData.woocommerce?.total_products || (scanData.post_types?.product?.count || 0);
                    var docsCount  = scanData.documents?.count || 0;

                    var pagesEl = document.getElementById('metric-pages');
                    if (pagesEl) pagesEl.textContent = pagesCount;

                    var postsEl = document.getElementById('metric-posts');
                    if (postsEl) postsEl.textContent = postsCount;

                    var prodEl = document.getElementById('metric-products');
                    if (prodEl) prodEl.textContent = prodCount;

                    var docsEl = document.getElementById('metric-docs');
                    if (docsEl) docsEl.textContent = docsCount;

                    // If WooCommerce is not active, hide products card or show 0
                    var prodCard = document.getElementById('metric-card-products');
                    if (prodCard && !scanData.woocommerce?.active && prodCount === 0) {
                        prodCard.style.display = 'none';
                    }

                    metrics.style.display = 'grid';
                }

                if (nextBtn) nextBtn.disabled = false;

                // Pre-populate Step 3 lists with discovered post types
                populateStep3(scanData);
            })
            .catch(function (err) {
                if (statusText) statusText.textContent = 'Failed to connect to database: ' + err.message;
            });
        }

        var btnToStep3 = document.getElementById('btn-to-step-3');
        if (btnToStep3) {
            btnToStep3.addEventListener('click', function () {
                goToStep(3);
            });
        }

        // ================= STEP 3: DYNAMIC POST TYPES CURATION =================
        function populateStep3(scan) {
            var container = document.getElementById('dynamic-post-types-curate');
            if (!container) return;
            container.innerHTML = '';

            var postTypes = scan.post_types || {};
            var allowed = scan.allowed_post_types || ['page', 'post', 'product'];
            var totalSelectedCount = 0;

            Object.keys(postTypes).forEach(function (slug) {
                var pt = postTypes[slug];
                var isChecked = allowed.indexOf(slug) !== -1;
                if (isChecked) totalSelectedCount += (pt.count || 0);

                var groupDiv = document.createElement('div');
                groupDiv.className = 'content-group';
                groupDiv.id = 'group-pt-' + slug;

                var headerHtml = '<label class="group-header">' +
                    '<input type="checkbox" class="pt-group-check" data-slug="' + escapeHtml(slug) + '" ' + (isChecked ? 'checked' : '') + ' /> ' +
                    '<strong>' + escapeHtml(pt.label) + ' (<span class="pt-count">' + (pt.count || 0) + '</span> items)</strong>' +
                    '</label>';

                var itemsHtml = '<div class="group-items" id="items-pt-' + escapeHtml(slug) + '">';

                // If this is WooCommerce and categories exist
                if (slug === 'product' && scan.woocommerce?.categories?.length > 0) {
                    scan.woocommerce.categories.forEach(function (cat) {
                        itemsHtml += '<label><input type="checkbox" class="cat-item-check" data-cat-id="' + cat.id + '" checked /> ' +
                            escapeHtml(cat.name) + ' (' + (cat.count || 0) + ' products)</label>';
                    });
                } else if (pt.samples && pt.samples.length > 0) {
                    pt.samples.forEach(function (item) {
                        itemsHtml += '<label><input type="checkbox" class="item-check" value="' + item.id + '" checked /> ' +
                            escapeHtml(item.title) + '</label>';
                    });
                } else {
                    itemsHtml += '<div style="color:#64748b; font-size:12px;">No items published yet.</div>';
                }
                itemsHtml += '</div>';

                groupDiv.innerHTML = headerHtml + itemsHtml;
                container.appendChild(groupDiv);

                // Add toggle event for parent checkbox
                var groupCheck = groupDiv.querySelector('.pt-group-check');
                groupCheck.addEventListener('change', function () {
                    var checked = this.checked;
                    groupDiv.querySelectorAll('.group-items input[type="checkbox"]').forEach(function (c) {
                        c.checked = checked;
                    });
                    updateCurateSummary();
                });
            });

            // Documents Group
            var docsGroup = document.getElementById('group-docs');
            var docsLabel = document.getElementById('count-docs-label');
            var docsList  = document.getElementById('items-docs-list');

            if (docsGroup && docsList) {
                var docCount = parseInt(scan.documents?.count, 10) || 0;
                if (docCount > 0) {
                    if (docsLabel) docsLabel.textContent = docCount;
                    docsList.innerHTML = '';
                    scan.documents.samples.forEach(function (d) {
                        var lbl = document.createElement('label');
                        lbl.innerHTML = '<input type="checkbox" class="doc-item-check" value="' + d.id + '" checked /> ' +
                            escapeHtml(d.title);
                        docsList.appendChild(lbl);
                    });
                    docsGroup.style.display = 'block';
                } else {
                    docsGroup.style.display = 'none';
                }
            }

            updateCurateSummary();
        }

        function updateCurateSummary() {
            var summaryEl = document.getElementById('curate-selection-count');
            if (!summaryEl) return;

            var total = 0;
            var checkedGroups = document.querySelectorAll('#dynamic-post-types-curate .pt-group-check:checked');
            checkedGroups.forEach(function (cb) {
                var slug = cb.getAttribute('data-slug');
                if (scanData?.post_types && scanData.post_types[slug]) {
                    total += (scanData.post_types[slug].count || 0);
                }
            });

            summaryEl.textContent = total + ' items ready to scrape';
        }

        // ================= STEP 4: REGISTRATION & ASYNC BATCH SYNC =================
        var btnStartSync = document.getElementById('btn-start-sync');
        if (btnStartSync) {
            btnStartSync.addEventListener('click', function () {
                goToStep(4);
                startAssistantRegistrationAndSync();
            });
        }

        function appendLog(elementId, text, level) {
            var log = document.getElementById(elementId);
            if (!log) return;
            var line = document.createElement('div');
            line.className = 'log-line ' + (level || 'info');
            line.textContent = text;
            log.appendChild(line);
            log.scrollTop = log.scrollHeight;
        }

        function updateProgress(fillId, percId, statId, percent, label) {
            var fill = document.getElementById(fillId);
            var perc = document.getElementById(percId);
            var stat = document.getElementById(statId);

            if (fill) fill.style.width = percent + '%';
            if (perc) perc.textContent = Math.round(percent) + '%';
            if (stat && label) stat.textContent = label;
        }

        function startAssistantRegistrationAndSync() {
            var websiteType = document.querySelector('input[name="website_type"]:checked')?.value || 'woocommerce';
            var objective = document.querySelector('input[name="objective"]:checked')?.value || 'sales';
            var hostUrl = document.getElementById('crescelo-host-url')?.value || 'https://www.crescelo.com';
            var apiKey = document.getElementById('crescelo-api-key')?.value || '';

            var features = [];
            if (document.getElementById('feat-add-to-cart')?.checked) features.push('add_to_cart');
            if (document.getElementById('feat-live-stock')?.checked) features.push('live_stock');
            if (document.getElementById('feat-comparison')?.checked) features.push('comparison');
            if (document.getElementById('feat-booking')?.checked) features.push('booking');
            if (document.getElementById('feat-lead-capture')?.checked) features.push('lead_capture');

            // Collect selected post types
            var selectedPostTypes = [];
            document.querySelectorAll('#dynamic-post-types-curate .pt-group-check:checked').forEach(function (cb) {
                selectedPostTypes.push(cb.getAttribute('data-slug'));
            });

            appendLog('sync-terminal-log', '[AUTH] Connecting to Crescelo SaaS engine at ' + hostUrl + '...', 'info');
            updateProgress('sync-progress-fill', 'sync-percent-label', 'sync-status-label', 10, 'Registering AI Assistant...');

            // Save post types selection first
            savePostTypesSelection(selectedPostTypes);

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
                    appendLog('sync-terminal-log', '[ERROR] Registration failed: ' + (res.data?.error || 'Unknown error'), 'error');
                    return;
                }

                assistantId = res.data.assistantId;
                appendLog('sync-terminal-log', '[SUCCESS] Assistant provisioned: ' + assistantId + ' (' + res.data.assistantName + ')', 'success');
                updateProgress('sync-progress-fill', 'sync-percent-label', 'sync-status-label', 25, 'Beginning content batch synchronization...');

                // Run batch synchronization sequence across selected post types
                runWizardSyncSequence(selectedPostTypes);
            })
            .catch(function (err) {
                appendLog('sync-terminal-log', '[ERROR] Connection exception: ' + err.message, 'error');
            });
        }

        function savePostTypesSelection(postTypesList) {
            var fd = new FormData();
            fd.append('action', 'crescelo_save_post_types');
            fd.append('nonce', data.nonce);
            postTypesList.forEach(function (slug) {
                fd.append('allowed_post_types[]', slug);
            });
            fetch(data.ajaxUrl, { method: 'POST', body: fd });
        }

        function runWizardSyncSequence(selectedTypes) {
            var queue = [];
            var batchLimit = data.batchSize || 15;

            selectedTypes.forEach(function (slug) {
                var total = scanData?.post_types && scanData.post_types[slug] ? scanData.post_types[slug].count : 15;
                if (total > 0) {
                    queue.push({
                        type: slug,
                        total: total,
                        limit: batchLimit
                    });
                }
            });

            // Media documents if selected
            if (document.getElementById('check-all-docs')?.checked && scanData?.documents?.count > 0) {
                queue.push({
                    type: 'documents',
                    total: scanData.documents.count,
                    limit: batchLimit
                });
            }

            if (queue.length === 0) {
                appendLog('sync-terminal-log', '[NOTICE] No content types selected with published posts.', 'warn');
                updateProgress('sync-progress-fill', 'sync-percent-label', 'sync-status-label', 100, 'Training complete.');
                document.getElementById('btn-to-step-5').disabled = false;
                return;
            }

            var currentQueueIdx = 0;
            var totalItemsSynced = 0;
            var totalChunksSynced = 0;

            function processNextQueueItem() {
                if (currentQueueIdx >= queue.length) {
                    // All finished!
                    updateProgress('sync-progress-fill', 'sync-percent-label', 'sync-status-label', 100, 'Training complete!');
                    appendLog('sync-terminal-log', '[DONE] Whole website scraped! Indexed ' + totalItemsSynced + ' items and generated ' + totalChunksSynced + ' Knowledge Base chunks.', 'success');
                    
                    // Record scrape complete
                    recordScrapeComplete(totalItemsSynced, totalChunksSynced, selectedTypes);

                    document.getElementById('btn-to-step-5').disabled = false;
                    return;
                }

                var qItem = queue[currentQueueIdx];
                var offset = 0;

                function sendBatch() {
                    appendLog('sync-terminal-log', '[SYNC] Scraping ' + qItem.type + ' (batch from offset ' + offset + ')...', 'info');

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
                            appendLog('sync-terminal-log', '[WARN] Batch notice: ' + (resp.data?.error || 'Retrying...'), 'warn');
                        } else {
                            var processed = resp.data.processedCount || 0;
                            var chunks = resp.data.totalChunks || 0;
                            totalItemsSynced += processed;
                            totalChunksSynced += chunks;

                            appendLog('sync-terminal-log', '[CHUNK] Stored ' + chunks + ' embeddings for ' + processed + ' ' + qItem.type + '.', 'success');

                            var baseProg = 25 + Math.round((currentQueueIdx / queue.length) * 70);
                            updateProgress('sync-progress-fill', 'sync-percent-label', 'sync-status-label', baseProg, 'Scraping ' + qItem.type + '...');

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
                        appendLog('sync-terminal-log', '[WARN] Communication error: ' + e.message, 'warn');
                        currentQueueIdx++;
                        processNextQueueItem();
                    });
                }

                sendBatch();
            }

            processNextQueueItem();
        }

        function recordScrapeComplete(items, chunks, postTypes) {
            var fd = new FormData();
            fd.append('action', 'crescelo_record_scrape_complete');
            fd.append('nonce', data.nonce);
            fd.append('total_items', items);
            fd.append('total_chunks', chunks);
            if (postTypes) {
                postTypes.forEach(function (pt) { fd.append('scraped_post_types[]', pt); });
            }
            fetch(data.ajaxUrl, { method: 'POST', body: fd });
        }

        // ================= STEP 5: FINALIZE =================
        var btnToStep5 = document.getElementById('btn-to-step-5');
        if (btnToStep5) {
            btnToStep5.addEventListener('click', function () {
                goToStep(5);
                var astDisplay = document.getElementById('display-assistant-id');
                if (astDisplay) astDisplay.textContent = assistantId;

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

        // ================= ADMIN SETTINGS: POST TYPE SELECTION & STANDALONE SCRAPER =================
        var ptCards = document.querySelectorAll('.post-type-card');
        ptCards.forEach(function (card) {
            card.addEventListener('click', function (e) {
                if (e.target.tagName !== 'INPUT') {
                    var cb = card.querySelector('.pt-checkbox');
                    if (cb) {
                        cb.checked = !cb.checked;
                        cb.dispatchEvent(new Event('change'));
                    }
                }
            });

            var checkbox = card.querySelector('.pt-checkbox');
            if (checkbox) {
                checkbox.addEventListener('change', function () {
                    if (this.checked) {
                        card.classList.add('selected');
                    } else {
                        card.classList.remove('selected');
                    }
                    updateSelectedPostTypesCount();
                });
            }
        });

        function updateSelectedPostTypesCount() {
            var totalChecked = document.querySelectorAll('.pt-checkbox:checked').length;
            var indicator = document.getElementById('total-selected-indicator');
            if (indicator) {
                indicator.textContent = totalChecked + ' types allowed';
            }
        }

        // Quick Actions in Settings
        var btnSelectAll = document.getElementById('action-select-all-pts');
        if (btnSelectAll) {
            btnSelectAll.addEventListener('click', function () {
                document.querySelectorAll('.pt-checkbox').forEach(function (cb) {
                    cb.checked = true;
                    cb.closest('.post-type-card')?.classList.add('selected');
                });
                updateSelectedPostTypesCount();
            });
        }

        var btnDeselectAll = document.getElementById('action-deselect-all-pts');
        if (btnDeselectAll) {
            btnDeselectAll.addEventListener('click', function () {
                document.querySelectorAll('.pt-checkbox').forEach(function (cb) {
                    cb.checked = false;
                    cb.closest('.post-type-card')?.classList.remove('selected');
                });
                updateSelectedPostTypesCount();
            });
        }

        var btnSelectDefaults = document.getElementById('action-select-defaults-pts');
        if (btnSelectDefaults) {
            btnSelectDefaults.addEventListener('click', function () {
                var defaults = ['page', 'post', 'product'];
                document.querySelectorAll('.pt-checkbox').forEach(function (cb) {
                    var isDef = defaults.indexOf(cb.value) !== -1;
                    cb.checked = isDef;
                    if (isDef) {
                        cb.closest('.post-type-card')?.classList.add('selected');
                    } else {
                        cb.closest('.post-type-card')?.classList.remove('selected');
                    }
                });
                updateSelectedPostTypesCount();
            });
        }

        // Standalone One-Click Website Scraper in Settings
        var btnStartStandalone = document.getElementById('btn-start-standalone-scrape');
        var btnCancelStandalone = document.getElementById('btn-cancel-standalone-scrape');
        var standaloneProgressWrap = document.getElementById('standalone-scraper-progress');

        if (btnStartStandalone) {
            btnStartStandalone.addEventListener('click', function () {
                var checkedTypes = [];
                document.querySelectorAll('.pt-checkbox:checked').forEach(function (cb) {
                    checkedTypes.push(cb.value);
                });

                if (checkedTypes.length === 0) {
                    alert('Please select at least one post type to allow scraping.');
                    return;
                }

                var currentAstId = data.currentAssistantId || document.getElementById('ai_assistant_id')?.value;
                if (!currentAstId) {
                    alert('No active Assistant ID found. Please configure an assistant or complete the setup wizard first.');
                    return;
                }

                activeScraperAborted = false;
                if (standaloneProgressWrap) standaloneProgressWrap.style.display = 'block';
                btnStartStandalone.disabled = true;

                // Save selected post types via AJAX
                var saveFd = new FormData();
                saveFd.append('action', 'crescelo_save_post_types');
                saveFd.append('nonce', data.nonce);
                checkedTypes.forEach(function (t) { saveFd.append('allowed_post_types[]', t); });

                saveFd.append('scrape_include_meta', document.getElementById('opt-scrape-include-meta')?.checked ? '1' : '0');
                saveFd.append('scrape_include_taxonomies', document.getElementById('opt-scrape-include-tax')?.checked ? '1' : '0');
                saveFd.append('scrape_include_excerpt', document.getElementById('opt-scrape-include-excerpt')?.checked ? '1' : '0');
                saveFd.append('scrape_method', document.getElementById('ai_assistant_scrape_method')?.value || 'db');
                saveFd.append('batch_size', document.getElementById('ai_assistant_batch_size')?.value || '15');

                appendLog('standalone-terminal-log', '[INIT] Saved post type scraping configuration: ' + checkedTypes.join(', '), 'info');
                updateProgress('standalone-progress-fill', 'standalone-percent-label', 'standalone-status-label', 5, 'Starting website scraper...');

                fetch(data.ajaxUrl, { method: 'POST', body: saveFd })
                .then(function () {
                    runStandaloneScraper(checkedTypes);
                })
                .catch(function (err) {
                    appendLog('standalone-terminal-log', '[ERROR] Failed saving configuration: ' + err.message, 'error');
                    btnStartStandalone.disabled = false;
                });
            });
        }

        if (btnCancelStandalone) {
            btnCancelStandalone.addEventListener('click', function () {
                activeScraperAborted = true;
                appendLog('standalone-terminal-log', '[CANCELLED] Scraper stopped by administrator.', 'warn');
                if (btnStartStandalone) btnStartStandalone.disabled = false;
            });
        }

        function runStandaloneScraper(postTypes) {
            var batchLimit = parseInt(document.getElementById('ai_assistant_batch_size')?.value, 10) || data.batchSize || 15;
            var currentTypeIdx = 0;
            var totalItemsScraped = 0;
            var totalChunksCreated = 0;

            function processNextType() {
                if (activeScraperAborted) {
                    btnStartStandalone.disabled = false;
                    return;
                }

                if (currentTypeIdx >= postTypes.length) {
                    // Completed whole website scrape!
                    updateProgress('standalone-progress-fill', 'standalone-percent-label', 'standalone-status-label', 100, 'Website scrape completed!');
                    appendLog('standalone-terminal-log', '[DONE] Whole website scraped! Indexed ' + totalItemsScraped + ' items and created ' + totalChunksCreated + ' knowledge chunks.', 'success');
                    
                    recordScrapeComplete(totalItemsScraped, totalChunksCreated, postTypes);

                    btnStartStandalone.disabled = false;
                    return;
                }

                var currentType = postTypes[currentTypeIdx];
                var offset = 0;

                function sendScrapeBatch() {
                    if (activeScraperAborted) {
                        btnStartStandalone.disabled = false;
                        return;
                    }

                    appendLog('standalone-terminal-log', '[SCRAPE] Scraping ' + currentType + ' batch at offset ' + offset + '...', 'info');

                    var batchFd = new FormData();
                    batchFd.append('action', 'crescelo_wizard_sync_batch');
                    batchFd.append('nonce', data.nonce);
                    batchFd.append('batch_type', currentType);
                    batchFd.append('offset', offset);
                    batchFd.append('limit', batchLimit);

                    batchFd.append('include_meta', document.getElementById('opt-scrape-include-meta')?.checked ? '1' : '0');
                    batchFd.append('include_taxonomies', document.getElementById('opt-scrape-include-tax')?.checked ? '1' : '0');
                    batchFd.append('include_excerpt', document.getElementById('opt-scrape-include-excerpt')?.checked ? '1' : '0');
                    batchFd.append('scrape_method', document.getElementById('ai_assistant_scrape_method')?.value || 'db');

                    fetch(data.ajaxUrl, { method: 'POST', body: batchFd })
                    .then(function (res) { return res.json(); })
                    .then(function (resp) {
                        if (activeScraperAborted) return;

                        if (!resp.success) {
                            appendLog('standalone-terminal-log', '[WARN] ' + (resp.data?.error || 'Batch warning'), 'warn');
                        } else {
                            var processed = resp.data.processedCount || 0;
                            var chunks = resp.data.totalChunks || 0;
                            totalItemsScraped += processed;
                            totalChunksCreated += chunks;

                            appendLog('standalone-terminal-log', '[CHUNK] Stored ' + chunks + ' embeddings for ' + processed + ' ' + currentType + ' items.', 'success');

                            var percent = Math.min(95, Math.round(((currentTypeIdx + (offset / (offset + 20))) / postTypes.length) * 90) + 10);
                            updateProgress('standalone-progress-fill', 'standalone-percent-label', 'standalone-status-label', percent, 'Scraping ' + currentType + '...');

                            if (resp.data.hasMore && resp.data.nextOffset) {
                                offset = resp.data.nextOffset;
                                sendScrapeBatch();
                                return;
                            }
                        }

                        currentTypeIdx++;
                        processNextType();
                    })
                    .catch(function (err) {
                        appendLog('standalone-terminal-log', '[ERROR] Batch request failed: ' + err.message, 'error');
                        currentTypeIdx++;
                        processNextType();
                    });
                }

                sendScrapeBatch();
            }

            processNextType();
        }

        // ================= TABS SWITCHING =================
        var tabButtons = document.querySelectorAll('.crescelo-tab-btn');
        var tabPanes = document.querySelectorAll('.crescelo-tab-pane');

        function switchTab(targetTabId) {
            tabButtons.forEach(function (btn) {
                var tab = btn.getAttribute('data-tab');
                if (tab === targetTabId) {
                    btn.classList.add('active');
                    btn.setAttribute('aria-selected', 'true');
                } else {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-selected', 'false');
                }
            });

            tabPanes.forEach(function (pane) {
                if (pane.id === targetTabId) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });

            try {
                localStorage.setItem('crescelo_admin_active_tab', targetTabId);
                history.replaceState(null, null, '#' + targetTabId);
            } catch (e) {}
        }

        tabButtons.forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                var target = btn.getAttribute('data-tab');
                if (target) switchTab(target);
            });
        });

        // Restore active tab on load
        var initialTab = window.location.hash ? window.location.hash.replace('#', '') : '';
        if (!initialTab) {
            try {
                initialTab = localStorage.getItem('crescelo_admin_active_tab');
            } catch (e) {}
        }
        if (initialTab && document.getElementById(initialTab)) {
            switchTab(initialTab);
        }

        // ================= MANUAL API KEY CONNECTION =================
        var btnSubmitManualKey = document.getElementById('btn-submit-manual-key');
        var inputManualKey = document.getElementById('input-manual-api-key');
        var inputManualHost = document.getElementById('input-manual-host-url');
        var feedbackManualKey = document.getElementById('manual-key-feedback');
        var btnToggleVisibility = document.getElementById('btn-toggle-key-visibility');

        if (btnToggleVisibility && inputManualKey) {
            btnToggleVisibility.addEventListener('click', function () {
                if (inputManualKey.type === 'password') {
                    inputManualKey.type = 'text';
                    btnToggleVisibility.textContent = '🔒';
                } else {
                    inputManualKey.type = 'password';
                    btnToggleVisibility.textContent = '👁️';
                }
            });
        }

        if (btnSubmitManualKey && inputManualKey) {
            btnSubmitManualKey.addEventListener('click', function () {
                var keyVal = inputManualKey.value.trim();
                if (!keyVal) {
                    showManualFeedback('Please enter your Crescelo API key.', 'error');
                    inputManualKey.focus();
                    return;
                }

                btnSubmitManualKey.disabled = true;
                btnSubmitManualKey.innerHTML = '<span>Verifying &amp; Connecting...</span>';
                showManualFeedback('Verifying key with Crescelo...', 'info');

                var fd = new FormData();
                fd.append('action', 'crescelo_manual_connect_key');
                fd.append('nonce', data.nonce);
                fd.append('api_key', keyVal);
                var customHost = inputManualHost ? inputManualHost.value.trim() : '';
                if (customHost) {
                    fd.append('host_url', customHost);
                }

                fetch(data.ajaxUrl, {
                    method: 'POST',
                    body: fd
                })
                .then(function (res) { return res.json(); })
                .then(function (res) {
                    if (res.success) {
                        showManualFeedback('✓ Connected successfully! Reloading...', 'success');
                        setTimeout(function () {
                            window.location.href = window.location.pathname + '?page=ai-business-assistant#tab-connection';
                            window.location.reload();
                        }, 700);
                    } else {
                        btnSubmitManualKey.disabled = false;
                        btnSubmitManualKey.innerHTML = '<span>Verify &amp; Connect via Key</span>';
                        showManualFeedback('Connection failed: ' + (res.data?.error || 'Invalid API key.'), 'error');
                    }
                })
                .catch(function (err) {
                    btnSubmitManualKey.disabled = false;
                    btnSubmitManualKey.innerHTML = '<span>Verify &amp; Connect via Key</span>';
                    showManualFeedback('Network error: ' + err.message, 'error');
                });
            });
        }

        function showManualFeedback(msg, type) {
            if (!feedbackManualKey) return;
            feedbackManualKey.textContent = msg;
            feedbackManualKey.className = 'manual-feedback-text ' + (type || 'info');
            feedbackManualKey.style.display = 'inline-block';
        }

        // ================= TEST CONNECTION HEALTH =================
        var btnTestConnection = document.getElementById('btn-test-connection');
        var testStatusEl = document.getElementById('test-connection-status');

        if (btnTestConnection) {
            btnTestConnection.addEventListener('click', function () {
                btnTestConnection.disabled = true;
                if (testStatusEl) {
                    testStatusEl.textContent = 'Testing connection health...';
                    testStatusEl.className = 'test-status-msg info';
                    testStatusEl.style.display = 'inline-block';
                }

                var fd = new FormData();
                fd.append('action', 'crescelo_test_connection');
                fd.append('nonce', data.nonce);

                fetch(data.ajaxUrl, {
                    method: 'POST',
                    body: fd
                })
                .then(function (res) { return res.json(); })
                .then(function (res) {
                    btnTestConnection.disabled = false;
                    if (testStatusEl) {
                        if (res.success) {
                            testStatusEl.textContent = '✓ Healthy & Active (Assistant: ' + (res.data?.assistantName || 'Connected') + ')';
                            testStatusEl.className = 'test-status-msg success';
                        } else {
                            testStatusEl.textContent = '✗ ' + (res.data?.error || 'Connection check failed.');
                            testStatusEl.className = 'test-status-msg error';
                        }
                    }
                })
                .catch(function (err) {
                    btnTestConnection.disabled = false;
                    if (testStatusEl) {
                        testStatusEl.textContent = '✗ Communication error: ' + err.message;
                        testStatusEl.className = 'test-status-msg error';
                    }
                });
            });
        }

        function escapeHtml(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }
    });
})();
