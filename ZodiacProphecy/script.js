let currentDate = new Date();
let currentCategoryIndex = 0;
const totalCategories = 4;
let userData = null;
let currentPage = 'home';
let selectedCategory = null;

document.addEventListener('DOMContentLoaded', function() {
    showLoadingScreen();
    setTimeout(() => {
        hideLoadingScreen();
        initializeApp();
    }, 1500);
});

function initializeApp() {
    populateYears();
    setupFormValidation();
    setupDateValidation();
    updateCosmicInfo();
    setupNavigation();
    createCelestialParticles();
    setupSuffixHandling();

    // Update cosmic info every hour
    setInterval(updateCosmicInfo, 3600000);
    setInterval(createCelestialParticles, 30000);
}

function setupSuffixHandling() {
    const suffixSelect = document.getElementById('suffix');
    if (suffixSelect) {
        suffixSelect.addEventListener('change', handleSuffixChange);
    }
}

function createCelestialParticles() {
    const container = document.querySelector('.interactive-celestial');
    if (!container) return;

    // Remove old particles
    const oldParticles = container.querySelectorAll('.celestial-particle');
    oldParticles.forEach(particle => {
        if (Math.random() > 0.7) {
            particle.remove();
        }
    });

    // Create new particles
    for (let i = 0; i < 3; i++) {
        const particle = document.createElement('div');
        particle.className = 'celestial-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';

        particle.addEventListener('click', function() {
            this.classList.add('clicked');
            createCelestialBurst(this);
            setTimeout(() => this.remove(), 1000);
        });

        container.appendChild(particle);
    }
}

function createCelestialBurst(particle) {
    const rect = particle.getBoundingClientRect();
    const burst = document.createElement('div');
    burst.style.cssText = `
        position: fixed;
        left: ${rect.left}px;
        top: ${rect.top}px;
        width: 100px;
        height: 100px;
        background: radial-gradient(circle, #40e0ff, transparent);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        animation: celestialExplosion 1s ease-out forwards;
    `;

    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 1000);
}

function showLoadingScreen() {
    const loadingOverlay = createLoadingOverlay();
    document.body.appendChild(loadingOverlay);

    let progress = 0;
    const progressBar = loadingOverlay.querySelector('.loading-progress');
    const progressText = loadingOverlay.querySelector('.loading-percentage');

    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
        }

        progressBar.style.width = progress + '%';
        progressText.textContent = Math.round(progress) + '%';
    }, 100);
}

function createLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">Accessing Celestial Network...</div>
        <div class="loading-bar">
            <div class="loading-progress"></div>
        </div>
        <div class="loading-percentage">0%</div>
    `;
    return overlay;
}

function hideLoadingScreen() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('fade-out');
        setTimeout(() => loadingOverlay.remove(), 500);
    }
}

function showCategoryLoadingScreen(callback) {
    const loadingOverlay = createLoadingOverlay();
    loadingOverlay.querySelector('.loading-text').textContent = 'Revealing Cosmic Secrets...';
    document.body.appendChild(loadingOverlay);

    let progress = 0;
    const progressBar = loadingOverlay.querySelector('.loading-progress');
    const progressText = loadingOverlay.querySelector('.loading-percentage');

    const interval = setInterval(() => {
        progress += Math.random() * 25;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                loadingOverlay.classList.add('fade-out');
                setTimeout(() => {
                    loadingOverlay.remove();
                    if (callback) callback();
                }, 500);
            }, 300);
        }

        progressBar.style.width = progress + '%';
        progressText.textContent = Math.round(progress) + '%';
    }, 80);
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            if (page) navigateToPage(page);
        });
    });
}

function navigateToPage(page) {
    showCategoryLoadingScreen(() => {
        const pages = document.querySelectorAll('.page');
        const navLinks = document.querySelectorAll('.nav-link');

        pages.forEach(p => p.classList.remove('active'));
        navLinks.forEach(link => link.classList.remove('active'));

        const targetPageId = page + 'Page';
        const targetPage = document.getElementById(targetPageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        const targetLink = document.querySelector(`[data-page="${page}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }

        currentPage = page;

        if (page === 'result') {
            resetCategoryView();
        }

        window.scrollTo(0, 0);
    });
}

