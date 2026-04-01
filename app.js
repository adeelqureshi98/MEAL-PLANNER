const weekDays = ['پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ', 'اتوار'];

const svgWhatsApp = `<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;
const svgPDF = `<svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>`;

let weeklyPlan = JSON.parse(localStorage.getItem('weeklyPlan')) || null;
let cookedHistory = JSON.parse(localStorage.getItem('cookedHistory')) || {};
let activeDayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; 

let currentRecipeDish = null;

function initApp() {
    console.log("Initializing App...");
    // ---- 4s LOADER FAILSAFE ---- //
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader && loader.style.display !== 'none') {
            loader.style.opacity = '0';
            setTimeout(() => { loader.style.display = 'none'; }, 500);
            console.log("Loader failsafe triggered.");
        }
    }, 4000);

    try {
        if (!window.allDishes || window.allDishes.length === 0) {
            throw new Error("Recipe Data (data.js) Not Loaded correctly.");
        }

        const currentMonth = new Date().getMonth() + 1;
        document.getElementById('season-badge').innerText = `اسپیشل ہفتہ وار مینو`;

        if (shouldRegeneratePlan()) generateWeeklyPlan(currentMonth);
        
        renderTabs();
        renderDay(activeDayIndex);
        updateNutriReport();
        populateMealOfMoment();

        setTimeout(() => { 
            const loader = document.getElementById('loader');
            if(loader) {
                loader.style.opacity = 0; 
                setTimeout(()=> loader.style.display='none', 300);
            }
        }, 800);

    } catch (error) {
        console.error("Critical Init Error:", error);
        alert("Eror: " + error.message);
        const l = document.getElementById('loader');
        if(l) l.style.display = 'none';
    }
}

// RECIPE DIRECTORY LOGIC
function openDirectory() {
    switchMainTab('directory');
    const container = document.getElementById('directory-list');
    if(!container || !window.allDishes) return;
    
    container.innerHTML = window.allDishes.slice(0, 50).map(dish => `
        <div class="directory-item urdu" style="background:#fff; padding:15px; border-radius:12px; border:1px solid #eee; display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <div style="font-weight:bold; font-size:1.1rem;">${dish.n}</div>
            <button class="btn-primary urdu" style="width:auto; padding:5px 15px;" onclick="openRecipe(${dish.id})">ریسیپی دیکھیں</button>
        </div>
    `).join('');
}

function filterDirectory() {
    const query = document.getElementById('dir-search').value.toLowerCase();
    const container = document.getElementById('directory-list');
    const filtered = window.allDishes.filter(d => d.n.toLowerCase().includes(query)).slice(0, 100);
    
    container.innerHTML = filtered.map(dish => `
        <div class="directory-item urdu" style="background:#fff; padding:15px; border-radius:12px; border:1px solid #eee; display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <div style="font-weight:bold; font-size:1.1rem;">${dish.n}</div>
            <button class="btn-primary urdu" style="width:auto; padding:5px 15px;" onclick="openRecipe(${dish.id})">ریسیپی دیکھیں</button>
        </div>
    `).join('');
}

// PREMIUM DAWAT CARD LOGIC
function buildDawatCard() {
    const guest = document.getElementById('dawat-guest-name').value || "معزز مہمان";
    const main = document.getElementById('d_main').value || "سپیشل چکن کڑاہی";
    const sweet = document.getElementById('d_sweet').value || "شاہی کھیر";
    const side = "رائتہ اور تازہ سلاد";
    
    const card = document.getElementById('premium-card');
    card.innerHTML = `
        <div class="urdu dawat-title" style="font-size:2rem; color: #CFB53B; margin-bottom:15px; font-weight:bold;">دعوت نامہ</div>
        <p class="urdu" style="font-size:1.1rem;">بڑی مسرت کے ساتھ آپ کو کھانے پر مدعو کیا جاتا ہے۔</p>
        <div class="urdu" style="margin-top:20px; font-weight:bold; font-size:1.5rem; color:#1d1d1f;">بہت پیارے: ${guest}</div>
        <div class="dawat-menu-box urdu" style="background:#fffdf5; padding:20px; border-radius:15px; margin:20px 0; border:2px dashed #CFB53B;">
            <div style="font-weight:bold; color: #CFB53B; margin-bottom:10px; font-size:1.3rem;">🍽️ مینو 🍽️</div>
            <div style="font-size:1.2rem;">• ${main}</div>
            <div style="font-size:1.2rem;">• ${sweet}</div>
            <div style="font-size:1.2rem;">• ${side}</div>
        </div>
        <p class="urdu" style="margin-top:10px; font-size:0.9rem; opacity:0.8;">آپ کی آمد ہمارے لیے خوشی کا باعث ہوگی۔</p>
    `;
    
    document.getElementById('dawat-modal').classList.add('active');
    
    const msg = encodeURIComponent(`اسلام علیکم! 💌\nآپ کو ہمارے ہاں کھانے پر مدعو کیا جاتا ہے۔\n\n🍽️ مینو:\n- ${main}\n- ${sweet}\n- ${side}\n\nمنتظر: فیملی`);
    document.getElementById('whatsapp-share-btn').onclick = () => {
        window.open(`https://wa.me/?text=${msg}`);
    };
}

