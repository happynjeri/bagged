
const $ = (id) => document.getElementById(id);

let items = [];
let fontIndex = 0;
let toastTimer;

const fonts = [
    { name: "Arial", value: "Arial, sans-serif" },
    { name: "Georgia", value: "Georgia, serif" },
    { name: "Verdana", value: "Verdana, sans-serif" },
    { name: "Trebuchet", value: "'Trebuchet MS', sans-serif" },
    { name: "Monospace", value: "'Courier New', monospace" }
];

// Each item has a name and either a fixed or calculated quantity.
const essentials = {
    "Important documents": [
        ["Passport or national ID", 1],
        ["Visa or entry authorisation, if required", 1],
        ["Flight or transport tickets", 1],
        ["Accommodation details", 1],
        ["Travel insurance details", 1],
        ["Wallet, bank cards and local cash", 1],
        ["Emergency contacts", 1],
        ["Copies of important documents", 1],
        ["Driving licence, if needed", 1],
        ["House keys", 1]
    ],

    "Toiletries and personal care": [
        ["Toothbrush", 1],
        ["Toothpaste", 1],
        ["Deodorant", 1],
        ["Shampoo and conditioner", 1],
        ["Body wash or soap", 1],
        ["Face wash and moisturiser", 1],
        ["Sunscreen", 1],
        ["Lip balm", 1],
        ["Hairbrush or comb", 1],
        ["Nail clippers", 1],
        ["Tweezers", 1],
        ["Razor or shaving items", 1],
        ["Period products, if needed", 1],
        ["Wet wipes and tissues", 1],
        ["Hand sanitiser", 1],
        ["Laundry bag", 1]
    ],

    "Health and safety": [
        ["Prescription medicines", 1],
        ["Copies of prescriptions, if needed", 1],
        ["Glasses or contact lenses", 1],
        ["Basic first-aid kit", 1],
        ["Plasters for blisters", 1],
        ["Personal pain relief, if appropriate", 1],
        ["Insect repellent", 1],
        ["Medical information and emergency contacts", 1]
    ],

    "Electronics": [
        ["Mobile phone", 1],
        ["Phone charger and cable", 1],
        ["Power bank", 1],
        ["Destination-compatible plug adapter", 1],
        ["Headphones or earbuds", 1],
        ["Laptop and charger, if needed", 1],
        ["Camera and memory card, if needed", 1],
        ["Watch and charger, if needed", 1],
        ["Offline maps and saved tickets", 1]
    ],

    "Clothing and shoes": [
        ["Underwear", d => d + 1],
        ["Pairs of socks", d => Math.ceil(d * 0.7) + 1],
        ["Everyday tops", d => Math.ceil(d * 0.7) + 1],
        ["Trousers, shorts or skirts", d => Math.ceil(d / 2)],
        ["Sleepwear", d => Math.max(1, Math.ceil(d / 4))],
        ["Comfortable walking shoes", 1],
        ["Everyday shoes or sandals", 1],
        ["Light jacket or extra layer", 1],
        ["Special occasion outfit, if needed", 1],
        ["Laundry detergent, if needed", 1]
    ],

    "Useful extras": [
        ["Reusable water bottle", 1],
        ["Sunglasses", 1],
        ["Small day bag", 1],
        ["Earplugs and sleep mask", 1],
        ["Pen", 1],
        ["Reusable shopping bag", 1],
        ["Travel snacks", 1],
        ["Travel lock, if needed", 1],
        ["Book or downloaded entertainment", 1]
    ],

    "Before leaving home": [
        ["Check the weather forecast", 1],
        ["Check passport validity and entry requirements", 1],
        ["Check airline baggage and liquid rules", 1],
        ["Download maps and tickets", 1],
        ["Charge phone and power bank", 1],
        ["Check all chargers are packed", 1],
        ["Pack your toothbrush after its last use", 1],
        ["Check the bathroom and electrical sockets", 1],
        ["Secure windows and doors", 1]
    ]
};

