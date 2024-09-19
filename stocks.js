let mainDiv = null;
let holdingDetails = null;
let ltpElement = null;
let highElement = null;
let closeElement = null;
let upperElement = null;
let rowElement = null;
let performanceLtpHigh = null;
let performanceLtpHighValue = null;
let performanceQty = null;
let performanceQtyValue = null;
let stockNameContainer = null;

let makeElementSticky = (element, top, zIndex) => {
    element.style.position = 'sticky';
    element.style.top = top;
    element.style.zIndex = zIndex;
    element.style.backgroundColor = "rgba(18, 18, 18, 0.85)";
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
    if (!closeElement) {
        closeElement = document.getElementsByClassName('stockPerformance_value__g7yez bodyLargeHeavy')[1];
    }
    if (!upperElement) {
        upperElement = document.getElementsByClassName('stockPerformance_value__g7yez bodyLargeHeavy')[4];
    }
    if (!rowElement) {
        const dividerElement = document.querySelector('.stockPerformance_dividerHz__hL82_');
        if (dividerElement) {
            const nextSibling = dividerElement.nextElementSibling;
            if (nextSibling && nextSibling.classList.contains('row')) {
                rowElement = nextSibling;
            }
        }
    }
    if (!performanceLtpHigh) {
        performanceLtpHigh = document.querySelector('div.col.l3.extension.performance.ltp-high');
    }
    if (performanceLtpHigh && !performanceLtpHighValue) {
        performanceLtpHighValue = performanceLtpHigh.querySelector('.stockPerformance_value__g7yez');
    }
    if (!performanceQty) {
        performanceQty = document.querySelector('div.col.l3.extension.performance.qty');
    }
    if (performanceQty && !performanceQtyValue) {
        performanceQtyValue = performanceQty.querySelector('.stockPerformance_value__g7yez');
    }
    if (!stockNameContainer) {
        stockNameContainer = document.getElementsByClassName('valign-wrapper vspace-between')[1];
    }
}

let addPerformanceOnLtpChange = () => {
    let className = 'extension performance';
    if (highElement) {
        let highValue = parseFloat(highElement.textContent);
        let ltpValue = parseFloat(ltpElement.textContent);
        let ltpHighPercentageDiff = (((highValue - ltpValue) / ltpValue) * 100).toFixed(2);
        let amount = document.getElementById('inputAmount').value;
        let qtyValue = parseInt(amount / ltpValue);

        if (rowElement) {
            if (performanceLtpHigh) {
                if (performanceLtpHighValue) {
                    performanceLtpHighValue.textContent = ltpHighPercentageDiff;
                }
            } else {
                addPerformanceElement(rowElement, className + ' ltp-high', 'LTP-HIGH diff(%)', ltpHighPercentageDiff);
            }
            if (performanceQty) {
                if (performanceQtyValue) {
                    performanceQtyValue.textContent = qtyValue;
                }
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
    let closeValue = parseFloat(closeElement.textContent);
    let upperValue = parseFloat(upperElement.textContent);
    let maxDiffPercentage = (((upperValue - closeValue) / closeValue) * 100).toFixed(2);

    if (rowElement) {
        addPerformanceElement(rowElement, className + ' max-diff', 'Max Diff(%)', maxDiffPercentage);
    }
}

// Create a callback function to handle changes
const handleChange = (mutationsList, observer) => {
    for (let mutation of mutationsList) {
        if (mutation.type === 'characterData' || mutation.type === 'childList') {
            initializeElements();
            addPerformanceOnLtpChange();
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
    newInput.className = "buySellOrder_qtyinputbox__jMqei headingLarge";
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

    let livePriceCard = document.getElementById('card-live-price');
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
        let isT2T = jsonResponse["isT2t"] ? "T2T" : "Normal";
        let color = jsonResponse["isT2t"] ? 'rgb(198, 92, 66)' : 'rgb(85, 184, 148)';
        addElement('div', isT2T, "", color, stockNameContainer);

        return jsonResponse;
    } catch (error) {
        console.error('Error fetching stock details:', error);
    }
}

let main = () => {
    initializeElements();
    if (mainDiv) {
        makeElementSticky(mainDiv, '30px', '5');
    }
    if (holdingDetails) {
        makeElementSticky(holdingDetails, '40px', '4');
    }
    addInputFields();
    addPerformanceOnLtpChange();
    addPerformance();
    scrollIntoView();
    addContractDetails();

    const observer = new MutationObserver(handleChange);
    const config = { childList: true, subtree: true, characterData: true };
    observer.observe(ltpElement, config);
    setTimeout(() => {
        location.reload(true);
    }, getRandomNumber(10, 30)*1000);
}

setTimeout(main, 3000);