function copyResultToClipboard() {
    if (!window.currentProphecy || !userData) return;

    const zodiacSign = calculateZodiacSign(userData.month, userData.day);
    const dateStr = currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    });

    let mysticalSection = '';
    if (window.currentProphecy.mysticalElements) {
        const elements = window.currentProphecy.mysticalElements;
        mysticalSection = `
🔮 MYSTICAL ELEMENTS:
Lucky Number: ${elements.luckyNumber}
Power Color: ${elements.luckyColor.toUpperCase()}
Key Initial: ${elements.significantInitial}
Favorable Direction: ${elements.favorableDirection.toUpperCase()}
Power Time: ${elements.powerTime.toUpperCase()}
`;
    }

    const resultText = `
🌟 THE ZODIAC PROPHECY 🌟

Name: ${userData.firstName} ${userData.surname}
Zodiac Sign: ${zodiacSign.name} ${zodiacSign.symbol}
Date: ${dateStr}
${mysticalSection}
✨ MAIN PROPHECY:
${document.getElementById('mainProphecy').textContent}

💖 LOVE & RELATIONSHIPS:
${window.currentProphecy.love}

⚡ CAREER & SUCCESS:
${window.currentProphecy.career}

✧ HEALTH & VITALITY:
${window.currentProphecy.health}

◈ WEALTH & PROSPERITY:
${window.currentProphecy.money}

Generated by The Zodiac Prophecy - Where Ancient Wisdom Meets Modern Insight
    `.trim();

    navigator.clipboard.writeText(resultText).then(() => {
        showNotification('Prophecy copied to clipboard!');
    }).catch(() => {
        showNotification('Failed to copy. Please try again.');
    });
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #40e0ff, #0078ff);
        color: white;
        padding: 15px 30px;
        border-radius: 20px;
        z-index: 10000;
        font-family: 'Orbitron', monospace;
        box-shadow: 0 10px 30px rgba(64, 224, 255, 0.4);
        animation: notificationSlide 3s ease-out forwards;
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function showInfoModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'info-modal';
    modal.innerHTML = `
        <div class="info-modal-content">
            <div class="info-modal-header">
                <h3>${title}</h3>
                <button onclick="closeInfoModal()" class="info-close-btn">×</button>
            </div>
            <div class="info-modal-body">
                <p>${content}</p>
            </div>
        </div>
    `;

    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease-out;
    `;

    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeInfoModal();
    });
}

function closeInfoModal() {
    const modal = document.querySelector('.info-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => modal.remove(), 300);
    }
}

function showCosmicEnergyInfo() {
    const currentEnergy = document.getElementById('energyLevel')?.textContent || 'Balanced';
    const energyDescriptions = {
        'Peak': 'At Peak energy (80-100%), cosmic forces are at their strongest. Optimal time for major decisions.',
        'Rising': 'During Rising energy (60-79%), cosmic forces are building momentum. Ideal for planning and new projects.',
        'Balanced': 'At Balanced energy (40-59%), cosmic forces are in harmony. Perfect for maintaining current projects.',
        'Moderate': 'With Moderate energy (20-39%), cosmic forces are gentle. Suitable for reflection and planning.',
        'Reflective': 'During Reflective energy (0-19%), cosmic forces encourage introspection and healing.',
        'Intense': 'At Intense energy (90-100%), cosmic forces require careful handling. Breakthrough moments possible.',
        'Transformative': 'During Transformative energy (5-25%), cosmic forces work deeply within you.'
    };

    const specificInfo = energyDescriptions[currentEnergy] || 'Current cosmic energy creates unique opportunities.';

    showInfoModal(
        `Cosmic Energy: ${currentEnergy}`,
        `Cosmic Energy represents the universal life force flowing through all celestial bodies. ${specificInfo} Our system calculates this energy using real-time astronomical data.`
    );
}

function showLunarPhaseInfo() {
    const currentPhase = document.getElementById('lunarPhase')?.textContent || 'New Moon';
    const phaseDescriptions = {
        'New Moon': 'The New Moon brings a blank slate of possibilities. Most powerful time for setting intentions.',
        'Waxing Crescent': 'During the Waxing Crescent, intentions begin to take form. Supports taking first steps.',
        'First Quarter': 'The First Quarter Moon brings challenges that test commitment. Time for making decisions.',
        'Waxing Gibbous': 'During the Waxing Gibbous phase, refinement and adjustment are key.',
        'Full Moon': 'The Full Moon amplifies all energies. Time of culmination and maximum manifestation power.',
        'Waning Gibbous': 'The Waning Gibbous phase encourages gratitude and sharing wisdom.',
        'Last Quarter': 'During the Last Quarter Moon, release and forgiveness take center stage.',
        'Waning Crescent': 'The Waning Crescent phase supports rest, reflection, and spiritual renewal.'
    };

    const specificInfo = phaseDescriptions[currentPhase] || 'Current lunar phase creates unique opportunities.';

    showInfoModal(
        `Lunar Phase: ${currentPhase}`,
        `The Moon's phases influence human behavior and natural rhythms. ${specificInfo} Each phase creates unique energetic opportunities.`
    );
}

function showCosmicDateInfo() {
    showInfoModal(
        'Cosmic Time & Celestial Calendar',
        'Cosmic Date refers to the current moment viewed through celestial mechanics and astrological significance. This perspective helps align human activities with natural cosmic rhythms.'
    );
}

function showCosmicAlignmentInfo() {
    const currentAlignment = document.getElementById('cosmicAlignment')?.textContent || 'Balanced';
    const alignmentDescriptions = {
        'Highly Favorable': 'Planets and stars work in perfect harmony. Exceptional time for major decisions.',
        'Favorable': 'Cosmic forces are supportive and encouraging. Excellent time for positive actions.',
        'Balanced': 'Cosmic forces are in equilibrium. Ideal for maintaining momentum.',
        'Challenging': 'Cosmic forces present growth obstacles. Time for patience and planning.',
        'Transformative': 'Cosmic forces restructure your life path. Period of profound evolution.'
    };

    const specificInfo = alignmentDescriptions[currentAlignment] || 'Current alignment creates growth opportunities.';

    showInfoModal(
        `Cosmic Alignment: ${currentAlignment}`,
        `Cosmic Alignment reflects how well your energy harmonizes with universal forces. ${specificInfo}`
    );
}

