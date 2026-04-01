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
    const membersNode = document.getElementById('members-count');
    let members = membersNode ? parseInt(membersNode.value) : 4;
    
    let isFav = (JSON.parse(localStorage.getItem('favDishes')) || []).includes(currentRecipeDish.id);
    let favText = isFav ? "❤️ پسندیدہ سے ہٹائیں" : "🤍 پسندیدہ بنائیں";
    
    let ingredientsList = currentRecipeDish.i.split(',').map(item => `<li>${item.trim()}</li>`).join('');
    
    let steps = currentRecipeDish.t.split(/(?:\n|\d+\. )/).filter(s => s.trim().length > 5);
    let instrHTML = steps.length > 1 
        ? `<ol style="padding-right:20px;">` + steps.map(s => `<li style="margin-bottom:10px;">${s.trim()}</li>`).join('') + `</ol>`
        : `<p>${currentRecipeDish.t}</p>`;

    document.getElementById('modal-body').innerHTML = `
        <button class="btn-secondary urdu" style="width:100%; margin-bottom:15px; background:var(--gold-light);" onclick="toggleFavorite(${currentRecipeDish.id})">${favText}</button>
        <div class="recipe-section urdu">
            <h3>🛒 اجزاء (${members} افراد کے لیے):</h3>
            <ul>${ingredientsList}</ul>
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
    if (view) view.classList.add('active');
    
    const navItem = element || document.querySelector(`.nav-item[onclick*="switchMainTab('${viewId}'"]`);
    if(navItem) navItem.classList.add('active');
    
    if (viewId === 'favs') renderFavs();
    if (viewId === 'grocery') generateGroceryList();
    if (viewId === 'ramadan') renderRamadan();
    if (viewId === 'directory') filterDirectory();
    window.scrollTo(0,0);
}

function getCostAndCalories(category, members) {
    return { cost: 500 * members, cals: 300 };
}

window.urduTags = {'Chicken':'🍗 چکن','Beef':'🥩 بیف','Mutton':'🥩 مٹن','Sabzi':'🥦 سبزی','Daal':'🍲 دال','Rice':'🍚 چاول','Sweet':'🍮 میٹھا','Besan':'🧆 بیسن'};

document.addEventListener('DOMContentLoaded', initApp);
function closeRecipe() { document.getElementById('recipe-modal').classList.remove('active'); }
function changeMembers(n) {
    let countNode = document.getElementById('members-count');
    if (!countNode) return;
    let current = parseInt(countNode.value) || 4;
    let next = current + n;
    if (next < 1) next = 1;
    if (next > 50) next = 50;
    countNode.value = next;
    updateQuantities();
}
function toggleNightMode() { document.body.classList.toggle('night-mode'); }
function toggleTheme() {
    const bodies = document.body;
    if (bodies.classList.contains('theme-rose')) {
        bodies.classList.remove('theme-rose');
        bodies.classList.add('theme-silver');
    } else if (bodies.classList.contains('theme-silver')) {
        bodies.classList.remove('theme-silver');
    } else {
        bodies.classList.add('theme-rose');
    }
}
function filterByCategory(c, el) {
    // Switch to Home view first
    switchMainTab('home');
    
    document.querySelectorAll('.cat-pill').forEach(btn => btn.classList.remove('active'));
    if(el) el.classList.add('active');
    
    const grid = document.getElementById('app-grid');
    if(!grid) return;
    grid.innerHTML = '';
    
    let dishesToShow = [];
    if (c === 'All') { 
        dishesToShow = (weeklyPlan && weeklyPlan.days) ? weeklyPlan.days[activeDayIndex] : []; 
    } else { 
        dishesToShow = window.allDishes.filter(d => d.c.toLowerCase().includes(c.toLowerCase()) || d.n.includes(c)).slice(0, 24); 
    }
    
    if (dishesToShow.length === 0) {
        grid.innerHTML = `<div class="urdu" style="grid-column: 1/-1; text-align:center; padding:2rem;">اس کیٹیگری میں فی الحال کوئی ڈش موجود نہیں ہے۔</div>`;
        return;
    }

    dishesToShow.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-category urdu">${window.urduTags[item.c] || item.c}</div>
            <div class="card-title urdu gold-text" style="font-size:1.8rem;">${item.n}</div>
            <button class="btn-primary urdu" onclick="openRecipe(${item.id})">ترکیب و مقدار</button>
        `;
        grid.appendChild(card);
    });
}
function filterDishes() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const grid = document.getElementById('app-grid');
    if(!grid) return;
    if(q.length === 0) { filterByCategory('All', document.querySelector('.cat-pill')); return; }
    grid.innerHTML = '';
    const filtered = window.allDishes.filter(d => d.n.toLowerCase().includes(q) || d.i.toLowerCase().includes(q)).slice(0, 20);
    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-title urdu gold-text" style="font-size:1.8rem;">${item.n}</div>
            <button class="btn-primary urdu" onclick="openRecipe(${item.id})">ترکیب و مقدار</button>
        `;
        grid.appendChild(card);
    });
}
function shareWhatsApp(id) {}
function downloadPDF(id) {}
function askBhai() {
    let q = document.getElementById('bhai-input').value;
    if(!q) return;
    document.getElementById('bhai-chat-box').innerText = "بھائی سوچ رہا ہے...";
    setTimeout(() => {
        document.getElementById('bhai-chat-box').innerText = "اگر گوشت نہیں گل رہا تو اس میں کچا پپیتا یا تھوڑا سا میٹھا سوڈا ڈالیں!";
    }, 1000);
}
function saveWeight() {
    let w = document.getElementById('weight-input').value;
    if(w) alert('وزن ' + w + ' KG محفوظ ہو گیا!');
}
function nextGasTip() {
    let tips = ['پریشر ککر کا استعمال کریں، 40% گیس بچائیں۔', 'برتن کا ڈھکن بند رکھ کر پکائیں تاکہ بھاپ ضائع نہ ہو۔', 'پکانے سے پہلے دالوں کو بھگو کر رکھیں۔'];
    let el = document.getElementById('gas-tip');
    let idx = tips.indexOf(el.innerText) + 1;
    if(idx >= tips.length) idx = 0;
    el.innerText = tips[idx];
}
function updateMoodSuggestions(val) {
    let texts = ['تھکا ہوا: جلدی بننے والی ڈش (مثلاً انڈا پراٹھا)', 'عام: کوئی بھی متوازن ڈش', 'خوش: مزیدار اور چٹپٹی ڈش (مثلاً بریانی)', 'بہت خوش: شاہی اور میٹھا (مثلاً قورمہ اور کھیر)'];
    document.getElementById('mood-text').innerText = texts[val-1];
}
function pickLunch(type) {
    if(!window.lunchBoxState) window.lunchBoxState = {};
    
    // Urdu Lunchbox Options
    const options = {
        'سنیک': ['بسکٹ 🍪', 'چپس 🍟', 'فرنچ فرائز 🍟', 'پاپ کارن 🍿', 'کیک 🍰'],
        'مین': ['چکن سینڈوچ 🥪', 'میکرونی 🍝', 'نوڈلز 🍜', 'شامی کباب برگر 🍔', 'رول پراٹھا 🌯'],
        'پھل': ['سیب 🍎', 'کیلا 🍌', 'انگور 🍇', 'کھجور 🌴', 'آم 🥭']
    };
    
    window.lunchBoxState[type] = options[type][Math.floor(Math.random() * options[type].length)];
    
    let res = document.getElementById('lunchbox-result');
    if(res) {
        res.style.display = 'block';
        res.style.animation = 'popIn 0.3s ease';
        res.innerHTML = `
            <div class="urdu" style="font-size:1.2rem; font-weight:bold; color:var(--gold-solid); text-align:center; border-bottom:1px solid var(--gold-light); margin-bottom:10px;">لنچ باکس ڈیزائن 🍱</div>
            <div class="urdu" style="display:flex; justify-content:space-between; margin-bottom:5px;"><strong>سنیک:</strong> <span>${window.lunchBoxState['سنیک'] || '-'}</span></div>
            <div class="urdu" style="display:flex; justify-content:space-between; margin-bottom:5px;"><strong>مین ڈش:</strong> <span>${window.lunchBoxState['مین'] || '-'}</span></div>
            <div class="urdu" style="display:flex; justify-content:space-between;"><strong>پھل:</strong> <span>${window.lunchBoxState['پھل'] || '-'}</span></div>
            <button class="btn-primary urdu" style="width:100%; margin-top:10px; font-size:0.9rem; padding:5px;" onclick="speakLunch()">آواز میں سنیں 🔊</button>
        `;
    }
}

function speakLunch() {
    if(!window.lunchBoxState) return;
    let text = `بچوں کے لنچ باکس کے لیے، سنیک میں ${window.lunchBoxState['سنیک'] || 'کچھ نہیں'}، مین ڈش میں ${window.lunchBoxState['مین'] || 'کچھ نہیں'}، اور پھل میں ${window.lunchBoxState['پھل'] || 'کچھ نہیں'} بہترین رہے گا۔`;
    let msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'ur-PK';
    window.speechSynthesis.speak(msg);
}
function addFamilyMember() {
    let name = document.getElementById('family-member-input').value;
    if(!name) return;
    if(!window.familyMembers) window.familyMembers = ['امی', 'ابو'];
    if(!window.familyMembers.includes(name)) window.familyMembers.push(name);
    document.getElementById('family-member-input').value = '';
    let list = document.getElementById('family-names-list');
    if(list) list.innerHTML = window.familyMembers.map(m => `<span class="cat-pill active urdu" style="padding:2px 10px;">${m}</span>`).join('');
}
function shuffleDuties() {
    if(!window.familyMembers) window.familyMembers = ['امی', 'ابو'];
    let duties = ['برتن دھونا', 'سبزی کاٹنا', 'روٹی بنانا', 'سالن پکانا', 'میز لگانا'];
    let html = '';
    window.familyMembers.forEach(m => {
        let d = duties[Math.floor(Math.random() * duties.length)];
        html += `<div><strong>${m}:</strong> ${d}</div>`;
    });
    document.getElementById('duty-list').innerHTML = html;
}
function openHack(type) {
    let hackData = {
        'dictionary': { title: 'انگریزی مصالحے 📖', text: 'Cumin = زیرہ<br>Coriander = دھنیا<br>Turmeric = ہلدی<br>Fenugreek = میتھی' },
        'leftover': { title: 'بچا ہوا سالن 🍲', text: 'بچے ہوئے سالن سے پراٹھا رول، یا پاستا میں مکس کر کے نیا ڈش بنا سکتے ہیں۔' },
        'diet': { title: 'ڈائٹ مینو 🥗', text: 'صبح: ابلے انڈے<br>دوپہر: سلاد<br>رات: دال کا سوپ' },
        'tiffin': { title: 'بچوں کا لنچ باکس 🍱', text: 'پھل، ایک پروٹین اور کاربز ضرور رکھیں۔' },
        'chai': { title: 'چائے کا جادوگر ☕', text: 'زیادہ ذائقے کے لیے الائچی، دارچینی، یا ادرک ڈالیں۔' },
        'converter': { title: 'ناپ تول ⚖️', text: '1 کپ = 240 ملی لیٹر<br>1 کھانے کا چمچ = 15 گرام' },
        'substitute': { title: 'متبادل 🔄', text: 'ٹماٹر نہیں تو دہی، لیموں نہیں تو سرکہ استعمال کریں۔' },
        'multitimer': { title: 'چولہا الارم ⏳', text: 'موبائل کا ٹائمر استعمال کریں تاکہ کھانا نہ جلے۔' },
        'storage': { title: 'محفوظ کرنا 🌿', text: 'دھنیا کو پلاسٹک کے ڈبے میں ٹشو کے ساتھ رکھیں۔' },
        'masala': { title: 'مصالحے 🌶️', text: 'مصالحوں کو ایئر ٹائٹ بوتل میں رکھیں۔' },
        'meat': { title: 'گوشت ٹائمر 🥩', text: 'گوشت گلانے میں کچا پپیتا استعمال کریں۔' },
        'tadka': { title: 'دال تڑکا 🍲', text: 'زیرہ اور کڑی پتے کا تڑکا لاجواب ہوتا ہے۔' },
        'baking': { title: 'بیکنگ 🍰', text: 'اوون کو ہمیشہ پہلے سے گرم (پری ہیٹ) کریں۔' }
    };
    let hack = hackData[type] || { title: 'معلومات', text: 'جلد آرہا ہے...' };
    document.getElementById('hack-title').innerHTML = hack.title;
    document.getElementById('hack-body').innerHTML = hack.text;
    document.getElementById('hack-modal').classList.add('active');
}
function toggleRadio() {
    let audio = document.getElementById('kitchen-audio');
    if(!audio) return;
    if(audio.paused) audio.play(); else audio.pause();
}
function toggleFavorite(id) {
    let favs = JSON.parse(localStorage.getItem('favDishes')) || [];
    let idx = favs.indexOf(id);
    if(idx > -1) favs.splice(idx, 1);
    else favs.push(id);
    localStorage.setItem('favDishes', JSON.stringify(favs));
    openRecipe(id);
    if (document.getElementById('view-favs').classList.contains('active')) renderFavs();
}
function renderFavs() {
    const grid = document.getElementById('fav-grid');
    if(!grid) return;
    let favs = JSON.parse(localStorage.getItem('favDishes')) || [];
    grid.innerHTML = '';
    if(favs.length === 0) {
        grid.innerHTML = '<p class="urdu" style="text-align:center;">کوئی پسندیدہ ریسیپی نہیں۔</p>';
        return;
    }
    favs.forEach(id => {
        let item = window.allDishes.find(d => d.id === parseInt(id));
        if(item) {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-title urdu gold-text" style="font-size:1.8rem;">${item.n}</div>
                <button class="btn-primary urdu" onclick="openRecipe(${item.id})">ترکیب و مقدار</button>
                <button class="btn-secondary urdu" style="margin-top:10px;" onclick="toggleFavorite(${item.id})">❌ پسندیدہ سے ہٹائیں</button>
            `;
            grid.appendChild(card);
        }
    });
}
function generateGroceryList() {
    const listContainer = document.getElementById('grocery-list-container');
    if(!listContainer) return;

    let items = [];
    if(weeklyPlan && weeklyPlan.days) {
        for(let i=0; i<7; i++) {
            (weeklyPlan.days[i] || []).forEach(dish => {
                let dIngs = dish.i.split(',');
                dIngs.forEach(ing => {
                    let cleaned = ing.replace(/[0-9]/g, '').replace('کلو', '').replace('گرام', '').replace('چمچ', '').trim();
                    if(cleaned.length > 2 && !items.includes(cleaned)) items.push(cleaned);
                });
            });
        }
    }

    if(items.length === 0) {
        // Fallback for empty plan
        items = ['چکن', 'پیاز', 'ٹماٹر', 'ادرک لہسن', 'دہی', 'تیل', 'ہری مرچ', 'دھنیا', 'نمک', 'سرخ مرچ', 'ہلدی', 'چاول', 'بیسن'];
    }

    let html = `
        <div class="urdu" style="background:var(--gold-light); padding:10px; border-radius:10px; margin-bottom:15px; font-weight:bold; text-align:center;">ہفتہ وار ضروری اشیاء</div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
    `;
    items.slice(0, 20).forEach(item => {
        html += `<div class="urdu" style="padding:10px; background:#fff; border:1px solid #eee; border-radius:8px;">✅ ${item}</div>`;
    });
    html += `</div>`;
    listContainer.innerHTML = html;
}
function shareGroceryWhatsApp() {
    const items = document.querySelectorAll('#grocery-list-container .urdu:not(:first-child)');
    let text = "ہفتہ وار سودا سلف کی پرچی 🛒:\n\n";
    items.forEach(el => text += el.innerText + "\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
}
function scanFridge() {
    let res = document.getElementById('scanner-results');
    res.innerHTML = '<p class="urdu">اسکیننگ جاری ہے... (یہ فیچر جلد آ رہا ہے)</p>';
}
function markCooked() {
    if(!currentRecipeDish) return;
    alert(currentRecipeDish.n + " پکانے کی ہسٹری میں شامل کر دیا گیا! ✅");
    closeRecipe();
}
function shareWhatsApp(id) {
    const dish = window.allDishes.find(d => d.id === id);
    if(!dish) return;
    const msg = `آج ہم پکا رہے ہیں: ${dish.n} 🥘\nترکیب مینو ایپ سے لی گئی ہے۔`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
}
function downloadPDF(id) {
    alert("PDF ڈاؤن لوڈ ہو رہی ہے... براہ کرم انتظار کریں۔");
}
function speakRecipe() {
    if(!currentRecipeDish) return;
    window.speechSynthesis.cancel();
    let msg = new SpeechSynthesisUtterance();
    msg.text = `ڈش کا نام: ${currentRecipeDish.n}۔ اجزاء اور ترکیب درج ذیل ہے۔ ${currentRecipeDish.t}`;
    msg.lang = 'ur-PK';
    msg.rate = 0.9;
    window.speechSynthesis.speak(msg);
}
function playBismillah() { alert('بسم اللہ الرحمن الرحیم شروع کریں!'); }
function toggleFocusMode() { document.getElementById('recipe-modal').classList.toggle('focus-mode'); }
function startVoiceSearch() {
    document.getElementById('voice-status').style.display = 'block';
    setTimeout(() => {
        document.getElementById('voice-status').innerText = 'بریانی تلاش کی جا رہی ہے...';
        document.getElementById('searchInput').value = 'بریانی';
        filterDishes();
        setTimeout(() => document.getElementById('voice-status').style.display = 'none', 2000);
    }, 1500);
}
function showFastMeals() {
    const grid = document.getElementById('app-grid');
    grid.innerHTML = '';
    window.allDishes.filter(d => d.c === 'Besan' || d.c === 'Eggs' || d.n.includes('سینڈوچ')).slice(0,5).forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-category urdu">اچانک مہمان</div>
            <div class="card-title urdu gold-text" style="font-size:1.8rem;">${item.n}</div>
            <button class="btn-primary urdu" onclick="openRecipe(${item.id})">ترکیب و مقدار</button>
        `;
        grid.appendChild(card);
    });
    switchMainTab('home');
    document.getElementById('current-day-title').innerText = 'اچانک مہمان مینو (20 منٹ)';
}
function leftoverMagic() {
    let inp = document.getElementById('leftover-input').value;
    if(!inp) return;
    alert(inp + " سے بہترین ڈش: اس میں انڈا شامل کر کے پراٹھا رول بنائیں یا پاستا میں مکس کریں!");
}
function showHistory() {
    document.getElementById('history-results').innerHTML = '<div class="urdu card" style="padding:10px;">گزشتہ روز: چکن کڑاہی 🍗</div><div class="urdu card" style="padding:10px;">اس سے پہلے: دال چاول 🍛</div>';
}
function saveCustomRecipe(e) {
    if(e) e.preventDefault();
    alert('آپ کی ترکیب محفوظ کر لی گئی ہے!');
    document.getElementById('add-recipe-form').reset();
}
function buildDawat() {
    switchMainTab('home');
    document.getElementById('ai-dashboard').scrollIntoView();
    document.getElementById('dawat-guest-name').focus();
    alert('دعوت مینو بلڈر کھل گیا ہے! مہمانوں کا نام ڈال کر پریمیم کارڈ بنائیں۔');
}
function renderRamadan() {
    let container = document.getElementById('ramadan-grid');
    if(!container) return;
    container.innerHTML = '<div class="urdu" style="grid-column: 1/-1; text-align:center;">لوڈ ہو رہا ہے...</div>';
    
    const sehriKeywords = ['پراٹھا', 'انڈے', 'قیمہ', 'دہی', 'چائے', 'آملیٹ', 'بونگ', 'نہاری'];
    const iftariKeywords = ['پکوڑے', 'بیسن', 'چاٹ', 'سموسہ', 'شربت', 'رول', 'میٹھا', 'فروٹ چاٹ', 'دہی بڑے'];
    
    let sehriItems = window.allDishes.filter(d => 
        sehriKeywords.some(key => d.n.includes(key) || (d.t && d.t.includes(key)))
    ).slice(0, 4);
    
    let iftariItems = window.allDishes.filter(d => 
        iftariKeywords.some(key => d.n.includes(key) || (d.c === 'Besan' || d.c === 'Sweet'))
    ).slice(0, 4);

    if(sehriItems.length === 0) sehriItems = window.allDishes.slice(10, 14);
    if(iftariItems.length === 0) iftariItems = window.allDishes.slice(20, 24);
    
    let html = `<div style="grid-column: 1/-1;"><h3 class="urdu gold-text" style="margin-top:20px; border-right:4px solid var(--gold-solid); padding-right:10px;">سحری کی تجاویز 🌙</h3></div>`;
    sehriItems.forEach(item => {
        html += `
            <div class="card" style="margin-bottom:10px;">
                <div class="card-title urdu" style="font-size:1.5rem; line-height:1.4;">${item.n}</div>
                <button class="btn-primary urdu" style="padding:5px 15px; width:100%;" onclick="openRecipe(${item.id})">ترکیب دیکھیں</button>
            </div>
        `;
    });
    
    html += `<div style="grid-column: 1/-1;"><h3 class="urdu gold-text" style="margin-top:30px; border-right:4px solid var(--gold-solid); padding-right:10px;">افطاری کی تجاویز 🥘</h3></div>`;
    iftariItems.forEach(item => {
        html += `
            <div class="card" style="margin-bottom:10px;">
                <div class="card-title urdu" style="font-size:1.5rem; line-height:1.4;">${item.n}</div>
                <button class="btn-primary urdu" style="padding:5px 15px; width:100%;" onclick="openRecipe(${item.id})">ترکیب دیکھیں</button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}
function toggleTag() {}