function closeDawatModal() {
    document.getElementById('dawat-modal').classList.remove('active');
}

function populateMealOfMoment() {
    const el = document.getElementById('mom-dish-name');
    if(!el || !window.allDishes) return;
    const randomDish = window.allDishes[Math.floor(Math.random() * window.allDishes.length)];
    el.innerText = randomDish.n;
    el.setAttribute('data-dish-id', randomDish.id);
}

window.openRandomRecipe = function() {
    const el = document.getElementById('mom-dish-name');
    if(!el) return;
    const id = parseInt(el.getAttribute('data-dish-id'));
    if(id) openRecipe(id);
};

function updateNutriReport() {
    if(!weeklyPlan || !weeklyPlan.days) return;
    let counts = { protein: 0, vitamins: 0, fiber: 0, carbs: 0 };
    let total = 0;
    for(let i=0; i<7; i++) {
        (weeklyPlan.days[i] || []).forEach(dish => {
            counts[getNutriCategory(dish.c)]++;
            total++;
        });
    }
    if(total === 0) return;
    const pBar = document.querySelector('.p-protein');
    const vBar = document.querySelector('.p-vitamins');
    if(pBar) {
        let pPct = Math.min(100, Math.round((counts.protein / (total/2)) * 100));
        pBar.style.width = pPct + "%";
        pBar.parentElement.previousElementSibling.innerText = `پروٹین: ${pPct}%`;
    }
    if(vBar) {
        let vPct = Math.min(100, Math.round((counts.vitamins / (total/3)) * 100));
        vBar.style.width = vPct + "%";
        vBar.parentElement.previousElementSibling.innerText = `وٹامنز: ${vPct}%`;
    }
}

function shouldRegeneratePlan() {
    if (!weeklyPlan || !weeklyPlan.timestamp) return true;
    if (Date.now() - weeklyPlan.timestamp > (7 * 24 * 60 * 60 * 1000)) return true;
    return false;
}

function getNutriCategory(category) {
    if (["Chicken", "Beef", "Mutton", "Fish", "Eggs", "Gosht"].includes(category)) return 'protein';
    if (["Sabzi", "Daal/Sabzi"].includes(category)) return 'vitamins';
    if (["Rice", "Pasta", "Sweet"].includes(category)) return 'carbs';
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
        if (dailySuggestions.length < 6) {
            let backup = window.allDishes.sort(() => 0.5 - Math.random());
            for (let dish of backup) {
                if (!dailySuggestions.find(d => d.id === dish.id) && dailySuggestions.length < 6) {
                    dailySuggestions.push(dish);
                }
            }
        }
        weeklyPlan.days[i] = dailySuggestions.sort(() => 0.5 - Math.random());
    }
    localStorage.setItem('weeklyPlan', JSON.stringify(weeklyPlan));
}