function showCosmicEnergyPercentageInfo() {
    const energyPercentage = parseInt(document.getElementById('energyPercentage')?.textContent) || 50;
    let specificInfo = '';

    if (energyPercentage >= 90) {
        specificInfo = `At ${energyPercentage}%, you're experiencing peak universal alignment. Extraordinary time for major manifestations.`;
    } else if (energyPercentage >= 70) {
        specificInfo = `With ${energyPercentage}%, you're in a highly favorable period. Excellent for new ventures and bold actions.`;
    } else if (energyPercentage >= 50) {
        specificInfo = `At ${energyPercentage}%, forces are balanced and stable. Perfect for maintaining current projects.`;
    } else if (energyPercentage >= 30) {
        specificInfo = `With ${energyPercentage}%, this is a time for careful consideration and inner work.`;
    } else {
        specificInfo = `At ${energyPercentage}%, you're experiencing a transformative phase of spiritual growth.`;
    }

    showInfoModal(
        `Cosmic Energy Level: ${energyPercentage}%`,
        `Your cosmic energy percentage represents universal forces flowing through your life. ${specificInfo}`
    );
}

function showMysticalElementInfo(type, value) {
    let title = '';
    let content = '';

    switch(type) {
        case 'number':
            title = `Lucky Number: ${value}`;
            content = `Your lucky number ${value} carries special vibrational energy today. This number appears in significant moments and decisions. Look for patterns involving ${value} - whether in time, dates, addresses, or quantities. When you encounter this number, it signals alignment with your cosmic purpose. Use it as guidance for important choices and timing. The universe speaks through numbers, and ${value} is your personal cosmic frequency for this day.`;
            break;
        case 'initial':
            title = `Key Initial: ${value}`;
            content = `The letter ${value} holds mystical significance in your daily journey. Pay attention to people, places, or opportunities beginning with ${value}. This initial represents a cosmic connection point - someone whose name starts with ${value} may bring important messages or opportunities. Cities, streets, or businesses starting with ${value} could be particularly favorable. When making decisions, choices beginning with ${value} carry enhanced cosmic support. This letter is your spiritual beacon today.`;
            break;
        case 'color':
            title = `Power Color: ${value}`;
            content = `${value} is your dominant cosmic color vibration today. Surrounding yourself with this color enhances your energy field and attracts positive outcomes. Wear ${value.toLowerCase()} clothing, choose ${value.toLowerCase()} accessories, or add ${value.toLowerCase()} elements to your environment. This color strengthens your aura and makes you more receptive to beneficial cosmic frequencies. When you see ${value.toLowerCase()} in your surroundings, it confirms you're on the right path. Let this color guide your choices and amplify your intentions.`;
            break;
        case 'stone':
            title = `Guardian Stone: ${value}`;
            content = `${value} is your protective and empowering crystal ally today. This stone resonates with your current cosmic needs, offering protection, clarity, and manifestation power. If you have ${value}, carry it with you or place it in your workspace. Even visualizing ${value} or looking at images of this stone can activate its beneficial properties. ${value} enhances your intuition, protects your energy field, and amplifies your connection to universal wisdom. This stone represents your spiritual guardian for today's journey.`;
            break;
    }

    showInfoModal(title, content);
}

function showPrivacyPolicy() {
    showInfoModal(
        'Privacy Policy',
        'The Zodiac Prophecy respects your cosmic privacy. We collect only necessary information for celestial guidance. Data is stored locally and never shared with third parties.'
    );
}

function showTermsOfService() {
    showInfoModal(
        'Terms of Service',
        'By using our celestial services, you agree that prophecies are for entertainment and spiritual guidance only. Users must be 13+ years old. Use cosmic wisdom responsibly.'
    );
}

function startProphecy() {
    navigateToPage('information');
}

function goToHome() {
    navigateToPage('home');
}

function goToInformation() {
    navigateToPage('information');
}

function updateCosmicInfo() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };

    const cosmicDateElement = document.getElementById('cosmicDate');
    if (cosmicDateElement) {
        cosmicDateElement.textContent = now.toLocaleDateString('en-US', options);
    }

    const lunarPhase = calculateLunarPhase(now);
    const cosmicEnergy = calculateCosmicEnergy(now);

    const energyElement = document.getElementById('energyLevel');
    const lunarElement = document.getElementById('lunarPhase');

    if (energyElement) energyElement.textContent = cosmicEnergy;
    if (lunarElement) lunarElement.textContent = lunarPhase;
}

