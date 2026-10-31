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
        var scanInProgress = false;

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

        // Auto-advance if already connected or just returned from OAuth
        if (data.isConnected || data.currentAssistantId) {
            goToStep(2);
            runSiteScan();
        } else {
            goToStep(1);
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

        var btnRescanStep2 = document.getElementById('btn-rescan-step-2');
        if (btnRescanStep2) {
            btnRescanStep2.addEventListener('click', function () {
                runSiteScan();
            });
        }

        function getPostTypeIcon(slug) {
            switch (slug) {
                case 'product': return '🛍️';
                case 'post': return '📝';
                case 'page': return '📄';
                case 'portfolio': return '💼';
                case 'case_study': return '📊';
                case 'e-floating-elements':
                case 'floating-elements': return '✨';
                case 'elementor_library':
                case 'my_templates': return '📐';
                case 'documents':
                case 'attachment': return '📁';
                default: return '🗂️';
            }
        }

        function runSiteScan() {
            if (scanInProgress) return;
            scanInProgress = true;

            var statusText = document.getElementById('scanner-status-text');
            var stepDetail = document.getElementById('scan-step-detail');
            var scanFill = document.getElementById('scan-progress-fill');
            var scanPerc = document.getElementById('scan-percent-text');
            var nextBtn = document.getElementById('btn-to-step-3');
            var rescanBtn = document.getElementById('btn-rescan-step-2');

            if (rescanBtn) rescanBtn.disabled = true;
            if (nextBtn) nextBtn.disabled = true;

            if (statusText) statusText.textContent = 'Discovering registered post types, taxonomies, and WooCommerce catalog...';
            if (stepDetail) stepDetail.textContent = 'Connecting to database schema...';
            if (scanFill) scanFill.style.width = '20%';
            if (scanPerc) scanPerc.textContent = '20%';

            var pVal = 20;
            var scanTimer = setInterval(function () {
                if (pVal < 80) {
                    pVal += 15;
                    if (scanFill) scanFill.style.width = pVal + '%';
                    if (scanPerc) scanPerc.textContent = pVal + '%';
                    if (pVal === 35 && stepDetail) stepDetail.textContent = 'Scanning public post types & custom taxonomies...';
                    if (pVal === 50 && stepDetail) stepDetail.textContent = 'Inspecting WooCommerce products, orders & stock status...';
                    if (pVal === 65 && stepDetail) stepDetail.textContent = 'Indexing media attachments and document libraries...';
                }
            }, 300);

            var formData = new FormData();
            formData.append('action', 'crescelo_wizard_scan');
            formData.append('nonce', data.nonce);

            fetch(data.ajaxUrl, {
                method: 'POST',
                body: formData
            })
            .then(function (res) { return res.json(); })
            .then(function (response) {
                clearInterval(scanTimer);
                scanInProgress = false;
                if (rescanBtn) rescanBtn.disabled = false;

                if (!response.success) {
                    if (statusText) statusText.textContent = 'Scan encountered an issue: ' + (response.data?.error || 'Unknown error');
                    if (stepDetail) stepDetail.textContent = 'Database check failed.';
                    return;
                }

                scanData = response.data;
                if (scanFill) scanFill.style.width = '100%';
                if (scanPerc) scanPerc.textContent = '100%';

                var postTypesCount = Object.keys(scanData.post_types || {}).length;
                var totalItems = scanData.total_items || 0;
                if (statusText) statusText.textContent = 'Database scan complete! Discovered ' + postTypesCount + ' post types with ' + totalItems + ' items.';
                if (stepDetail) stepDetail.textContent = 'Ready to configure post types and AI commerce features.';

                // Render dynamic post type metrics cards in Step 2
                renderDiscoveryMetrics(scanData);

                if (nextBtn) nextBtn.disabled = false;

                // Pre-populate Step 3 lists with clean structured cards
                populateStep3(scanData);
            })
            .catch(function (err) {
                clearInterval(scanTimer);
                scanInProgress = false;
                if (rescanBtn) rescanBtn.disabled = false;
                if (statusText) statusText.textContent = 'Failed to connect to database: ' + err.message;
            });
        }

        function renderDiscoveryMetrics(scan) {
            var grid = document.getElementById('discovery-metrics');
            if (!grid) return;
            grid.innerHTML = '';

            var postTypes = scan.post_types || {};
            var keys = Object.keys(postTypes);

            keys.forEach(function (slug) {
                var pt = postTypes[slug];
                var count = pt.count || 0;
                var card = document.createElement('div');
                card.className = 'metric-card';

                var icon = getPostTypeIcon(slug);
                var subText = count > 0 ? (count + ' published entries') : 'No entries published';

                card.innerHTML = 
                    '<div class="metric-icon">' + icon + '</div>' +
                    '<div class="metric-num">' + count.toLocaleString() + '</div>' +
                    '<div class="metric-label">' + escapeHtml(pt.label) + '</div>' +
                    '<div class="metric-sub">' + subText + '</div>';

                grid.appendChild(card);
            });

            // Media documents card if any
            if (scan.documents && scan.documents.count > 0) {
                var docCard = document.createElement('div');
                docCard.className = 'metric-card';
                docCard.innerHTML = 
                    '<div class="metric-icon">📁</div>' +
                    '<div class="metric-num">' + (scan.documents.count || 0).toLocaleString() + '</div>' +
                    '<div class="metric-label">Media Documents</div>' +
                    '<div class="metric-sub">PDFs & text files</div>';
                grid.appendChild(docCard);
            }
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

            Object.keys(postTypes).forEach(function (slug) {
                var pt = postTypes[slug];
                var count = pt.count || 0;
                var isChecked = allowed.indexOf(slug) !== -1;
                var icon = getPostTypeIcon(slug);
                var hasSamples = (slug === 'product' && scan.woocommerce?.categories?.length > 0) || (pt.samples && pt.samples.length > 0);

                var card = document.createElement('div');
                card.className = 'pt-curate-card' + (isChecked ? ' selected' : '') + (count === 0 ? ' empty-items' : '');
                card.id = 'curate-card-' + slug;

                var drawerId = 'drawer-samples-' + slug;
                var sampleCount = slug === 'product' && scan.woocommerce?.categories?.length > 0 
                    ? scan.woocommerce.categories.length + ' categories' 
                    : (pt.samples ? pt.samples.length + ' samples' : '');

                var headerHtml = 
                    '<div class="pt-card-header">' +
                        '<label class="pt-card-left">' +
                            '<input type="checkbox" class="pt-group-check" data-slug="' + escapeHtml(slug) + '" ' + (isChecked ? 'checked' : '') + ' />' +
                            '<span class="pt-card-icon">' + icon + '</span>' +
                            '<span class="pt-card-title">' + escapeHtml(pt.label) + '</span>' +
                            '<span class="pt-count-badge">' + count.toLocaleString() + ' items</span>' +
                        '</label>' +
                        '<div class="pt-card-right">';

                if (hasSamples) {
                    headerHtml += '<button type="button" class="pt-toggle-samples-btn" data-target="' + drawerId + '">▾ View ' + sampleCount + '</button>';
                } else if (count === 0) {
                    headerHtml += '<span style="font-size:11px; color:#94a3b8;">No items</span>';
                }

                headerHtml += '</div></div>';

                var drawerHtml = '<div class="pt-samples-drawer" id="' + drawerId + '" style="display:none;">';

                if (slug === 'product' && scan.woocommerce?.categories?.length > 0) {
                    drawerHtml += '<div style="font-size:11px; font-weight:700; color:#475569; margin-bottom:6px;">Filter by WooCommerce Category:</div>';
                    drawerHtml += '<div class="cat-pill-grid">';
                    scan.woocommerce.categories.forEach(function (cat) {
                        drawerHtml += '<label class="cat-pill">' +
                            '<input type="checkbox" class="cat-item-check" data-cat-id="' + cat.id + '" checked /> ' +
                            '<span>' + escapeHtml(cat.name) + ' (' + (cat.count || 0) + ')</span>' +
                        '</label>';
                    });
                    drawerHtml += '</div>';
                } else if (pt.samples && pt.samples.length > 0) {
                    drawerHtml += '<div style="font-size:11px; font-weight:700; color:#475569; margin-bottom:6px;">Sample Discovered Entries (first ' + pt.samples.length + '):</div>';
                    drawerHtml += '<div class="pt-samples-list">';
                    pt.samples.forEach(function (item) {
                        drawerHtml += '<div class="pt-sample-row">' +
                            '<div class="pt-sample-left">' +
                                '<input type="checkbox" class="item-check" value="' + item.id + '" checked /> ' +
                                '<span class="pt-sample-title" title="' + escapeHtml(item.title) + '">' + escapeHtml(item.title) + '</span>' +
                            '</div>' +
                            '<span class="pt-sample-id">#' + item.id + '</span>' +
                        '</div>';
                    });
                    drawerHtml += '</div>';
                }

                drawerHtml += '</div>';
                card.innerHTML = headerHtml + drawerHtml;
                container.appendChild(card);

                // Master checkbox change
                var groupCheck = card.querySelector('.pt-group-check');
                groupCheck.addEventListener('change', function () {
                    var checked = this.checked;
                    if (checked) {
                        card.classList.add('selected');
                    } else {
                        card.classList.remove('selected');
                    }
                    card.querySelectorAll('.pt-samples-drawer input[type="checkbox"]').forEach(function (c) {
                        c.checked = checked;
                    });
                    updateCurateSummary();
                });

                // Toggle drawer button
                var toggleBtn = card.querySelector('.pt-toggle-samples-btn');
                if (toggleBtn) {
                    toggleBtn.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        var targetId = this.getAttribute('data-target');
                        var drawer = document.getElementById(targetId);
                        if (drawer) {
                            var isOpen = drawer.style.display === 'block';
                            drawer.style.display = isOpen ? 'none' : 'block';
                            this.textContent = (isOpen ? '▾ View ' : '▴ Hide ') + sampleCount;
                        }
                    });
                }
            });

            // Media Documents List
            var docsList = document.getElementById('items-docs-list');
            var docsCountLabel = document.getElementById('count-docs-label');
            var groupDocs = document.getElementById('group-docs');
            var checkAllDocs = document.getElementById('check-all-docs');

            if (checkAllDocs) {
                checkAllDocs.onchange = function () {
                    var chk = this.checked;
                    var docCard = document.querySelector('#group-docs .pt-curate-card');
                    if (docCard) {
                        if (chk) docCard.classList.add('selected');
                        else docCard.classList.remove('selected');
                    }
                    document.querySelectorAll('#items-docs-list input[type="checkbox"]').forEach(function (c) {
                        c.checked = chk;
                    });
                    updateCurateSummary();
                };
            }

            if (scan.documents && scan.documents.count > 0) {
                if (docsCountLabel) docsCountLabel.textContent = scan.documents.count;
                if (docsList) {
                    docsList.innerHTML = '';
                    scan.documents.samples.forEach(function (d) {
                        var row = document.createElement('div');
                        row.className = 'pt-sample-row';
                        row.innerHTML = 
                            '<div class="pt-sample-left">' +
                                '<input type="checkbox" class="doc-item-check" value="' + d.id + '" checked /> ' +
                                '<span class="pt-sample-title" title="' + escapeHtml(d.title) + '">' + escapeHtml(d.title) + '</span>' +
                            '</div>' +
                            '<span class="pt-sample-id">#' + d.id + '</span>';
                        docsList.appendChild(row);
                    });
                }
                if (groupDocs) {
                    groupDocs.style.display = 'block';
                    var dCard = groupDocs.querySelector('.pt-curate-card');
                    if (dCard) dCard.classList.add('selected');
                }
            } else if (groupDocs) {
                groupDocs.style.display = 'none';
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

            if (document.getElementById('check-all-docs')?.checked && scanData?.documents?.count) {
                total += (scanData.documents.count || 0);
            }

            summaryEl.textContent = total.toLocaleString() + ' items ready to scrape';
        }

        // Quick Curate Toolbar
        var btnSelectAllCurate = document.getElementById('btn-curate-select-all');
        if (btnSelectAllCurate) {
            btnSelectAllCurate.addEventListener('click', function () {
                document.querySelectorAll('#dynamic-post-types-curate .pt-curate-card').forEach(function (card) {
                    var cb = card.querySelector('.pt-group-check');
                    if (cb) cb.checked = true;
                    card.classList.add('selected');
                    card.querySelectorAll('.pt-samples-drawer input[type="checkbox"]').forEach(function (c) {
                        c.checked = true;
                    });
                });
                var docsMaster = document.getElementById('check-all-docs');
                if (docsMaster) {
                    docsMaster.checked = true;
                    docsMaster.dispatchEvent(new Event('change'));
                }
                updateCurateSummary();
            });
        }

        var btnSelectDefaultsCurate = document.getElementById('btn-curate-select-defaults');
        if (btnSelectDefaultsCurate) {
            btnSelectDefaultsCurate.addEventListener('click', function () {
                var defaults = ['page', 'post', 'product'];
                document.querySelectorAll('#dynamic-post-types-curate .pt-curate-card').forEach(function (card) {
                    var cb = card.querySelector('.pt-group-check');
                    if (cb) {
                        var slug = cb.getAttribute('data-slug');
                        var isDef = defaults.indexOf(slug) !== -1;
                        cb.checked = isDef;
                        if (isDef) card.classList.add('selected');
                        else card.classList.remove('selected');
                        card.querySelectorAll('.pt-samples-drawer input[type="checkbox"]').forEach(function (c) {
                            c.checked = isDef;
                        });
                    }
                });
                updateCurateSummary();
            });
        }

        var btnDeselectAllCurate = document.getElementById('btn-curate-deselect-all');
        if (btnDeselectAllCurate) {
            btnDeselectAllCurate.addEventListener('click', function () {
                document.querySelectorAll('#dynamic-post-types-curate .pt-curate-card').forEach(function (card) {
                    var cb = card.querySelector('.pt-group-check');
                    if (cb) cb.checked = false;
                    card.classList.remove('selected');
                    card.querySelectorAll('.pt-samples-drawer input[type="checkbox"]').forEach(function (c) {
                        c.checked = false;
                    });
                });
                var docsMaster = document.getElementById('check-all-docs');
                if (docsMaster) {
                    docsMaster.checked = false;
                    docsMaster.dispatchEvent(new Event('change'));
                }
                updateCurateSummary();
            });
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
            if (document.getElementById('feat-order-tracking')?.checked) features.push('order_tracking');
            if (document.getElementById('feat-order-cancel')?.checked) features.push('order_cancel');
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
                
                var completeNoticeEmpty = document.getElementById('sync-complete-notice');
                var completeMetaEmpty = document.getElementById('sync-complete-meta');
                if (completeNoticeEmpty) {
                    if (completeMetaEmpty) completeMetaEmpty.textContent = 'Configuration saved. Ready for launch!';
                    completeNoticeEmpty.style.display = 'flex';
                }

                var step5BtnEmpty = document.getElementById('btn-to-step-5');
                if (step5BtnEmpty) step5BtnEmpty.disabled = false;
                return;
            }

            var currentQueueIdx = 0;
            var totalItemsSynced = 0;
            var totalChunksSynced = 0;

            var grandTotalItems = 0;
            queue.forEach(function (q) {
                grandTotalItems += (q.total || 0);
            });
            if (grandTotalItems === 0) grandTotalItems = 1;

            function processNextQueueItem() {
                if (currentQueueIdx >= queue.length) {
                    // All finished!
                    updateProgress('sync-progress-fill', 'sync-percent-label', 'sync-status-label', 100, 'Training complete!');
                    appendLog('sync-terminal-log', '[DONE] Whole website scraped! Indexed ' + totalItemsSynced.toLocaleString() + ' items and generated ' + totalChunksSynced.toLocaleString() + ' Knowledge Base chunks.', 'success');
                    
                    // Record scrape complete
                    recordScrapeComplete(totalItemsSynced, totalChunksSynced, selectedTypes);

                    // Show completion card
                    var completeNotice = document.getElementById('sync-complete-notice');
                    var completeMeta = document.getElementById('sync-complete-meta');
                    if (completeNotice) {
                        if (completeMeta) {
                            completeMeta.textContent = 'Indexed ' + totalItemsSynced.toLocaleString() + ' items across ' + selectedTypes.length + ' post types and generated ' + totalChunksSynced.toLocaleString() + ' Knowledge Base chunks. Your AI assistant is now fully trained and ready for live visitors.';
                        }
                        completeNotice.style.display = 'flex';
                    }

                    var step5Btn = document.getElementById('btn-to-step-5');
                    if (step5Btn) {
                        step5Btn.disabled = false;
                        step5Btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
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

                            // Scale smoothly from 25% up to 98% based on real items processed vs total items
                            var scrapeFraction = Math.min(1, totalItemsSynced / grandTotalItems);
                            var currentPercent = Math.min(98, Math.max(25, 25 + Math.round(scrapeFraction * 73)));
                            var progressMsg = 'Scraping ' + qItem.type + ' (' + totalItemsSynced.toLocaleString() + ' / ' + grandTotalItems.toLocaleString() + ' items indexed)...';
                            updateProgress('sync-progress-fill', 'sync-percent-label', 'sync-status-label', currentPercent, progressMsg);

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

        // ================= STEP 5: FINALIZE & INTERACTIVE SIMULATED PREVIEW =================
        var btnToStep5 = document.getElementById('btn-to-step-5');
        if (btnToStep5) {
            btnToStep5.addEventListener('click', function () {
                goToStep(5);
                initStep5Preview();

                var finData = new FormData();
                finData.append('action', 'crescelo_wizard_finish');
                finData.append('nonce', data.nonce);

                fetch(data.ajaxUrl, { method: 'POST', body: finData });
            });
        }

        function initStep5Preview() {
            var astDisplay = document.getElementById('display-assistant-id');
            if (astDisplay) astDisplay.textContent = assistantId || data.currentAssistantId || 'ast_ready';

            var astName = data.siteName ? (data.siteName + ' AI') : 'Crescelo AI Assistant';
            var astNameEl = document.getElementById('wizard-preview-ast-name');
            if (astNameEl) astNameEl.textContent = astName;

            var welcomeBubble = document.getElementById('wizard-welcome-bubble');
            if (welcomeBubble && data.siteName) {
                welcomeBubble.textContent = "Hi! 👋 Welcome to " + data.siteName + ". I'm your AI Shopping Assistant. Looking for a specific product or have a question?";
            }

            // Interactive input
            var chatBody = document.getElementById('wizard-preview-chat-body');
            var inputSim = document.getElementById('wizard-preview-input');
            var sendBtn = document.getElementById('wizard-preview-send');

            function sendSimulatedMessage(text) {
                if (!text || !chatBody) return;

                // Add user bubble
                var userRow = document.createElement('div');
                userRow.className = 'preview-msg user';
                userRow.style.display = 'flex';
                userRow.style.justifyContent = 'flex-end';
                userRow.style.marginBottom = '10px';
                userRow.innerHTML = '<div class="preview-bubble" style="background:#08251a; color:#abff44; border-radius:12px 12px 2px 12px; margin-left:auto;">' + escapeHtml(text) + '</div>';
                chatBody.appendChild(userRow);
                chatBody.scrollTop = chatBody.scrollHeight;

                // Simulated thinking then bot response
                setTimeout(function () {
                    var lower = text.toLowerCase();
                    var reply = '';

                    if (lower.indexOf('order') !== -1 || lower.indexOf('track') !== -1 || lower.indexOf('dispatch') !== -1) {
                        reply = '📦 I can check live order tracking and dispatch status! Please provide your Order # and email address, and I will verify it deterministically in your store.';
                    } else if (lower.indexOf('cancel') !== -1) {
                        reply = '🛑 To cancel an order, I will confirm your order details and mark it for cancellation, adding a 🤖 Bot Cancelled badge in your WooCommerce dashboard.';
                    } else if (lower.indexOf('stock') !== -1 || lower.indexOf('available') !== -1 || lower.indexOf('acne') !== -1 || lower.indexOf('product') !== -1 || lower.indexOf('item') !== -1) {
                        reply = '🛍️ Based on your store catalog, I found relevant items! I automatically verify real-time stock levels and pricing from your WooCommerce database before making any recommendation.';
                    } else {
                        reply = '✨ I am trained on your website content and catalog. I can recommend in-stock products, answer questions, and stage items to cart!';
                    }

                    var botRow = document.createElement('div');
                    botRow.className = 'preview-msg bot';
                    botRow.style.display = 'flex';
                    botRow.style.marginBottom = '10px';
                    botRow.innerHTML = '<div class="preview-bubble">' + reply + '</div>';
                    chatBody.appendChild(botRow);
                    chatBody.scrollTop = chatBody.scrollHeight;
                }, 400);
            }

            if (sendBtn && inputSim) {
                sendBtn.onclick = function () {
                    var val = inputSim.value.trim();
                    if (val) {
                        sendSimulatedMessage(val);
                        inputSim.value = '';
                    }
                };

                inputSim.onkeydown = function (e) {
                    if (e.key === 'Enter') {
                        var val = inputSim.value.trim();
                        if (val) {
                            sendSimulatedMessage(val);
                            inputSim.value = '';
                        }
                    }
                };
            }

            // Suggestion pills
            document.querySelectorAll('#wizard-preview-suggestions .preview-pill').forEach(function (pill) {
                pill.onclick = function () {
                    var msg = this.getAttribute('data-msg') || this.textContent;
                    sendSimulatedMessage(msg);
                };
            });

            // Toggle launcher
            var launcher = document.getElementById('wizard-preview-launcher');
            var chatWindow = document.getElementById('wizard-preview-chat-window');
            var closeBtn = document.getElementById('wizard-preview-close');

            if (launcher && chatWindow) {
                launcher.onclick = function () {
                    var isHidden = chatWindow.style.display === 'none';
                    chatWindow.style.display = isHidden ? 'block' : 'none';
                };
            }
            if (closeBtn && chatWindow) {
                closeBtn.onclick = function () {
                    chatWindow.style.display = 'none';
                };
            }
        }

        var btnFinishAll = document.getElementById('btn-finish-all');
        if (btnFinishAll) {
            btnFinishAll.addEventListener('click', function () {
                btnFinishAll.disabled = true;
                btnFinishAll.textContent = 'Saving...';
                var isEnabled = document.getElementById('toggle-widget-public')?.checked ? '1' : '0';
                var finData = new FormData();
                finData.append('action', 'crescelo_wizard_finish');
                finData.append('nonce', data.nonce);
                finData.append('enabled', isEnabled);

                fetch(data.ajaxUrl, { method: 'POST', body: finData })
                .then(function () {
                    window.location.reload();
                })
                .catch(function () {
                    window.location.reload();
                });
            });
        }

        var btnReRun = document.getElementById('btn-re-run-wizard');
        if (btnReRun) {
            btnReRun.addEventListener('click', function () {
                var resetData = new FormData();
                resetData.append('action', 'crescelo_wizard_reset');
                resetData.append('nonce', data.nonce);
                fetch(data.ajaxUrl, { method: 'POST', body: resetData });
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

            var grandTotalExpected = 0;
            postTypes.forEach(function (t) {
                var count = scanData?.post_types && scanData.post_types[t] ? scanData.post_types[t].count : 15;
                grandTotalExpected += (count || 15);
            });
            if (grandTotalExpected === 0) grandTotalExpected = 1;

            function processNextType() {
                if (activeScraperAborted) {
                    btnStartStandalone.disabled = false;
                    return;
                }

                if (currentTypeIdx >= postTypes.length) {
                    // Completed whole website scrape!
                    updateProgress('standalone-progress-fill', 'standalone-percent-label', 'standalone-status-label', 100, 'Website scrape completed!');
                    appendLog('standalone-terminal-log', '[DONE] Whole website scraped! Indexed ' + totalItemsScraped.toLocaleString() + ' items and created ' + totalChunksCreated.toLocaleString() + ' knowledge chunks.', 'success');
                    
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

                            var frac = Math.min(1, totalItemsScraped / grandTotalExpected);
                            var percent = Math.min(98, Math.max(5, Math.round(frac * 93)));
                            var progressMsg = 'Scraping ' + currentType + ' (' + totalItemsScraped.toLocaleString() + ' / ' + grandTotalExpected.toLocaleString() + ' items)...';
                            updateProgress('standalone-progress-fill', 'standalone-percent-label', 'standalone-status-label', percent, progressMsg);

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
                            window.location.href = window.location.pathname + '?page=crescelo#tab-connection';
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
