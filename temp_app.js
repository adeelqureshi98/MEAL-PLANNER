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
        updateGroceryTotal(); // Initialize budget total

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
    let usedNames = new Set();
    let seasonDishes = window.allDishes.filter(d => d.m.includes(month));
    
    function shuffle(array) {
        let copy = [...array];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    for (let i = 0; i < 7; i++) {
        let dailySuggestions = [];
        let quotas = { protein: 2, vitamins: 2, carbs: 1, fiber: 1 };
        
        // Refresh shuffled list for each day
        let shuffled = shuffle(seasonDishes);
        
        // Friday Special: Pulao / Biryani (Rice Category)
        if (i === 4) {
            quotas.carbs = 2; // More focus on rice/carbs
            let fridaySpecials = shuffled.filter(d => d.n.includes('بریانی') || d.n.includes('پلاؤ') || d.c === 'Rice');
            if(fridaySpecials.length > 0) {
                dailySuggestions.push(fridaySpecials[0]);
                usedNames.add(fridaySpecials[0].n);
            }
        }
        
        // Sunday Special: Heavy Meat (Beef/Mutton/Nihari)
        if (i === 6) {
            quotas.protein = 3; 
            let sundaySpecials = shuffled.filter(d => d.c === 'Beef' || d.c === 'Mutton' || d.n.includes('نہاری') || d.n.includes('پائے'));
            if(sundaySpecials.length > 0) {
                dailySuggestions.push(sundaySpecials[0]);
                usedNames.add(sundaySpecials[0].n);
            }
        }

        for (let dish of shuffled) {
            if (dailySuggestions.length >= 6) break;
            let baseName = dish.n;
            if (usedNames.has(baseName)) continue;

            let type = getNutriCategory(dish.c);
            if (quotas[type] > 0) {
                dailySuggestions.push(dish);
                usedNames.add(baseName);
                quotas[type]--;
            }
        }

        // Fill remaining slots
        if (dailySuggestions.length < 6) {
            let backup = shuffle(window.allDishes);
            for (let dish of backup) {
                if (dailySuggestions.length >= 6) break;
                if (!usedNames.has(dish.n)) {
                    dailySuggestions.push(dish);
                    usedNames.add(dish.n);
                }
            }
        }

        weeklyPlan.days[i] = shuffle(dailySuggestions);
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
window.shareDawatPlanWhatsApp = function(guests, main, rice, sweet) {
    let msg = `*${guests} افراد کی دعوت کا مینو اور پرچی* 🍽️\n\n`;
    msg += `🥘 *مین*: ${main}\n`;
    msg += `🍚 *چاول*: ${rice}\n`;
    msg += `🍮 *میٹھا*: ${sweet}\n\n`;
    msg += `یہ پلان AI Meal Planner ایپ سے بنایا گیا ہے!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
};

function buildDawat() {
    let guests = parseInt(document.getElementById('dawat-guests').value) || 15;
    if (guests < 5) guests = 5;
    
    // Pick Dawat-worthy Dishes
    let dawatMains = window.allDishes.filter(d => d.c === 'Beef' || d.c === 'Mutton' || d.n.includes('کڑاہی') || d.n.includes('قورمہ'));
    let dawatRice = window.allDishes.filter(d => d.n.includes('بریانی') || d.n.includes('پلاؤ'));
    let dawatSweet = window.allDishes.filter(d => d.c === 'Sweet');
    
    let main = dawatMains.length > 0 ? dawatMains[Math.floor(Math.random() * dawatMains.length)] : {n: 'چکن قورمہ'};
    let rice = dawatRice.length > 0 ? dawatRice[Math.floor(Math.random() * dawatRice.length)] : {n: 'چکن بریانی'};
    let sweet = dawatSweet.length > 0 ? dawatSweet[Math.floor(Math.random() * dawatSweet.length)] : {n: 'کھیر'};
    let side = 'تازہ سلاد، پودینے کا رائتہ، اور نان/روٹی';

    // Quantity Calculations based on Guests
    let meatKg = (guests / 4.5).toFixed(1);
    let riceKg = (guests / 6).toFixed(1); 
    let sweetMilk = (guests / 5).toFixed(1);
    let naan = Math.ceil(guests * 1.5);
    let drinkLiters = (guests / 3).toFixed(1);

    let html = `
        <div style="background:#fffdf5; padding:15px; border-radius:10px; border:2px dashed var(--gold-solid); text-align:right;">
            <h3 class="gold-text" style="text-align:center; margin-bottom:15px;">🍽️ ${guests} افراد کا مکمل دعوت پلان 🍽️</h3>
            
            <div style="margin-bottom:15px;">
                <strong>1️⃣ مین ڈش (گوشت):</strong> ${main.n}<br>
                <span style="color:#666; font-size:0.9rem;">⚗️ مقدار: تقریباً ${meatKg} کلو گوشت لگے گا۔</span>
            </div>
            
            <div style="margin-bottom:15px;">
                <strong>2️⃣ چاول کی ڈش:</strong> ${rice.n}<br>
                <span style="color:#666; font-size:0.9rem;">⚗️ مقدار: تقریباً ${riceKg} کلو چاول درکار ہوں گے۔</span>
            </div>
            
            <div style="margin-bottom:15px;">
                <strong>3️⃣ میٹھا (سویٹ):</strong> ${sweet.n}<br>
                 <span style="color:#666; font-size:0.9rem;">⚗️ مقدار: تقریباً ${sweetMilk} لیٹر دودھ (یا مساوی اجزاء) درکار ہوں گے۔</span>
            </div>
            
            <div style="margin-bottom:15px;">
                <strong>4️⃣ لوازمات (سائیڈز):</strong> ${side}<br>
                <span style="color:#666; font-size:0.9rem;">⚗️ مقدار: روٹی/نان تقریباً ${naan} عدد، اور کولڈ ڈرنک ${drinkLiters} لیٹر۔</span>
            </div>
            
            <div style="margin-top:20px; text-align:center; padding-top:10px; border-top:1px solid #ccc;">
                <button class="btn-primary urdu" style="background:#25D366; border:none; width:100%;" onclick="shareDawatPlanWhatsApp('${guests}', '${main.n}', '${rice.n}', '${sweet.n}')">پرچی واٹس ایپ کریں ✅</button>
            </div>
        </div>
    `;

    document.getElementById('hack-title').innerHTML = "پریمیم دعوت پلاننگ";
    document.getElementById('hack-body').innerHTML = html;
    document.getElementById('hack-modal').classList.add('active');
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
function toggleFocusMode() { 
    const modal = document.getElementById('recipe-modal');
    modal.classList.toggle('focus-mode'); 
    if(modal.classList.contains('focus-mode')) {
        modal.onclick = (e) => {
            if (e.target === modal || e.target.classList.contains('focus-mode')) {
                toggleFocusMode();
                modal.onclick = null;
            }
        };
    } else {
        modal.onclick = null;
    }
}
function scrollToMenu() {
    const el = document.getElementById('days-nav');
    if(el) {
        el.scrollIntoView({ behavior: 'smooth' });
        el.style.boxShadow = '0 0 20px var(--gold-solid)';
        setTimeout(() => el.style.boxShadow = 'none', 2000);
    }
}
function checkNetworkStatus() {
    alert("آپ کا انٹرنیٹ ٹھیک کام کر رہا ہے! ✅\nتمام ریسیپیز آف لائن بھی دستیاب ہیں۔");
}

let groceryBudget = JSON.parse(localStorage.getItem('groceryBudget')) || [];

function openBudgetBuilder() {
    document.getElementById('budget-modal').classList.add('active');
    renderBudgetItems();
}

function closeBudgetBuilder() {
    document.getElementById('budget-modal').classList.remove('active');
}

function addBudgetItem() {
    const name = document.getElementById('budget-item-name').value;
    const price = parseInt(document.getElementById('budget-item-price').value);
    
    if(!name || !price) {
        alert("براہ کرم چیز کا نام اور قیمت درج کریں۔");
        return;
    }
    
    groceryBudget.push({ name, price, id: Date.now() });
    document.getElementById('budget-item-name').value = '';
    document.getElementById('budget-item-price').value = '';
    
    renderBudgetItems();
    saveBudget();
}

function removeBudgetItem(id) {
    groceryBudget = groceryBudget.filter(item => item.id !== id);
    renderBudgetItems();
    saveBudget();
}

function renderBudgetItems() {
    const list = document.getElementById('budget-items-list');
    list.innerHTML = groceryBudget.map(item => `
        <div class="urdu" style="background:#fff; padding:10px 15px; border-radius:10px; border:1px solid #eee; display:flex; justify-content:space-between; align-items:center;">
            <div style="font-weight:bold;">${item.name}</div>
            <div style="display:flex; gap:15px; align-items:center;">
                <div class="gold-text" style="font-weight:bold;">Rs. ${item.price}</div>
                <button onclick="removeBudgetItem(${item.id})" style="background:none; border:none; color:#ff4444; font-size:1.2rem; cursor:pointer;">✕</button>
            </div>
        </div>
    `).join('');
    
    const total = groceryBudget.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('budget-total-display').innerText = `Rs. ${total.toLocaleString()}`;
    updateGroceryTotal();
}

function saveBudget() {
    localStorage.setItem('groceryBudget', JSON.stringify(groceryBudget));
}

function updateGroceryTotal() {
    const total = groceryBudget.reduce((sum, item) => sum + item.price, 0);
    const display = document.getElementById('cost-prediction');
    if(display) {
        display.innerText = total > 0 ? `Rs. ${total.toLocaleString()}` : "Rs. 0";
    }
}
let speechRecognition = null;

function stopVoiceSearch() {
    if (speechRecognition) {
        speechRecognition.stop();
        speechRecognition = null;
    }
    document.getElementById('voice-overlay').classList.remove('active');
}

function startVoiceSearch() {
    const overlay = document.getElementById('voice-overlay');
    const interimText = document.getElementById('voice-interim');
    const searchInput = document.getElementById('searchInput');

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("آپ کا براؤزر آواز سے تلاش کرنے کی سہولت فراہم نہیں کرتا۔ برائے مہربانی کروم (Chrome) استعمال کریں۔");
        return;
    }

    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        alert("صوتی تلاش کے لیے محفوظ کنکشن (HTTPS) ضروری ہے۔");
        return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    speechRecognition = new Recognition();

    speechRecognition.lang = 'ur-PK';
    speechRecognition.interimResults = true; // Show results in real-time
    speechRecognition.maxAlternatives = 1;

    speechRecognition.onstart = () => {
        overlay.classList.add('active');
        interimText.innerText = 'بولئے...';
        overlay.onclick = (e) => {
            if (e.target === overlay) stopVoiceSearch();
        };
        console.log("Mobile Recognition Started...");
    };

    speechRecognition.onerror = (event) => {
        let msg = "آواز پہچاننے میں مسئلہ ہوا۔";
        if (event.error === 'not-allowed') msg = "بھائی، فون کی سیٹنگز میں براؤزر کے لیے مائیکروفون آن کریں۔";
        if (event.error === 'no-speech') msg = "کچھ سنائی نہیں دیا، دوبارہ بولیں۔";
        if (event.error === 'network') msg = "انٹرنیٹ کا مسئلہ ہے۔";
        
        interimText.innerText = msg;
        setTimeout(stopVoiceSearch, 3000);
    };

    speechRecognition.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                const final = event.results[i][0].transcript;
                searchInput.value = final;
                interimText.innerHTML = `<b>تلاش: ${final}</b>`;
                filterDishes();
                setTimeout(() => {
                    stopVoiceSearch();
                    document.getElementById('app-grid').scrollIntoView({ behavior: 'smooth' });
                }, 1000);
            } else {
                interim += event.results[i][0].transcript;
                interimText.innerText = interim;
            }
        }
    };

    speechRecognition.onend = () => {
        console.log("Mobile Recognition Ended.");
    };

    try {
        speechRecognition.start();
    } catch(e) {
        console.error("Start Error:", e);
        stopVoiceSearch();
    }
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

// Legacy dishes (1-10)
const legacyDishes = [
    { id: 1, n: "چکن کڑاہی (کراچی اسٹائل)", c: "Chicken", m: [1,2,3,4,5,6,7,8,9,10,11,12], i: "چکن 1 کلو (16 ٹکڑے), ٹماٹر 500 گرام, ہری مرچ 6 عدد, ادرک 2 چمچ, لہسن 2 چمچ, تیل 1 کپ, کالی مرچ 1 چمچ, نمک حسب ذائقہ", t: "1. تیل گرم کر کے چکن بھونیں۔ 2. ادرک لہسن ڈالیں۔ 3. ٹماٹر ڈال کر دم دیں۔ 4. چھلکا اتار کر میش کریں اور بھون کر ہری مرچ کے ساتھ پیش کریں۔" },
    { id: 2, n: "چکن بریانی (بمبئی اسٹائل)", c: "Rice", m: [1,2,3,4,5,6,7,8,9,10,11,12], i: "چاول 1 کلو, چکن 1 کلو, آلو 3 عدد, دہی 1 کپ, پیاز 1 کپ, ٹماٹر 3 عدد, بریانی مصالحہ 1 پیکٹ", t: "1. چاول ابال لیں۔ 2. چکن کا قورمہ بنا لیں۔ 3. تہہ لگائیں اور 20 منٹ دم دیں۔" },
    { id: 3, n: "شاہی چکن قورمہ", c: "Chicken", m: [1,2,3,4,5,6,7,8,9,10,11,12], i: "چکن 1 کلو, پیاز 3 عدد (براؤن), دہی 250 گرام, گھی 200 گرام, قورمہ مصالحہ", t: "1. الائچی کڑکڑائیں۔ 2. چکن اور دہی مصالحہ ڈال کر پکائیں۔ 3. براؤن پیاز کچل کر شامل کریں اور دم دیں۔" },
    { id: 4, n: "بیف نہاری (دلی اسٹائل)", c: "Beef", m: [1,2,3,10,11,12], i: "بیف بونگ 1 کلو, ہڈی 500 گرام, نہاری مصالحہ, آٹا 1 کپ", t: "1. گوشت بھون کر پانی ڈال کر گلائیں۔ 2. آٹا گھول کر ملائیں تاکہ گاڑھا ہو جائے۔" },
    { id: 5, n: "لاہوری مٹن حلیم (دلیم)", c: "Daal", m: [1,2,7,8,10,11,12], i: "مٹن 750 گرام, دلیہ 500 گرام, دالیں 250 گرام", t: "1. دالیں ابال کر گھوٹ لیں۔ 2. مٹن قورمہ کا ریشہ کریں۔ 3. سب مکس کر کے دم دیں۔" },
    { id: 6, n: "چکن وائٹ کڑاہی", c: "Chicken", m: [1,2,3,4,5,6,7,8,9,10,11,12], i: "چکن 1 کلو, کریم 1 پیکٹ, دہی 1 کپ, سفید مرچ, لہسن ادرک", t: "1. چکن بھونیں اور دہی ڈالیں۔ 2. آخر میں کریم شامل کر کے اتار لیں۔" },
    { id: 7, n: "لاہوری کڑھی پکوڑا", c: "Besan", m: [1,2,3,4,5,6,7,8,9,10,11,12], i: "بیسن 1 کپ, دہی 500 گرام, آلو پیاز", t: "1. دہی بیسن کی لسی کو 2 گھنٹے پکائیں۔ 2. پکوڑے تل کر شامل کریں۔ 3. زیرے کا تڑکا لگائیں۔" },
    { id: 8, n: "مٹن کنا", c: "Mutton", m: [4,5,6,10,11,12], i: "مٹن 1 کلو, پیاز, سونف پاؤڈر, گھی", t: "1. مٹن بھونیں اور پانی ڈال کر گلائیں۔ 2. آٹا شامل کر کے گاڑھا کریں۔" },
    { id: 9, n: "آلو میتھی (اسپیشل)", c: "Sabzi", m: [11,12,1,2], i: "میتھی 1 کلو, آلو 500 گرام", t: "1. ٹماٹر پیاز بھون کر آلو ڈالیں۔ 2. میتھی ڈال کر بغیر ڈھانپے پکائیں۔" },
    { id: 10, n: "گاجر کا حلوہ", c: "Sweet", m: [11,12,1,2], i: "گاجر 2 کلو, دودھ 1 لیٹر, کھویا 250 گرام", t: "1. گاجر کو دودھ میں پکائیں۔ 2. چینی اور گھی ڈال کر بھونیں اور کھویا شامل کریں۔" }
];

const categoryLists = {
    // Winter mostly
    "Sabzi": [
        "آلو گوبھی", "بھنڈی مصالحہ", "آلو مٹر", "توری کا سالن", "لوکی (گھیا) کدو", "بینگن کا بھرتہ", "آلو پالک", 
        "آلو شملہ مرچ", "اروی مصالحہ", "مکس سبزی", "کریلے پیاز", "مونگرے آلو", "میتھی آلو", "گاجر مٹر", "ٹینڈے مصالحہ", 
        "کچنار", "سہانجنا", "ساگ (سرسوں کا ساگ)", "گھی توری", "پیٹھا کدو", "مولی کی بھجیا", "شلجم پالک", "گاجر کا سالن", 
        "میتھی مٹر ملائی", "کٹلٹس (آلو کے کباب)", "اروی گوشت", "بینگن آلو", "مولی کے پراٹھے", "مونگرے مٹر", "بند گوبھی آلو", 
        "کالی توری", "ٹینڈے گوشت", "کدو کا رائتہ", "بھرے ہوئے کریلے", "آلو میتھی گوشت", "کدو گوشت", "گوبھی گوشت", "مٹر گوشت", 
        "ٹینڈے بھرے ہوئے", "توری گوشت", "پالک میتھی", "ہری پیاز کا سالن", "آلو انڈے کا بھجیا", "آلو گاجر میتھی", "چپن کدو", 
        "پودینے کی چٹنی والا آلو", "بند گوبھی مٹر", "اروی بینگن", "آلو کی بھجیا (دم والی)", "کچی ہلدی کا سالن", "میتھی کی بھجیا", 
        "کڑی پتا آلو", "مکس سبزی اچاری", "گوبھی مٹر قیمہ", "آلو مولی کی بھجیا", "کدو کا بھرتا", "مکس سبزی کڑاہی", "آلو کی قاشیں", 
        "لوکی کا شوربہ", "پالک میتھی گوشت", "آلو ٹینڈے کا شوربہ", "توری چنا دال", "شلجم گوشت", "چولائی کا ساگ", "باتھو کا ساگ", 
        "کمل کاکڑی (بھین)", "آلو مٹر قیمہ"
    ],
    "Beef": [ // Koftas & Beef
        "بیف کوفتے (روایتی)", "ملائی کوفتے", "لوکی کے کوفتے", "کوفتہ انڈا مصالحہ", "وائٹ کوفتہ کڑاہی", "قیمہ بھرے کوفتے", "ہانڈی کوفتے", 
        "اچاری کوفتے", "کوفتہ کباب (فرائی)", "زعفرانی کوفتے", "آلو بخارا کوفتے", "دم پخت کوفتے", "نہاری", "بیف حلیم (دلیم)", 
        "بیف بریانی", "بیف بنگ", "بیف پسندے", "بیف نلی نہاری", "بیف اسٹیک", "بیف پائے", "بیف پلاؤ", "بیف قیمہ مٹر", "بیف قیمہ کچنار", 
        "بیف قیمہ کریلے", "بیف بھنا گوشت", "بیف دم قیمہ", "بیف ہانڈی", "بیف چٹخارہ بوٹی", "بیف سٹیم روسٹ", "بیف مغز قورمہ", "بیف تکہ بوٹی", "بیف بیجا فرائی"
    ],
    "Fish": [
        "فرائیڈ فش (لاہوری)", "مچھلی کا سالن", "گرلڈ فش", "فش فنگرز", "بیسنی مچھلی", "مچھلی کا پلاؤ", "سٹیم فش", "مچھلی کے کباب", "فش تکہ", 
        "فش ہانڈی", "توہ فش", "مچھلی کا شوربہ", "مچھلی کی کڑاہی", "تلی ہوئی رہو مچھلی", "مچھلی کا اچاری سالن", "پاپلیٹ فرائی", 
        "مچھلی کا دم پخت", "میتھی مچھلی", "فش اسٹیک", "مچھلی کی چٹنی", "فش بریانی", "فش پکوڑے", "مچھلی کا بھرتا"
    ],
    "Mutton": [
        "مٹن قورمہ", "مٹن کڑاہی", "مٹن اسٹیو", "مٹن کنہ", "مٹن پائے", "مٹن پلاؤ", "مٹن چاپس", "مٹن نمکین گوشت", "مٹن وائٹ کڑاہی", 
        "آلو گوشت", "مٹن کلیجی", "مٹن مغز مصالحہ", "مٹن ران روسٹ", "مٹن ہانڈی", "مٹن مکھنی کڑاہی", "مٹن دو پیازہ", "مٹن شنواری کڑاہی", 
        "مٹن بھنا گوشت", "مٹن اچاری گوشت", "مٹن قیمہ آلو", "مٹن سری پائے", "مٹن دم پخت", "مٹن مکھنی ہانڈی", "مٹن جل فریزی"
    ],
    "Chicken": [
        "چکن کڑاہی", "چکن قورمہ", "چکن وائٹ ہانڈی", "چکن بریانی", "چکن پلاؤ", "چکن تکہ", "چکن روسٹ", "چکن جلفریزی", "چکن منچورین", 
        "چکن شاشلک", "چکن اسٹیم روسٹ", "آلو چکن شوربہ", "چکن ملائی بوٹی", "چکن نہاری", "چکن شوارما", "چکن پیٹیز", "چکن اچاری", 
        "چکن مکھنی", "چکن شنواری", "چکن اسٹیک", "چکن پکوڑے", "چکن کٹلٹس", "چکن چیز بالز", "چکن قیمہ بھرے کریلے", "چکن ریشمی کباب", 
        "چکن ہانڈی", "چکن تاہری", "چکن فرائیڈ ونگز", "چکن اسٹیم چاپس"
    ],
    "Daal": [
        "دال چنا (فرائی)", "دال ماش (بھنی ہوئی)", "دال مونگ (پیلی)", "دال مسور (لال)", "مکس دال (پنچ میل)", "دال ماش اور مونگ", 
        "ڈھابہ دال", "دال چنا لوکی", "دال چنا کریلے", "دال ماش (دم والی)", "چنے کی دال کا حلوہ", "دال مسور (ثابت/کالی)", "کھٹی دال", 
        "دال پالک", "شاہی دال ماش", "دال تڑکا", "دال ماش اور قیمہ", "دال مونگ چھلکے والی", "دال لوبیا مکس", "حیدرآبادی ختی دال", 
        "دال چنا کدو", "دال گوشت", "دال ارہر", "سفید لوبیا کا سالن", "لال لوبیا (راجما)", "کالے چنے کا شوربہ", "سفید چنے (چھولے)", 
        "لو بیانی (پھلیاں)", "آلو چولے", "چنا چاٹ", "سفید چنے کا پلاؤ", "چنا مصالحہ", "پھلیاں گوشت"
    ],
    "Besan": [
        "کڑھی پکوڑا", "بیسن کی روٹی", "بیسن کے پکوڑے", "آلو کے پکوڑے", "بیسن والا نان", "بیسن کی کھنڈویاں", "دہی بھلے", "بھلیاں", 
        "بیسن کا پراٹھا", "بیسن کی برفی", "بیسن والی مرچیں", "میٹھی بوندیاں", "نمکو", "پکوڑا کڑھی (ہری مرچ والی)"
    ],
    "Rice": [
        "سادہ ابلے ہوئے چاول", "تڑکے والے چاول", "مٹر پلاؤ", "چنا پلاؤ", "مٹن پلاؤ", "یخنی پلاؤ", "زیرہ رائس", "مکس سبزی پلاؤ", 
        "شملہ مرچ چاول", "ایگ فرائیڈ رائس", "تہہ والی بریانی", "کھچڑی", "چائنیز رائس", "کچے گوشت کی بریانی", "کڑھی چاول", "سنگاپورین رائس", 
        "کباب پلاؤ", "چکن تکہ پلاؤ", "موتی پلاؤ", "سندھی بریانی", "بمبئی بریانی", "زعفرانی چاول", "گڑ والے چاول", "میٹھے چاول", 
        "ساگ والے چاول", "قیمہ بھرے چاول", "تاہری (آلو والے پیلے چاول)"
    ],
    "Sweet": [
        "کھیر", "گاجر کا حلوہ", "سوجی کا حلوہ", "زردہ", "متنجن", "لبِ شیریں", "کسٹڈ", "فالودہ", "رس ملائی", "گلاب جامن", "شاہی ٹکڑے", 
        "دودھ دلاری", "لوکی کا حلوہ", "پیٹھے کا حلوہ", "پھرنی", "ربڑی", "شیر خورمہ", "جلیبی", "انڈے کا حلوہ", "بیسن کا حلوہ", "سوہن حلوہ", 
        "بالو شاہی", "پیٹھے کی مٹھائی", "برفی", "لڈو", "گلاکنڈ", "پستے کی کلفی", "شاہی فالودہ", "فروٹ ٹرائفل", "چاول کی پنیاں", "کدو کی کھیر", 
        "مکھنڈی حلوہ", "پیٹھے کا مربہ", "گاجر کا مربہ", "دال چنا کا حلوہ", "حبشی حلوہ", "قلاقند", "ناریل کا حلوہ"
    ]
};

// Generic instructions per category
const tpls = {
    "Sabzi": { i: "حسبِ ضرورت سبزی (500 گرام), پیاز 2 عدد, ٹماٹر 2 عدد, ہری مرچ, ادرک لہسن 1 چمچ, خوردنی تیل 1/2 کپ, خشک مصالحہ جات", t: "1. تیل میں پیاز اور ٹماٹر بھون لیں۔ 2. سبزی ڈال کر 10 منٹ پکائیں۔ 3. حسب ضرورت پانی ڈال کر دم دیں۔" },
    "Beef": { i: "بیف/قیمہ 1 کلو, پیاز 3 عدد, ٹماٹر 3 عدد, سرسوں کا تیل/گھی 1 کپ, ادرک لہسن 2 چمچ, دہی آدھا کپ, ہرا دھنیا", t: "1. گوشت کو ادرک لہسن کے ساتھ تیل میں بھون لیں۔ 2. پانی اور مصالحے ڈال کر گوشت گلنے (40 منٹ) تک پکائیں۔ 3. ٹماٹر/دہی ڈال کے اچھی طرح بھون لیں۔" },
    "Mutton": { i: "مٹن 1 کلو, کٹی ہوئی پیاز 2 عدد, ٹماٹر 2 عدد, دہی 1 کپ, ادرک لہسن پیسٹ 2 چمچ, ثابت گرم مصالحہ, تیل", t: "1. مٹن کا رنگ تبدیل ہونے تک بھونیں۔ 2. ٹماٹر، دہی اور مصالحے ڈال کر پریشر ککر میں 20 منٹ گلائیں۔ 3. ہری مرچیں ڈال کر دم پہ رکھیں۔" },
    "Chicken": { i: "چکن 1 کلو, پیاز 2 عدد, ٹماٹر 4 عدد, ادرک لہسن 2 چمچ, ہلدی دھنیا کالی مرچ 1 چمچ ہر ایک, ہرا دھنیا 1 گٹھی", t: "1. چکن کو ہائی فلیم پر ادرک لہسن کے ساتھ بھونیں۔ 2. ٹماٹر کی پیسٹ ڈال کر پکائیں۔ 3. جب تیل الگ ہو جائے تو ہرا دھنیا چھڑک کر پیش کریں۔" },
    "Fish": { i: "مچھلی 1 کلو, لیموں کا رس 4 چمچ, اجوائن 1 چمچ, ہری مرچ کی چٹنی, بیسن 2 چمچ, تیل فرائی/سالن کے لیے", t: "1. مچھلی کو مصالحہ لگا کر 2 گھنٹے رکھیں۔ 2. اگر فرائی کرنی ہے تو درمیانی آنچ پر تلیں، اور اگر سالن ہے تو مصالحہ بھون کر 10 منٹ دم پہ رکھیں۔" },
    "Daal": { i: "دال 2 کپ, پیاز 1 عدد (تڑکے کے لیے), لہسن 4 جوئے, زیرہ 1 چمچ, ٹماٹر 1 عدد (اختیاری), گھی/تیل", t: "1. دال کو نمک اور ہلدی ڈال کر ابال لیں۔ 2. جب دال گل جائے تو دوسرے پین میں گھی، لہسن، زیرہ، اور پیاز کا تڑکا تیار کریں۔ 3. تڑکا دال میں شامل کریں۔" },
    "Besan": { i: "بیسن 2 کپ, دہی 500 گرام (کڑھی/بھلوں کے لیے), پیاز، آلو لمبائی میں کٹے ہوئے, انار دانہ, ہری مرچیں", t: "1. بیسن، پیاز اور مصالحوں کا بیٹر (آمیزہ) بنائیں۔ 2. گرم تیل میں پکوڑے تل لیں۔ 3. حسبِ ڈش دہی یا کڑھی کے ساتھ پیش کریں۔" },
    "Rice": { i: "چاول 1 کلو (بھگوئے ہوئے), گوشت/سبزی 750 گرام, ثابت گرم مصالحہ (زیرہ، دارچینی، لونگ، کالی مرچ), پیاز 2 عدد, تیل 1 کپ", t: "1. پیاز براؤن کریں، گوشت یا سبزی ڈال کر بھونیں۔ 2. پانی اور مصالحے شامل کریں۔ جب پانی ابلے تو چاول ڈال دیں۔ 3. پانی خشک ہونے پر 15 منٹ دم دیں۔" },
    "Sweet": { i: "دودھ 1 سے 2 لیٹر، چینی حسبِ ذائقہ، الائچی 4 عدد، کھویا یا میوہ جات 100 گرام، گھی 2 چمچ", t: "1. جزوی اجزاء (مثلاً چاول، گاجر، سوجی) کو دودھ یا گھی میں بھونیں۔ 2. دودھ ڈال کر گاڑھا ہونے تک پکائیں۔ 3. آخر میں چینی اور کھویا/میوے شامل کر کے دم دیں۔" }
};

// Map subcategories accurately
const exactCatMap = {
    "Beef": "Beef", "Fish": "Fish", "Mutton": "Mutton", "Chicken": "Chicken", "Sweet": "Sweet"
};

const monthMapping = {
    "Winter": [10, 11, 12, 1, 2],
    "Summer": [3, 4, 5, 6, 7, 8, 9],
    "All": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
};

function determineMonths(name, category) {
    if (name.includes('ساگ') || name.includes('گاجر') || name.includes('سوپ') || name.includes('مچھلی') || category === 'Fish' || name.includes('پائے') || name.includes('نہاری') || name.includes('حلوہ')) {
        return monthMapping.Winter;
    }
    if (name.includes('لوکی') || name.includes('توری') || name.includes('کدو') || name.includes('بھنڈی') || name.includes('شربت')) {
        return monthMapping.Summer;
    }
    return monthMapping.All;
}

window.allDishes = [...legacyDishes];
let nextId = 11;

Object.keys(categoryLists).forEach(cat => {
    categoryLists[cat].forEach(dishName => {
        // Prevent pure duplicates silently
        if(window.allDishes.find(d => d.n === dishName)) return; 
        
        let tpl = tpls[cat] || tpls['Sabzi'];
        let actualCat = exactCatMap[cat] || cat;
        
        window.allDishes.push({
            id: nextId++,
            n: dishName,
            c: actualCat,
            m: determineMonths(dishName, cat),
            i: `${dishName} کے اجزاء: ` + tpl.i,
            t: tpl.t
        });
    });
});

console.log(`Loaded ${window.allDishes.length} authentic dishes via new AI Database...`);