const activities = {
    beach: {
        title: "Beach essentials",
        list: [
            ["Swimsuits", d => Math.min(3, Math.ceil(d / 3))],
            ["Beach towel", 1],
            ["Sun hat or cap", 1],
            ["Beach bag", 1],
            ["Waterproof sandals", 1],
            ["Cover-up or rash guard", 1],
            ["Waterproof phone pouch, if needed", 1],
            ["After-sun lotion", 1]
        ]
    },

    hiking: {
        title: "Hiking and outdoors",
        list: [
            ["Hiking boots or trail shoes", 1],
            ["Moisture-wicking hiking socks", d => Math.min(7, Math.ceil(d / 2))],
            ["Waterproof jacket", 1],
            ["Warm layers", 1],
            ["Daypack", 1],
            ["Headlamp or flashlight", 1],
            ["Water and trail snacks", 1],
            ["Navigation map or offline route", 1],
            ["Sun hat and sunscreen", 1],
            ["Blister care supplies", 1],
            ["Emergency whistle and basic safety kit", 1]
        ]
    },

    city: {
        title: "City essentials",
        list: [
            ["Comfortable all-day walking shoes", 1],
            ["Secure crossbody bag", 1],
            ["Compact umbrella", 1],
            ["Transit card or transport app", 1],
            ["Clothing suitable for cultural sites", 1]
        ]
    },

    business: {
        title: "Business essentials",
        list: [
            ["Work outfits", d => Math.min(10, Math.ceil(d / 2))],
            ["Smart shoes", 1],
            ["Laptop and charger", 1],
            ["Notebook and pen", 1],
            ["Meeting files saved offline", 1],
            ["Business cards, if needed", 1]
        ]
    }
};

function quantity(value, days) {
    const result = typeof value === "function"
        ? value(days)
        : value;

    return Math.max(1, Math.min(365, Math.ceil(result)));
}

function makeItems(list, days) {
    return list.map(([label, amount]) => ({
        id: crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2),
        label,
        qty: quantity(amount, days),
        done: false
    }));
}

function buildList(activity, weather, laundry, days) {
    const result = Object.entries(essentials).map(
        ([name, list]) => ({
            name,
            items: makeItems(list, days)
        })
    );

    // Add activity-specific recommendations.
    if (activity === "mixed") {
        ["beach", "hiking", "city"].forEach(key => {
            result.push({
                name: activities[key].title,
                items: makeItems(activities[key].list, days)
            });
        });
    } else if (activities[activity]) {
        result.push({
            name: activities[activity].title,
            items: makeItems(activities[activity].list, days)
        });
    }

    // Add weather-specific items.
    const clothing = result.find(
        category => category.name === "Clothing and shoes"
    );

    const weatherItems = {
        hot: [
            ["Breathable lightweight clothing", Math.min(days, 5)],
            ["Extra sunscreen", 1],
            ["Electrolyte sachets, if useful", 1]
        ],
        cold: [
            ["Warm coat", 1],
            ["Thermal base layers", Math.min(3, Math.ceil(days / 3))],
            ["Warm hat, gloves and scarf", 1]
        ],
        rainy: [
            ["Waterproof jacket", 1],
            ["Compact umbrella", 1],
            ["Water-resistant bag cover", 1]
        ],
        mild: [
            ["Packable extra layer", 1]
        ]
    };

    if (weatherItems[weather]) {
        clothing.items.push(
            ...makeItems(weatherItems[weather], days)
        );
    }

    // Adjust clothing quantities when laundry is unavailable.
    if (laundry === "no") {
        clothing.items.forEach(item => {
            if (/underwear|socks|everyday tops/i.test(item.label)) {
                item.qty = days;
            }
        });
    }

    if (laundry === "yes") {
        clothing.items.push(
            ...makeItems([["Laundry detergent", 1]], days)
        );
    }

    return result;
}

function renderProgress() {
    const allItems = items.flatMap(category => category.items);
    const packed = allItems.filter(item => item.done).length;

    const percent = allItems.length
        ? Math.round(packed / allItems.length * 100)
        : 0;

    $("progressFill").style.width = percent + "%";
    $("progressNumber").textContent = percent + "%";
    $("progressTrack").setAttribute("aria-valuenow", percent);

    $("progressLabel").textContent =
        allItems.length && packed === allItems.length
            ? "All packed — ready to go!"
            : `${packed} of ${allItems.length} items packed`;
}

