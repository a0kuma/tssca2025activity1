function attachBton() {
    //!important![區段起始] FA 樣式
    document.querySelectorAll('.inline-icon-fa').forEach(el => {
        const faBits = [...el.classList]
            .filter(cls => cls.startsWith('ifa-'))
            .map(cls => 'fa-' + cls.slice(4)); // "ifa-solid" -> "fa-solid"

        if (faBits.length === 0) return;                 // nothing to do
        if (el.querySelector('i[data-auto-fa]')) return; // already injected

        const icon = document.createElement('i');
        icon.setAttribute('aria-hidden', 'true');
        icon.dataset.autoFa = '1'; // marker to prevent duplicates
        icon.classList.add(...faBits);

        el.appendChild(icon);
    });
    //!important![區段起始] SW2 (預)
    document.querySelectorAll('.notyet').forEach(el => {
        el.addEventListener('click', () => {
            Swal.fire({
                icon: 'info',
                title: 'Notice',
                html: '<p class="lihsianti">很抱歉，這個網站的這個功能正在開發中</p>',
                showCloseButton: true,
                confirmButtonText: 'OK',
                didOpen: () => {
                    _jf.flush();
                }
            });
        });
    });

    document.querySelectorAll('.DEVONLYdownloadJSON').forEach(el => {
        el.addEventListener('click', () => {
            downloadJSONFromFrame8();
        });
    });

    document.querySelectorAll('.DEVONLYdownloadPDF').forEach(el => {
        el.addEventListener('click', async () => {
            try {
                const blob = await DOALL();
                if (blob) {
                    // Create download link
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'business-cards-a4-layout.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }
            } catch (error) {
                console.error('Error generating image:', error);
            }
        });
    });
}

function renderBC(data) {
    if (!data || !Array.isArray(data.elements)) return;

    const mainBC = document.querySelector('.mainBC');               // Task A target
    const frame8 = document.querySelector('.desktop1-frame8');      // Task B target (TOC)
    const jsxClass = getJsxClass();                                 // jsx-* prefix (optional)

    // ── Task A: render into .mainBC (no clearing) ────────────────────────────────
    if (mainBC) {
        const cw = mainBC.clientWidth;
        const ch = mainBC.clientHeight;

        data.elements.forEach((el, idx) => {
            const x = Number(el?.x) * cw;
            const y = Number(el?.y) * ch;
            const size = Number(el?.size) || 14;
            const value = (el?.value ?? '') + '';
            const icon = (el?.icon ?? 'none') + '';

            const div = document.createElement('div');
            div.id = `bc-item-${idx}`; // unique id for each item
            div.classList.add('justinbeaverfont-fluffy');
            div.style.position = 'absolute';
            div.style.left = x + 'px';
            div.style.top = y + 'px';
            div.style.transform = 'translate(0%, -50%)'; // center y but not x ********on point
            div.style.fontSize = size + 'px';
            div.style.display = 'inline-flex';
            div.style.alignItems = 'center';
            div.style.gap = '4px';

            if (icon && icon.toLowerCase() !== 'none') {
                const i = document.createElement('i');
                if (icon.startsWith('brands-')) {
                    i.className = `fa-brands fa-${icon.slice(7).toLowerCase()}`;
                } else {
                    i.className = `fa-solid fa-${icon.toLowerCase()}`;
                }
                div.appendChild(i);
            }
            div.appendChild(document.createTextNode(value));

            mainBC.appendChild(div); // IMPORTANT: no innerHTML clearing
        });
    }

    // ── Task B: append frame blocks inside existing frame8 (unrelated to mainBC) ─
    if (frame8) {
        data.elements.forEach((el, idx) => {
            const frame9 = document.createElement('div');
            frame9.className = classJoin(jsxClass, 'desktop1-frame9');

            // Set data attribute with x, y, and size
            frame9.setAttribute('data-x', el?.x);
            frame9.setAttribute('data-y', el?.y);
            frame9.setAttribute('data-size', el?.size);
            frame9.setAttribute('data-idx', idx);

            const frame10 = document.createElement('div');
            frame10.className = classJoin(jsxClass, 'desktop1-frame10');

            const frame12 = document.createElement('div');
            frame12.className = classJoin(jsxClass, 'desktop1-frame12');
            const i2 = document.createElement('i');
            i2.className = 'fa-solid fa-text-size';
            frame12.appendChild(i2);

            // Add click event to frame12 for size selection
            frame12.addEventListener('click', () => {
                showCTRL(frame12, idx);
            });

            // Add icon to frame10
            const icon = (el?.icon ?? 'none') + '';
            const i = document.createElement('i');

            if (icon && icon.toLowerCase() !== 'none') {
                if (icon.startsWith('brands-')) {
                    i.className = `fa-brands fa-${icon.slice(7).toLowerCase()}`;
                } else {
                    i.className = `fa-solid fa-${icon.toLowerCase()}`;
                }
            } else {
                i.className = 'fa-solid fa-sliders-up';
            }

            frame10.appendChild(i);

            // Add click event to frame10 for icon selection
            frame10.addEventListener('click', () => {
                showIconSelector(frame10);
            });

            const frame11 = document.createElement('div');
            frame11.className = classJoin(jsxClass, 'desktop1-frame11');

            // Add input to frame11
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = icon;
            input.value = el?.value ?? '';
            input.className = classJoin(jsxClass, 'input desktop1-textinput');

            // Add input event listener to update corresponding bc-item
            input.addEventListener('input', (e) => {
                const bcItem = document.querySelector(`#bc-item-${idx}`);
                if (bcItem) {
                    // Find the text node (last child after any icon)
                    const textNode = bcItem.lastChild;
                    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                        textNode.textContent = e.target.value;
                        _jf.flush();
                    }
                }
            });

            frame11.appendChild(input);

            frame9.appendChild(frame10);
            frame9.appendChild(frame12);
            frame9.appendChild(frame11);
            frame8.appendChild(frame9); // append only; never clear
        });
    }

    // ── Icon Selector Modal ──────────────────────────────────────────────────────
    function showIconSelector(frame10Element) {
        const icons = [
            { class: 'fa-solid fa-user', name: 'user' },
            { class: 'fa-solid fa-phone', name: 'phone' },
            { class: 'fa-solid fa-people-group', name: 'people-group' },
            { class: 'fa-solid fa-person-waving', name: 'signature' },
            { class: 'fa-solid fa-envelope', name: 'envelope' },
            { class: 'fa-solid fa-input-text', name: 'input-text' },
            { class: 'fa-solid fa-school', name: 'school' },
            { class: 'fa-solid fa-buildings', name: 'buildings' },
            { class: 'fa-solid fa-screen-users', name: 'screen-users' },
            { class: 'fa-solid fa-landmark', name: 'landmark' },
            { class: 'fa-solid fa-pencil', name: 'pencil' },
            { class: 'fa-solid fa-map-location-dot', name: 'map-location-dot' },
            { class: 'fa-solid fa-mobile-retro', name: 'mobile-retro' },
            { class: 'fa-solid fa-comment-sms', name: 'comment-sms' },
            { class: 'fa-solid fa-fax', name: 'fax' },
            { class: 'fa-solid fa-paper-plane-top', name: 'paper-plane-top' },
            { class: 'fa-solid fa-voicemail', name: 'voicemail' },
            { class: 'fa-solid fa-globe-pointer', name: 'globe-pointer' },
            { class: 'fa-brands fa-square-facebook', name: 'brands-square-facebook' },
            { class: 'fa-brands fa-facebook-messenger', name: 'brands-facebook-messenger' },
            { class: 'fa-brands fa-twitter', name: 'brands-twitter' },
            { class: 'fa-brands fa-x-twitter', name: 'brands-x-twitter' },
            { class: 'fa-brands fa-square-linkedin', name: 'brands-square-linkedin' },
            { class: 'fa-brands fa-instagram', name: 'brands-instagram' },
            { class: 'fa-brands fa-line', name: 'brands-line' },
            { class: 'fa-solid fa-billboard', name: 'billboard' },
            { class: 'fa-brands fa-github', name: 'brands-github' },
            { class: 'fa-brands fa-discord', name: 'brands-discord' },
            { class: 'fa-brands fa-twitch', name: 'brands-twitch' },
            { class: 'fa-brands fa-tiktok', name: 'brands-tiktok' },
            { class: 'fa-brands fa-whatsapp', name: 'brands-whatsapp' },
            { class: 'fa-brands fa-telegram', name: 'brands-telegram' },
            { class: 'fa-brands fa-youtube', name: 'brands-youtube' },
            { class: 'fa-brands fa-reddit', name: 'brands-reddit' },
            { class: 'fa-brands fa-threads', name: 'brands-threads' }
        ];

        const tableRows = icons.map(icon => `
            <tr>
                <td style="text-align: center; padding: 8px;">
                    <i class="${icon.class}" style="font-size: 18px;"></i>
                </td>
                <td style="padding: 8px;">${icon.name}</td>
                <td style="text-align: center; padding: 8px;">
                    <button class="swal2-confirm swal2-styled" onclick="selectIcon('${icon.class}', '${icon.name}')" style="margin: 0;">Select</button>
                </td>
            </tr>
        `).join('');

        const tableHTML = `
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 10px; border: 1px solid #ddd;">Icon</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Name</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        `;

        // Store reference to current frame10 element for selectIcon function
        window.currentFrame10 = frame10Element;

        Swal.fire({
            title: 'Select an Icon',
            html: tableHTML,
            width: '600px',
            showConfirmButton: false,
            showCancelButton: true,
            showCloseButton: true,
            cancelButtonText: 'Cancel'
        });
    }

    // Global function to handle icon selection
    window.selectIcon = function (iconClass, iconName) {
        if (window.currentFrame10) {
            // Update the icon in frame10
            const iconElement = window.currentFrame10.querySelector('i');
            if (iconElement) {
                iconElement.className = iconClass;
            }

            // Update the corresponding input placeholder
            const frame9 = window.currentFrame10.parentElement;
            const input = frame9.querySelector('input');
            if (input) {
                input.placeholder = iconName;
            }

            // Clean up
            window.currentFrame10 = null;
        }

        Swal.close();
    };

    function showCTRL(frame12Element, itemIdx) {
        // Remove existing control panel if any
        const existingCtrl = document.querySelector('.ctrl-panel');
        if (existingCtrl) {
            existingCtrl.remove();
        }

        // Create control panel
        const ctrlPanel = document.createElement('div');
        ctrlPanel.className = 'ctrl-panel';
        ctrlPanel.style.position = 'fixed';
        ctrlPanel.style.right = '32vw';
        ctrlPanel.style.bottom = '32vw';
        ctrlPanel.style.width = '30vw';
        ctrlPanel.style.height = '30vw';
        ctrlPanel.style.backgroundColor = '#DDB98B';
        ctrlPanel.style.display = 'grid';
        ctrlPanel.style.gridTemplateColumns = '1fr 1fr 1fr';
        ctrlPanel.style.gridTemplateRows = '1fr 1fr 1fr';
        ctrlPanel.style.gap = '2px';
        ctrlPanel.style.padding = '10px';
        ctrlPanel.style.borderRadius = '8px';
        ctrlPanel.style.zIndex = '9999';

        // Button configurations: [icon, action]
        const buttonConfigs = [
            ['fa-solid fa-minus', () => changeFontSize(itemIdx, -2)],
            ['fa-solid fa-up', () => moveItem(itemIdx, 0, -moveStep)],
            ['fa-solid fa-plus', () => changeFontSize(itemIdx, 2)],
            ['fa-solid fa-left', () => moveItem(itemIdx, -moveStep, 0)],
            ['fa-solid fa-xmark', () => closeCtrl()],
            ['fa-solid fa-right', () => moveItem(itemIdx, moveStep, 0)],
            ['fa-solid fa-magnifying-glass-minus', () => setMoveStep(-0.01)],
            ['fa-solid fa-down', () => moveItem(itemIdx, 0, moveStep)],
            ['fa-solid fa-magnifying-glass-plus', () => setMoveStep(0.01)]
        ];

        // Create 9 buttons in 3x3 grid
        for (let i = 0; i < 9; i++) {
            const button = document.createElement('button');
            button.style.backgroundColor = '#f0f0f0';
            button.style.border = '1px solid #ccc';
            button.style.borderRadius = '4px';
            button.style.cursor = 'pointer';
            button.style.display = 'flex';
            button.style.alignItems = 'center';
            button.style.justifyContent = 'center';
            button.style.fontSize = '18px';

            const icon = document.createElement('i');
            icon.className = buttonConfigs[i][0];
            button.appendChild(icon);

            button.addEventListener('click', buttonConfigs[i][1]);
            ctrlPanel.appendChild(button);
        }

        document.body.appendChild(ctrlPanel);

        let moveStep = 0.01; // Default move step (1% of container)

        function changeFontSize(idx, delta) {
            const bcItem = document.querySelector(`#bc-item-${idx}`);

            // Find the frame9 element by its class name and data-idx attribute
            const frame9 = document.querySelector(`.desktop1-frame9[data-idx="${idx}"]`);

            if (bcItem && frame9) {
                const currentSize = parseInt(bcItem.style.fontSize) || 14;
                const newSize = Math.max(8, currentSize + delta);
                bcItem.style.fontSize = newSize + 'px';

                // Update the data-size attribute in frame9
                frame9.setAttribute('data-size', newSize);

                _jf.flush();
            }
        }

        function moveItem(idx, deltaX, deltaY) {
            const bcItem = document.querySelector(`#bc-item-${idx}`);
            const frame9 = document.querySelector(`[data-idx="${idx}"]`);
            const mainBC = document.querySelector('.mainBC');

            if (bcItem && frame9 && mainBC) {
                // Get current percentage values from data attributes
                const currentX = parseFloat(frame9.getAttribute('data-x')) || 0;
                const currentY = parseFloat(frame9.getAttribute('data-y')) || 0;

                // Calculate new percentage values (clamped to 0-1 range)
                const newX = Math.max(0, Math.min(1, currentX + deltaX));
                const newY = Math.max(0, Math.min(1, currentY + deltaY));

                // Update data attributes
                frame9.setAttribute('data-x', newX);
                frame9.setAttribute('data-y', newY);

                // Convert to pixel positions
                const cw = mainBC.clientWidth;
                const ch = mainBC.clientHeight;
                const newLeftPx = newX * cw;
                const newTopPx = newY * ch;

                // Update element position
                bcItem.style.left = newLeftPx + 'px';
                bcItem.style.top = newTopPx + 'px';
                _jf.flush();
            }
        }

        function setMoveStep(step) {
            if (step > 0) {
                moveStep = Math.min(0.1, moveStep + Math.abs(step)); // Increase step, max 10%
            } else {
                moveStep = Math.max(0.001, moveStep - Math.abs(step)); // Decrease step, min 0.1%
            }
            // Update move functions to use new step
            buttonConfigs[1][1] = () => moveItem(itemIdx, 0, -moveStep);
            buttonConfigs[3][1] = () => moveItem(itemIdx, -moveStep, 0);
            buttonConfigs[5][1] = () => moveItem(itemIdx, moveStep, 0);
            buttonConfigs[7][1] = () => moveItem(itemIdx, 0, moveStep);
        }

        function closeCtrl() {
            ctrlPanel.remove();
        }
    }

    // ── helpers ──────────────────────────────────────────────────────────────────
    function getJsxClass() {
        // Prefer from .desktop1-container
        const host = document.querySelector('.desktop1-container');
        if (host) {
            const found = Array.from(host.classList).find(c => c.startsWith('jsx-'));
            if (found) return found;
        }
        // Fallback: derive from existing frame8 if present
        if (frame8) {
            const found = Array.from(frame8.classList).find(c => c.startsWith('jsx-'));
            if (found) return found;
        }
        // Last resort: empty (omit jsx-* prefix)
        return '';
    }

    function classJoin(prefix, cls) {
        return prefix ? `${prefix} ${cls}` : cls;
    }
}