function renderTabs() {
    const nav = document.getElementById('days-nav');
    if(!nav) return;
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
    const titleEl = document.getElementById('current-day-title');
    if(titleEl) titleEl.innerText = weekDays[dayIndex] + " کا مینو";
    const grid = document.getElementById('app-grid');
    if(!grid) return;
    grid.innerHTML = '';
    
    let items = (weeklyPlan && weeklyPlan.days) ? weeklyPlan.days[dayIndex] : [];
    let userBudget = parseInt(localStorage.getItem('dailyBudget')) || 1500;
    
    items.forEach((item, index) => {
        let cc = getCostAndCalories(item.c, 4);
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-title urdu gold-text" style="font-size:1.8rem;">${item.n}</div>
            <button class="btn-primary urdu" onclick="openRecipe(${item.id})">ترکیب و مقدار</button>
        `;
        grid.appendChild(card);
    });
}

function openRecipe(id) {
    currentRecipeDish = window.allDishes.find(d => d.id === id);
    if(!currentRecipeDish) return;
    document.getElementById('modal-title').innerText = currentRecipeDish.n;
    document.getElementById('recipe-modal').classList.add('active');
    updateQuantities();
}

function updateQuantities() {
    if (!currentRecipeDish) return;
    const ingredients = currentRecipeDish.i.split(',').map(item => `<li>${item.trim()}</li>`).join('');
    let steps = currentRecipeDish.t.split(/(?:\n|\d+\. )/).filter(s => s.trim().length > 5);
    let instrHTML = steps.length > 1 
        ? `<ol style="padding-right:20px;">` + steps.map(s => `<li style="margin-bottom:10px;">${s.trim()}</li>`).join('') + `</ol>`
        : `<p>${currentRecipeDish.t}</p>`;

    document.getElementById('modal-body').innerHTML = `
        <div class="recipe-section urdu">
            <h3>🛒 اجزاء:</h3>
            <ul>${ingredients}</ul>
        </div>
        <div class="recipe-section urdu" style="margin-top:20px;">
            <h3>👨‍🍳 پکانے کا طریقہ:</h3>
            ${instrHTML}
        </div>
    `;
}

function switchMainTab(viewId, element) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const view = document.getElementById('view-' + viewId);
    if(view) view.classList.add('active');
    if(element) element.classList.add('active');
}

function getCostAndCalories(category, members) {
    return { cost: 500 * members, cals: 300 };
}

window.urduTags = {'Chicken':'🍗 چکن','Beef':'🥩 بیف','Mutton':'🥩 مٹن','Sabzi':'🥦 سبزی','Daal':'🍲 دال','Rice':'🍚 چاول','Sweet':'🍮 میٹھا','Besan':'🧆 بیسن'};

document.addEventListener('DOMContentLoaded', initApp);
function closeRecipe() { document.getElementById('recipe-modal').classList.remove('active'); }
function changeMembers(n) { }
function toggleNightMode() { document.body.classList.toggle('night-mode'); }
function toggleTheme() { }
function filterByCategory(c, el) { }
function filterDishes() { }
function shareWhatsApp(id) { }
function downloadPDF(id) { }
function askBhai() { }
function saveWeight() { }
function nextGasTip() { }
function updateMoodSuggestions() { }
function pickLunch() { }
function addFamilyMember() { }
function shuffleDuties() { }
function openHack() { }
function toggleRadio() { }
function toggleFavorite() { }
function generateGroceryList() { }
function shareGroceryWhatsApp() { }
function scanFridge() { }
function toggleTag() { }
function speakRecipe() { }
function playBismillah() { }
function toggleFocusMode() { }
function startVoiceSearch() { }
function markCooked() { }
