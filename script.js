// DOM ELEMENTS
const ageForm = document.getElementById('ageForm');
const dayInput = document.getElementById('day');
const monthInput = document.getElementById('month');
const yearInput = document.getElementById('year');
const calculateBtn = document.getElementById('calculateBtn');
const resetBtn = document.getElementById('resetBtn');
const resultsSection = document.getElementById('resultsSection');
const themeToggle = document.getElementById('themeToggle');

// Result elements
const yearsValue = document.getElementById('yearsValue');
const monthsValue = document.getElementById('monthsValue');
const daysValue = document.getElementById('daysValue');
const nextBirthday = document.getElementById('nextBirthday');
const totalDays = document.getElementById('totalDays');

// Error message elements
const dayError = document.getElementById('dayError');
const monthError = document.getElementById('monthError');
const yearError = document.getElementById('yearError');

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    loadTheme();
    const currentYear = new Date().getFullYear();
    yearInput.setAttribute('max', currentYear);
    ageForm.addEventListener('submit', handleFormSubmit);
    resetBtn.addEventListener('click', handleReset);
    themeToggle.addEventListener('click', toggleTheme);
    dayInput.addEventListener('input', () => clearError('day'));
    monthInput.addEventListener('change', () => clearError('month'));
    yearInput.addEventListener('input', () => clearError('year'));
    dayInput.addEventListener('blur', formatDayInput);
    yearInput.addEventListener('blur', formatYearInput);
}

// THEME MANAGEMENT
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || 
        (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-mode');
    }
}

// FORM SUBMISSION HANDLER
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Clear all previous errors
    clearAllErrors();
    
    // Get input values
    const day = parseInt(dayInput.value);
    const month = parseInt(monthInput.value);
    const year = parseInt(yearInput.value);
    
    // Validate inputs
    const validation = validateInput(day, month, year);
    
    if (!validation.isValid) {
        displayErrors(validation.errors);
        return;
    }
    
    // Calculate age
    const birthDate = new Date(year, month - 1, day);
    const ageData = calculateAge(birthDate);
    
    // Display results
    displayResult(ageData);
}

// INPUT VALIDATION
function validateInput(day, month, year) {
    const errors = {};
    let isValid = true;
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    
    if (!day || isNaN(day)) {
        errors.day = 'Day is required';
        isValid = false;
    } else if (day < 1 || day > 31) {
        errors.day = 'Day must be between 1-31';
        isValid = false;
    }
    
    if (!month || isNaN(month)) {
        errors.month = 'Month is required';
        isValid = false;
    } else if (month < 1 || month > 12) {
        errors.month = 'Invalid month';
        isValid = false;
    }
    
    if (!year || isNaN(year)) {
        errors.year = 'Year is required';
        isValid = false;
    } else if (year < 1900) {
        errors.year = 'Year must be after 1900';
        isValid = false;
    } else if (year > currentYear) {
        errors.year = 'Year cannot be in the future';
        isValid = false;
    }
    
    if (isValid) {
        const testDate = new Date(year, month - 1, day);
        
        if (testDate.getMonth() !== month - 1 || testDate.getDate() !== day) {
            errors.day = 'Invalid date for this month';
            isValid = false;
        }
        if (year === currentYear && month === currentMonth && day > currentDay) {
            errors.day = 'Date cannot be in the future';
            isValid = false;
        } else if (year === currentYear && month > currentMonth) {
            errors.month = 'Date cannot be in the future';
            isValid = false;
        }
        const inputDate = new Date(year, month - 1, day);
        if (inputDate > today) {
            errors.day = 'Birth date cannot be in the future';
            isValid = false;
        }
    }
    
    return { isValid, errors };
}

// AGE CALCULATION LOGIC
/**
 * Calculate exact age from birth date to today
 * Handles leap years and varying month lengths correctly
 * 
 * Logic:
 * 1. Start with today's date and birth date
 * 2. Calculate years by comparing year values
 * 3. Adjust if birthday hasn't occurred this year yet
 * 4. Calculate remaining months
 * 5. Calculate remaining days
 */
