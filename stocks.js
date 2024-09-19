// Define the regular expression pattern
let pattern = /^https:\/\/groww\.in\/stocks\/[^\/]+$/;

// Get the current URL
let currentUrl = window.location.href;

// Check if the current URL matches the pattern
if (pattern.test(currentUrl)) {

let mainDiv = null;
let holdingDetails = null;
let ltpElement = null;
let highElement = null;
let rowElement = null;
let performanceLtpHighValue = null;
let performanceQtyValue = null;
let namedElements = {};
let stockLTPContainer = null;
let htmlElement = null;

let makeElementSticky = (element, top, zIndex) => {
    let theme = htmlElement.getAttribute('data-theme');
    element.style.position = 'sticky';
    element.style.top = top;
    element.style.zIndex = zIndex;
    element.style.backgroundColor = theme ==="dark" ? "rgba(18, 18, 18, 0.85)" : "rgba(255, 255, 255, 0.85)";
}

let addPerformanceElement = (rootElement, className, name, value) => {
    var newDiv = document.createElement('div');
    newDiv.className = `col l3 ${className.trim()}`;
    newDiv.innerHTML = `
        <div class="stockPerformance_keyText__f0fuN stockPerformance_keyTextStk__shi_y left-align bodyBase">${name}</div>
        <span class="stockPerformance_value__g7yez bodyLargeHeavy">${value}</span>
    `;
    rootElement.appendChild(newDiv);
}

let addElement = (elementType, content, className, color, container) => {
    let newElement = document.createElement(elementType);
    newElement.className = className;
    newElement.innerHTML = content;
    newElement.style.color = color;
    container.appendChild(newElement);
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let initializeElements = () => {
    if (!htmlElement) {
        htmlElement = document.documentElement;
    }
    if (!mainDiv) {
        mainDiv = document.querySelector('div.lpu38MainDiv');
    }
    if (!holdingDetails) {
        holdingDetails = document.getElementsByClassName('yh878ContentDiv backgroundPrimary borderPrimary')[0];
    }
    if (!ltpElement) {
        ltpElement = document.getElementsByClassName('lpu38San')[0].nextElementSibling;
    }
    if (!highElement) {
        const highElementParent = document.getElementsByClassName('pbar29Value bodyLarge')[1];
        if (highElementParent) {
            highElement = highElementParent.querySelector('span');
        }
    }

    // Find the parent element that contains the unique class 'stockPerformance_dividerHz__hL82_'
    let parentElement = document.querySelector('.stockPerformance_dividerHz__hL82_').closest('.contentPrimary');
    // Now get the specific row within this parent element
    rowElement = parentElement.querySelector('.row');
    // Get all divs with class 'col l3' within the found row
    let colDivs = rowElement.querySelectorAll('.col.l3');
    // Iterate over the colDivs and extract the key-value pairs
    colDivs.forEach(div => {
        // Get the key and value elements
        let keyElement = div.querySelector('.stockPerformance_keyText__f0fuN');
        let valueElement = div.querySelector('.stockPerformance_value__g7yez');
    
        // Store key-value pairs in the stockData object
        if (keyElement && valueElement) {
            let key = keyElement.textContent.trim();
            let value = valueElement.textContent.trim();
    
            // Add the key-value pair to the stockData object
            namedElements[key] = valueElement; // Store the reference to valueElement
        }
    });

    if (!stockLTPContainer) {
        stockLTPContainer = document.querySelector('.lpu38Pri.valign-wrapper.false.displayBase').parentElement;
    }
}

let addPerformanceOnLtpChange = () => {
    let className = 'extension performance';
    if (highElement) {
        let highValue = parseFloat(highElement.textContent.replace(/,/g, ''));
        let ltpValue = parseFloat(ltpElement.textContent.replace(/,/g, ''));
        let ltpHighPercentageDiff = (((highValue - ltpValue) / ltpValue) * 100).toFixed(2);
        let amount = document.getElementById('inputAmount').value;
        let qtyValue = parseInt(amount / ltpValue);

        if (!performanceLtpHighValue) {
            let ltpHighElement = document.querySelector('div.col.l3.extension.performance.ltp-high');
            if (ltpHighElement) {
                performanceLtpHighValue = ltpHighElement.querySelector('.stockPerformance_value__g7yez.bodyLargeHeavy');
            }
        }

        if (!performanceQtyValue) {
            let qtyElement = document.querySelector('div.col.l3.extension.performance.qty');
            if (qtyElement) {
                performanceQtyValue = qtyElement.querySelector('.stockPerformance_value__g7yez.bodyLargeHeavy');
            }
        }

        if (rowElement) {
            if (performanceLtpHighValue) {
                performanceLtpHighValue.textContent = ltpHighPercentageDiff;
            } else {
                addPerformanceElement(rowElement, className + ' ltp-high', 'LTP-HIGH diff(%)', ltpHighPercentageDiff);
            }
            if (performanceQtyValue) {
                performanceQtyValue.textContent = qtyValue;
            } else {
                addPerformanceElement(rowElement, className + ' qty', 'Quantity', qtyValue);
            }
        } else {
            console.log('No div with class "row" found next to the divider.');
        }
    }
}

let addPerformance = () => {
    let className = 'extension performance';
    let closeValue = parseFloat(namedElements['Prev. Close'].textContent.replace(/,/g, ''));
    let upperValue = parseFloat(namedElements['Upper Circuit'].textContent.replace(/,/g, ''));
    let maxDiffPercentage = (((upperValue - closeValue) / closeValue) * 100).toFixed(2);

    if (rowElement) {
        addPerformanceElement(rowElement, className + ' max-diff', 'Max Diff(%)', maxDiffPercentage);
    }
}

let configureStickyElements = () => {
    if (mainDiv) {
        makeElementSticky(mainDiv, '30px', '5');
    }
    if (holdingDetails) {
        makeElementSticky(holdingDetails, '40px', '4');
    }
}

// Create a callback function to handle changes
const handleChange = (mutationsList, observer) => {
    for (let mutation of mutationsList) {
        if (mutation.type === 'characterData' || mutation.type === 'childList') {
            addPerformanceOnLtpChange();
        } else if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
            configureStickyElements();
        }
    }
};

// scroll into view
const scrollIntoView = () => {
    // Select the h2 element with the specified class
    const headingElement = document.querySelector("div.stkP12TabsDiv.bodyXLargeHeavy");

    // Check if the element exists
    if (headingElement) {
        // Scroll the element into view
        headingElement.scrollIntoView({
            behavior: 'smooth', // Optional: for smooth scrolling
            block: 'start' // Optional: align to the top of the view
        });
    } else {
        console.log("Element not found");
    }
}

const addInputFields = () => {
    var newInput = document.createElement("input");
    newInput.className = "buySellOrder_qtyinputbox__jMqei  bodyLargeHeavy contentPrimary borderPrimary";
    newInput.id = "inputAmount";
    newInput.type = "number";
    newInput.min = "1";
    newInput.value = "20000";
    newInput.placeholder = "Amount"

    // Add change event listener
    newInput.addEventListener('input', (event) => {
        initializeElements();
        addPerformanceOnLtpChange();
    });

    let livePriceCard = document.querySelector('.width100.buySellOrder_bso21Head__4p9v2.valign-wrapper.vspace-between');
    livePriceCard.appendChild(newInput);
}

const addContractDetails = async () => {
    const scriptTag = document.getElementById('__NEXT_DATA__');
    const data = JSON.parse(scriptTag.textContent);
    const isNseTradable = data.props.pageProps.stockData.header.isNseTradable;
    const isBseTradable = data.props.pageProps.stockData.header.isBseTradable;
    const isin = data.props.pageProps.stockData.header.isin;
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
        let content = jsonResponse["isT2t"] ? "T2T" : "Normal";
        let color = jsonResponse["isT2t"] ? 'var(--red500)' : 'var(--green500)';
        addElement('div', content, "lpu38Day bodyBaseHeavy contentPositive", color, stockLTPContainer);

        return jsonResponse;
    } catch (error) {
        console.error('Error fetching stock details:', error);
    }
}

let main = () => {
    initializeElements();
    configureStickyElements();
    addInputFields();
    addPerformanceOnLtpChange();
    addPerformance();
    scrollIntoView();
    addContractDetails();

    const observer = new MutationObserver(handleChange);
    const config = { 
        childList: true, 
        subtree: true, 
        characterData: true,
        attributes: true,
        attributeFilter: ['data-theme']
    };
    observer.observe(ltpElement, config);
    observer.observe(htmlElement, config);
    setTimeout(() => {
        location.reload(true);
    }, getRandomNumber(10, 30)*1000);
}

setTimeout(main, 3000);

}