function calculateLunarPhase(date) {
    const knownNewMoon = new Date('2024-01-11');
    const daysSinceNewMoon = Math.floor((date - knownNewMoon) / (1000 * 60 * 60 * 24));
    const lunarCycle = daysSinceNewMoon % 29.53;

    if (lunarCycle < 1) return 'New Moon';
    else if (lunarCycle < 7.4) return 'Waxing Crescent';
    else if (lunarCycle < 8.4) return 'First Quarter';
    else if (lunarCycle < 14.8) return 'Waxing Gibbous';
    else if (lunarCycle < 15.8) return 'Full Moon';
    else if (lunarCycle < 22.1) return 'Waning Gibbous';
    else if (lunarCycle < 23.1) return 'Last Quarter';
    else return 'Waning Crescent';
}

function calculateCosmicEnergy(date) {
    const hour = date.getHours();
    const lunarPhase = calculateLunarPhase(date);

    let baseEnergy = 'Moderate';

    if (hour >= 6 && hour < 12) baseEnergy = 'Rising';
    else if (hour >= 12 && hour < 18) baseEnergy = 'Peak';
    else if (hour >= 18 && hour < 24) baseEnergy = 'Balanced';
    else baseEnergy = 'Reflective';

    if (lunarPhase === 'Full Moon') baseEnergy = 'Intense';
    else if (lunarPhase === 'New Moon') baseEnergy = 'Transformative';

    return baseEnergy;
}

function populateYears() {
    const yearSelect = document.getElementById('year');
    if (!yearSelect) return;

    const currentYear = new Date().getFullYear();
    yearSelect.innerHTML = '<option value="">Year</option>';

    for (let year = currentYear; year >= 1920; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

function setupDateValidation() {
    const monthSelect = document.getElementById('month');
    const daySelect = document.getElementById('day');
    const yearSelect = document.getElementById('year');

    if (!monthSelect || !daySelect || !yearSelect) return;

    monthSelect.addEventListener('change', updateDays);
    yearSelect.addEventListener('change', () => {
        if (monthSelect.value) updateDays();
    });
}

function updateDays() {
    const monthSelect = document.getElementById('month');
    const daySelect = document.getElementById('day');
    const yearSelect = document.getElementById('year');

    if (!monthSelect || !daySelect) return;

    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value) || new Date().getFullYear();
    const currentlySelectedDay = daySelect.value;

    daySelect.innerHTML = '<option value="">Select Day</option>';

    if (month) {
        const daysInMonth = new Date(year, month, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const option = document.createElement('option');
            option.value = day;
            option.textContent = day;
            daySelect.appendChild(option);
        }

        if (currentlySelectedDay && currentlySelectedDay <= daysInMonth) {
            daySelect.value = currentlySelectedDay;
        }
    }
}

function handleSuffixChange() {
    const suffixSelect = document.getElementById('suffix');
    const customSuffixInput = document.getElementById('customSuffix');

    if (suffixSelect.value === 'OTHERS') {
        customSuffixInput.style.display = 'block';
        customSuffixInput.focus();

        // Add auto-uppercase for custom suffix
        customSuffixInput.addEventListener('input', function() {
            const cursorPosition = this.selectionStart;
            this.value = this.value.toUpperCase();
            this.setSelectionRange(cursorPosition, cursorPosition);
        });
    } else {
        customSuffixInput.style.display = 'none';
        customSuffixInput.value = '';
    }
}

function setupFormValidation() {
    const form = document.getElementById('zodiacForm');
    if (!form) return;

    const nameInputs = ['surname', 'firstName', 'middleInitial'];

    nameInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            // Auto-uppercase on input
            input.addEventListener('input', function() {
                const cursorPosition = this.selectionStart;

                if (inputId === 'middleInitial') {
                    let value = this.value.toUpperCase().replace(/[^A-Z\.]/g, '');

                    if (value.length === 1 && value.match(/[A-Z]/)) {
                        this.value = value + '.';
                    } else if (value.length === 2 && value.match(/^[A-Z]\.$/)) {
                        this.value = value;
                    } else if (value === '.') {
                        this.value = '';
                    } else if (value.length > 0) {
                        const firstLetter = value.charAt(0);
                        if (firstLetter.match(/[A-Z]/)) {
                            this.value = firstLetter + '.';
                        } else {
                            this.value = '';
                        }
                    }
                } else {
                    // Auto-uppercase for surname and firstName
                    this.value = this.value.toUpperCase();
                    this.setSelectionRange(cursorPosition, cursorPosition);
                }

                validateCapitalLetters(this);
            });

            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const currentTabIndex = parseInt(this.getAttribute('tabindex'));
                    const nextElement = document.querySelector(`[tabindex="${currentTabIndex + 1}"]`);
                    if (nextElement) nextElement.focus();
                }
            });
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm()) {
            showCategoryLoadingScreen(() => {
                userData = collectFormData();
                saveUserData(userData);
                displayProphecy(userData);
                navigateToPage('result');
            });
        }
    });
}

function validateCapitalLetters(input) {
    const errorElement = document.getElementById(input.id + 'Error');
    const value = input.value;

    // Since we're auto-uppercasing, just check if field has content
    if (input.id === 'middleInitial') {
        if (errorElement) errorElement.classList.remove('show');
        input.style.borderColor = 'rgba(64, 224, 255, 0.3)';
        return true;
    } else {
        if (value.trim() === '') {
            input.style.borderColor = 'rgba(64, 224, 255, 0.2)';
        } else {
            input.style.borderColor = 'rgba(64, 224, 255, 0.5)';
        }
        if (errorElement) errorElement.classList.remove('show');
        return true;
    }
}

