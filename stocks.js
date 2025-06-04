const initializeElements = () => {
    if (!htmlElement) {
        htmlElement = document.documentElement;
    }
    if (!mainDiv) {
        mainDiv = document.querySelector('div.lpu38MainDiv');
    }
    if (!holdingsElement) {
        holdingsElement = document.querySelector('div.flex.width100.contentPrimary.yourHoldingsWithSIP_yh878HoldingDetails__Lq_oH');
    }
    if (!holdingDetailsContainer) {
        holdingDetailsContainer = document.getElementsByClassName('cur-po contentPrimary borderPrimary width100 flex flex-column stockProduct_stkP12ProductPageMidSectionWrapper__vhPRw')[0];
    }
    if (!ltpElement) {
        ltpElement = document.getElementsByClassName('lpu38Pri valign-wrapper false displayBase')[0].firstChild;
    }
    if (!highElement) {
        const highElementParent = document.getElementsByClassName('pbar29Value bodyLarge')[1];
        if (highElementParent) {
            highElement = highElementParent.querySelector('span');
        }
    }
    const parentElement = document.querySelector('.stockPerformance_dividerHz__hL82_').closest('.contentPrimary');
    rowElement = parentElement.querySelector('.row');
    const colDivs = rowElement.querySelectorAll('.col.l3');
    colDivs.forEach(div => {
        const keyElement = div.querySelector('.stockPerformance_keyText__f0fuN');
        const valueElement = div.querySelector('.stockPerformance_value__g7yez');
        if (keyElement && valueElement) {
            const key = keyElement.textContent.trim();
            const value = valueElement.textContent.trim();
            namedElements[key] = valueElement;
        }
    });
    if (!stockLTPContainer) {
        stockLTPContainer = document.querySelector('.lpu38Pri.valign-wrapper.false.displayBase').parentElement;
    }
    if (!contentSecondaryContainer) {
        contentSecondaryContainer = document.querySelector("div.valign-wrapper.contentSecondary.bodySmall");
    }
    let stickyNavContainer = document.getElementsByClassName('secondaryHeader_secondaryHeaderContainer__GUUMe secondaryHeader_pointerDisabled__gwEUo flex vspace-between flex-column')[0];
    if (stickyNavContainer) {
        stickyNavContainer.style.display = 'none';
    }
    stickyNavContainer = document.getElementsByClassName('secondaryHeader_secondaryHeaderContainer__GUUMe secondaryHeader_visible__lhvuo flex vspace-between flex-column')[0];
    if (stickyNavContainer) {
        stickyNavContainer.style.display = 'none';
    }
}

const makeElementSticky = (element, top, zIndex) => {
    const theme = htmlElement.getAttribute('data-theme');
    element.style.position = 'sticky';
    element.style.top = top;
    element.style.zIndex = zIndex;
    element.style.backgroundColor = theme === "dark" ? "rgba(18, 18, 18, 0.7)" : "rgba(255, 255, 255, 0.7)";
}

const configureStickyElements = () => {
    if (mainDiv) {
        makeElementSticky(mainDiv, '-120px', '5');
    }
    if (holdingDetailsContainer && holdingsElement) {
        makeElementSticky(holdingDetailsContainer, '3px', '4');
    }
}

const addPerformanceElement = (rootElement, className, name, value) => {
    const newDiv = document.createElement('div');
    newDiv.className = `col l3 ${className.trim()}`;
    newDiv.innerHTML = `
        <div class="stockPerformance_keyText__f0fuN stockPerformance_keyTextStk__shi_y left-align bodyBase">${name}</div>
        <span class="stockPerformance_value__g7yez bodyLargeHeavy">${value}</span>
    `;
    rootElement.appendChild(newDiv);
}

const addOrUpdatePerformanceOnAmountChange = async (amount) => {
    if (amount) {
        await chrome.storage.local.set({ amount });
    } else {
        amount = amountElement.value;
    }
    const ltpValue = parseFloat(ltpElement.textContent.replace(/[₹,]/g, ''));
    const qtyValue = parseInt(amount / ltpValue);
    if (!quantityElement) {
        quantityElement = document.createElement('div');
        quantityElement.className = `bodySmall flex`;
        quantityElement.style.marginLeft = '4px';
        quantityElement.innerHTML = `
            <span class="contentSecondary">QTY:</span>
            <span style="margin-left: 3px;">${qtyValue}</span>
        `;
        contentSecondaryContainer.appendChild(quantityElement);
    } else {
        quantityElement.innerHTML = `
            <span class="contentSecondary">QTY:</span>
            <span style="margin-left: 3px;">${qtyValue}</span>
        `;
    }
}

const addInputFields = async () => {
    let default_amount = 20000;
    const result = await chrome.storage.local.get(['amount']);
    if (result.amount) {
        default_amount = result.amount;
    }
    amountElement = document.createElement("input");
    amountElement.className = "buySellOrder_qtyinputbox__jMqei amount_input_box  bodyLargeHeavy contentPrimary borderPrimary";
    amountElement.id = "inputAmount";
    amountElement.type = "number";
    amountElement.min = "1";
    amountElement.value = default_amount;
    amountElement.placeholder = "Amount"
    amountElement.addEventListener('input', async (event) => {
        await addOrUpdatePerformanceOnAmountChange(event.target.value);
    });
    const livePriceCard = document.querySelector('.width100.buySellOrder_bso21Head__4p9v2.valign-wrapper.vspace-between');
    livePriceCard.appendChild(amountElement);
}