function render() {
    const query = $("search").value.trim().toLowerCase();
    const filter = $("filter").value;
    const container = $("packingList");

    container.replaceChildren();

    let visibleCount = 0;

    items.forEach(category => {
        const matchingItems = category.items.filter(item => {
            const matchesSearch = item.label.toLowerCase().includes(query);

            const matchesFilter =
                filter === "all" ||
                (filter === "done" && item.done) ||
                (filter === "todo" && !item.done);

            return matchesSearch && matchesFilter;
        });

        if (!matchingItems.length) return;

        visibleCount += matchingItems.length;

        const section = document.createElement("section");
        section.className = "category";

        const heading = document.createElement("div");
        heading.className = "category-title";

        const title = document.createElement("h3");
        title.textContent = category.name;

        const count = document.createElement("span");
        count.className = "count";

        const packedCount = category.items.filter(
            item => item.done
        ).length;

        count.textContent =
            `${packedCount} / ${category.items.length}`;

        heading.append(title, count);
        section.append(heading);

        matchingItems.forEach(item => {
            const label = document.createElement("label");
            label.className = "item";

            if (item.done) label.classList.add("checked");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = item.done;
            checkbox.setAttribute(
                "aria-label",
                `Packed: ${item.label}`
            );

            checkbox.addEventListener("change", () => {
                item.done = checkbox.checked;
                render();
            });

            const name = document.createElement("span");
            name.textContent = item.label;

            const qty = document.createElement("small");
            qty.className = "qty";
            qty.textContent = item.qty > 1
                ? `× ${item.qty}`
                : "";

            label.append(checkbox, name, qty);
            section.append(label);
        });

        container.append(section);
    });

    if (!visibleCount) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent =
            "No matching items. Try another search or filter.";

        container.append(empty);
    }

    renderProgress();
}

function showToast(message) {
    const toast = $("toast");

    toast.textContent = message;
    toast.style.display = "block";

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.style.display = "none";
    }, 2500);
}

$("tripForm").addEventListener("submit", event => {
    event.preventDefault();

    const country = $("country").value.trim();
    const days = Number($("days").value);

    if (!country) {
        showToast("Enter your destination country.");
        return;
    }

    if (!Number.isInteger(days) || days < 1 || days > 365) {
        showToast("Enter a trip length from 1 to 365 days.");
        return;
    }

    const activity = $("activity").value;
    const weather = $("weather").value;
    const laundry = $("laundry").value;

    items = buildList(activity, weather, laundry, days);

    $("listTitle").textContent = `Packing for ${country}`;

    $("tripMeta").textContent =
        `${days} ${days === 1 ? "day" : "days"} · ` +
        `${$("activity").selectedOptions[0].text} · ` +
        `${$("weather").selectedOptions[0].text}`;

    $("search").value = "";
    $("filter").value = "all";

    render();
    showToast("Your packing list is ready.");
});

$("search").addEventListener("input", render);
$("filter").addEventListener("change", render);

$("resetBtn").addEventListener("click", () => {
    items.forEach(category => {
        category.items.forEach(item => {
            item.done = false;
        });
    });

    render();
    showToast("Packing checks have been reset.");
});

$("printBtn").addEventListener("click", () => {
    window.print();
});

$("themeButton").addEventListener("click", () => {
    const dark = $("app").classList.toggle("dark");

    $("themeLabel").textContent = dark
        ? "Light mode"
        : "Dark mode";
});

$("fontButton").addEventListener("click", () => {
    fontIndex = (fontIndex + 1) % fonts.length;

    document.body.style.fontFamily = fonts[fontIndex].value;

    $("fontButton").textContent =
        "Aa " + fonts[fontIndex].name;

    showToast("Font: " + fonts[fontIndex].name);
});

// Display a useful example checklist when the website opens.
$("country").value = "Your destination";

items = buildList("city", "unsure", "some", 5);

$("listTitle").textContent = "Your packing list";
$("tripMeta").textContent = "5 days · City · Weather not set";

render();
const STORAGE_KEY = "bagged-packing-list";

function savePackingList() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items)
    );
}

function loadPackingList() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
        try {
            const parsed = JSON.parse(saved);

            if (Array.isArray(parsed)) {
                items = parsed;
                render();
            }
        } catch (error) {
            console.error("Could not load saved packing list.");
        }
    }
}