function validateForm() {
    let isValid = true;
    const nameInputs = ['surname', 'firstName', 'middleInitial'];

    nameInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input && !validateCapitalLetters(input)) {
            isValid = false;
        }
    });

    const requiredFields = ['surname', 'firstName', 'month', 'day', 'year'];
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#ff6b6b';
        }
    });

    const genderChecked = document.querySelector('input[name="gender"]:checked');
    if (!genderChecked) isValid = false;

    return isValid;
}

function collectFormData() {
    const genderChecked = document.querySelector('input[name="gender"]:checked');
    const suffixSelect = document.getElementById('suffix');
    const customSuffixInput = document.getElementById('customSuffix');

    let suffixValue = suffixSelect.value;
    if (suffixValue === 'OTHERS' && customSuffixInput.value.trim()) {
        suffixValue = customSuffixInput.value.trim().toUpperCase();
    } else if (suffixValue === 'OTHERS') {
        suffixValue = '';
    }

    return {
        surname: document.getElementById('surname').value,
        firstName: document.getElementById('firstName').value,
        middleInitial: document.getElementById('middleInitial').value,
        suffix: suffixValue,
        gender: genderChecked ? genderChecked.value : '',
        month: parseInt(document.getElementById('month').value),
        day: parseInt(document.getElementById('day').value),
        year: parseInt(document.getElementById('year').value),
        timestamp: new Date().toISOString()
    };
}

function calculateZodiacSign(month, day) {
    const zodiacSigns = [
        { name: 'Capricorn', symbol: '♑', start: [12, 22], end: [1, 19] },
        { name: 'Aquarius', symbol: '♒', start: [1, 20], end: [2, 18] },
        { name: 'Pisces', symbol: '♓', start: [2, 19], end: [3, 20] },
        { name: 'Aries', symbol: '♈', start: [3, 21], end: [4, 19] },
        { name: 'Taurus', symbol: '♉', start: [4, 20], end: [5, 20] },
        { name: 'Gemini', symbol: '♊', start: [5, 21], end: [6, 20] },
        { name: 'Cancer', symbol: '♋', start: [6, 21], end: [7, 22] },
        { name: 'Leo', symbol: '♌', start: [7, 23], end: [8, 22] },
        { name: 'Virgo', symbol: '♍', start: [8, 23], end: [9, 22] },
        { name: 'Libra', symbol: '♎', start: [9, 23], end: [10, 22] },
        { name: 'Scorpio', symbol: '♏', start: [10, 23], end: [11, 21] },
        { name: 'Sagittarius', symbol: '♐', start: [11, 22], end: [12, 21] }
    ];

    for (const sign of zodiacSigns) {
        if (sign.name === 'Capricorn') {
            if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
                return sign;
            }
        } else {
            const [startMonth, startDay] = sign.start;
            const [endMonth, endDay] = sign.end;

            if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
                return sign;
            }
        }
    }

    return zodiacSigns[0];
}

function generateDailyProphecy(zodiacSign, gender, date) {
    const dateKey = date.toDateString();
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const monthSeed = date.getMonth() + 1;
    const weekOfYear = Math.floor(dayOfYear / 7);
    const hourOfDay = date.getHours();
    const seed = hashCode(zodiacSign + dateKey + dayOfYear + monthSeed + weekOfYear + hourOfDay);

    // Basic colors as requested
    const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Black', 'White', 'Brown'];
    const numbers = [3, 7, 9, 11, 13, 17, 21, 23, 27, 31, 33, 37, 41, 44, 47, 51, 55, 63, 69, 77, 81, 88, 93, 99];
    const initials = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    const stones = ['Amethyst', 'Ruby', 'Emerald', 'Sapphire', 'Diamond', 'Opal', 'Garnet', 'Turquoise', 'Jade', 'Pearl', 'Topaz', 'Quartz'];

    const getRandomElement = (arr, seedValue) => {
        const index = Math.abs(seedValue) % arr.length;
        return arr[index];
    };

    // Create more dynamic element selection
    const luckyColor = getRandomElement(colors, seed * dayOfYear);
    const luckyNumber = getRandomElement(numbers, seed + monthSeed * weekOfYear);
    const significantInitial = getRandomElement(initials, seed + hourOfDay * 7);
    const luckyStone = getRandomElement(stones, seed + dayOfYear * 3);

    // Generate truly dynamic prophecy text using AI-like generation
    const prophecyData = generateDynamicProphecyText(zodiacSign, gender, date, seed, {
        luckyColor, luckyNumber, significantInitial, luckyStone
    });

    return {
        main: prophecyData.main,
        love: prophecyData.love,
        career: prophecyData.career,
        health: prophecyData.health,
        money: prophecyData.money,
        mysticalElements: {
            luckyColor,
            luckyNumber,
            significantInitial,
            luckyStone
        }
    };
}