// Function to download JSON based on current desktop1-frame8 data
function downloadJSONFromFrame8() {
    const frame8 = document.querySelector('.desktop1-frame8');
    if (!frame8) {
        console.error('desktop1-frame8 not found');
        return;
    }

    const frame9Elements = frame8.querySelectorAll('.desktop1-frame9');
    const elements = [];

    frame9Elements.forEach((frame9, idx) => {
        // Get data from attributes
        const x = parseFloat(frame9.getAttribute('data-x')) || 0;
        const y = parseFloat(frame9.getAttribute('data-y')) || 0;
        const size = parseFloat(frame9.getAttribute('data-size')) || 14;

        // Get value from input
        const input = frame9.querySelector('input');
        const value = input ? input.value : '';

        // Get icon from frame10
        const frame10 = frame9.querySelector('.desktop1-frame10');
        let icon = 'none';
        if (frame10) {
            const iconElement = frame10.querySelector('i');
            if (iconElement) {
                const className = iconElement.className;
                if (className.includes('fa-brands')) {
                    // Extract brands icon name
                    const match = className.match(/fa-brands fa-(.+?)(?:\s|$)/);
                    if (match) {
                        icon = `brands-${match[1]}`;
                    }
                } else if (className.includes('fa-solid')) {
                    // Extract solid icon name
                    const match = className.match(/fa-solid fa-(.+?)(?:\s|$)/);
                    if (match && match[1] !== 'sliders-up') { // Skip default icon
                        icon = match[1];
                    }
                }
            }
        }

        elements.push({
            value: value,
            x: x,
            y: y,
            size: size,
            icon: icon
        });
    });

    const jsonData = {
        elements: elements
    };

    // Create and download the JSON file
    const dataStr = JSON.stringify(jsonData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'frame8-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(url);

    console.log('JSON downloaded with', elements.length, 'elements');
    return jsonData;
}

async function DOALL(type = 'png') {
    const node = document.querySelector('.mainBC');
    if (!node) {
        console.error('mainBC element not found');
        return null;
    }

    try {
        // wait for fonts (optional, avoids blank text)
        if (document.fonts && document.fonts.ready) await document.fonts.ready;

        const canvas = await html2canvas(node, {
            useCORS: true,
            scale: window.devicePixelRatio || 1,
            backgroundColor: type === 'png' ? null : '#ffffff'
        });

        const mime = type === 'jpg' ? 'image/jpeg' : 'image/png';
        const ext = type === 'jpg' ? 'jpg' : 'png';

        // Create A4 layout with 10 copies (2 columns, 5 rows)
        return createA4Layout(canvas, mime);
    } catch (error) {
        console.error('Error in DOALL function:', error);
        return null;
    }
}

// Create A4 layout with 10 business cards (2 columns, 5 rows)
function createA4Layout(singleCardCanvas, mime) {
    return new Promise((resolve) => {
        // DPI setting
        const dpi = 1200;
        
        // Card dimensions
        const cardWidthMM = 90;
        const cardHeightMM = 54;
        const cardWidthPx = Math.round((cardWidthMM / 25.4) * dpi); // ~4252px
        const cardHeightPx = Math.round((cardHeightMM / 25.4) * dpi); // ~2551px
        
        // Margins
        const topMarginMM = 13;
        const bottomMarginMM = 13; // 假設下邊界也是1.3cm
        const sideMarginMM = 15;
        const topMarginPx = Math.round((topMarginMM / 25.4) * dpi);
        const bottomMarginPx = Math.round((bottomMarginMM / 25.4) * dpi);
        const sideMarginPx = Math.round((sideMarginMM / 25.4) * dpi);
        
        // Calculate A4 dimensions based on content
        // Width: 側邊界 + 寬度*2 + 側邊界
        const a4WidthPx = sideMarginPx + (cardWidthPx * 2) + sideMarginPx;
        // Height: 上邊界 + 高度*5 + 下邊界
        const a4HeightPx = topMarginPx + (cardHeightPx * 5) + bottomMarginPx;
        
        // Create A4 canvas
        const a4Canvas = document.createElement('canvas');
        a4Canvas.width = a4WidthPx;
        a4Canvas.height = a4HeightPx;
        const ctx = a4Canvas.getContext('2d');
        
        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, a4WidthPx, a4HeightPx);
        
        // Draw 10 cards (2 columns, 5 rows) with no spacing between cards
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 2; col++) {
                const x = sideMarginPx + col * cardWidthPx;
                const y = topMarginPx + row * cardHeightPx;
                
                // Draw the single card canvas onto the A4 canvas, scaled to fit card dimensions
                ctx.drawImage(singleCardCanvas, x, y, cardWidthPx, cardHeightPx);
            }
        }
        
        // Convert A4 canvas to blob
        a4Canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                console.error('Failed to create A4 layout blob');
                resolve(null);
            }
        }, mime, 1.0);
    });
}

const jsonData = {
    "elements": [
        {
            "value": "王小明",
            "x": 0.51,
            "y": 0.3,
            "size": 28,
            "icon": "none"
        },
        {
            "value": "學生",
            "x": 0.52,
            "y": 0.38,
            "size": 14,
            "icon": "none"
        },
        {
            "value": "成功大學",
            "x": 0.14999999999999997,
            "y": 0.5499999999999998,
            "size": 18,
            "icon": "none"
        },
        {
            "value": "數學系",
            "x": 0.182,
            "y": 0.6159999999999999,
            "size": 14,
            "icon": "none"
        },
        {
            "value": "0912123456",
            "x": 0.5200000000000002,
            "y": 0.69,
            "size": 12,
            "icon": "phone"
        },
        {
            "value": "abc123@mail.com",
            "x": 0.5200000000000002,
            "y": 0.6199999999999999,
            "size": 12,
            "icon": "envelope"
        },
        {
            "value": "abc123",
            "x": 0.5200000000000002,
            "y": 0.76,
            "size": 12,
            "icon": "brands-facebook"
        },
        {
            "value": "abc456",
            "x": 0.5200000000000002,
            "y": 0.5429999999999998,
            "size": 12,
            "icon": "brands-twitter"
        }
    ]
};

