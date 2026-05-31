const patternStocks = /^https:\/\/groww\.in\/stocks\/[^\/]+$/;
const patternCharts = /^https:\/\/groww\.in\/charts\/stocks\/[^\/]+$/;

const currentUrl = window.location.href;

/* Stocks Order Card Handler */

let priceObserver = null;
let pageObserver = null;
let isCalculatorAttached = false;

const INPUT_ID = 'custom-amount-input';
const OUTPUT_ID = 'custom-quantity-output';

let currentPrice = 0;

let amountInput = null;
let quantityOutput = null;


const updateQuantity = async () => {

    if (!amountInput || !quantityOutput || !currentPrice) return;

    const amount = parseFloat(amountInput.value);

    const quantity = amount / currentPrice;

    quantityOutput.textContent = `Qty: ${Math.floor(quantity)}`;

    await chrome.storage.local.set({ amount });
};

const createCustomElements = async () => {
    const result = await chrome.storage.local.get(['amount']);
    const defaultAmount = result.amount || 100000;

    // ===== INPUT =====
    const inputParent = document.querySelector(
        '.width100.buySellOrder_bso21Head__SEipI.valign-wrapper.vspace-between'
    );

    if (inputParent && !document.getElementById(INPUT_ID)) {
        const inputElement = document.createElement('input');
        inputElement.id = INPUT_ID;
        inputElement.className = 'buySellOrder_qtyinputbox__6bRuy bodyLargeHeavy contentPrimary borderPrimary';
        inputElement.type = 'number';
        inputElement.min = '1';
        inputElement.value = defaultAmount;
        inputElement.placeholder = 'Enter Amount';
        inputElement.style.marginTop = '10px';

        inputParent.appendChild(inputElement);

        amountInput = document.getElementById(INPUT_ID);

        amountInput.addEventListener('input', updateQuantity);
    }

    // ===== OUTPUT =====
    const outputParent = document.querySelector(
        '.valign-wrapper.contentSecondary.bodySmall'
    );

    if (outputParent && !document.getElementById(OUTPUT_ID)) {
        const outputElement = document.createElement('span');
        outputElement.id = OUTPUT_ID;
        outputElement.style.margin = '0px 5px';

        outputParent.appendChild(outputElement);

        quantityOutput = document.getElementById(OUTPUT_ID);

    }
    console.log('Custom input and quantity output elements created');
};

const addQuantityCalculator = async () => {

    const stockOrderCard = document.getElementById('stockOrderCard');

    // If card removed/invisible -> cleanup
    if (
        !stockOrderCard ||
        !document.body.contains(stockOrderCard) ||
        stockOrderCard.offsetParent === null
    ) {

        if (priceObserver) {
            priceObserver.disconnect();
            priceObserver = null;
            console.log('Price observer detached');
        }

        isCalculatorAttached = false;
        return;
    }

    // Prevent duplicate attachment
    if (isCalculatorAttached) return;

    const cardLivePrice = document.getElementById('card-live-price');

    if (cardLivePrice) {

        // First .bodySmall.flex element
        const targetElement = cardLivePrice.querySelector('.bodySmall.flex');

        if (targetElement) {

            // Second span always contains price
            const priceSpan = targetElement.querySelectorAll('span')[1];

            if (!priceSpan) return;

            const getAndUpdateQuantity = async () => {
                const price = parseFloat(priceSpan.textContent
                    .replace('₹', '')
                    .trim());

                currentPrice = price;

                await updateQuantity();
            };

            // Create input/outputs and calculate initial quantity
            await createCustomElements();
            await getAndUpdateQuantity();

            // Observe realtime price changes
            priceObserver = new MutationObserver(async () => {
                await getAndUpdateQuantity();
            });

            priceObserver.observe(priceSpan, {
                childList: true,
                subtree: true,
                characterData: true
            });

            isCalculatorAttached = true;

            console.log('Price observer attached');

            // Listen for amount changes from storage (in case user has multiple tabs open)
            chrome.storage.onChanged.addListener(async (changes, area) => {
                if (area === 'local' && changes.amount) {
                    const newAmount = changes.amount.newValue;
                    if (amountInput) {
                        amountInput.value = newAmount;
                    }
                    await updateQuantity();
                }
            });
        }
    }
};

const observeStockOrderCard = () => {

    // Watch whole page for stockOrderCard add/remove
    pageObserver = new MutationObserver(async () => {

        const stockOrderCard = document.getElementById('stockOrderCard');

        // If card appears
        if (stockOrderCard && !isCalculatorAttached) {
            await addQuantityCalculator();
        }

        // If card disappears
        if (
            (!stockOrderCard ||
                !document.body.contains(stockOrderCard) ||
                stockOrderCard.offsetParent === null)
            && isCalculatorAttached
        ) {

            if (priceObserver) {
                priceObserver.disconnect();
                priceObserver = null;
            }

            isCalculatorAttached = false;

            console.log('Price observer detached');
        }
    });

    pageObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
};

const main = async () => {

    // Stocks page -> directly attach
    if (patternStocks.test(currentUrl)) {
        await addQuantityCalculator();
    }

    // Charts page -> wait for dynamic stockOrderCard
    if (patternCharts.test(currentUrl)) {
        observeStockOrderCard();
    }
};

if (patternStocks.test(currentUrl) || patternCharts.test(currentUrl)) {
    window.onload = () => {
        setTimeout(main, 1000);
    };
}