function generateDynamicProphecyText(zodiacSign, gender, date, seed, elements) {
    // Create unique daily seed that's consistent for same birthday regardless of year
    const birthdaySeed = seed + Math.abs(hashCode(zodiacSign + elements.significantInitial));
    const dailySeed = birthdaySeed + Math.abs(hashCode(date.toDateString()));

    // AI-like dynamic text generation components
    const energyWords = ['cosmic', 'celestial', 'universal', 'spiritual', 'mystical', 'divine', 'magical', 'ethereal'];
    const actionWords = ['awakens', 'transforms', 'reveals', 'channels', 'amplifies', 'manifests', 'creates', 'unlocks'];
    const qualityWords = ['profound', 'intense', 'gentle', 'powerful', 'harmonious', 'dynamic', 'radiant', 'vibrant'];
    const timeWords = ['today', 'now', 'this moment', 'currently', 'at present', 'right now', 'this day', 'immediately'];
    const connectionWords = ['through', 'via', 'by way of', 'using', 'with the help of', 'guided by', 'influenced by', 'powered by'];

    // Generate main prophecy with unique structure each day
    const mainStructures = [
        `${getRandomWord(energyWords, dailySeed)} energy ${getRandomWord(actionWords, dailySeed + 1)} ${getRandomWord(qualityWords, dailySeed + 2)} opportunities ${timeWords[dailySeed % timeWords.length]}. Your ${elements.luckyStone} stone and ${elements.luckyColor} color guide this transformation.`,
        `${timeWords[dailySeed % timeWords.length]}, ${getRandomWord(qualityWords, dailySeed + 3)} ${getRandomWord(energyWords, dailySeed + 4)} forces ${getRandomWord(actionWords, dailySeed + 5)} new paths. The letter ${elements.significantInitial} and number ${elements.luckyNumber} hold special significance.`,
        `A ${getRandomWord(qualityWords, dailySeed + 6)} shift ${getRandomWord(actionWords, dailySeed + 7)} ${connectionWords[dailySeed % connectionWords.length]} ${getRandomWord(energyWords, dailySeed + 8)} alignment. ${elements.luckyColor} surroundings enhance your ${elements.luckyStone} stone's power.`,
        `${getRandomWord(energyWords, dailySeed + 9)} currents ${getRandomWord(actionWords, dailySeed + 10)} ${getRandomWord(qualityWords, dailySeed + 11)} change. Focus on ${elements.luckyColor} items and the number ${elements.luckyNumber} for guidance.`
    ];

    return {
        main: mainStructures[dailySeed % mainStructures.length],
        love: generateCategoryText('love', zodiacSign, dailySeed, elements),
        career: generateCategoryText('career', zodiacSign, dailySeed, elements),
        health: generateCategoryText('health', zodiacSign, dailySeed, elements),
        money: generateCategoryText('money', zodiacSign, dailySeed, elements)
    };
}

function getRandomWord(wordArray, seed) {
    return wordArray[Math.abs(seed) % wordArray.length];
}

function generateCategoryText(category, zodiacSign, seed, elements) {
    const categorySeeds = {
        love: seed + 100,
        career: seed + 200,
        health: seed + 300,
        money: seed + 400
    };

    const categoryEmojis = {
        love: '💕',
        career: '🚀', 
        health: '💪',
        money: '💰'
    };

    const dynamicSeed = categorySeeds[category];

    // Dynamic word pools for each category
    const categoryWords = {
        love: {
            subjects: ['romance', 'connection', 'attraction', 'partnership', 'intimacy', 'affection', 'emotion', 'passion'],
            actions: ['blossoms', 'deepens', 'emerges', 'strengthens', 'flourishes', 'awakens', 'transforms', 'develops'],
            outcomes: ['meaningful bonds', 'lasting joy', 'deep understanding', 'emotional growth', 'romantic fulfillment', 'heart connections', 'soul harmony', 'true companionship']
        },
        career: {
            subjects: ['opportunity', 'success', 'advancement', 'recognition', 'growth', 'leadership', 'innovation', 'achievement'],
            actions: ['accelerates', 'expands', 'manifests', 'develops', 'progresses', 'advances', 'succeeds', 'thrives'],
            outcomes: ['professional growth', 'career breakthroughs', 'new opportunities', 'skill development', 'leadership roles', 'financial rewards', 'recognition', 'success']
        },
        health: {
            subjects: ['vitality', 'wellness', 'energy', 'balance', 'strength', 'healing', 'renewal', 'harmony'],
            actions: ['improves', 'strengthens', 'restores', 'energizes', 'balances', 'heals', 'revitalizes', 'harmonizes'],
            outcomes: ['physical wellness', 'mental clarity', 'emotional balance', 'renewed energy', 'inner strength', 'life vitality', 'healing progress', 'overall health']
        },
        money: {
            subjects: ['prosperity', 'abundance', 'wealth', 'income', 'investment', 'savings', 'financial growth', 'resources'],
            actions: ['increases', 'multiplies', 'grows', 'accumulates', 'expands', 'develops', 'prospers', 'flourishes'],
            outcomes: ['financial stability', 'wealth creation', 'investment success', 'income growth', 'prosperity gains', 'security building', 'abundance flow', 'money success']
        }
    };

    const words = categoryWords[category];
    const subject = getRandomWord(words.subjects, dynamicSeed);
    const action = getRandomWord(words.actions, dynamicSeed + 1);
    const outcome = getRandomWord(words.outcomes, dynamicSeed + 2);

    // Generate unique sentence structures for each category
    const structures = [
        `${categoryEmojis[category]} Your ${subject} ${action} through ${elements.luckyColor.toLowerCase()} energy. The ${elements.luckyStone} stone amplifies ${outcome} today.`,
        `${categoryEmojis[category]} ${elements.luckyColor} surroundings attract ${subject} that ${action}. Look for connections with letter ${elements.significantInitial} for ${outcome}.`,
        `${categoryEmojis[category]} The number ${elements.luckyNumber} guides ${subject} toward ${outcome}. Your ${elements.luckyStone} brings clarity to ${action} opportunities.`,
        `${categoryEmojis[category]} ${subject} ${action} when you embrace ${elements.luckyColor.toLowerCase()} choices. ${elements.luckyStone} energy supports ${outcome} in unexpected ways.`
    ];

    return structures[dynamicSeed % structures.length];

}

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}