const addOrUpdatePerformanceOnLtpChange = async () => {
    if (highElement) {
        const highValue = parseFloat(highElement.textContent.replace(/,/g, ''));
        const ltpValue = parseFloat(ltpElement.textContent.replace(/[₹,]/g, ''));
        const ltpHighPercentageDiff = (((highValue - ltpValue) / ltpValue) * 100).toFixed(2);

        if (!performanceLtpHighValue) {
            const ltpHighElement = document.querySelector('div.col.l3.extension.performance.ltp-high');
            if (ltpHighElement) {
                performanceLtpHighValue = ltpHighElement.querySelector('.stockPerformance_value__g7yez.bodyLargeHeavy');
            }
        }

        if (rowElement) {
            if (performanceLtpHighValue) {
                performanceLtpHighValue.textContent = ltpHighPercentageDiff;
            } else {
                addPerformanceElement(rowElement, className + ' ltp-high', 'LTP-HIGH diff(%)', ltpHighPercentageDiff);
            }
        } else {
            console.log('No div with class "row" found next to the divider.');
        }
    }
    await addOrUpdatePerformanceOnAmountChange();
}

const addPerformance = () => {
    const closeValue = parseFloat(namedElements['Prev. Close'].textContent.replace(/,/g, ''));
    const upperValue = parseFloat(namedElements['Upper Circuit'].textContent.replace(/,/g, ''));
    const maxDiffPercentage = (((upperValue - closeValue) / closeValue) * 100).toFixed(2);

    if (rowElement) {
        addPerformanceElement(rowElement, className + ' max-diff', 'Max Diff(%)', maxDiffPercentage);
    }
}

const scrollIntoView = () => {
    const headingElement = document.querySelector("div.stkP12TabsDiv.bodyXLargeHeavy");
    if (headingElement) {
        headingElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    } else {
        console.log("Element not found");
    }
}

const addElement = (elementType, content, className, color, container, attributes = {}) => {
    const newElement = document.createElement(elementType);
    newElement.className = className;
    newElement.innerHTML = content;
    newElement.style.color = color;
    for (const key in attributes) {
        newElement.setAttribute(key, attributes[key]);
    }
    container.appendChild(newElement);
}

const addContractDetails = async () => {
    const scriptTag = document.getElementById('__NEXT_DATA__');
    const data = JSON.parse(scriptTag.textContent);
    const isNseTradable = data.props.pageProps.stockData.header.isNseTradable;
    const isBseTradable = data.props.pageProps.stockData.header.isBseTradable;
    const isin = data.props.pageProps.stockData.header.isin;
    const websiteUrl = data.props.pageProps.stockData.details.websiteUrl;
    let market = null;
    if (isNseTradable) {
        market = "NSE";
    } else if (isBseTradable) {
        market = "BSE";
    }
    if (market === null) {
        console.log("The stock is not tradable on NSE or BSE.");
        return;
    }
    const url = `https://groww.in/v1/api/stocks/oms/rms/exchange/${market}/contract/${isin}/info`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            alert(`HTTP error! status: ${response.status}`);
        }
        const jsonResponse = await response.json();
        const content = jsonResponse["isT2t"] ? "T2T" : "Normal";
        const color = jsonResponse["isT2t"] ? 'var(--red500)' : 'var(--green500)';
        addElement('div', content, "lpu38Day bodyBaseHeavy contentPositive", color, stockLTPContainer);
        if (websiteUrl) {
            addElement('a', "Website", "lpu38Day bodyBaseHeavy contentPositive", "rgb(80, 156, 248)", stockLTPContainer, { href: websiteUrl, target: "_blank" });
        }
        return jsonResponse;
    } catch (error) {
        console.error('Error fetching stock details:', error);
    }
}

const main = async () => {
    initializeElements();
    configureStickyElements();
    await addInputFields();
    await addOrUpdatePerformanceOnLtpChange();
    addPerformance();
    scrollIntoView();
    addContractDetails();
    const observer1 = new MutationObserver(async () => {
        await addOrUpdatePerformanceOnLtpChange();
    });
    const config1 = {
        characterData: true,
        subtree: true 
    };
    observer1.observe(ltpElement, config1);
    const observer2 = new MutationObserver(async () => {
        configureStickyElements();
    });
    const config2 = {
        attributes: true,
        attributeFilter: ['data-theme']
    };
    observer2.observe(htmlElement, config2);
}

// Define the regular expression pattern
const pattern = /^https:\/\/groww\.in\/stocks\/[^\/]+$/;
// Get the current URL
const currentUrl = window.location.href;
// Check if the current URL matches the pattern
if (pattern.test(currentUrl)) {
    var mainDiv = null;
    var holdingsElement = null;
    var holdingDetailsContainer = null;
    var ltpElement = null;
    var highElement = null;
    var rowElement = null;
    var performanceLtpHighValue = null;
    var namedElements = {};
    var stockLTPContainer = null;
    var htmlElement = null;
    var className = 'extension performance';
    var amountElement = null;
    var quantityElement = null;
    var contentSecondaryContainer = null;
    var stickyNavContainer = null;
    window.onload = setTimeout(main, 3000);
}