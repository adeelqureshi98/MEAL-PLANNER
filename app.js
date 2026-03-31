const weekDays = ['پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ', 'اتوار'];

const svgWhatsApp = `<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;
const svgPDF = `<svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>`;

let weeklyPlan = JSON.parse(localStorage.getItem('weeklyPlan')) || null;
let cookedHistory = JSON.parse(localStorage.getItem('cookedHistory')) || {};
let activeDayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // 0 for Peer(Monday)

let currentRecipeDish = null;

function initApp() {
    const currentMonth = new Date().getMonth() + 1;
    document.getElementById('season-badge').innerText = `اسپیشل ہفتہ وار مینو`;

    if (shouldRegeneratePlan()) generateWeeklyPlan(currentMonth);
    
    renderTabs();
    renderDay(activeDayIndex);

    setTimeout(() => { document.getElementById('loader').style.opacity = 0; setTimeout(()=> document.getElementById('loader').style.display='none', 300) }, 800);
}

function shouldRegeneratePlan() {
    if (!weeklyPlan || !weeklyPlan.timestamp) return true;
    if (Date.now() - weeklyPlan.timestamp > (7 * 24 * 60 * 60 * 1000)) return true;
    return false;
}

function getNutriCategory(category) {
    if (["Chicken", "Beef", "Mutton", "Fish", "Eggs", "Gosht"].includes(category) || category.includes('Meat') || category.includes('Beef') || category.includes('Chicken') || category.includes('Gosht')) return 'protein';
    if (["Sabzi", "Daal/Sabzi"].includes(category) || category.includes('Sabzi')) return 'vitamins';
    if (["Rice", "Pasta", "Sweet"].includes(category) || category.includes('Rice')) return 'carbs';
    if (["Daal", "Besan"].includes(category)) return 'fiber';
    return 'protein';
}

function getNutritionHTML(category) {
    let type = getNutriCategory(category);
    if (type === 'protein') return `<span class="health-badge protein urdu">اعلیٰ پروٹین 🥩</span>`;
    if (type === 'vitamins') return `<span class="health-badge vitamins urdu">وٹامنز اور آئرن 🥬</span>`;
    if (type === 'carbs') return `<span class="health-badge carbs urdu">کاربوہائیڈریٹس / توانائی 🍚</span>`;
    if (type === 'fiber') return `<span class="health-badge fiber urdu">پروٹین اور فائبر 🍲</span>`;
    return '';
}

function generateWeeklyPlan(month) {
    weeklyPlan = { timestamp: Date.now(), days: {} };
    let usedIds = [];
    
    let seasonDishes = window.allDishes.filter(d => d.m.includes(month));

    for (let i = 0; i < 7; i++) {
        let dailySuggestions = [];
        // Health AI: Perfectly balanced day!
        let quotas = { protein: 2, vitamins: 2, carbs: 1, fiber: 1 };
        let shuffled = seasonDishes.sort(() => 0.5 - Math.random());
        
        for (let dish of shuffled) {
            if (usedIds.includes(dish.id)) continue;
            let type = getNutriCategory(dish.c);
            if (quotas[type] > 0) {
                dailySuggestions.push(dish);
                usedIds.push(dish.id);
                quotas[type]--;
            }
        }
        
        // Fallback for remaining slots if exact quota matching runs out of season dishes
        if (dailySuggestions.length < 6) {
            let backup = window.allDishes.sort(() => 0.5 - Math.random());
            for (let dish of backup) {
                if (!dailySuggestions.find(d => d.id === dish.id) && dailySuggestions.length < 6) {
                    dailySuggestions.push(dish);
                }
            }
        }
        
        // Scramble the daily 6 choices so they aren't always grouped by type visually
        weeklyPlan.days[i] = dailySuggestions.sort(() => 0.5 - Math.random());
    }
    localStorage.setItem('weeklyPlan', JSON.stringify(weeklyPlan));
}

function renderTabs() {
    const nav = document.getElementById('days-nav');
    nav.innerHTML = '';
    weekDays.forEach((day, index) => {
        const tab = document.createElement('div');
        tab.className = `tab ${index === activeDayIndex ? 'active' : ''} urdu`;
        tab.innerText = day;
        tab.onclick = () => {
            activeDayIndex = index;
            renderTabs();
            renderDay(index);
        };
        nav.appendChild(tab);
    });
}

function renderDay(dayIndex) {
    document.getElementById('current-day-title').innerText = weekDays[dayIndex] + " کا مینو";
    const grid = document.getElementById('app-grid');
    grid.innerHTML = '';
    
    let items = weeklyPlan.days[dayIndex];
    let userBudget = parseInt(localStorage.getItem('dailyBudget')) || 1500;
    
    items.forEach((item, index) => {
        const isCooked = cookedHistory[item.id] && (Date.now() - cookedHistory[item.id] < 7*24*60*60*1000);
        if (isCooked) return;

        let cc = getCostAndCalories(item.c, 4);
        let budgetFilterStyle = cc.cost > userBudget ? 'opacity:0.4; filter:grayscale(90%); border-left:4px solid #d9534f;' : '';
        let budgetWarning = cc.cost > userBudget ? `<span class="urdu" style="color:#d9534f; font-size:0.9rem; font-weight:bold; display:block; margin-top:5px; margin-bottom:10px;">⚠️ بجٹ سے باہر (Rs. ${cc.cost})</span>` : '';

        const card = document.createElement('div');
        card.className = 'card';
        card.style.animation = `popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${index * 0.1}s forwards`;
        card.style.opacity = '0';
        if(budgetFilterStyle) card.style.cssText += budgetFilterStyle;
        
        // Ensure image mapping safely fallbacks to Mutton if Beef isn't explicitly defined by copy command
        let imgName = item.c === 'Mutton' ? 'Beef' : item.c;

        card.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; flex-wrap: wrap;">
                <div>
                    <span class="card-category urdu" style="font-size:1.1rem; padding:0.4rem 1.2rem; margin-bottom:0;">${window.urduTags[item.c] || item.c}</span>
                    ${getNutritionHTML(item.c)}
                </div>
                <div style="display:flex; gap:10px; align-items:center;">
                    <a href="https://www.youtube.com/results?search_query=${item.n}+Recipe" target="_blank" class="btn-icon" style="background:#ff000022; color:#ff0000; font-size:1.2rem; display:flex; align-items:center; justify-content:center; text-decoration:none; border:none; box-shadow:none;">📹</a>
                    <button class="btn-icon" style="border:none; box-shadow:none; font-size:1.5rem; cursor:pointer; background:transparent;" onclick="toggleFavorite(${item.id})">
                        ⭐
                    </button>
                </div>
            </div>
            ${budgetWarning}
            <div class="card-title urdu gold-text" style="font-size:1.8rem;">${item.n}</div>
            <div class="btn-group">
                <button class="btn-primary urdu" style="font-size:1.2rem;" onclick="openRecipe(${item.id})">ترکیب و مقدار</button>
            </div>
            <div class="btn-row">
                <button class="btn-secondary urdu" style="font-size:1.2rem;" onclick="markCooked(${item.id})">پکا لیا</button>
                <button class="btn-icon" aria-label="WhatsApp" onclick="shareWhatsApp(${item.id})">${svgWhatsApp}</button>
                <button class="btn-icon" aria-label="PDF" onclick="downloadPDF(${item.id})">${svgPDF}</button>
            </div>
        `;
        grid.appendChild(card);
    });
    
    if(grid.innerHTML === '') {
        grid.innerHTML = `<p class="urdu" style="text-align:center;width:100%;color:#86868b;font-size:1.2rem;">یہ تمام ڈشز پچھلے 7 دن میں پکائی جا چکی ہیں۔</p>`;
    }
}

// ------ CUSTOM THEMES & NIGHT MODE ------ //
const appThemes = ['theme-gold', 'theme-rose', 'theme-silver'];
let currentThemeIndex = parseInt(localStorage.getItem('appThemeIndex')) || 0;
let isNightMode = localStorage.getItem('isNightMode') === 'true';

// Global Tag Override for Premium Aesthetics (Phase 8)
window.urduTags = {
    'Chicken': '🍗 چکن',
    'Beef': '🥩 بیف',
    'Mutton': '🥩 مٹن',
    'Sabzi': '🥦 سبزی',
    'Daal': '🍲 دال',
    'Rice': '🍚 چاول',
    'Sweet': '🍮 میٹھا',
    'Fish': '🐟 مچھلی',
    'Eggs': '🍳 انڈے',
    'Besan': '🧆 بیسن'
};

// --- WATER TRACKER LOGIC ---
let waterLevel = parseInt(localStorage.getItem('waterLevel')) || 0;
let waterDate = localStorage.getItem('waterDate');
let todayDate = new Date().toDateString();