function displayProphecy(userData) {
    const zodiacSign = calculateZodiacSign(userData.month, userData.day);

    fetchProphecyFromBackend(userData)
        .then(prophecyData => {
            updateProphecyDisplay(zodiacSign, prophecyData.prophecy);
            updateResultDate();
            updateCosmicAlignment();
            resetCategoryView();
        })
        .catch(error => {
            console.error('Error fetching prophecy:', error);
            const fallbackProphecy = generateDailyProphecy(zodiacSign.name, userData.gender, currentDate);
            updateProphecyDisplay(zodiacSign, fallbackProphecy);
            updateResultDate();
            updateCosmicAlignment();
            resetCategoryView();
        });
}

function updateProphecyDisplay(zodiacSign, prophecy) {
    const signNameElement = document.getElementById('zodiacSignName');
    const symbolElement = document.getElementById('zodiacSymbol');
    const mainProphecyElement = document.getElementById('mainProphecy');

    if (signNameElement) signNameElement.textContent = zodiacSign.name.toUpperCase();
    if (symbolElement) symbolElement.textContent = zodiacSign.symbol;
    if (mainProphecyElement) mainProphecyElement.textContent = prophecy.main.toUpperCase();

    // Add mystical elements if available
    if (prophecy.mysticalElements) {
        const zodiacDetailsElement = document.querySelector('.zodiac-details');
        if (zodiacDetailsElement) {
            // Remove existing mystical numbers if any
            const existingNumbers = zodiacDetailsElement.querySelector('.mystical-numbers');
            if (existingNumbers) existingNumbers.remove();

            // Add new mystical numbers with click handlers
            const mysticalNumbersDiv = document.createElement('div');
            mysticalNumbersDiv.className = 'mystical-numbers';
            mysticalNumbersDiv.innerHTML = `
                <div class="mystical-number" onclick="showMysticalElementInfo('number', '${prophecy.mysticalElements.luckyNumber}')">
                    <div class="number">${prophecy.mysticalElements.luckyNumber}</div>
                    <div class="label">Lucky Number</div>
                </div>
                <div class="mystical-number" onclick="showMysticalElementInfo('initial', '${prophecy.mysticalElements.significantInitial}')">
                    <div class="number">${prophecy.mysticalElements.significantInitial}</div>
                    <div class="label">Key Initial</div>
                </div>
                <div class="mystical-number" onclick="showMysticalElementInfo('color', '${prophecy.mysticalElements.luckyColor}')">
                    <div class="number" style="color: ${prophecy.mysticalElements.luckyColor.toLowerCase()}; text-shadow: 0 0 10px ${prophecy.mysticalElements.luckyColor.toLowerCase()}; font-weight: bold;">${prophecy.mysticalElements.luckyColor.toUpperCase()}</div>
                    <div class="label">Power Color</div>
                </div>
                <div class="mystical-number" onclick="showMysticalElementInfo('stone', '${prophecy.mysticalElements.luckyStone}')">
                    <div class="number">${prophecy.mysticalElements.luckyStone}</div>
                    <div class="label">Guardian Stone</div>
                </div>
            `;

            const alignmentDiv = zodiacDetailsElement.querySelector('.cosmic-alignment');
            if (alignmentDiv) {
                zodiacDetailsElement.insertBefore(mysticalNumbersDiv, alignmentDiv);
            } else {
                zodiacDetailsElement.appendChild(mysticalNumbersDiv);
            }
        }
    }

    window.currentProphecy = {
        love: prophecy.love.toUpperCase(),
        career: prophecy.career.toUpperCase(),
        health: prophecy.health.toUpperCase(),
        money: prophecy.money.toUpperCase(),
        mysticalElements: prophecy.mysticalElements
    };
}