function calculateAge(birthDate) {
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();
    if (days < 0) {
        months--;
        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += prevMonth.getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }
    const nextBirthdayData = calculateNextBirthday(birthDate);
    const totalDaysLived = calculateTotalDays(birthDate, today);
    
    return {
        years,
        months,
        days,
        nextBirthday: nextBirthdayData,
        totalDays: totalDaysLived
    };
}

// NEXT BIRTHDAY CALCULATION
function calculateNextBirthday(birthDate) {
    const today = new Date();
    const currentYear = today.getFullYear();
    let nextBirthday = new Date(
        currentYear,
        birthDate.getMonth(),
        birthDate.getDate()
    );
    if (nextBirthday < today) {
        nextBirthday = new Date(
            currentYear + 1,
            birthDate.getMonth(),
            birthDate.getDate()
        );
    }
    if (
        today.getDate() === birthDate.getDate() &&
        today.getMonth() === birthDate.getMonth()
    ) {
        return {
            daysUntil: 0,
            isToday: true,
            formatted: 'Today!'
        };
    }

    const timeDiff = nextBirthday - today;
    const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    const formatted = `${daysUntil} days (${nextBirthday.toLocaleDateString('en-US', options)})`;
    
    return {
        daysUntil,
        isToday: false,
        formatted
    };
}

// TOTAL DAYS CALCULATION
function calculateTotalDays(birthDate, today) {
    const timeDiff = today - birthDate;
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    return days.toLocaleString('en-US');
}

// DISPLAY RESULTS
function displayResult(ageData) {
    animateValue(yearsValue, 0, ageData.years, 800);
    animateValue(monthsValue, 0, ageData.months, 900);
    animateValue(daysValue, 0, ageData.days, 1000);
    nextBirthday.textContent = ageData.nextBirthday.formatted;
    totalDays.textContent = ageData.totalDays;
    resultsSection.classList.add('show');
    setTimeout(() => {
        resultsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
    }, 300);
}

// NUMBER ANIMATION
function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16); 
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = end;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// ERROR HANDLING
function displayErrors(errors) {
    Object.keys(errors).forEach(field => {
        const inputGroup = document.getElementById(field).parentElement;
        const errorElement = document.getElementById(`${field}Error`);
        
        inputGroup.classList.add('error');
        errorElement.textContent = errors[field];
    });
}

function clearError(field) {
    const inputGroup = document.getElementById(field).parentElement;
    const errorElement = document.getElementById(`${field}Error`);
    
    inputGroup.classList.remove('error');
    errorElement.textContent = '';
}

function clearAllErrors() {
    ['day', 'month', 'year'].forEach(field => clearError(field));
}

// RESET FUNCTIONALITY
function handleReset() {
    ageForm.reset();
    clearAllErrors();
    resultsSection.classList.remove('show');
    setTimeout(() => {
        yearsValue.textContent = '0';
        monthsValue.textContent = '0';
        daysValue.textContent = '0';
        nextBirthday.textContent = '--';
        totalDays.textContent = '--';
    }, 300);
    dayInput.focus();
}

// INPUT FORMATTING
function formatDayInput() {
    if (dayInput.value && dayInput.value.length === 1) {
        dayInput.value = '0' + dayInput.value;
    }
}

function formatYearInput() {
    const value = yearInput.value;
    if (value && value.length === 2) {
        const currentYear = new Date().getFullYear();
        const currentCentury = Math.floor(currentYear / 100) * 100;
        const twoDigitYear = parseInt(value);
        if (twoDigitYear <= currentYear % 100) {
            yearInput.value = currentCentury + twoDigitYear;
        } else {
            yearInput.value = (currentCentury - 100) + twoDigitYear;
        }
    }
}

// KEYBOARD SHORTCUTS
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.target.matches('input, select')) {
        e.preventDefault();
        calculateBtn.click();
    }
    if (e.key === 'Escape') {
        handleReset();
    }
});

// UTILITY FUNCTIONS
function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function getDaysInMonth(month, year) {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    if (month === 2 && isLeapYear(year)) {
        return 29;
    }
    
    return daysInMonth[month - 1];
}

// CONSOLE CREDITS
console.log('%c Age Calculator ', 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 20px; padding: 10px; border-radius: 5px;');
console.log('%c Crafted with ❤️ using Vanilla JavaScript ', 'color: #667eea; font-size: 14px;');