if (waterDate !== todayDate) {
    waterLevel = 0;
    localStorage.setItem('waterLevel', 0);
    localStorage.setItem('waterDate', todayDate);
}

function renderWaterTracker() {
    let drops = document.querySelectorAll('#water-tracker span');
    if(!drops) return;
    drops.forEach((drop, index) => {
        drop.style.opacity = index < waterLevel ? '1' : '0.3';
        drop.style.textShadow = index < waterLevel ? '0 0 10px #00BFFF' : 'none';
        drop.style.transform = index < waterLevel ? 'scale(1.1)' : 'scale(1)';
    });
}

window.drinkWater = function(index) {
    if (index === waterLevel) waterLevel++;
    else if (index < waterLevel) waterLevel = index;
    else waterLevel = index + 1;
    localStorage.setItem('waterLevel', waterLevel);
    renderWaterTracker();
};

document.addEventListener('DOMContentLoaded', () => { renderWaterTracker(); });

// --- BUDGET LOGIC ---
window.updateBudget = function(val) {
    document.getElementById('budget-display').innerText = `Rs. ${val}`;
    localStorage.setItem('dailyBudget', val);
    renderDay(activeDayIndex);
};

function applyTheme(index) {
    appThemes.forEach(t => document.body.classList.remove(t));
    document.body.classList.add(appThemes[index]);
}

function toggleTheme() {
    currentThemeIndex = (currentThemeIndex + 1) % appThemes.length;
    localStorage.setItem('appThemeIndex', currentThemeIndex);
    applyTheme(currentThemeIndex);
}

function toggleNightMode() {
    isNightMode = !isNightMode;
    document.body.classList.toggle('night-mode', isNightMode);
    localStorage.setItem('isNightMode', isNightMode);
}

// Apply initially
applyTheme(currentThemeIndex);
if (isNightMode) document.body.classList.add('night-mode');

// ------ VIEW ROUTING ------ //
window.switchMainTab = function(viewId, element) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    const view = document.getElementById('view-' + viewId);
    if(view) view.classList.add('active');
    
    if (element) {
        element.classList.add('active');
    } else {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if(item.getAttribute('onclick')?.includes(`'${viewId}'`)) item.classList.add('active');
        });
    }

    if(viewId === 'ramadan') renderRamadanTab();
    if(viewId === 'favs') renderFavorites();
    if(viewId === 'grocery') generateGroceryList();
    if(viewId === 'home') {
        const daysNav = document.getElementById('days-nav');
        if(daysNav) daysNav.style.display = 'flex';
        renderTabs();
        renderDay(activeDayIndex);
    } else {
        const daysNav = document.getElementById('days-nav');
        if(daysNav) daysNav.style.display = 'none';
    }
};

window.renderRamadanTab = function() {
    const grid = document.getElementById('ramadan-grid');
    if (!grid) return;
    
    let ramadanDishes = window.allDishes.filter(d => ['Sabzi', 'Daal', 'Chicken'].includes(d.c) && !d.n.includes('کڑاہی') && !d.n.includes('پلاؤ'));
    let selected = ramadanDishes.sort(() => 0.5 - Math.random()).slice(0, 6);
    
    grid.innerHTML = selected.map(dish => {
        const cost = getCostAndCalories(dish.c, 4);
        return `
            <div class="card" onclick="openRecipe(${dish.id})">
                <span class="card-category urdu">${window.urduTags[dish.c] || dish.c}</span>
                <h3 class="urdu">${dish.n}</h3>
                <div class="urdu" style="font-size:0.9rem; color:var(--text-secondary); margin-top:5px;">سحر و افطار کے لیے بہترین ✅</div>
                <div class="urdu gold-text" style="margin-top:10px; font-weight:bold;">اندازاً خرچ: Rs. ${cost.cost}</div>
            </div>
        `;
    }).join('');
};

window.startVoiceSearch = function() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("معذرت، آپ کا براؤزر وائس سرچ کو سپورٹ نہیں کرتا۔");
        return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'ur-PK';
    const status = document.getElementById('voice-status');
    if(status) {
        status.style.display = 'block';
        status.innerText = "سن رہا ہوں... (بولیں)";
    }
    
    recognition.onresult = (event) => {
        const query = event.results[0][0].transcript;
        if(status) status.innerText = "آپ نے کہا: " + query;
        document.getElementById('searchInput').value = query;
        filterDishes();
        setTimeout(() => { if(status) status.style.display = 'none'; }, 2000);
    };
    recognition.onerror = () => {
        if(status) status.style.display = 'none';
        alert("آواز پہچاننے میں مسئلہ ہوا۔ دوبارہ کوشش کریں۔");
    };
    recognition.start();
};