async function fetchProphecyFromBackend(userData) {
    try {
        const userResponse = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (!userResponse.ok) throw new Error('Failed to save user data');

        const userResult = await userResponse.json();

        const prophecyResponse = await fetch(`/api/consultations?userId=${userResult.userId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!prophecyResponse.ok) throw new Error('Failed to fetch prophecy');

        return await prophecyResponse.json();
    } catch (error) {
        console.error('Backend prophecy fetch failed:', error);
        throw error;
    }
}

function updateResultDate() {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    };
    const dateElement = document.getElementById('currentResultDate');
    if (dateElement) {
        dateElement.textContent = currentDate.toLocaleDateString('en-US', options);
    }
}

function updateCosmicAlignment() {
    const energyMeter = document.getElementById('energyMeter');
    const energyPercentage = document.getElementById('energyPercentage');
    let energyLevel = Math.random() * 100;

    let alignment;
    if (energyLevel >= 80) alignment = 'Highly Favorable';
    else if (energyLevel >= 60) alignment = 'Favorable';
    else if (energyLevel >= 40) alignment = 'Balanced';
    else if (energyLevel >= 20) alignment = 'Challenging';
    else alignment = 'Transformative';

    const alignmentElement = document.getElementById('cosmicAlignment');
    if (alignmentElement) alignmentElement.textContent = alignment;

    if (energyMeter) {
        energyMeter.style.width = energyLevel + '%';
        if (energyPercentage) {
            energyPercentage.textContent = Math.round(energyLevel) + '%';
        }
    }
}

function adjustDate(days) {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + days);

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    if (newDate >= sevenDaysAgo && newDate <= sevenDaysFromNow) {
        showCategoryLoadingScreen(() => {
            currentDate = newDate;            if (userData) {
                const adjustedUserData = { ...userData, requestDate: newDate.toISOString() };
                displayProphecy(adjustedUserData);
            }
        });
    }
}

function selectCategory(categoryIndex) {
    showCategoryLoadingScreen(() => {
        selectedCategory = categoryIndex;
        showCategoryDetail(categoryIndex);
    });
}

function showCategoryDetail(categoryIndex) {
    const categoryGrid = document.querySelector('.category-grid');
    const categoryDetail = document.getElementById('categoryDetail');
    const categoryContent = document.getElementById('categoryContent');

    if (!categoryGrid || !categoryDetail || !categoryContent) return;

    const categories = ['love', 'career', 'health', 'money'];
    const categoryNames = ['Love & Relationships', 'Career & Success', 'Health & Vitality', 'Wealth & Prosperity'];
    const categoryIcons = ['♥', '⚡', '✧', '◈'];

    const categoryKey = categories[categoryIndex];
    const prophecyText = window.currentProphecy ? window.currentProphecy[categoryKey] : 'Your cosmic insights are being revealed...';

    const otherCategories = categories.filter((_, index) => index !== categoryIndex);
    const otherCategoryButtons = otherCategories.map((cat, index) => {
        const originalIndex = categories.indexOf(cat);
        return `<button onclick="selectCategory(${originalIndex})" class="other-category-btn">
            <span class="category-icon ${cat}-icon">${categoryIcons[originalIndex]}</span>
            ${categoryNames[originalIndex]}
        </button>`;
    }).join('');

    categoryContent.innerHTML = `
        <div class="category-icon ${categoryKey}-icon" style="font-size: 3rem; margin-bottom: 20px;">${categoryIcons[categoryIndex]}</div>
        <h4>${categoryNames[categoryIndex].toUpperCase()}</h4>
        <p>${prophecyText}</p>

        <div class="other-categories">
            <h5>Explore Other Aspects:</h5>
            <div class="other-category-buttons">
                ${otherCategoryButtons}
            </div>
        </div>

        <div class="category-actions">
            <button onclick="copyResultToClipboard()" class="copy-result-btn">
                <span>📋 Copy Full Prophecy</span>
            </button>
        </div>
    `;

    categoryGrid.style.display = 'none';
    categoryDetail.classList.add('active');
}

function closeCategory() {
    const categoryGrid = document.querySelector('.category-grid');
    const categoryDetail = document.getElementById('categoryDetail');

    if (categoryGrid && categoryDetail) {
        categoryDetail.classList.remove('active');
        categoryGrid.style.display = 'grid';
        selectedCategory = null;
    }
}

function resetCategoryView() {
    closeCategory();
}

function saveUserData(userData) {
    try {
        let users = JSON.parse(localStorage.getItem('zodiacUsers')) || [];
        userData.id = Date.now();
        users.push(userData);
        localStorage.setItem('zodiacUsers', JSON.stringify(users));
    } catch (error) {
        console.error('Error saving user data:', error);
    }
}

function resetForm() {
    showCategoryLoadingScreen(() => {
        const form = document.getElementById('zodiacForm');
        if (form) form.reset();

        currentDate = new Date();
        currentCategoryIndex = 0;
        userData = null;
        selectedCategory = null;

        document.querySelectorAll('.error-msg').forEach(error => {
            error.classList.remove('show');
        });

        document.querySelectorAll('input, select').forEach(field => {
            field.style.borderColor = 'rgba(64, 224, 255, 0.2)';
        });

        const daySelect = document.getElementById('day');
        if (daySelect) {
            daySelect.innerHTML = '<option value="">Day</option>';
        }

        navigateToPage('home');
    });
}