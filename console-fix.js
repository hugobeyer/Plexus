// 🎯 EMERGENCY TAB INJECTION - Paste this into browser console
(function() {
    console.log('🔧 Injecting emergency tabs...');
    
    // Remove any existing tabs
    document.querySelectorAll('.tab-bar, .force-tab-bar, #fallback-tab-bar').forEach(el => el.remove());
    
    // Create emergency tab bar
    const tabBar = document.createElement('div');
    tabBar.id = 'emergency-tabs';
    tabBar.innerHTML = `
        <div style="
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            height: 50px !important;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%) !important;
            border-bottom: 3px solid #00ff88 !important;
            display: flex !important;
            align-items: center !important;
            z-index: 9999 !important;
            font-family: Monaco, monospace !important;
            color: #ccc !important;
            font-size: 14px !important;
            box-shadow: 0 2px 15px rgba(0,255,136,0.4) !important;
        ">
            <div style="display: flex !important; height: 100% !important; flex: 1 !important;" id="emergency-tab-list">
                <div class="emergency-tab" style="
                    background: #4a4a4a !important;
                    border-right: 1px solid #666 !important;
                    padding: 0 20px !important;
                    display: flex !important;
                    align-items: center !important;
                    cursor: pointer !important;
                    min-width: 220px !important;
                    position: relative !important;
                ">
                    <span style="flex: 1 !important; font-size: 14px !important; color: #fff !important;" ondblclick="editName(this)">🎮 PLEXUS - Nested Graph 1</span>
                    <button style="
                        margin-left: 12px !important;
                        background: none !important;
                        border: none !important;
                        color: #888 !important;
                        cursor: pointer !important;
                        font-size: 16px !important;
                        padding: 4px !important;
                        border-radius: 2px !important;
                    " onclick="closeEmergencyTab(this)">×</button>
                </div>
            </div>
            <button style="
                width: 60px !important;
                height: 100% !important;
                background: #00ff88 !important;
                border: none !important;
                color: #000 !important;
                cursor: pointer !important;
                font-size: 20px !important;
                font-weight: bold !important;
                border-left: 2px solid #fff !important;
            " onclick="addEmergencyTab()" title="Add New Nested Graph">＋</button>
        </div>
    `;
    
    // Insert at very top
    document.body.insertBefore(tabBar, document.body.firstChild);
    
    // Adjust body padding
    document.body.style.paddingTop = '50px';
    
    // Emergency tab functions
    let emergencyTabCounter = 1;
    
    window.addEmergencyTab = function() {
        emergencyTabCounter++;
        const tabList = document.getElementById('emergency-tab-list');
        
        // Deactivate all tabs
        document.querySelectorAll('.emergency-tab').forEach(tab => {
            tab.style.background = '#3a3a3a';
        });
        
        const newTab = document.createElement('div');
        newTab.className = 'emergency-tab';
        newTab.style.cssText = `
            background: #4a4a4a !important;
            border-right: 1px solid #666 !important;
            padding: 0 20px !important;
            display: flex !important;
            align-items: center !important;
            cursor: pointer !important;
            min-width: 220px !important;
            position: relative !important;
        `;
        newTab.innerHTML = `
            <span style="flex: 1 !important; font-size: 14px !important; color: #fff !important;" ondblclick="editName(this)">🎮 PLEXUS - Nested Graph ${emergencyTabCounter}</span>
            <button style="
                margin-left: 12px !important;
                background: none !important;
                border: none !important;
                color: #888 !important;
                cursor: pointer !important;
                font-size: 16px !important;
                padding: 4px !important;
                border-radius: 2px !important;
            " onclick="closeEmergencyTab(this)">×</button>
        `;
        
        // Make tab clickable
        newTab.addEventListener('click', function(e) {
            if (!e.target.closest('button')) {
                document.querySelectorAll('.emergency-tab').forEach(tab => {
                    tab.style.background = '#3a3a3a';
                });
                this.style.background = '#4a4a4a';
            }
        });
        
        tabList.appendChild(newTab);
        console.log('✅ Added emergency tab:', emergencyTabCounter);
    };
    
    window.closeEmergencyTab = function(closeBtn) {
        const tab = closeBtn.closest('.emergency-tab');
        const tabName = tab.querySelector('span').textContent;
        
        if (document.querySelectorAll('.emergency-tab').length > 1) {
            if (confirm(`Close "${tabName}"?`)) {
                tab.remove();
                console.log('🗑️ Closed emergency tab:', tabName);
            }
        } else {
            alert('Cannot close the last tab!');
        }
    };
    
    window.editName = function(nameSpan) {
        nameSpan.contentEditable = true;
        nameSpan.style.background = '#555';
        nameSpan.style.border = '1px solid #00ff88';
        nameSpan.style.borderRadius = '2px';
        nameSpan.focus();
        
        // Select all text
        const range = document.createRange();
        range.selectNodeContents(nameSpan);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        const finishEdit = () => {
            nameSpan.contentEditable = false;
            nameSpan.style.background = 'transparent';
            nameSpan.style.border = 'none';
            console.log('✏️ Renamed to:', nameSpan.textContent);
        };
        
        nameSpan.addEventListener('blur', finishEdit, { once: true });
        nameSpan.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                nameSpan.blur();
            }
        }, { once: true });
    };
    
    // Make first tab clickable
    document.querySelector('.emergency-tab').addEventListener('click', function(e) {
        if (!e.target.closest('button')) {
            document.querySelectorAll('.emergency-tab').forEach(tab => {
                tab.style.background = '#3a3a3a';
            });
            this.style.background = '#4a4a4a';
        }
    });
    
    console.log('🎯 EMERGENCY TABS INJECTED SUCCESSFULLY!');
    console.log('✅ Features: Click +, double-click names to edit, × to close');
    
    return 'TABS INJECTED!';
})();