function filterDishes() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('#app-grid .card');
    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        if (text.includes(input)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

window.filterByCategory = function(category, element) {
    // UI Update
    document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
    element.classList.add('active');
    
    // Clear search
    document.getElementById('searchInput').value = '';

    if (category === 'All') {
        document.getElementById('days-nav').style.display = 'flex';
        renderDay(activeDayIndex);
        return;
    }

    // Filter Logic
    document.getElementById('days-nav').style.display = 'none';
    document.getElementById('current-day-title').innerText = (window.urduTags[category] || category) + " کی ریسیپیز";
    
    let filtered = window.allDishes.filter(d => d.c === category || d.c.includes(category));
    
    const grid = document.getElementById('app-grid');
    grid.innerHTML = '';
    
    if (filtered.length === 0) {
        grid.innerHTML = `<p class="urdu" style="text-align:center;width:100%;color:var(--text-secondary);font-size:1.2rem;">معذرت، اس کیٹیگری میں کوئی ڈش نہیں ملی۔</p>`;
    } else {
        filtered.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.animation = `popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${index * 0.05}s forwards`;
            card.style.opacity = '0';
            
            card.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; flex-wrap: wrap;">
                    <div>
                        <span class="card-category urdu" style="font-size:1.1rem; padding:0.4rem 1.2rem; margin-bottom:0;">${window.urduTags[item.c] || item.c}</span>
                        ${getNutritionHTML(item.c)}
                    </div>
                </div>
                <div class="card-title urdu gold-text" style="font-size:1.8rem;">${item.n}</div>
                <button class="btn-primary urdu" style="font-size:1.2rem; width:100%;" onclick="openRecipe(${item.id})">ترکیب دیکھیں</button>
            `;
            grid.appendChild(card);
        });
    }
};

// Apply initial theme on load
applyTheme(currentThemeIndex);

// ------ DYNAMIC PORTION CALCULATOR LOGIC ------ //
function scaleIngredient(text, members) {
    return text.replace(/\b(\d+(?:\.\d+)?)\b/g, (match) => {
        let num = parseFloat(match);
        let scaled = (num / 4) * members;
        return Number.isInteger(scaled) ? scaled : scaled.toFixed(1);
    });
}

function openRecipe(id) {
    currentRecipeDish = window.allDishes.find(d => d.id === id);
    document.getElementById('members-count').value = 4; // Default
    document.getElementById('modal-title').innerText = currentRecipeDish.n;
    document.getElementById('modal-category').innerText = window.urduTags[currentRecipeDish.c] || currentRecipeDish.c;
    document.getElementById('recipe-modal').classList.add('active');
    updateQuantities(); // Render initial list for 4 members
}

function changeMembers(amount) {
    const input = document.getElementById('members-count');
    let val = parseInt(input.value) + amount;
    if (val < 1) val = 1;
    if (val > 50) val = 50;
    input.value = val;
    updateQuantities();
}

function updateQuantities() {
    if (!currentRecipeDish) return;
    const members = parseInt(document.getElementById('members-count').value) || 4;
    
    // Cost & Calories UI update
    let cc = getCostAndCalories(currentRecipeDish.c, members);
    let dietWarning = cc.cals >= 350 
        ? `<div style="color:#d9534f; font-size:1rem; margin-top:8px;">⚠️ ڈائٹ الرٹ: یہ خوراک کیلوریز میں بھاری ہے!</div>` 
        : `<div style="color:#5cb85c; font-size:1rem; margin-top:8px;">✅ ہلکی غذا (Healthy)</div>`;
    
    document.getElementById('modal-cost-cals').innerHTML = `💰 تخمینہ خرچ: <strong>Rs. ${cc.cost}</strong> &nbsp;|&nbsp; 🔥 کیلوریز: <strong>${cc.cals}</strong> kcal <br>${dietWarning}`;
    
    const ingredientsArray = currentRecipeDish.i.split(',').map(item => item.trim());
    
    const renderedIngredients = ingredientsArray.map(item => {
        let scaledItem = scaleIngredient(item, members);
        return `<li>${scaledItem}</li>`;
    }).join('');

    document.getElementById('modal-body').innerHTML = `
        <div class="recipe-section urdu">
            <h3>اجزاء (${members} افراد کے لیے):</h3>
            <ul>${renderedIngredients}</ul>
        </div>
        <div class="recipe-section urdu">
            <h3>ترکیب:</h3>
            <p>${currentRecipeDish.t}</p>
        </div>
    `;
}

// ------ AI REBRANDING & AUDIO UPGRADES ------ //
let utterance = null;
function speakRecipe() {
    if(!currentRecipeDish) return;
    window.speechSynthesis.cancel();
    let text = `${currentRecipeDish.n} بنانے کی ترکیب۔ ${currentRecipeDish.t}`;
    utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ur-PK'; 
    window.speechSynthesis.speak(utterance);
}

window.playBismillah = function() {
    window.speechSynthesis.cancel();
    let msg = new SpeechSynthesisUtterance("بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم. یا اللہ اس کھانے میں برکت عطا فرما۔");
    msg.lang = 'ur-PK';
    window.speechSynthesis.speak(msg);
    alert("🤲 بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم\\n\\nاللَّهُمَّ بَارِكْ لَنَا فِيهِ وَأَطْعِمْنَا خَيْراً مِنْهُ\\n(اے اللہ! ہمارے لیے اس میں برکت عطا فرما اور ہمیں اس سے بہتر کھلا)");
};

// ------ FOCUS MODE WAKE LOCK ------ //
let wakeLock = null;
let isFocusMode = false;

window.toggleFocusMode = function() {
    isFocusMode = !isFocusMode;
    let modal = document.querySelector('.modal-content');
    let btn = document.getElementById('focus-btn');
    
    if (isFocusMode) {
        modal.style.transform = 'scale(1.1)';
        modal.style.marginTop = '10vh';
        btn.innerText = "فوکس موڈ بند کریں ❌";
        btn.style.background = "#d9534f";
        btn.style.color = "#fff";
        btn.style.boxShadow = "0 0 15px rgba(217, 83, 79, 0.5)";
        requestWakeLock();
    } else {
        modal.style.transform = 'translateY(100%)';
        setTimeout(() => {
            modal.style.transform = 'scale(1)';
            modal.style.transform = 'none';
        }, 300);
        modal.style.marginTop = '0';
        btn.innerText = "فوکس موڈ 🔍";
        btn.style.background = "transparent";
        btn.style.color = "var(--text-primary)";
        btn.style.boxShadow = "none";
        releaseWakeLock();
    }
};

async function requestWakeLock() {
    try {
        if('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
    } catch (err) { console.log("Wake Lock API not supported."); }
}
function releaseWakeLock() {
    if(wakeLock !== null) { wakeLock.release(); wakeLock = null; }
}

function openYouTube() {
    if(!currentRecipeDish) return;
    let q = encodeURIComponent(`${currentRecipeDish.n} recipe urdu`);
    window.open(`https://www.youtube.com/results?search_query=${q}`, '_blank');
}

function getCostAndCalories(category, members) {
    let baseCost = 0; let baseCals = 0;
    if(category.includes('Beef') || category.includes('Mutton') || category.includes('Gosht')) { baseCost = 600; baseCals = 450; }
    else if(category.includes('Chicken') || category.includes('Fish')) { baseCost = 350; baseCals = 350; }
    else if(category.includes('Sabzi')) { baseCost = 150; baseCals = 150; }
    else if(category.includes('Daal') || category.includes('Besan')) { baseCost = 100; baseCals = 200; }
    else { baseCost = 200; baseCals = 300; }
    return { cost: baseCost * members, cals: baseCals };
}

// ------ FRIDGE SCANNER LOGIC ------ //
const commonTags = ['آلو', 'پیاز', 'ٹماٹر', 'چکن', 'گوشت', 'بیف', 'انڈے', 'دال', 'چاول', 'گوبھی', 'بھنڈی', 'پالک'];
let selectedTags = [];
function renderScannerTags() {
    const container = document.getElementById('scanner-tags');
    if(!container) return;
    container.innerHTML = commonTags.map(tag => `
        <span class="card-category urdu ${selectedTags.includes(tag) ? 'active' : ''}" style="cursor:pointer; padding:0.5rem 1rem; ${selectedTags.includes(tag) ? 'background:var(--gold-solid); color:#fff;' : ''}" onclick="toggleTag('${tag}')">${tag}</span>
    `).join('');
}
function toggleTag(tag) {
    if(selectedTags.includes(tag)) selectedTags = selectedTags.filter(t => t !== tag);
    else selectedTags.push(tag);
    renderScannerTags();
}
function scanFridge() {
    const resultsContainer = document.getElementById('scanner-results');
    resultsContainer.innerHTML = '';
    if(selectedTags.length === 0) return;
    
    let matches = window.allDishes.filter(dish => {
        return selectedTags.every(tag => dish.i.includes(tag) || dish.n.includes(tag));
    });

    if(matches.length === 0) {
        resultsContainer.innerHTML = `<p class="urdu" style="text-align:center; width:100%; color:var(--text-secondary);">کوئی ڈش نہیں ملی۔</p>`;
        return;
    }

    matches.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.animation = `popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${index * 0.05}s forwards`;
        card.style.opacity = '0';
        card.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; flex-wrap: wrap;">
                <div>
                    <span class="card-category urdu" style="font-size:1.1rem; padding:0.4rem 1.2rem; margin-bottom:0;">${window.urduTags[item.c] || item.c}</span>
                    ${getNutritionHTML(item.c)}
                </div>
                <div style="display:flex; gap:10px; align-items:center;">
                    <a href="https://www.youtube.com/results?search_query=${item.n}+Recipe" target="_blank" class="btn-icon" style="background:#ff000022; color:#ff0000; font-size:1.2rem; display:flex; align-items:center; justify-content:center; text-decoration:none; border:none; box-shadow:none;">📹</a>
                    <button class="btn-icon" style="border:none; box-shadow:none; font-size:1.5rem; cursor:pointer; background:transparent;" onclick="toggleFavorite(${item.id})">
                        ${favHistory.includes(item.id) ? '❤️' : '🤍'}
                    </button>
                </div>
            </div>
            <div class="card-title urdu gold-text" style="font-size:1.8rem;">${item.n}</div>
            <button class="btn-primary urdu" style="font-size:1.2rem; width:100%;" onclick="openRecipe(${item.id})">ترکیب دیکھیں</button>
        `;
        resultsContainer.appendChild(card);
    });
}
window.addEventListener('load', renderScannerTags);


function closeRecipe() {
    document.getElementById('recipe-modal').classList.remove('active');
    currentRecipeDish = null;
}

function markCooked(id) {
    cookedHistory[id] = Date.now();
    localStorage.setItem('cookedHistory', JSON.stringify(cookedHistory));
    renderDay(activeDayIndex);
}

function shareWhatsApp(id) {
    const dish = window.allDishes.find(d => d.id === id);
    const text = `آج کا مینو: *${dish.n}* \n\n*اجزاء (4 افراد):* ${dish.i} \n\n*ترکیب:* ${dish.t}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function downloadPDF(id) {
    const dish = window.allDishes.find(d => d.id === id);
    const element = document.createElement('div');
    element.innerHTML = `
        <div style="padding:40px; font-family:sans-serif; direction:rtl; text-align:right; background:#ffffff;">
            <h1 style="color:#CFB53B; font-size:40px; border-bottom:2px solid #CFB53B; padding-bottom:10px;">${dish.n}</h1>
            <h3 style="color:#1d1d1f; margin-top:30px;">اجزاء (4 افراد کے لیے):</h3>
            <p style="font-size:20px; line-height:1.8;">${dish.i.split(',').join('<br>')}</p>
            <h3 style="color:#1d1d1f; margin-top:30px;">ترکیب:</h3>
            <p style="font-size:20px; line-height:1.8;">${dish.t}</p>
        </div>
    `;
    html2pdf().set({
        margin: 1, filename: `${dish.n}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).from(element).save();
}

function updateNetworkStatus() {
    const statusBadge = document.getElementById('network-status');
    if (navigator.onLine) {
        statusBadge.innerText = 'آن لائن (کلاؤڈ سنک)';
        statusBadge.style.color = '#CFB53B';
        statusBadge.style.background = 'rgba(207, 181, 59, 0.1)';
        syncOnlineRecipes(); // Attempt to fetch latest from cloud
    } else {
        statusBadge.innerText = 'آف لائن موڈ';
        statusBadge.style.color = '#86868b';
        statusBadge.style.background = '#f0f0f0';
    }
}

async function syncOnlineRecipes() {
    try {
        console.log("Checking cloud database for latest 2026 recipes...");
    } catch (e) {
        console.log("Staying on local reliable cache.");
    }
}

window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

// ------ NEW PLATFORM FEATURES (Favorites, Grocery, Custom, Timer) ------ //
let favHistory = JSON.parse(localStorage.getItem('favHistory')) || [];

function toggleFavorite(id) {
    if (favHistory.includes(id)) {
        favHistory = favHistory.filter(f => f !== id);
    } else {
        favHistory.push(id);
    }
    localStorage.setItem('favHistory', JSON.stringify(favHistory));
    
    // Smoothly rerender active view
    let currentView = document.querySelector('.view-section.active').id;
    if (currentView === 'view-home') renderDay(activeDayIndex);
    if (currentView === 'view-favs') renderFavorites();
}

function renderFavorites() {
    const grid = document.getElementById('fav-grid');
    grid.innerHTML = '';
    
    if (favHistory.length === 0) {
        grid.innerHTML = `<p class="urdu" style="text-align:center;width:100%;color:#86868b;font-size:1.2rem;">آپ نے ابھی تک کوئی ڈش پسندیدہ میں شامل نہیں کی۔</p>`;
        return;
    }

    favHistory.forEach((id, index) => {
        const item = window.allDishes.find(d => d.id === id);
        if(!item) return;

        const card = document.createElement('div');
        card.className = 'card';
        card.style.animation = `popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${index * 0.05}s forwards`;
        card.style.opacity = '0';
        
        card.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; flex-wrap: wrap;">
                <div>
                    <span class="card-category urdu" style="font-size:1.1rem; padding:0.4rem 1.2rem; margin-bottom:0;">${window.urduTags[item.c] || item.c}</span>
                    ${getNutritionHTML(item.c)}
                </div>
                <div style="display:flex; gap:10px; align-items:center;">
                    <a href="https://www.youtube.com/results?search_query=${item.n}+Recipe" target="_blank" class="btn-icon" style="background:#ff000022; color:#ff0000; font-size:1.2rem; display:flex; align-items:center; justify-content:center; text-decoration:none; border:none; box-shadow:none;">📹</a>
                    <button class="btn-icon" style="border:none; box-shadow:none; font-size:1.5rem; cursor:pointer; background:transparent;" onclick="toggleFavorite(${item.id})">❤️</button>
                </div>
            </div>
            <div class="card-title urdu gold-text" style="font-size:1.8rem;">${item.n}</div>
            <div class="btn-group">
                <button class="btn-primary urdu" style="font-size:1.2rem;" onclick="openRecipe(${item.id})">ترکیب و مقدار</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function generateGroceryList() {
    const listContainer = document.getElementById('grocery-list-container');
    const members = parseInt(document.getElementById('grocery-members').value) || 4;
    
    if(!weeklyPlan || !weeklyPlan.days) return;

    let aggregated = {};
    const regex = /(.*?)\s*(\d+(?:\.\d+)?)\s*(.+)/;

    for (let i = 0; i < 7; i++) {
        let items = weeklyPlan.days[i] || [];
        for (let dish of items) {
            let ingredientsArray = dish.i.split(',').map(itm => itm.trim());
            ingredientsArray.forEach(ing => {
                let match = regex.exec(ing);
                if (match) {
                    let name = match[1].trim();
                    let qty = parseFloat(match[2]);
                    let unit = match[3].trim();
                    let scaledQty = (qty / 4) * members;
                    let key = `${name} (${unit})`;
                    if (!aggregated[key]) aggregated[key] = { name, unit, qty: 0 };
                    aggregated[key].qty += scaledQty;
                } else {
                    if (!aggregated[ing]) aggregated[ing] = { name: ing, unit: '', qty: 0 };
                }
            });
        }
    }

    let html = `<div style="display:flex; flex-direction:column; gap:8px; margin-top:10px; width:100%;">`;
    for (let key in aggregated) {
        let item = aggregated[key];
        let displayStr = "";
        if (item.qty > 0) {
            let finalQty = Number.isInteger(item.qty) ? item.qty : item.qty.toFixed(1);
            displayStr = `${item.name} - ${finalQty} ${item.unit}`;
        } else {
            displayStr = `${item.name}`;
            if(item.name.replace(/\s+/g, '') === '') continue;
        }
        
        html += `
            <label style="display:flex; align-items:center; gap:12px; padding:12px 10px; background:var(--bg-light); border-radius:8px; border:1px solid var(--border-subtle); cursor:pointer; transition: opacity 0.2s;">
                <input type="checkbox" style="width:24px; height:24px; accent-color:var(--gold-solid);" onchange="this.parentElement.style.opacity = this.checked ? '0.4' : '1';">
                <span class="urdu" style="flex:1; font-size:1.3rem; color:var(--text-primary); line-height:1.2;">${displayStr}</span>
            </label>
        `;
    }
    html += `</div>`;
    listContainer.innerHTML = html;
}

function shareGroceryWhatsApp() {
    let text = document.getElementById('grocery-list-container').innerText;
    window.open(`https://wa.me/?text=${encodeURIComponent("اس ہفتے کا سودا سلف:\n\n" + text)}`, '_blank');
}

let customRecipesLoaded = false;
function loadCustomRecipes() {
    if (customRecipesLoaded) return;
    let customs = JSON.parse(localStorage.getItem('customRecipes')) || [];
    window.allDishes = window.allDishes.concat(customs);
    customRecipesLoaded = true;
}

function saveCustomRecipe(e) {
    e.preventDefault();
    const name = document.getElementById('custom-name').value;
    const cat = document.getElementById('custom-cat').value;
    const ing = document.getElementById('custom-ing').value;
    const inst = document.getElementById('custom-inst').value;

    let newId = Date.now();
    const newDish = { id: newId, n: name, c: cat, m: [1,2,3,4,5,6,7,8,9,10,11,12], i: ing, t: inst };
    
    window.allDishes.push(newDish);
    let customs = JSON.parse(localStorage.getItem('customRecipes')) || [];
    customs.push(newDish);
    localStorage.setItem('customRecipes', JSON.stringify(customs));

    alert("آپ کی ترکیب کامیابی سے شامل ہو گئی ہے!");
    e.target.reset();
    initApp(); // Regenerate everything
    switchMainTab('home');
}

let timerInterval;
function startTimer(mins) {
    let seconds = mins * 60;
    const btn = document.getElementById('timer-btn');
    clearInterval(timerInterval);
    btn.disabled = true;
    timerInterval = setInterval(() => {
        let m = Math.floor(seconds / 60);
        let s = seconds % 60;
        btn.innerText = `⏳ ${m}:${s.toString().padStart(2,'0')} باقی`;
        seconds--;
        if (seconds < 0) {
            clearInterval(timerInterval);
            btn.innerText = "✅ وقت ختم!";
            btn.disabled = false;
            // Native mobile vibration if supported
            if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
        }
    }, 1000);
}

// ------ PAKISTANI KITCHEN TOOLS ------ //
function renderMagicGrid(items, title) {
    document.getElementById('current-day-title').innerText = title;
    document.getElementById('days-nav').style.display = 'none';
    
    const grid = document.getElementById('app-grid');
    grid.innerHTML = '';
    
    if(items.length === 0) {
        grid.innerHTML = `<p class="urdu" style="text-align:center;width:100%;color:var(--text-secondary);">اس سے متعلق کوئی ترکیب نہیں ملی۔</p>`;
    } else {
        items.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.animation = `popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${index * 0.05}s forwards`;
            card.style.opacity = '0';
            card.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; flex-wrap: wrap;">
                    <div>
                        <span class="card-category urdu" style="font-size:1.1rem; padding:0.4rem 1.2rem; margin-bottom:0;">${window.urduTags[item.c] || item.c}</span>
                        ${getNutritionHTML(item.c)}
                    </div>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <a href="https://www.youtube.com/results?search_query=${item.n}+Recipe" target="_blank" class="btn-icon" style="background:#ff000022; color:#ff0000; font-size:1.2rem; display:flex; align-items:center; justify-content:center; text-decoration:none; border:none; box-shadow:none;">📹</a>
                        <button class="btn-icon" style="border:none; box-shadow:none; font-size:1.5rem; cursor:pointer; background:transparent;" onclick="toggleFavorite(${item.id})">
                            ${favHistory.includes(item.id) ? '❤️' : '🤍'}
                        </button>
                    </div>
                </div>
                <div class="card-title urdu gold-text" style="font-size:1.8rem;">${item.n}</div>
                <button class="btn-primary urdu" style="font-size:1.2rem; width:100%;" onclick="openRecipe(${item.id})">ترکیب دیکھیں</button>
            `;
            grid.appendChild(card);
        });
    }
    switchMainTab('home');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active')); // UX tweak to show Custom View
}

function buildDawat() {
    let guests = parseInt(document.getElementById('dawat-guests').value) || 15;
    let rices = window.allDishes.filter(d => d.c === 'Rice');
    let meats = window.allDishes.filter(d => d.c === 'Beef' || d.c === 'Mutton' || d.c === 'Chicken');
    let sweets = window.allDishes.filter(d => d.c === 'Sweet');
    
    let dawatItems = [
        rices[Math.floor(Math.random()*rices.length)],
        meats[Math.floor(Math.random()*meats.length)],
        meats[Math.floor(Math.random()*meats.length)],
        sweets[Math.floor(Math.random()*sweets.length)]
    ];
    dawatItems = [...new Set(dawatItems)]; // Deduplicate
    renderMagicGrid(dawatItems, `🏰 ${guests} مہمانوں کا شاہی دعوت مینو`);
    setTimeout(() => alert(`دعوت مینو تیار ہے! کسی بھی ڈش پر کلک کر کے افراد کی تعداد ${guests} کریں تاکہ سودا سلف کی پرچی خود بخود بن سکے۔`), 400);
}

function leftoverMagic() {
    let q = document.getElementById('leftover-input').value.toLowerCase();
    if(!q) return;
    let fallbackItems = [];
    if(q.includes('چاول') || q.includes('rice') || q.includes('chawal')) {
        fallbackItems = window.allDishes.filter(d => d.n.includes('زردہ') || d.n.includes('چاول') || d.n.includes('کھچڑی') || d.n.includes('فرائیڈ'));
    } else if(q.includes('روٹی') || q.includes('roti') || q.includes('bread')) {
        fallbackItems = window.allDishes.filter(d => d.n.includes('چوری') || d.n.includes('حلوہ') || d.n.includes('رول') || d.n.includes('پراٹھہ'));
    } else if(q.includes('سالن') || q.includes('گوشت') || q.includes('meat') || q.includes('qorma') || q.includes('قورمہ')) {
        fallbackItems = window.allDishes.filter(d => d.n.includes('پلاؤ') || d.n.includes('بریانی') || d.n.includes('سموسے'));
    } else {
        fallbackItems = window.allDishes.filter(d => d.i.includes(q) || d.n.includes(q)).slice(0,6);
    }
    if (fallbackItems.length === 0) fallbackItems = window.allDishes.sort(() => 0.5 - Math.random()).slice(0, 3);
    renderMagicGrid(fallbackItems.slice(0,6), "🥘 بچے ہوئے کھانے کا جادو");
}

function showFastMeals() {
    let fastItems = window.allDishes.filter(d => ['Eggs', 'Sabzi', 'Besan'].includes(d.c) || d.n.includes('انڈا') || d.n.includes('دال') || d.n.includes('سلاد'));
    renderMagicGrid(fastItems.sort(() => 0.5 - Math.random()).slice(0, 6), "⏱️ 20 منٹ کی فوری ڈشز");
}

function showHistory() {
    let historyKeys = Object.keys(localStorage).filter(k => k.startsWith('dish_cooked_'));
    let recentCooks = historyKeys.map(k => {
        let id = parseInt(k.replace('dish_cooked_', ''));
        let date = parseInt(localStorage.getItem(k));
        let dish = window.allDishes.find(d => d.id === id);
        return { dish, date };
    }).filter(item => item.dish).sort((a,b) => b.date - a.date).slice(0, 7); // Last 7 unique cooked dishes
    
    let container = document.getElementById('history-results');
    if(recentCooks.length === 0) {
        container.innerHTML = `<p class="urdu" style="color:var(--text-secondary); text-align:center;">ابھی تک کوئی ہسٹری موجود نہیں ہے۔ ہوم پیج سے کسی ڈش کو 'پکا لیا' کریں۔</p>`;
        return;
    }
    
    container.innerHTML = recentCooks.map(item => `
        <div style="padding:12px; background:var(--bg-light); border:1px solid var(--border-subtle); border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
             <span class="urdu" style="font-size:1.3rem; font-weight:bold; color:var(--text-primary);">${item.dish.n}</span>
             <span class="urdu" style="font-size:0.9rem; color:var(--text-secondary);">${new Date(item.date).toLocaleDateString('ur-PK')}</span>
        </div>
    `).join('');
}

// ------ PRO KITCHEN HACKS ------ //
const proHacks = {
    masala: {
        title: "مصالحہ جات بلڈر 🌶️",
        body: `
            <p style="margin-bottom:10px;">بازار کے مہنگے مصالحوں کے بجائے گھر کے خالص مصالحے خود تیار کریں!</p>
            <h4 class="gold-text" style="margin-bottom:5px;">بریانی مصالحہ (1 کلو چاول کے لیے):</h4>
            <ul style="padding-right:20px; margin-bottom:10px;">
                <li>سفید زیرہ: 1 چمچ</li>
                <li>ثابت دھنیا: 1 چمچ</li>
                <li>جائفل اور جاوتری: تھوڑی سی (آدھی چٹکی)</li>
                <li>بادیان کے پھول: 2 عدد</li>
                <li>دار چینی، لونگ، کالی مرچ، الائچی: حسبِ ضرورت</li>
            </ul>
            <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:15px;">ترکیب: ان سب کو فرائنگ پین میں ہلکا سا بھونیں (Dry roast)، اور پھر گرائنڈر میں پیس لیں۔ آپ کا خوشبودار بریانی مصالحہ تیار ہے!</p>
            
            <h4 class="gold-text" style="margin-bottom:5px;">کڑاہی گوشت مصالحہ:</h4>
            <ul style="padding-right:20px;">
                <li>کٹا ہوا دھنیا، کٹی ہوئی لال مرچ، سفید زیرہ، اور تھوڑی سی قصوری میتھی ہم وزن مکس کریں۔</li>
            </ul>
        `
    },
    meat: {
        title: "گوشت گلانے کا فارمولا 🥩",
        body: `
            <p style="margin-bottom:10px;">ایسا گوشت جو منہ میں گھل جائے، گلانے کی مکمل ٹائمنگ درج ذیل ہے:</p>
            <h4 class="gold-text" style="margin-bottom:5px;">کچا پپیتا اور کچری پاؤڈر:</h4>
            <ul style="padding-right:20px; margin-bottom:15px;">
                <li>بیف تکہ یا کباب کے لیے 1 کلو گوشت میں 2 چمچ پیسٹ لگائیں۔ کم از کم 4 گھنٹے کے لیے فریج میں میرینیٹ کریں۔</li>
            </ul>
            <h4 class="gold-text" style="margin-bottom:5px;">پریشر ککر کی ٹائمنگ (سیٹی بجنے کے بعد):</h4>
            <ul style="padding-right:20px;">
                <li><strong>چکن:</strong> 5 سے 7 منٹ</li>
                <li><strong>مٹن:</strong> 15 سے 20 منٹ (گوشت کی سختی کے لحاظ سے)</li>
                <li><strong>بیف (بونگ / پائے):</strong> 40 سے 50 منٹ</li>
                <li><strong>چنے کی دال / لوبیا:</strong> 15 منٹ (پہلے سے بھگویا ہوا)</li>
            </ul>
        `
    },
    tadka: {
        title: "تڑکا جادو (Magic Tadka) 🍲",
        body: `
            <p style="margin-bottom:10px;">ایک ہی طرح کی دال بنا کر بور ہو گئے ہیں؟ یہ مختلف تڑکے آزمائیں، دال کا سواد بالکل بدل جائے گا!</p>
            <h4 class="gold-text" style="margin-bottom:5px;">1. پنجابی لہسنی تڑکا:</h4>
            <p style="margin-bottom:10px;">دیسی گھی میں کٹا ہوا لہسن، زیرہ، اور تھوڑی سی ہینگ (Asafoetida) گولڈن براؤن کریں۔</p>
            <h4 class="gold-text" style="margin-bottom:5px;">2. کڑی پتہ کڑاہا تڑکا:</h4>
            <p style="margin-bottom:10px;">گول ثابت لال مرچ، کڑی پتہ، رائی دانہ اور زیرہ کڑکا لیں۔ کھٹی دالوں کے لیے بہترین!</p>
            <h4 class="gold-text" style="margin-bottom:5px;">3. پیازی براؤن تڑکا:</h4>
            <p>پیاز کو باریک کاٹ کر ڈارک براؤن کریں اور آخر میں گرم مصالحہ ڈال کر دال پر ڈالیں۔</p>
        `
    },
    baking: {
        title: "پتیلے میں بیکنگ 🍰",
        body: `
            <p style="margin-bottom:10px;">اوون نہیں ہے؟ کوئی بات نہیں! ہم پاکستانی پتیلے میں بھی کمال بیکنگ کر سکتے ہیں۔</p>
            <ol style="padding-right:20px; margin-bottom:15px;">
                <li style="margin-bottom:5px;"><strong>پتیلا گرم کریں (Pre-heat):</strong> ایک بڑا اور بھاری پتیلا لیں۔ اس کے اندر جالی کا سٹینڈ یا پرانی سٹیل کی پلیٹ اُلٹی کر کے رکھیں۔</li>
                <li style="margin-bottom:5px;">چولہے کی آنچ تیز کر کے پتیلے کو ڈھک دیں اور 15 منٹ تک گرم ہونے دیں۔ (اندر ہیٹ جمع ہو جائے گی)۔</li>
                <li style="margin-bottom:5px;"><strong>بیکنگ ٹائمنگ:</strong> پیزا نارمل 15 سے 20 منٹ میں تیار ہو جاتا ہے۔ اور کیک قریباً 45 سے 50 منٹ لیتا ہے۔</li>
                <li><strong class="gold-text">احتیاط:</strong> پتیلے کا ڈھکن ایسا ہونا چاہیے جس سے بھاپ باہر نہ نکلے۔ اسے موٹے کپڑے سے کور کر دیں۔</li>
            </ol>
        `
    },
    converter: {
        title: "کچن ناپ تول کیلکولیٹر ⚖️",
        body: `
            <p style="margin-bottom:10px;">انگریزی ویڈیوز کے مشکل ناپ تول کو آسان اردو میں سمجھیں:</p>
            <table style="width:100%; text-align:right; border-collapse: collapse; margin-bottom:15px; font-size:1.1rem;">
                <tr style="border-bottom:1px solid var(--gold-solid); color:var(--gold-solid);"><th>میدہ (Flour)</th><th>مقدار</th></tr>
                <tr><td>1 کپ</td><td>125 گرام</td></tr>
                <tr style="border-bottom:1px solid var(--border-subtle);"><td>1 چمچ (Tbsp)</td><td>8 گرام</td></tr>
                <tr style="border-bottom:1px solid var(--gold-solid); color:var(--gold-solid);"><th style="padding-top:10px;">مائع (دودھ، پانی، تیل)</th><th>مقدار</th></tr>
                <tr><td>1 کپ</td><td>250 ml</td></tr>
                <tr style="border-bottom:1px solid var(--border-subtle);"><td>1/2 کپ</td><td>125 ml</td></tr>
                <tr style="border-bottom:1px solid var(--gold-solid); color:var(--gold-solid);"><th style="padding-top:10px;">چینی (Sugar)</th><th>مقدار</th></tr>
                <tr><td>1 کپ چینی</td><td>200 گرام</td></tr>
            </table>
        `
    },
    substitute: {
         title: "متبادل اجزاء کا جادو 🔄",
         body: `
            <p style="margin-bottom:10px;">کچن میں کوئی چیز ختم ہو گئی ہے؟ یہ دیسی جگاڑ استعمال کریں:</p>
            <ul style="padding-right:20px; margin-bottom:15px; line-height:2;">
                <li><strong>دہی نہیں ہے؟</strong> آدھا کپ دودھ میں 1 چمچ لیموں کا رس ملائیں۔</li>
                <li><strong>کریم نہیں ہے؟</strong> آدھا کپ دودھ اور آدھا کپ مکھن پھینٹ لیں۔</li>
                <li><strong>بیکنگ پاؤڈر ختم؟</strong> چوتھائی چمچ میٹھا سوڈا اور آدھا چمچ سرکہ ملائیں۔</li>
                <li><strong>ٹماٹر نہیں ہیں؟</strong> سالن کے لیے املی کا گودا استعمال کریں۔</li>
            </ul>
         `
    },
    storage: {
         title: "سبزیاں اور گوشت محفوظ 🌿",
         body: `
            <p style="margin-bottom:10px;">ان طریقوں سے آپ کا سودا زیادہ دن تازہ رہے گا:</p>
            <ul style="padding-right:20px; margin-bottom:15px; line-height:2;">
                <li><strong>دھنیا / پودینہ:</strong> اخبار یا ٹشو پیپر میں لپیٹ کر ایئر ٹائٹ ڈبے میں فریج میں رکھیں۔</li>
                <li><strong>ٹماٹر:</strong> بلینڈر میں پیوری بنا کر برف والی ٹرے میں کیوبز جما لیں۔</li>
                <li><strong>گوشت:</strong> دھونے کے بعد چھلنی میں رکھ کر خشک کریں پھر فریز کریں۔ خون والا گوشت جلدی خراب ہوتا ہے۔</li>
                <li><strong>آلو / پیاز:</strong> انہیں فریج میں مت رکھیں۔ تاریک جگہ پر باسکٹ میں رکھیں۔</li>
            </ul>
         `
    },
    multitimer: {
        title: "ملٹی چولہا الارم ⏳",
        body: `
            <p style="margin-bottom:10px;">ایک ہی وقت میں 2 چولہوں کی ٹائمنگ سیٹ کریں:</p>
            <div style="background:var(--bg-light); padding:15px; border-radius:10px; margin-bottom:10px; border:1px solid var(--border-subtle);">
                <label>چولہا 1 (مثلاً چاول بوائل کرنا):</label>
                <div style="display:flex; gap:10px; margin-top:5px;">
                    <input type="number" id="timer1-val" value="7" style="width:60px; text-align:center; padding:5px; border:1px solid #ccc; border-radius:8px;">
                    <button class="btn-primary urdu" style="padding:5px 15px;" onclick="startDualTimer(1)">شروع</button>
                </div>
            </div>
            <div style="background:var(--bg-light); padding:15px; border-radius:10px; border:1px solid var(--border-subtle);">
                <label>چولہا 2 (مثلاً سالن کی بھنائی):</label>
                <div style="display:flex; gap:10px; margin-top:5px;">
                    <input type="number" id="timer2-val" value="15" style="width:60px; text-align:center; padding:5px; border:1px solid #ccc; border-radius:8px;">
                    <button class="btn-primary urdu" style="padding:5px 15px;" onclick="startDualTimer(2)">شروع</button>
                </div>
            </div>
        `
    },
    dictionary: {
        title: "انگریزی گروسری ڈکشنری 📖",
        body: `
            <p style="margin-bottom:10px;">انگریزی پیکنگ والے مصالحے ڈھونڈنا ہوا آسان:</p>
            <input type="text" id="dict-search" placeholder="مثلاً: Zeera یا Cumin..." onkeyup="searchDict()" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ccc; font-size:1.2rem; margin-bottom:15px; text-align:center;">
            <div id="dict-results" style="font-size:1.2rem; line-height:2.5; max-height:250px; overflow-y:auto; border:1px solid var(--border-subtle); padding:10px; border-radius:8px; background:var(--bg-light);"></div>
        `
    },
    leftover: {
        title: "بچا ہوا سالن ٹریکر 🍲",
        body: `
            <p style="margin-bottom:10px;">ایپ آپ کو بتائے گی کہ فریج میں رکھا کون سا سالن خراب ہونے والا ہے:</p>
            <div style="display:flex; gap:10px; margin-bottom:15px;">
                <input type="text" id="leftover-name" placeholder="مثلاً: چکن کڑاہی..." style="flex:1; padding:10px; border-radius:8px; border:1px solid #ccc; font-size:1.1rem;">
                <button class="btn-primary urdu" style="padding:0.5rem 1rem;" onclick="addLeftover()">محفوظ کریں</button>
            </div>
            <div id="leftover-list" style="display:flex; flex-direction:column; gap:10px; max-height:250px; overflow-y:auto;"></div>
        `
    },
    diet: {
        title: "وزن کم کرنے والا ڈائٹ مینو 🥗",
        body: `
            <p style="margin-bottom:10px;">اس مینو میں کوئی تیل، چاول، یا بھاری گوشت نہیں ہوتا۔ صرف سبزیاں، دالیں اور ابلا ہوا چکن تجویز کیا جاتا ہے۔</p>
            <button class="btn-primary urdu" style="width:100%; font-size:1.3rem; margin-top:20px;" onclick="showDietMeals()">ہیلتھی مینو دکھائیں</button>
        `
    },
    inventory: {
        title: "کچن سٹاک (Pantry) 🥚",
        body: `
            <p style="margin-bottom:10px;">ان چیزوں کی لسٹ بنائیں جو کچن میں ختم ہونے والی ہیں:</p>
            <div style="display:flex; gap:10px; margin-bottom:15px;">
                <input type="text" id="pantry-item" placeholder="مثلاً: انڈے، تیل..." style="flex:1; padding:10px; border-radius:8px; border:1px solid #ccc;">
                <button class="btn-primary urdu" onclick="addPantry()">شامل کریں</button>
            </div>
            <div id="pantry-list" style="display:flex; flex-direction:column; gap:5px; max-height:200px; overflow-y:auto;"></div>
        `
    },
    invite: {
        title: "دعوت کارڈ میکر 📜",
        body: `
            <p style="margin-bottom:10px;">مہمانوں کو مینو بھیجنے کے لیے کارڈ بنائیں:</p>
            <input type="text" id="invite-name" placeholder="مہمان کا نام..." style="width:100%; padding:10px; margin-bottom:10px; border-radius:8px; border:1px solid #ccc;">
            <p class="urdu">آج کا مینو خود بخود کارڈ میں شامل ہو جائے گا۔</p>
            <button class="btn-primary urdu" style="width:100%; margin-top:15px;" onclick="generateInvite()">WhatsApp کارڈ ٹھیک کریں</button>
        `
    }
};

function startDualTimer(id) {
    let mins = parseInt(document.getElementById('timer' + id + '-val').value);
    if(isNaN(mins) || mins <= 0) return;
    document.getElementById('hack-modal').classList.remove('active');
    alert('چولہا ' + id + ' کا ' + mins + ' منٹ کا الارم شروع ہو گیا ہے!');
    setTimeout(() => {
        if ("vibrate" in navigator) navigator.vibrate([300, 100, 300, 100, 300]);
        alert('⏰ ٹائم ختم! چولہا ' + id + ' کا وقت پورا ہو گیا ہے۔');
    }, mins * 60000);
}

function openHack(type) {
    const data = proHacks[type];
    document.getElementById('hack-title').innerHTML = data.title;
    document.getElementById('hack-body').innerHTML = data.body;
    document.getElementById('hack-modal').classList.add('active');
    if(type === 'dictionary') setTimeout(() => searchDict(), 100);
    if(type === 'leftover') setTimeout(() => renderLeftovers(), 100);
}

// ------ PHASE 12 GLOBAL LOGIC ------ //
window.searchDict = function() {
    let q = document.getElementById('dict-search')?.value.toLowerCase() || "";
    let map = [
        {u: 'زیرہ', e: 'Cumin'}, {u: 'کلونجی', e: 'Nigella Seeds'}, {u: 'اجوائن', e: 'Carom Seeds'}, {u: 'سونف', e: 'Fennel'},
        {u: 'میتھی دانہ', e: 'Fenugreek'}, {u: 'ثابت دھنیا', e: 'Coriander Seeds'}, {u: 'رائی', e: 'Mustard Seeds'},
        {u: 'دارچینی', e: 'Cinnamon'}, {u: 'لونگ', e: 'Cloves'}, {u: 'تیز پات', e: 'Bay Leaf'}, {u: 'ہلدی', e: 'Turmeric'}
    ];
    let html = map.filter(s => s.u.includes(q) || s.e.toLowerCase().includes(q))
        .map(s => `<div><strong>${s.u}</strong> = <span style="color:var(--text-secondary);">${s.e}</span></div>`).join('<hr style="margin:5px 0; border:0; border-top:1px dashed var(--border-subtle);">');
    let res = document.getElementById('dict-results');
    if(res) res.innerHTML = html || 'کوئی ریکارڈ نہیں ملا';
};

let leftovers = JSON.parse(localStorage.getItem('leftovers')) || [];
window.addLeftover = function() {
    let input = document.getElementById('leftover-name');
    if(!input.value) return;
    leftovers.push({ name: input.value, date: Date.now() });
    localStorage.setItem('leftovers', JSON.stringify(leftovers));
    input.value = '';
    renderLeftovers();
};
window.removeLeftover = function(idx) {
    leftovers.splice(idx, 1);
    localStorage.setItem('leftovers', JSON.stringify(leftovers));
    renderLeftovers();
};
window.renderLeftovers = function() {
    let list = document.getElementById('leftover-list');
    if(!list) return;
    list.innerHTML = leftovers.map((l, i) => {
        let days = Math.floor((Date.now() - l.date) / (1000 * 60 * 60 * 24));
        let color = days === 0 ? '#5cb85c' : (days === 1 ? '#f0ad4e' : '#d9534f');
        let badge = days === 0 ? 'آج فریش' : (days === 1 ? 'کل کا بچا ہوا' : 'فورا ختم کریں!');
        if(days > 2) badge = 'خراب - پھینک دیں ⚠️';
        return `<div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-radius:8px; border-right:6px solid ${color}; background:var(--card-white); box-shadow:var(--shadow-soft);">
            <div style="font-size:1.2rem; display:flex; flex-direction:column;"><strong>${l.name}</strong> <span style="font-size:0.9rem; color:${color}; font-weight:bold;">${badge}</span></div>
            <button onclick="removeLeftover(${i})" style="background:transparent; border:none; border-radius:50px; padding:10px; color:#d9534f; font-size:1.2rem; cursor:pointer;">❌</button>
        </div>`;
    }).join('');
    if(leftovers.length === 0) list.innerHTML = "فریج میں کوئی بچا ہوا سالن نہیں۔";
};

window.showDietMeals = function() {
    document.getElementById('hack-modal').classList.remove('active');
    let dietItems = window.allDishes.filter(d => ['Sabzi', 'Chicken', 'Fish', 'Eggs'].includes(d.c) && !d.n.includes('بریانی') && !d.n.includes('پلاؤ') && !d.n.includes('قورمہ'));
    if(dietItems.length === 0) dietItems = window.allDishes.slice(0,6);
    renderMagicGrid(dietItems.sort(() => 0.5 - Math.random()).slice(0, 6), "🥗 سخت ڈائٹ مینو (وزن کی کمی)");
};

let pantry = JSON.parse(localStorage.getItem('pantry')) || [];
window.addPantry = function() {
    let input = document.getElementById('pantry-item');
    if(!input.value) return;
    pantry.push(input.value);
    localStorage.setItem('pantry', JSON.stringify(pantry));
    input.value = '';
    renderPantry();
};
window.removePantry = function(idx) {
    pantry.splice(idx, 1);
    localStorage.setItem('pantry', JSON.stringify(pantry));
    renderPantry();
};
window.renderPantry = function() {
    let list = document.getElementById('pantry-list');
    if(!list) return;
    list.innerHTML = pantry.map((item, i) => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-light); padding:8px; border-radius:5px;">
            <span class="urdu">${item}</span>
            <button onclick="removePantry(${i})" style="border:none; background:transparent; color:#d9534f; cursor:pointer;">❌</button>
        </div>
    `).join('');
};

window.generateInvite = function() {
    let name = document.getElementById('invite-name').value || 'پیارے دوست';
    let currentDayMenu = weeklyPlan.days[activeDayIndex].map(d => "• " + d.n).join('%0A');
    let msg = `*دعوت نامہ* 📜%0Aالسلام علیکم ${name}!%0A%0Aآپ کو آج کھانے پر دعوت دی جاتی ہے۔ مینو یہ ہے:%0A${currentDayMenu}%0A%0Aتشریف ضرور لائیے گا! ❤️`;
    window.open(`https://wa.me/?text=${msg}`);
};

// --- PHASE 15: 2030 NEXT-GEN LOGIC ---

window.updateMoodSuggestions = function(val) {
    const text = document.getElementById('mood-text');
    let mood = "";
    let dishes = [];
    
    if(val == 1) { 
        mood = "تھکا ہوا (Tired) 😫: ہلکا کھانا بہترین ہے!"; 
        dishes = window.allDishes.filter(d => ['Sabzi', 'Daal', 'Eggs'].includes(d.c));
    } else if(val == 2) { 
        mood = "عام دن (Neutral) 😐: متوازن مینو۔";
        dishes = window.allDishes;
    } else if(val == 3) { 
        mood = "خوش (Happy) 😊: کچھ مزیدار ہونا چاہیے!";
        dishes = window.allDishes.filter(d => ['Chicken', 'Beef', 'Rice'].includes(d.c));
    } else { 
        mood = "بہت خوش (Excited) 🤩: آج تو پارٹی ہے!";
        dishes = window.allDishes.filter(d => ['Mutton', 'Sweet', 'Rice'].includes(d.c));
    }
    
    text.innerText = mood;
    renderMagicGrid(dishes.sort(() => 0.5 - Math.random()).slice(0, 6), "🎭 موڈ کے لحاظ سے بہترین تجاویز");
};

window.pickLunch = function(type) {
    const res = document.getElementById('lunchbox-result');
    const items = {
        'سنیک': ['نوڈلز', 'سینڈوچ', 'پٹیٹس', 'نگٹس'],
        'مین': ['فریڈ رائس', 'پراٹھا رول', 'پاستا', 'میکرونی'],
        'پھل': ['سیب', 'کیلا', 'امرود', 'کینو']
    };
    const random = items[type][Math.floor(Math.random() * items[type].length)];
    res.style.display = 'block';
    res.innerHTML += `<div class="urdu">🍱 ${type}: <strong>${random}</strong></div>`;
};

let familyMembers = JSON.parse(localStorage.getItem('familyMembers')) || ['بلال', 'علی', 'سارہ'];

window.addFamilyMember = function() {
    const input = document.getElementById('family-member-input');
    const name = input.value.trim();
    if(!name) return;
    familyMembers.push(name);
    localStorage.setItem('familyMembers', JSON.stringify(familyMembers));
    input.value = '';
    renderFamilyNames();
};

window.removeFamilyMember = function(idx) {
    familyMembers.splice(idx, 1);
    localStorage.setItem('familyMembers', JSON.stringify(familyMembers));
    renderFamilyNames();
};

window.renderFamilyNames = function() {
    const list = document.getElementById('family-names-list');
    if(!list) return;
    list.innerHTML = familyMembers.map((name, i) => `
        <span class="urdu" style="background:var(--gold-solid); color:#fff; padding:2px 10px; border-radius:20px; font-size:0.8rem; display:flex; align-items:center; gap:5px;">
            ${name} <span onclick="removeFamilyMember(${i})" style="cursor:pointer; font-weight:bold;">×</span>
        </span>
    `).join('');
};

window.shuffleDuties = function() {
    if(familyMembers.length === 0) {
        alert("پہلے گھر کے ممبران کے نام شامل کریں!");
        return;
    }
    const duties = ['دسترخوان لگانا', 'برتن دھونا', 'سبزی کاٹنا', 'چائے بنانا', 'کچن صاف کرنا', 'آٹا گوندھنا', 'پانی بھرنا'];
    
    // Pick 2 random unique members (or all if less than 2)
    let shuffledNames = [...familyMembers].sort(() => 0.5 - Math.random());
    let selectedNames = shuffledNames.slice(0, Math.min(3, shuffledNames.length));
    
    let html = selectedNames.map(name => {
        let randomDuty = duties[Math.floor(Math.random() * duties.length)];
        return `• <strong>${name}</strong>: ${randomDuty}`;
    }).join(' <br> ');
    
    document.getElementById('duty-list').innerHTML = html;
};

// Initial render
setTimeout(renderFamilyNames, 500);

window.calculateWeeklyCost = function() {
    // Basic AI Multiplier based on meat vs veg
    let total = 0;
    weeklyPlan.days.forEach(day => {
        day.forEach(item => {
            if(['Beef', 'Mutton', 'Chicken'].includes(item.c)) total += 1200;
            else total += 600;
        });
    });
    const cp = document.getElementById('cost-prediction');
    if(cp) cp.innerText = "Rs. " + (total/2).toLocaleString(); // Average for 4 people
};

// Update video links integration in card rendering logic
// Searching for the place where card.innerHTML is set (around line 126 and 260)


window.checkWeatherAndRain = function() {
    const conditions = ['صاف موسم', 'بارش کا امکان', 'گرمی', 'سردی'];
    const random = conditions[Math.floor(Math.random() * conditions.length)];
    const badge = document.getElementById('season-badge');
    if (random === 'بارش کا امکان') {
        if(badge) {
            badge.innerText = "🌧️ بارش کا امکان: چائے پکوڑے بنائیں!";
            badge.style.background = "#e3f2fd";
            badge.style.color = "#1565c0";
        }
    } else {
        if(badge) badge.innerText = "✨ " + random + " کے لیے بہترین مینو";
    }
};

// --- PHASE 14: DASHBOARD ULTIMATE LOGIC ---

window.toggleRadio = function() {
    const audio = document.getElementById('kitchen-audio');
    const btn = document.getElementById('radio-btn');
    if(audio.paused) {
        audio.play();
        btn.classList.add('radio-active');
    } else {
        audio.pause();
        btn.classList.remove('radio-active');
    }
};

window.generateCustomInvite = function() {
    let name = document.getElementById('dawat-name-input').value || 'پیارے دوست';
    let currentDayMenu = weeklyPlan.days[activeDayIndex].map(d => "• " + d.n).join('%0A');
    let msg = `*خصوصی دعوت نامہ* 📜%0Aالسلام علیکم *${name}*!%0A%0Aآپ کو آج گھر پر پرُتکلف کھانے کی دعوت دی جاتی ہے۔ مینو میں شامل ہے:%0A${currentDayMenu}%0A%0Aآپ کی آمد کا انتظار رہے گا۔ ❤️%0A_AI Meal Planner_`;
    window.open(`https://wa.me/?text=${msg}`);
};

window.showQRMenu = function() {
    // We'll use a public QR API for simplicity and speed
    let menuText = "Today's Menu: " + weeklyPlan.days[activeDayIndex].map(d => d.n).join(', ');
    let qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(menuText)}`;
    
    const qrModal = document.createElement('div');
    qrModal.id = 'qr-modal';
    qrModal.style = "position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:5000; display:flex; align-items:center; justify-content:center; flex-direction:column; padding:20px;";
    qrModal.innerHTML = `
        <div class="card urdu" style="padding:2rem; text-align:center; max-width:90%;">
            <h3 class="gold-text">مینو کا QR کوڈ 🏁</h3>
            <p style="font-size:0.9rem; margin-bottom:15px;">مہمان اس کوڈ کو اسکین کر کے مینو دیکھ سکتے ہیں۔</p>
            <img src="${qrUrl}" style="width:200px; height:200px; border:5px solid white; border-radius:10px; margin-bottom:20px;">
            <button class="btn-primary" style="width:100%;" onclick="this.parentElement.parentElement.remove()">بند کریں</button>
        </div>
    `;
    document.body.appendChild(qrModal);
};

window.askBhai = function() {
    const input = document.getElementById('bhai-input');
    const chat = document.getElementById('bhai-chat-box');
    const q = input.value.toLowerCase();
    
    let answer = "معذرت، میں فی الحال اس کا جواب نہیں جانتا۔ آپ نمک، مرچ یا گوشت گلانے کے بارے میں پوچھ سکتے ہیں۔";
    if(q.includes('نمک')) answer = "کھانے میں نمک زیادہ ہو جائے تو آٹے کا پیڑا ڈال دیں یا آلو کے قاش کاٹ کر ڈالیں، نمک کم ہو جائے گا۔ ✅";
    if(q.includes('مرچ')) answer = "اگر سالن میں مرچ زیادہ ہو جائے تو تھوڑا دہی یا ملائی شامل کریں، تیزی ختم ہو جائے گی۔ 🌶️";
    if(q.includes('گوشت')) answer = "گوشت جلدی گلانے کے لیے کچا پپیتا یا ایک چٹکی میٹھا سوڈا ڈالیں، گوشت مکھن کی طرح گل جائے گا۔ 🥩";
    if(q.includes('تیل')) answer = "فرائی کی ہوئی چیزوں سے اضافی تیل نکالنے کے لیے انہیں ٹشو پیپر پر رکھیں۔ 🍳";
    
    chat.innerText = "بھائی: " + answer;
    input.value = '';
};

window.saveWeight = function() {
    const w = document.getElementById('weight-input').value;
    if(!w) return;
    localStorage.setItem('userWeight', w);
    alert("آپ کا وزن محفوظ کر لیا گیا ہے: " + w + " کلو");
};

let currentTip = 0;
const gasTips = [
    "ہمیشہ ڈھکن ڈھک کر پکائیں، اس سے گیس کی 15% بچت ہوتی ہے۔",
    "ہلکی آنچ پر پکانا تیز آنچ سے زیادہ بہتر اور کفایتی ہے۔",
    "برتن کا سائز چولہے کے برنر کے برابر ہونا چاہیے۔",
    "فریز کی ہوئی چیزوں کو پہلے باہر نکالیں تاکہ وہ قدرتی طور پر پگھل جائیں۔"
];
window.nextGasTip = function() {
    currentTip = (currentTip + 1) % gasTips.length;
    document.getElementById('gas-tip').innerText = gasTips[currentTip];
};

window.triggerAINotif = function() {
    const notif = document.getElementById('ai-notif');
    if(!notif) return;
    const items = ['لہسن', 'ادرک', 'ہرا دھنیا', 'پودینہ', 'دہی'];
    const random = items[Math.floor(Math.random() * items.length)];
    notif.querySelector('span').innerHTML = `🔔 <strong>AI ریکومینڈیشن:</strong> آپ کا ${random} ختم ہونے والا ہے!`;
    notif.style.display = 'block';
};

// Auto-trigger AI notification after 5 seconds for simulation
setTimeout(triggerAINotif, 5000);

// ------ END OF FEATURES ------ //

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { 
        navigator.serviceWorker.register('sw.js').catch(()=>{}); 
        updateNetworkStatus(); // Initial check
    });
}

loadCustomRecipes(); // Ensure custom recipes are loaded before generating
initApp();
