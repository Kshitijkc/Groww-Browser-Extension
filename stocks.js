let mainDiv = null;
let holdingDetails = null;
let ltpElement = null;
let highElement = null;
let rowElement = null;
let performanceLtpHigh = null;
let performanceLtpHighValue = null;

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
}

let addPerformanceLtpHigh = () => {
    if (highElement) {
        var highValue = parseFloat(highElement.textContent);
        var ltpValue = parseFloat(ltpElement.textContent);
        var ltpHighPercentageDiff = (((highValue - ltpValue) / ltpValue) * 100).toFixed(2);

        if (rowElement) {
            if (performanceLtpHigh) {
                if (performanceLtpHighValue) {
                    performanceLtpHighValue.textContent = ltpHighPercentageDiff;
                }
            } else {
                var className = 'extension performance ltp-high';
                addPerformanceElement(rowElement, className, 'LTP-HIGH diff(%)', ltpHighPercentageDiff);
            }
        } else {
            console.log('No div with class "row" found next to the divider.');
        }
    }
}

let addPerformance = () => {
    addPerformanceLtpHigh();
}

// Create a callback function to handle changes
const handleChange = (mutationsList, observer) => {
    for (let mutation of mutationsList) {
        if (mutation.type === 'characterData' || mutation.type === 'childList') {
            initializeElements();
            addPerformance();
        }
    }
};

let main = () => {
    initializeElements();
    if (mainDiv) {
        makeElementSticky(mainDiv, '30px', '5');
    }
    if (holdingDetails) {
        makeElementSticky(holdingDetails, '40px', '4');
    }
    addPerformance();
    
    const observer = new MutationObserver(handleChange);
    const config = { childList: true, subtree: true, characterData: true };
    observer.observe(ltpElement, config);
    setTimeout(() => {
        location.reload(true);
    }, 15000);
}

setTimeout(main, 2000);