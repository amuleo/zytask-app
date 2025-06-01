let tasks = [];
let zPoint = 0;
let level = 1;
let totalCustomTasksCompleted = 0;
let userName = null;
let userCreationDate = null;
let unlockedAchievements = [];
let achievementUnlockDates = {};
let hasPinnedTaskEver = false;
let currentMotivationIndex = 0;
let defaultCategories = []; // New array to store default categories

const pointsPerNormalTask = 10;
const pointsPerImportantTask = 15;
const MAX_CUSTOM_POINTS = 20;
const TASKS_PER_PAGE = 7;
const DEFAULT_TASK_MAXLENGTH = 30;
const NOTE_TASK_MAXLENGTH = 55;
const CATEGORY_NAME_MAXLENGTH = 15; // New constant for category name max length
const MAX_CATEGORIES = 7; // New constant for maximum number of categories

let activeCurrentPage = 1;
let completedCurrentPage = 1;

let isReorderingMode = false;
let reorderingTaskId = null;

const levelPointsThresholds = [
    { name: 'نوب', points: 0, icon: 'fa-solid fa-ghost', motivational: 'شروع هر سفر با گام اول است. شما در ابتدای مسیر هستید و آماده برای کشف توانایی‌هایتان!' },
    { name: 'مبتدی', points: 50, icon: 'fa-solid fa-seedling', motivational: 'شما با تلاش و پشتکار، بذر موفقیت را کاشته‌اید. به رشد خود ادامه دهید!' },
    { name: 'جنگجو', points: 120, icon: 'fa-solid fa-hand-fist', motivational: 'شما با هر چالش، قوی‌تر و مصمم‌تر می‌شوید. روحیه جنگجویانه شما ستودنی است!' },
    { name: 'شوالیه', points: 220, icon: 'fa-solid fa-shield-halved', motivational: 'با هر وظیفه، زره‌ای از تجربه بر تن می‌کنید. شجاعت شما راهگشاست!' },
    { name: 'هیرو', points: 350, icon: 'fa-solid fa-mask', motivational: 'شما الهام‌بخش دیگران هستید. قدم‌هایتان ردپایی از موفقیت بر جای می‌گذارد!' },
    { level: 6, name: 'استاد', points: 500, icon: 'fa-solid fa-graduation-cap', motivational: 'دانش و مهارت شما در حال شکوفایی است. از هر تجربه درسی بیاموزید!' },
    { level: 7, name: 'فرمانده', points: 700, icon: 'fa-solid fa-star', motivational: 'اکنون می‌توانید رهبری کنید و مسیر را برای دیگران هموار سازید. قدرت در دستان شماست!' },
    { level: 8, name: 'سلطان', points: 950, icon: 'fa-solid fa-crown', motivational: 'شما بر قلمرو وظایف خود مسلط شده‌اید. با اقتدار به سوی اهداف بزرگتر گام بردارید!' },
    { level: 9, name: 'کار درست', points: 1250, icon: 'fa-solid fa-dragon', motivational: 'شما به قدرتی بی‌نظیر دست یافته‌اید. هیچ مانعی جلودار شما نخواهد بود!' },
    { level: 10, name: 'خفن', points: 1600, icon: 'fa-solid fa-fire-alt', motivational: 'شما به یک ستاره درخشان تبدیل شده‌اید. انرژی و خلاقیت شما بی‌حد و مرز است و هر کاری را به بهترین شکل ممکن انجام می‌دهید!' },
    { level: 11, name: 'جاودان', points: 2000, icon: 'fa-solid fa-infinity', motivational: 'پشتکار شما بی‌حد و مرز است. این مسیر، راهی برای جاودانگی دستاوردهای شماست!' },
    { level: 12, name: 'کیهان‌سالار', points: 2500, icon: 'fa-solid fa-bolt', motivational: 'شما با سرعتی باورنکردنی در حال پیشرفت هستید. انرژی شما جهان را به حرکت درمی‌آورد!' },
    { level: 13, name: 'کیهان‌نورد', points: 3000, icon: 'fa-solid fa-rocket', motivational: 'شما مرزها را درنوردیده‌اید و به سوی ناشناخته‌ها پرواز می‌کنید. آسمان حد شما نیست!' },
    { level: 14, name: 'بتمن', points: 3600, icon: 'fa-solid fa-user-secret', motivational: 'شما در سایه‌ها نیز قدرتمندید. با هوش و اراده، هر مشکلی را حل می‌کنید!' },
    { level: 15, name: 'سیگما', points: 4300, icon: 'fa-solid fa-chess-king', motivational: 'شما به اوج رسیده‌اید. با خرد و استراتژی، هر بازی را به نفع خود به پایان می‌رسانید!' }
];

const achievementsData = [
    { level: 1, name: 'نوب', icon: 'fa-solid fa-ghost', type: 'level', description: 'شروع هر سفر با گام اول است. شما در ابتدای مسیر هستید و آماده برای کشف توانایی‌هایتان!' },
    { level: 2, name: 'مبتدی', icon: 'fa-solid fa-seedling', type: 'level', description: 'شما با تلاش و پشتکار، بذر موفقیت را کاشته‌اید. به رشد خود ادامه دهید!' },
    { level: 3, name: 'جنگجو', icon: 'fa-solid fa-hand-fist', type: 'level', description: 'شما با هر چالش، قوی‌تر و مصمم‌تر می‌شوید. روحیه جنگجویانه شما ستودنی است!' },
    { level: 4, name: 'شوالیه', icon: 'fa-solid fa-shield-halved', type: 'level', description: 'با هر وظیفه, زره‌ای از تجربه بر تن می‌کنید. شجاعت شما راهگشاست!' },
    { level: 5, name: 'هیرو', icon: 'fa-solid fa-mask', type: 'level', description: 'شما الهام‌بخش دیگران هستید. قدم‌هایتان ردپایی از موفقیت بر جای می‌گذارد!' },
    { level: 6, name: 'استاد', icon: 'fa-solid fa-graduation-cap', type: 'level', description: 'دانش و مهارت شما در حال شکوفایی است. از هر تجربه درسی بیاموزید!' },
    { level: 7, name: 'فرمانده', points: 700, icon: 'fa-solid fa-star', type: 'level', description: 'اکنون می‌توانید رهبری کنید و مسیر را برای دیگران هموار سازید. قدرت در دستان شماست!' },
    { level: 8, name: 'سلطان', points: 950, icon: 'fa-solid fa-crown', type: 'level', description: 'شما بر قلمرو وظایف خود مسلط شده‌اید. با اقتدار به سوی اهداف بزرگتر گام بردارید!' },
    { level: 9, name: 'کار درست', points: 1250, icon: 'fa-solid fa-dragon', type: 'level', description: 'شما به قدرتی بی‌نظیر دست یافته‌اید. هیچ مانعی جلودار شما نخواهد بود!' },
    { level: 10, name: 'خفن', points: 1600, icon: 'fa-solid fa-fire-alt', type: 'level', description: 'شما به یک ستاره درخشان تبدیل شده‌اید. انرژی و خلاقیت شما بی‌حد و مرز است و هر کاری را به بهترین شکل ممکن انجام می‌دهید!' },
    { level: 11, name: 'جاودان', points: 2000, icon: 'fa-solid fa-infinity', type: 'level', description: 'پشتکار شما بی‌حد و مرز است. این مسیر، راهی برای جاودانگی دستاوردهای شماست!' },
    { level: 12, name: 'کیهان‌سالار', points: 2500, icon: 'fa-solid fa-bolt', type: 'level', description: 'شما با سرعتی باورنکردنی در حال پیشرفت هستید. انرژی شما جهان را به حرکت درمی‌آورد!' },
    { level: 13, name: 'کیهان‌نورد', points: 3000, icon: 'fa-solid fa-rocket', type: 'level', description: 'شما مرزها را درنوردیده‌اید و به سوی ناشناخته‌ها پرواز می‌کنید. آسمان حد شما نیست!' },
    { level: 14, name: 'بتمن', points: 3600, icon: 'fa-solid fa-user-secret', type: 'level', description: 'شما در سایه‌ها نیز قدرتمندید. با هوش و اراده، هر مشکلی را حل می‌کنید!' },
    { level: 15, name: 'سیگما', points: 4300, icon: 'fa-solid fa-chess-king', type: 'level', description: 'شما به اوج رسیده‌اید. با خرد و استراتژی، هر بازی را به نفع خود به پایان می‌رسانید!' },
    { type: 'totalTasks', value: 1, name: 'اولین قدم', icon: 'fa-solid fa-shoe-prints', description: 'اولین وظیفه خود را با موفقیت تکمیل کنید. هر سفر طولانی با یک قدم آغاز می‌شود!' },
    { type: 'totalTasks', value: 5, name: 'پنج ستاره', icon: 'fa-solid fa-star-half-stroke', description: 'با تکمیل ۵ وظیفه، نشان می‌دهید که در مسیر درستی هستید. به همین ترتیب ادامه دهید!' },
    { type: 'totalTasks', value: 10, name: 'ده وظیفه', icon: 'fa-solid fa-check-double', description: 'با تکمیل ۱۰ وظیفه، گام‌های محکم‌تری برداشته‌اید. این نشان از تعهد شماست و به شما کمک می‌کند تا به اهداف بزرگتر دست یابید.' },
    { type: 'totalTasks', value: 20, name: 'بیست وظیفه', icon: 'fa-solid fa-list-ol', description: 'بیست وظیفه را به پایان رساندید. این پیوستگی، پایه‌های موفقیت‌های آینده شما را بنا می‌نهد.' },
    { type: 'totalTasks', value: 50, name: 'پنجاه وظیفه', icon: 'fa-solid fa-clipboard-check', description: 'نیم قرن از وظایف را به اتمام رساندید! این حجم از کار، نشانگر توانایی شما در سازماندهی و پیگیری است.' },
    { type: 'totalTasks', value: 100, name: 'صد وظیفه', icon: 'fa-solid fa-trophy', description: 'به باشگاه صدتایی‌ها خوش آمدید! شما در حال ساختن عادت‌های موفقیت‌آمیز هستید و این ثبات, مسیر را برایتان هموارتر می‌کند.' },
    { type: 'totalTasks', value: 200, name: 'دویصد وظیفه', icon: 'fa-solid fa-medal', description: 'دویصد وظیفه تکمیل شده! این عدد، گواه رشد و پیشرفت مداوم شماست. به این روند ادامه دهید.' },
    { type: 'totalTasks', value: 300, name: 'سیصد وظیفه', icon: 'fa-solid fa-crown', description: 'سیصد وظیفه را با موفقیت پشت سر گذاشتید. شما در حال تسلط بر مدیریت زمان و بهره‌وری خود هستید.' },
    { type: 'totalTasks', value: 500, name: 'پانصد وظیفه', icon: 'fa-solid fa-award', description: 'پانصد وظیفه! این یک دستاورد بزرگ است که نشان می‌دهد شما در مسیر رسیدن به اهداف بزرگ، مصمم و قدرتمندید.' },
    { type: 'totalTasks', value: 1000, name: 'هزار وظیفه', icon: 'fa-solid fa-star', description: 'هزار وظیفه تکمیل شده! شما به یک اسطوره تبدیل شدید. این حجم از کار، نشان از اراده پولادین و توانایی بی‌نظیر شما در تحقق اهداف است.' },
    { type: 'points', value: 100, name: 'صد پوینت', icon: 'fa-solid fa-gem', description: 'اولین ۱۰۰ پوینت را کسب کردید. هر پوینت، گامی به سوی اهداف بزرگتر است!' },
    { type: 'points', value: 500, name: 'پانصد پوینت', icon: 'fa-solid fa-money-bill-wave', description: 'با جمع‌آوری ۵۰۰ پوینت، ارزش تلاش‌هایتان نمایان شده است.' },
    { type: 'points', value: 1000, name: 'هزار پوینت', icon: 'fa-solid fa-coins', description: 'هزار پوینت کسب کردید! شما در حال ساختن ثروت از جنس موفقیت هستید.' },
    { type: 'points', value: 2500, name: 'دو هزار و پانصد پوینت', icon: 'fa-solid fa-star-of-life', description: '۲۵۰۰ پوینت! شما در حال درخشش هستید و به اوج نزدیک می‌شوید.' },
    { type: 'points', value: 5000, name: 'پنج هزار پوینت', icon: 'fa-solid fa-meteor', description: '۵۰۰۰ پوینت! شما به یک نیروی غیرقابل توقف تبدیل شده‌اید. تبریک می‌گوییم!' },
    { type: 'points', value: 7500, name: 'هفت هزار و پانصد پوینت', icon: 'fa-solid fa-sack-dollar', description: 'با کسب ۷۵۰۰ پوینت، ارزش تلاش‌های شما به اوج رسیده است.' },
    { type: 'points', value: 10000, name: 'ده هزار پوینت', icon: 'fa-solid fa-money-bill-trend-up', description: 'ده هزار پوینت! شما به یک ثروت از جنس دستاوردها دست یافته‌اید.' },
    { type: 'points', value: 20000, name: 'بیست هزار پوینت', icon: 'fa-solid fa-hand-holding-usd', description: 'بیست هزار پوینت! شما فراتر از انتظار درخشیده‌اید و به یک اسطوره تبدیل شده‌اید.' },
    { type: 'firstPin', value: 1, name: 'اولین پین', icon: 'fa-solid fa-thumbtack', description: 'اولین وظیفه خود را پین کردید. شما سازمان‌دهی را جدی می‌گیرید!' }
];

const motivationQuotes = [
    "هر قدم کوچک، پیشرفت بزرگیه.",
    "فقط شروع کن، بقیه‌اش ردیف میشه.",
    "پایداری، رمز موفقیت توئه.",
    "کارهای کوچیک، نتایج بزرگ میسازن.",
    "امروز رو بهترین روزت کن.",
    "تلاش کن، واسه هدفات.",
    "با هر کار، یه قدم به هدفت نزدیکتر.",
    "باور کن، می‌تونی، انجامش بده.",
    "بعدا همین الانه.",
    "کوچیک شروع کن، بزرگ فکر کن.",
    "هر روز، فرصت رشد داری.",
    "تغییر از درون خودته.",
    "بهترین خودت باش.",
    "پشتکار، سرنوشت رو میسازه.",
    "چالش‌ها، درس یادگیری هستن.",
    "تمرکز، قدرت آفرینشه.",
    "هر روز، یه قدم جلوتر.",
    "شادی تو عمل کردنشه.",
    "روی تلاشت تمرکز کن.",
    "انضباط، آزادی میاره.",
    "هر کار کوچیک، قوی‌ترت می‌کنه.",
    "به توانایی‌هات اعتماد کن.",
    "کمال‌گرایی، مانع عمله.",
    "همین الان شروع کن، نترس.",
    "تغییرات کوچیک، زندگی رو عوض می‌کنه.",
    "موفقیت، تکرار موفقیته.",
    "هر شکست، درس پیروزیه.",
    "به جای عالی، شروع کن.",
    "کارهای ناتمام رو تموم کن.",
    "با برنامه، به همه چی می‌رسی.",
    "ذهن آروم، عملکرد بهتر.",
    "هر روز، بهتر از دیروز باش.",
    "با عمل کردن، ترست رو از بین ببر.",
    "کوچیک اما پیوسته، برنده میشی.",
    "تلاش امروز، موفقیت فرداست.",
    "بهترین سرمایه‌گذاری، خودتی.",
    "هر کار کوچیک، فرصت درخششه.",
    "با ت، همه چی ممکنه.",
    "قدرت انتخاب با خودته.",
    "بهترین زمان، همین حالاست.",
    "از منطقه امنت بیا بیرون.",
    "هر روز، یه پیروزی کوچیکه.",
    "با انگیزه، کوه‌ها رو جابجا کن.",
    "به مسیرت ایمان داشته باش.",
    "تو قهرمان زندگی خودتی."
];

const menuBtn = document.getElementById('menuBtn');
const menuDropdown = document.getElementById('menuDropdown');
const profileMenuItem = document.getElementById('profileMenuItem');
const achievementsMenuItem = document.getElementById('achievementsMenuItem');
const defaultCategoriesMenuItem = document.getElementById('defaultCategoriesMenuItem'); // New element
const helpMenuItem = document.getElementById('helpMenuItem');
const aboutMenuItem = document.getElementById('aboutMenuItem');
const backupMenuItem = document.getElementById('backupMenuItem');
const updateAppMenuItem = document.getElementById('updateAppMenuItem');
const donateMenuItem = document.getElementById('donateMenuItem');
const resetMenuItem = document.getElementById('resetMenuItem');

const pointsDropdownToggle = document.getElementById('pointsDropdownToggle');
const pointsDropdownContent = document.getElementById('pointsDropdownContent');
const dropdownIndicator = document.getElementById('dropdownIndicator');

const reorderBar = document.getElementById('reorderBar');
const finishReorderBtn = document.getElementById('finishReorderBtn');

const welcomeModal = document.getElementById('welcomeModal');
const welcomeModalContent = document.getElementById('welcomeModalContent'); // Corrected ID
const userNameInput = document.getElementById('userNameInput');
const startBtn = document.getElementById('startBtn');

const profileModal = document.getElementById('profileModal');
const profileModalContent = document.getElementById('profileModalContent');
const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');

const achievementsModal = document.getElementById('achievementsModal');
const achievementsModalContent = document.getElementById('achievementsModalContent');
const achievementsModalBody = document.getElementById('achievementsModalBody');
const closeAchievementsModalBtn = document.getElementById('closeAchievementsModalBtn');

const achievementNotificationModal = document.getElementById('achievementNotificationModal');
const achievementNotificationModalContent = document.getElementById('achievementNotificationModalContent');
const achievementNotificationIcon = document.getElementById('achievementNotificationIcon');
const achievementNotificationTitle = document.getElementById('achievementNotificationTitle');
const achievementNotificationMessage = document.getElementById('achievementNotificationMessage');
const closeAchievementNotificationModalBtn = document.getElementById('closeAchievementNotificationModalBtn');


const helpModal = document.getElementById('helpModal');
const helpModalContent = document.getElementById('helpModalContent');
const helpModalBody = document.getElementById('helpModalBody');
const aboutModal = document.getElementById('aboutModal');
const aboutModalContent = document.getElementById('aboutModalContent');
const aboutModalBody = document.getElementById('aboutModalBody');
const backupModal = document.getElementById('backupModal');
const backupModalContent = document.getElementById('backupModalContent');
const resetConfirmModal = document.getElementById('resetConfirmModal');
const resetConfirmModalContent = document.getElementById('resetConfirmModalContent');
const closeHelpModalBtn = document.getElementById('closeHelpModalBtn');
const closeAboutModalBtn = document.getElementById('closeAboutModalBtn');
const closeBackupModalBtn = document.getElementById('closeBackupModalBtn');
const confirmResetBtn = document.getElementById('confirmResetBtn');
const cancelResetBtn = document.getElementById('cancelResetBtn');
const closeResetModalBtn = document.getElementById('closeResetModalBtn');
const importFileInput = document.getElementById('importFileInput');
const exportDataBtn = document.getElementById('exportDataBtn');
const importDataBtn = document.getElementById('importDataBtn');
const selectedFileNameSpan = document.getElementById('selectedFileName');

const detailModal = document.getElementById('detailModal');
const detailModalContent = document.getElementById('detailModalContent');
const detailModalTitle = document.getElementById('detailModalTitle');
const detailModalBody = document.getElementById('detailModalBody');
const closeDetailModalBtn = document.getElementById('closeDetailModalBtn');

const taskInput = document.getElementById('taskInput');
const importanceSelect = document.getElementById('importanceSelect');
const customPointsInput = document.getElementById('customPointsInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const activeTaskList = document.getElementById('activeTaskList');
const completedTasksContainer = document.getElementById('completedTasksContainer');
const toggleCompletedTasksBtn = document.getElementById('toggleCompletedTasksBtn');
const toggleIcon = document.getElementById('toggleIcon');
const zPointSpan = document.getElementById('zPoint');
const levelSpan = document.getElementById('level');
const levelIcon = document.getElementById('levelIcon');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const addTaskSection = document.getElementById('addTaskSection');
const addTaskTitle = document.getElementById('addTaskTitle');

const activeTasksPagination = document.getElementById('activeTasksPagination');
const completedTasksPagination = document.getElementById('completedTasksPagination');
const completedTasksSection = document.getElementById('completedTasksSection');

const confettiContainer = document.getElementById('confettiContainer');

const undoMessageBox = document.getElementById('undoMessageBox');
const undoMessageText = document.getElementById('undoMessageText');
const undoCountdown = document.getElementById('undoCountdown');

const notificationQueue = [];
let isNotificationDisplaying = false;

const achievementNotificationQueue = [];
let isAchievementNotificationDisplaying = false;

const bottomCenterMessageQueue = [];
let isBottomCenterDisplaying = false;

let currentCountdownInterval = null;
let currentBottomCenterTimeout = null;


const editTaskModal = document.getElementById('editTaskModal');
const editTaskModalContent = document.getElementById('editTaskModalContent');
const editTaskNameInput = document.getElementById('editTaskNameInput');
const editTaskImportanceSelect = document.getElementById('editTaskImportanceSelect');
const editTaskCustomPointsInput = document.getElementById('editTaskCustomPointsInput');
const saveEditedTaskBtn = document.getElementById('saveEditedTaskBtn');
const cancelEditTaskBtn = document.getElementById('cancelEditTaskBtn');

let currentTaskBeingEditedId = null;

const updateConfirmModal = document.getElementById('updateConfirmModal');
const updateConfirmModalContent = document.getElementById('updateConfirmModalContent');
const confirmUpdateBtn = document.getElementById('confirmUpdateBtn');
const cancelUpdateBtn = document.getElementById('cancelUpdateBtn');
const closeUpdateModalBtn = document.getElementById('closeUpdateModalBtn');

const motivationContainer = document.getElementById('motivationContainer');
const motivationTextSpan = document.getElementById('motivationText');
let motivationInterval = null;

// New elements for Default Categories
const defaultCategoriesModal = document.getElementById('defaultCategoriesModal');
const defaultCategoriesModalContent = document.getElementById('defaultCategoriesModalContent');
const newCategoryInput = document.getElementById('newCategoryInput');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const defaultCategoriesList = document.getElementById('defaultCategoriesList');
const closeDefaultCategoriesModalBtn = document.getElementById('closeDefaultCategoriesModalBtn');

const addCategoryTasksModal = document.getElementById('addCategoryTasksModal');
const addCategoryTasksModalContent = document.getElementById('addCategoryTasksModalContent');
const addCategoryTasksTitle = document.getElementById('addCategoryTasksTitle');
const categoryTasksInputContainer = document.getElementById('categoryTasksInputContainer');
const addCategoryTaskBtn = document.getElementById('addCategoryTaskBtn');
const cancelAddCategoryTasksBtn = document.getElementById('cancelAddCategoryTasksBtn');
const closeAddCategoryTasksModalBtn = document.getElementById('closeAddCategoryTasksModalBtn');

const editCategoryModal = document.getElementById('editCategoryModal');
const editCategoryModalContent = document.getElementById('editCategoryModalContent');
const editCategoryTitle = document.getElementById('editCategoryTitle');
const editCategoryNameInput = document.getElementById('editCategoryNameInput');
const editCategoryTasksContainer = document.getElementById('editCategoryTasksContainer');
const addNewTaskToCategoryBtn = document.getElementById('addNewTaskToCategoryBtn');
const saveEditedCategoryBtn = document.getElementById('saveEditedCategoryBtn');
const cancelEditCategoryBtn = document.getElementById('cancelEditCategoryBtn');
const closeEditCategoryModalBtn = document.getElementById('closeEditCategoryModalBtn');

let currentCategoryBeingEditedId = null;

function convertPersianNumbersToEnglish(inputString) {
    if (typeof inputString !== 'string') {
        return inputString;
    }
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    let convertedString = '';
    for (let i = 0; i < inputString.length; i++) {
        const char = inputString[i];
        const index = persianNumbers.indexOf(char);
        if (index !== -1) {
            convertedString += englishNumbers[index];
        } else {
            convertedString += char;
        }
    }
    return convertedString;
}

function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text;
}

function formatPersianDate(isoDateString) {
    if (!isoDateString || isoDateString === 'null') return 'نامشخص';
    const date = new Date(isoDateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const parts = new Intl.DateTimeFormat('fa-IR', options).formatToParts(date);

    let weekday = '';
    let day = '';
    let month = '';
    let year = '';

    parts.forEach(part => {
        if (part.type === 'weekday') weekday = part.value;
        if (part.type === 'day') day = part.value;
        if (part.type === 'month') month = part.value;
        if (part.type === 'year') year = part.value;
    });

    return `${weekday}، ${day} ${month} ${year}`;
}


function showMessageBox(message, type = 'info', options = {}) {
    const { position = 'top-right', duration = 3000, isUndo = false, taskData = null, link = null, linkText = '' } = options;

    if (options.type === 'achievement') {
        achievementNotificationQueue.push({ iconClass: options.iconClass, title: message, message: options.description });
        processAchievementNotificationQueue();
    } else if (position === 'top-right') {
        notificationQueue.push({ type: 'message', data: { message, msgType: type, duration } });
        processNotificationQueue();
    } else if (position === 'bottom-center') {
        bottomCenterMessageQueue.push({ message, type, position, duration, isUndo, taskData, link, linkText });
        processBottomCenterQueue();
    }
}

function processNotificationQueue() {
    if (!welcomeModal.classList.contains('hidden')) {
        return;
    }

    if (notificationQueue.length === 0 || isNotificationDisplaying) {
        return;
    }

    isNotificationDisplaying = true;
    const notification = notificationQueue.shift();

    const messageBox = document.createElement('div');
    let bgColorClass = '';
    if (notification.data.msgType === 'info') {
        bgColorClass = 'bg-gray-500 dark:bg-gray-700';
    } else if (notification.data.msgType === 'success') {
        bgColorClass = 'bg-green-500 dark:bg-green-700';
    } else if (notification.data.msgType === 'error') {
        bgColorClass = 'bg-red-500 dark:bg-red-700';
    }
    messageBox.className = `fixed p-4 rounded-lg text-white z-50 transition-all duration-300 transform opacity-0 top-4 right-4 translate-x-full ${bgColorClass}`;
    messageBox.textContent = notification.data.message;
    document.body.appendChild(messageBox);

    setTimeout(() => {
        messageBox.classList.remove('translate-x-full', 'opacity-0');
        messageBox.classList.add('translate-x-0', 'opacity-100');
    }, 100);

    setTimeout(() => {
        messageBox.classList.remove('translate-x-0', 'opacity-100');
        messageBox.classList.add('translate-x-full', 'opacity-0');
        messageBox.addEventListener('transitionend', () => {
            messageBox.remove();
            isNotificationDisplaying = false;
            processNotificationQueue();
        }, { once: true });
    }, notification.data.duration);
}

function processAchievementNotificationQueue() {
    if (!welcomeModal.classList.contains('hidden') || isAchievementNotificationDisplaying) {
        return;
    }
    if (achievementNotificationQueue.length === 0) {
        return;
    }

    isAchievementNotificationDisplaying = true;
    const achievement = achievementNotificationQueue.shift();

    achievementNotificationIcon.className = achievement.iconClass;
    achievementNotificationTitle.textContent = achievement.title;
    achievementNotificationMessage.textContent = achievement.message;

    achievementNotificationIcon.style.fontSize = '4.5rem';
    achievementNotificationIcon.style.display = 'flex';
    achievementNotificationIcon.style.alignItems = 'center';
    achievementNotificationIcon.style.justifyContent = 'center';
    achievementNotificationIcon.style.marginBottom = '5px';


    achievementNotificationModal.classList.remove('hidden');
    void achievementNotificationModalContent.offsetWidth;
    achievementNotificationModalContent.classList.remove('opacity-0', 'scale-95');
    achievementNotificationModalContent.classList.add('opacity-100', 'scale-100');
    triggerConfetti();
}

function processBottomCenterQueue() {
    if (bottomCenterMessageQueue.length === 0 || isBottomCenterDisplaying) {
        return;
    }

    isBottomCenterDisplaying = true;
    const { message, duration, isUndo, taskData, link, linkText } = bottomCenterMessageQueue.shift();

    undoMessageText.innerHTML = message; // Use innerHTML to allow for links

    if (link) {
        const linkElement = document.createElement('a');
        linkElement.href = link;
        linkElement.textContent = linkText;
        linkElement.className = 'underline font-semibold mr-1';
        linkElement.target = '_blank'; // Open in new tab
        undoMessageText.appendChild(linkElement);
    }

    undoMessageBox.classList.remove('hidden');
    undoMessageBox._currentUndoTaskData = taskData;

    let timeLeft = duration / 1000;
    undoCountdown.textContent = `(${timeLeft}s)`;
    clearInterval(currentCountdownInterval);
    currentCountdownInterval = setInterval(() => {
        timeLeft--;
        undoCountdown.textContent = `(${timeLeft}s)`;
        if (timeLeft <= 0) {
            clearInterval(currentCountdownInterval);
            hideBottomCenterMessage();
        }
    }, 1000);

    undoMessageBox.onclick = () => {
        if (isUndo && undoMessageBox._currentUndoTaskData) {
            if (undoMessageBox._currentUndoTaskData.importance === 'note') {
                restoreNote(undoMessageBox._currentUndoTaskData.id);
            } else {
                undoLastDeletion(undoMessageBox._currentUndoTaskData);
            }
        } else if (link) {
            window.open(link, '_blank');
        }
        hideBottomCenterMessage();
    };

    setTimeout(() => {
        undoMessageBox.classList.remove('scale-0', 'opacity-0');
        undoMessageBox.classList.add('scale-100', 'opacity-100');
    }, 100);

    currentBottomCenterTimeout = setTimeout(() => {
        hideBottomCenterMessage();
    }, duration);


    function hideBottomCenterMessage() {
        clearTimeout(currentBottomCenterTimeout);
        clearInterval(currentCountdownInterval);
        undoMessageBox.classList.remove('scale-100', 'opacity-100');
        undoMessageBox.classList.add('scale-0', 'opacity-0');
        undoMessageBox.addEventListener('transitionend', () => {
            undoMessageBox.classList.add('hidden');
            undoMessageBox.onclick = null;
            undoMessageBox._currentUndoTaskData = null;
            isBottomCenterDisplaying = false;
            processBottomCenterQueue();
        }, { once: true });
    }
}


function showPointsGainFeedback(pointsGained, taskElement) {
    if (!taskElement) return;

    const feedback = document.createElement('div');
    feedback.textContent = `${pointsGained} پوینت`;
    feedback.classList.add('points-gain-feedback');

    const rect = taskElement.getBoundingClientRect();
    feedback.style.top = `${rect.top + window.scrollY + rect.height / 2 - 10}px`;
    feedback.style.left = `${rect.left + window.scrollX + rect.width / 2 - 20}px`;
    feedback.style.fontSize = '1.2rem';

    document.body.appendChild(feedback);

    feedback.addEventListener('animationend', () => {
        feedback.remove();
    });
}

function triggerConfetti() {
    const colors = ['#f0f', '#0ff', '#ff0', '#f00', '#0f0', '#00f'];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = `${Math.random() * 0.5}s`;
        confettiContainer.appendChild(confetti);
    }
    setTimeout(() => {
        confettiContainer.innerHTML = '';
    }, 3000);
}

function applyLevelTheme(currentLevel) {
    const isDarkMode = document.documentElement.classList.contains('dark');

    const lightThemeColors = {
        primary: '#2563eb',
        secondary: '#1d4ed8',
        accentBg: '#eff6ff',
        accentText: '#1e3a8a',
        inputBorder: '#93c5fd',
        inputFocusRing: '#60a5fa',
        motivationIcon: '#2563eb'
    };
    const darkThemeColors = {
        primary: '#93c5fd',
        secondary: '#60a5fa',
        accentBg: '#1e3a8a',
        accentText: '#eff6ff',
        inputBorder: '#2563eb',
        inputFocusRing: '#3b82f6',
        motivationIcon: '#93c5fd'
    };

    const currentThemeData = isDarkMode ? darkThemeColors : lightThemeColors;

    document.documentElement.style.setProperty('--theme-primary', currentThemeData.primary);
    document.documentElement.style.setProperty('--theme-secondary', currentThemeData.secondary);
    document.documentElement.style.setProperty('--theme-accent-bg', currentThemeData.accentBg);
    document.documentElement.style.setProperty('--theme-accent-text', currentThemeData.accentText);
    document.documentElement.style.setProperty('--theme-progress-from', currentThemeData.primary);
    document.documentElement.style.setProperty('--theme-progress-to', currentThemeData.secondary);
    document.documentElement.style.setProperty('--theme-input-border', currentThemeData.inputBorder);
    document.documentElement.style.setProperty('--theme-input-focus-ring', currentThemeData.inputFocusRing);
    document.documentElement.style.setProperty('--theme-blue-motivation-icon', currentThemeData.motivationIcon);


    addTaskBtn.style.backgroundColor = currentThemeData.primary;
    addTaskBtn.onmouseover = () => addTaskBtn.style.backgroundColor = currentThemeData.secondary;
    addTaskBtn.onmouseout = () => addTaskBtn.style.backgroundColor = currentThemeData.primary;

    progressBar.style.backgroundImage = `linear-gradient(to right, ${currentThemeData.primary}, ${currentThemeData.secondary})`;
}

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
}

function updateGamificationDisplay() {
    if (!userName) {
        return;
    }

    const oldLevel = level;

    zPointSpan.textContent = zPoint;

    let newLevel = 1;
    let currentLevelInfo = levelPointsThresholds[0];
    for (let i = 0; i < levelPointsThresholds.length; i++) {
        if (zPoint >= levelPointsThresholds[i].points) {
            newLevel = i + 1;
            currentLevelInfo = levelPointsThresholds[i];
        } else {
            break;
        }
    }

    if (newLevel !== level || (newLevel === 1 && !unlockedAchievements.includes('نوب'))) {
        for (let i = oldLevel; i < newLevel; i++) {
            const achievedLevelInfo = levelPointsThresholds[i];
            if (achievedLevelInfo && !unlockedAchievements.includes(achievedLevelInfo.name)) {
                unlockedAchievements.push(achievedLevelInfo.name);
                achievementUnlockDates[achievedLevelInfo.name] = new Date().toISOString();
                showMessageBox(`دستاورد: ${achievedLevelInfo.name}`, 'success', {
                    type: 'achievement',
                    iconClass: achievedLevelInfo.icon,
                    description: achievedLevelInfo.motivational
                });
            }
        }
        if (newLevel === 1 && !unlockedAchievements.includes('نوب')) {
            const noobAchievement = levelPointsThresholds[0];
            unlockedAchievements.push(noobAchievement.name);
            achievementUnlockDates[noobAchievement.name] = new Date().toISOString();
            showMessageBox(`دستاورد: ${noobAchievement.name}`, 'success', {
                type: 'achievement',
                iconClass: noobAchievement.icon,
                description: noobAchievement.motivational
            });
        }

        level = newLevel;
    }
    levelSpan.textContent = level;

    levelIcon.className = `${currentLevelInfo.icon} text-xl ml-2`;

    if (level <= levelPointsThresholds.length) {
        const currentLevelThreshold = levelPointsThresholds[level - 1].points;
        const nextLevelThreshold = (level < levelPointsThresholds.length) ? levelPointsThresholds[level].points : levelPointsThresholds[levelPointsThresholds.length - 1].points;

        let pointsIntoCurrentLevel = zPoint - currentLevelThreshold;
        let pointsNeededForNextLevel = nextLevelThreshold - currentLevelThreshold;

        let progressPercentage = 0;
        if (pointsNeededForNextLevel > 0) {
            progressPercentage = Math.min(100, (pointsIntoCurrentLevel / pointsNeededForNextLevel) * 100);
        } else if (level === levelPointsThresholds.length) {
            progressPercentage = 100;
        }

        progressBar.style.width = `${progressPercentage}%`;
        if (level < levelPointsThresholds.length) {
            progressText.textContent = `شما ${Math.round(progressPercentage)}% از مسیر پیشرفت به سطح ${levelPointsThresholds[level].name} را طی کرده‌اید.`;
        } else {
            progressText.textContent = `شما به حداکثر سطح (${levelPointsThresholds[levelPointsThresholds.length - 1].name}) رسیده‌اید! شما می‌توانید همچنان پوینت کسب کنید!`;
        }
    } else {
        progressBar.style.width = `100%`;
        progressText.textContent = `شما به حداکثر سطح (${levelPointsThresholds[levelPointsThresholds.length - 1].name}) رسیده‌اید! شما می‌توانید همچنان پوینت کسب کنید!`;
    }

    const currentTotalTasksCompleted = tasks.filter(task => task.completed && task.importance !== 'note').length;

    achievementsData.forEach(achievement => {
        if (achievement.type === 'level') return;

        let isAchieved = false;
        const currentCustomTasksCompleted = totalCustomTasksCompleted;

        if (achievement.type === 'totalTasks') {
            if (currentTotalTasksCompleted >= achievement.value) {
                isAchieved = true;
            }
        } else if (achievement.type === 'points') {
            if (zPoint >= achievement.value) {
                isAchieved = true;
            }
        } else if (achievement.type === 'firstPin') {
            if (hasPinnedTaskEver) {
                isAchieved = true;
            }
        }

        if (isAchieved && !unlockedAchievements.includes(achievement.name)) {
            unlockedAchievements.push(achievement.name);
            achievementUnlockDates[achievement.name] = new Date().toISOString();
            showMessageBox(`دستاورد: ${achievement.name}`, 'success', {
                type: 'achievement',
                iconClass: achievement.icon,
                description: achievement.description
            });
        }
    });

    saveToLocalStorage();
    applyLevelTheme(level);
}

function saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('zPoint', zPoint);
    localStorage.setItem('level', level);
    localStorage.setItem('totalCustomTasksCompleted', totalCustomTasksCompleted);
    localStorage.setItem('userName', userName);
    localStorage.setItem('userCreationDate', userCreationDate);
    localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedAchievements));
    localStorage.setItem('achievementUnlockDates', JSON.stringify(achievementUnlockDates));
    localStorage.setItem('hasPinnedTaskEver', hasPinnedTaskEver);
    localStorage.setItem('currentMotivationIndex', currentMotivationIndex);
    localStorage.setItem('defaultCategories', JSON.stringify(defaultCategories)); // Save default categories
}

function loadFromLocalStorage() {
    const storedTasks = localStorage.getItem('tasks');
    const storedZPoint = localStorage.getItem('zPoint');
    const storedLevel = localStorage.getItem('level');
    const storedTotalCustomTasksCompleted = localStorage.getItem('totalCustomTasksCompleted');
    const storedUserName = localStorage.getItem('userName');
    const storedUserCreationDate = localStorage.getItem('userCreationDate');
    const storedUnlockedAchievements = localStorage.getItem('unlockedAchievements');
    const storedAchievementUnlockDates = localStorage.getItem('achievementUnlockDates');
    const storedHasPinnedTaskEver = localStorage.getItem('hasPinnedTaskEver');
    const storedCurrentMotivationIndex = localStorage.getItem('currentMotivationIndex');
    const storedDefaultCategories = localStorage.getItem('defaultCategories'); // Load default categories

    if (storedTasks) {
        try {
            tasks = JSON.parse(storedTasks);
            tasks.forEach(task => {
                if (typeof task.isPinned === 'undefined') {
                    task.isPinned = false;
                }
                if (typeof task.pinnedAt === 'undefined') {
                    task.pinnedAt = null;
                }
            });
        } catch (e) {
            console.error("Error parsing stored tasks from Local Storage:", e);
            tasks = [];
        }
    }
    if (storedZPoint) {
        zPoint = parseInt(storedZPoint, 10);
        if (isNaN(zPoint)) zPoint = 0;
    }
    if (storedLevel) {
        level = parseInt(storedLevel, 10);
        if (isNaN(level)) level = 1;
    }
    if (storedTotalCustomTasksCompleted) {
        totalCustomTasksCompleted = parseInt(storedTotalCustomTasksCompleted, 10);
        if (isNaN(totalCustomTasksCompleted)) totalCustomTasksCompleted = 0;
    }
    if (storedUserCreationDate && storedUserCreationDate !== 'null') {
        userCreationDate = storedUserCreationDate;
    } else {
        userCreationDate = null;
    }
    if (storedUnlockedAchievements) {
        try {
            unlockedAchievements = JSON.parse(storedUnlockedAchievements);
        } catch (e) {
            console.error("Error parsing unlocked achievements from Local Storage:", e);
            unlockedAchievements = [];
        }
    }
    if (storedAchievementUnlockDates) {
        try {
            achievementUnlockDates = JSON.parse(storedAchievementUnlockDates);
        } catch (e) {
            console.error("Error parsing achievement unlock dates from Local Storage:", e);
            achievementUnlockDates = {};
        }
    } else {
        unlockedAchievements.forEach(achName => {
            if (!achievementUnlockDates[achName]) {
                achievementUnlockDates[achName] = new Date().toISOString();
            }
        });
    }

    if (storedHasPinnedTaskEver) {
        hasPinnedTaskEver = (storedHasPinnedTaskEver === 'true');
    }

    if (storedCurrentMotivationIndex) {
        currentMotivationIndex = parseInt(storedCurrentMotivationIndex, 10);
        if (isNaN(currentMotivationIndex)) currentMotivationIndex = 0;
    } else {
        currentMotivationIndex = 0;
    }

    if (storedDefaultCategories) { // Load default categories
        try {
            defaultCategories = JSON.parse(storedDefaultCategories);
        } catch (e) {
            console.error("Error parsing default categories from Local Storage:", e);
            defaultCategories = [];
        }
    }
}

function createTaskElement(task, isNew = false, inReorderMode = false, reorderingTaskId = null) {
    const taskItem = document.createElement('div');
    taskItem.className = `task-item flex items-center justify-between p-3 mb-2 sm:p-4 sm:mb-3 rounded-lg transition-all duration-300 ease-in-out
                                ${task.completed ? 'bg-green-100 dark:bg-green-800 border-l-4 border-green-500 dark:border-green-600 line-through text-gray-500 dark:text-gray-400' :
                                task.isPinned ? 'bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-500 dark:border-yellow-600' :
                                task.importance === 'important' ? 'bg-red-50 dark:bg-red-900 border-l-4 border-red-500 dark:border-red-600' :
                                task.importance === 'custom' ? 'bg-purple-50 dark:bg-purple-900 border-l-4 border-purple-500 dark:border-purple-600' :
                                task.importance === 'note' ? 'bg-orange-50 dark:bg-orange-900 border-l-4 border-orange-500 dark:border-orange-600' :
                                'bg-gray-50 dark:bg-gray-700 border-l-4 border-gray-300 dark:border-gray-600'}
                                ${isNew ? 'new-task-animation' : ''}
                                ${inReorderMode && task.id !== reorderingTaskId ? 'reordering-disabled' : ''}
                                ${inReorderMode && task.id === reorderingTaskId ? 'reordering-active' : ''}`;
    taskItem.dataset.id = task.id;

    let importanceText = '';
    let importanceClasses = '';
    if (task.importance === 'important') {
        importanceText = 'مهم';
        importanceClasses = 'bg-red-200 dark:bg-red-700 text-red-800 dark:text-red-200';
    } else if (task.importance === 'normal') {
        importanceText = 'عادی';
        importanceClasses = 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200';
    } else if (task.importance === 'custom') {
        importanceText = `${task.customPoints} پوینت`;
        importanceClasses = 'bg-purple-200 dark:bg-purple-700 text-purple-800 dark:text-purple-200';
    } else if (task.importance === 'note') {
        importanceText = 'یادداشت';
        importanceClasses = 'bg-orange-200 dark:bg-orange-700 text-orange-800 dark:text-orange-200';
    }

    let actionButtonsHtml = '';
    if (inReorderMode && task.id === reorderingTaskId) {
        actionButtonsHtml = `
            <button data-id="${task.id}" data-action="move-up"
                class="h-7 w-7 flex items-center justify-center rounded-full bg-blue-200 hover:bg-blue-300 dark:bg-blue-700 dark:hover:bg-blue-600 text-blue-800 dark:text-blue-100 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400">
                <i class="fa-solid fa-arrow-up text-sm"></i>
            </button>
            <button data-id="${task.id}" data-action="move-down"
                class="h-7 w-7 flex items-center justify-center rounded-full bg-blue-200 hover:bg-blue-300 dark:bg-blue-700 dark:hover:bg-blue-600 text-blue-800 dark:text-blue-100 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400">
                <i class="fa-solid fa-arrow-down text-sm"></i>
            </button>
        `;
    } else {
        actionButtonsHtml = `
            <button data-id="${task.id}" data-action="menu"
                class="three-dot-menu-btn bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 100-2 1 1 0 000 2zm0 7a1 1 0 100-2 1 1 0 000 2zm0 7a1 1 0 100-2 1 1 0 000 2z"></path>
                </svg>
            </button>
        `;
    }

    const checkboxHtml = (task.importance !== 'note' || task.completed) ? `
        <input type="checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''} ${task.importance === 'note' ? 'disabled' : ''}
            class="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-400 rounded focus:ring-blue-500 dark:focus:ring-blue-300 ml-2">
    ` : '';

    const justifyClass = task.importance === 'note' ? 'text-align-justify-rtl' : '';

    const noteIconHtml = (task.importance === 'note' && !task.isPinned && !task.completed) ?
        `<i class="fa-solid fa-note-sticky ml-2 text-orange-500" title="یادداشت"></i>` : '';

    taskItem.innerHTML = `
        <div class="flex items-center flex-grow">
            ${checkboxHtml}
            <div class="task-name-wrapper ${task.importance !== 'note' ? 'ml-3' : ''} text-base sm:text-lg font-medium ${task.completed ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-800 dark:text-gray-100'} ${justifyClass}">
                ${task.isPinned ? `<i class="fa-solid fa-thumbtack ml-2 text-yellow-500" title="وظیفه پین شده"></i>` : ''}
                ${noteIconHtml}
                <span class="task-name">${task.name}</span>
            </div>
        </div>
        <div class="flex items-center space-x-2 space-x-reverse mr-2">
            <span class="task-importance-display text-sm px-2 py-1 rounded-full mr-2 ${importanceClasses}">
                ${importanceText}
            </span>
            ${actionButtonsHtml}
        </div>
    `;

    if (isNew) {
        setTimeout(() => {
            taskItem.classList.add('animate-in');
        }, 10);
    }

    return taskItem;
}

function renderTasks(focusTaskId = null) {
    let activeTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);

    activeTasks.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        if (a.isPinned && b.isPinned) {
            const dateA = new Date(a.pinnedAt || 0);
            const dateB = new Date(b.pinnedAt || 0);
            return dateB.getTime() - dateA.getTime();
        }

        return 0;
    });

    if (focusTaskId) {
        const focusedTask = tasks.find(t => t.id === focusTaskId);
        if (focusedTask) {
            if (!focusedTask.completed) {
                const indexInActiveList = activeTasks.findIndex(t => t.id === focusTaskId);
                if (indexInActiveList !== -1) {
                    activeCurrentPage = Math.ceil((indexInActiveList + 1) / TASKS_PER_PAGE);
                }
            } else {
                const indexInCompletedList = completedTasks.findIndex(t => t.id === focusTaskId);
                if (indexInCompletedList !== -1) {
                    completedCurrentPage = 1;
                    if (completedTasksSection.classList.contains('hidden')) {
                        completedTasksSection.classList.remove('hidden');
                        toggleIcon.classList.add('rotate-180');
                    }
                }
            }
        }
    }

    const activeTotalPages = Math.ceil(activeTasks.length / TASKS_PER_PAGE);
    if (activeCurrentPage > activeTotalPages && activeTotalPages > 0) {
        activeCurrentPage = activeTotalPages;
    } else if (activeTotalPages === 0) {
        activeCurrentPage = 1;
    }
    activeCurrentPage = Math.min(Math.max(1, activeCurrentPage), Math.max(1, activeTotalPages));

    const activeStartIndex = (activeCurrentPage - 1) * TASKS_PER_PAGE;
    const activeEndIndex = activeStartIndex + TASKS_PER_PAGE;
    const activeTasksToRender = activeTasks.slice(activeStartIndex, activeEndIndex);

    updateTaskListDOM(activeTaskList, activeTasksToRender, activeTasks.length === 0, 'اولین وظیفه فعال خود را ایجاد کنید!', isReorderingMode, reorderingTaskId, focusTaskId);

            // --- شروع: کدهای جدید برای کنترل اسکرول دو وجهی (فعال/تکمیل شده) ---
    // این کد باید بلافاصله بعد از فراخوانی updateTaskListDOM برای activeTaskList قرار گیرد.
    if (!focusTaskId) { // اگر هیچ focusTaskId مشخصی وجود ندارد (یعنی از طریق صفحه‌بندی کلیک شده)
        setTimeout(() => {
            if (triggeredByListType === 'active') {
                // اگر صفحه‌بندی برای وظایف فعال کلیک شده است
                if (!completedTasksSection.classList.contains('hidden')) {
                    completedTasksSection.classList.add('hidden'); // آکا دئسون را ببند
                    toggleIcon.classList.remove('rotate-180'); // آیکون را بچرخان
                }
                // همیشه کل صفحه را به بالا اسکرول کن (با اسکرول نرم)
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (triggeredByListType === 'completed') {
                // اگر صفحه‌بندی برای وظایف تکمیل شده کلیک شده است
                // آکا دئسون باید باز بماند (نیازی به تغییر visibility نیست)
                if (completedTasksContainer) {
                    completedTasksContainer.scrollTo({ top: 0, behavior: 'smooth' }); // کانتینر آن را به بالا اسکرول کن (با اسکرول نرم)
                }
            }
        }, 0); // 0ms delay, just to push it to the end of the event queue
    } else {
        // اگر focusTaskId وجود دارد (مثلاً وظیفه جدید اضافه شده یا بازگردانده شده)
        // به سمت آن وظیفه خاص به صورت نرم اسکرول کن
        const focusedTaskElement = document.getElementById(`task-${focusTaskId}`);
        if (focusedTaskElement) {
            focusedTaskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    // --- پایان: کدهای جدید برای کنترل اسکرول دو وجهی ---

    const completedTotalPages = Math.ceil(completedTasks.length / TASKS_PER_PAGE);
    if (completedCurrentPage > completedTotalPages && completedTotalPages > 0) {
        completedCurrentPage = completedTotalPages;
    } else if (completedTotalPages === 0) {
        completedCurrentPage = 1;
    }
    completedCurrentPage = Math.min(Math.max(1, completedCurrentPage), Math.max(1, completedTotalPages));

    const completedStartIndex = (completedCurrentPage - 1) * TASKS_PER_PAGE;
    const completedEndIndex = completedStartIndex + TASKS_PER_PAGE;
    const completedTasksToRender = completedTasks.slice(completedStartIndex, completedEndIndex);

    updateTaskListDOM(completedTasksContainer, completedTasksToRender, completedTasks.length === 0, 'هنوز وظیفه تکمیل شده‌ای وجود ندارد.', false, null, focusTaskId);

    renderPaginationControls(activeTasksPagination, activeTasks.length, activeCurrentPage, 'active');
    renderPaginationControls(completedTasksPagination, completedTasks.length, completedCurrentPage, 'completed');

    if (isReorderingMode) {
        void reorderBar.offsetWidth;
        setTimeout(() => {
            reorderBar.classList.remove('opacity-0', 'pointer-events-none');
        }, 10);
    } else {
        reorderBar.classList.add('opacity-0', 'pointer-events-none');
    }

    if (userName) {
        updateGamificationDisplay();
    }
}

function updateTaskListDOM(container, newTasks, isEmptyMessageNeeded, emptyMessageText, inReorderMode = false, reorderingTaskId = null, focusTaskId = null) {
    const existingElements = Array.from(container.children).filter(child => child.classList.contains('task-item'));
    const existingIds = new Set(existingElements.map(el => el.dataset.id));
    const newIds = new Set(newTasks.map(task => task.id));

    existingElements.forEach(element => {
        if (!newIds.has(element.dataset.id)) {
            element.style.transform = `translateX(-100vw)`;
            element.style.opacity = '0';
            element.addEventListener('transitionend', () => {
                element.remove();
            }, { once: true });
        }
    });

    const fragment = document.createDocumentFragment();
    newTasks.forEach(task => {
        let taskElement = container.querySelector(`[data-id="${task.id}"]`);
        if (taskElement) {
            const newElement = createTaskElement(task, false, inReorderMode, reorderingTaskId);
            taskElement.className = newElement.className;
            const newCheckbox = newElement.querySelector('input[type="checkbox"]');
            const existingCheckbox = taskElement.querySelector('input[type="checkbox"]');
            if (newCheckbox && existingCheckbox) {
                existingCheckbox.checked = task.completed;
                existingCheckbox.disabled = newCheckbox.disabled;
            } else if (!newCheckbox && existingCheckbox) {
                existingCheckbox.remove();
            } else if (newCheckbox && !existingCheckbox) {
                taskElement.querySelector('.flex-grow').prepend(newCheckbox);
            }

            taskElement.querySelector('.task-name').textContent = task.name;
            taskElement.querySelector('.task-name-wrapper').innerHTML = newElement.querySelector('.task-name-wrapper').innerHTML;
            taskElement.querySelector('.task-importance-display').className = newElement.querySelector('.task-importance-display').className;
            taskElement.querySelector('.task-importance-display').textContent = newElement.querySelector('.task-importance-display').textContent;
            const existingActionButtons = taskElement.querySelector('.flex.items-center.space-x-2.space-x-reverse.mr-2');
            if (existingActionButtons) {
                existingActionButtons.innerHTML = newElement.querySelector('.flex.items-center.space-x-2.space-x-reverse.mr-2').innerHTML;
            }
        } else {
            taskElement = createTaskElement(task, true, inReorderMode, reorderingTaskId);
        }
        fragment.appendChild(taskElement);
    });

    container.innerHTML = '';
    container.appendChild(fragment);

    const existingNoMessage = container.querySelector('#dynamicNoActiveMessage, #dynamicNoCompletedMessage');
    if (isEmptyMessageNeeded) {
        if (!existingNoMessage) {
            const noItem = document.createElement('div');
            noItem.id = container.id === 'activeTaskList' ? 'dynamicNoActiveMessage' : 'dynamicNoCompletedMessage';
            noItem.className = 'text-gray-500 dark:text-gray-400 text-center py-4';
            noItem.textContent = emptyMessageText;
            container.appendChild(noItem);
        }
    } else {
        if (existingNoMessage) {
            existingNoMessage.remove();
        }
    }

    if (focusTaskId) {
        const taskElement = document.querySelector(`.task-item[data-id="${focusTaskId}"]`);
        if (taskElement) {
            taskElement.classList.add('highlight');
            taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                taskElement.classList.remove('highlight');
            }, 1500);
        }
    } else if (!inReorderMode && newTasks.length > 0) {
        const firstTaskElement = container.querySelector(`.task-item[data-id="${newTasks[0].id}"]`);
        if (firstTaskElement) {
            firstTaskElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}


function renderPaginationControls(containerElement, totalItems, currentPage, listType) {
    const totalPages = Math.ceil(totalItems / TASKS_PER_PAGE);
    const maxPageButtons = 3;

    if (totalPages <= 1) {
        containerElement.classList.add('hidden');
        containerElement.innerHTML = '';
        return;
    } else {
        // اطمینان از اینکه بخش تکمیل شده پنهان نیست اگر لیست از نوع تکمیل شده باشد
        if (listType === 'completed' && completedTasksSection.classList.contains('hidden')) {
            containerElement.classList.add('hidden');
            containerElement.innerHTML = '';
            return;
        }
        containerElement.classList.remove('hidden');
    }

    containerElement.innerHTML = '';
    containerElement.classList.add('flex', 'flex-wrap', 'justify-center', 'items-center', 'gap-2', 'my-4');

    // دکمه قبلی
    const prevBtn = document.createElement('button');
    prevBtn.className = `p-1 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`;
    prevBtn.innerHTML = `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`;
    prevBtn.disabled = currentPage === 1;
    prevBtn.title = "صفحه قبلی";
    prevBtn.addEventListener('click', () => {
        if (listType === 'active') {
            activeCurrentPage = Math.max(1, activeCurrentPage - 1);
            // NEW: Close completed tasks section immediately for active task pagination
            if (!completedTasksSection.classList.contains('hidden')) {
                completedTasksSection.classList.add('hidden');
                toggleIcon.classList.remove('rotate-180');
            }
        } else {
            completedCurrentPage = Math.max(1, completedCurrentPage - 1);
        }
        renderTasks(null, listType); // فراخوانی renderTasks با listType
    });
    containerElement.appendChild(prevBtn);

    // تابع کمکی برای ایجاد دکمه‌های صفحه
    const createPageButton = (pageNumber, isActive = false) => {
        const button = document.createElement('button');
        button.className = `px-3 py-1 rounded-full text-sm font-semibold transition duration-200 ease-in-out
                            ${isActive ? 'bg-blue-600 text-white dark:bg-blue-500' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100'}
                            focus:outline-none focus:ring-2 focus:ring-blue-400`;
        button.textContent = pageNumber;
        button.title = `صفحه ${pageNumber}`;
        button.addEventListener('click', () => {
            if (listType === 'active') {
                activeCurrentPage = pageNumber;
                // NEW: Close completed tasks section immediately for active task pagination
                if (!completedTasksSection.classList.contains('hidden')) {
                    completedTasksSection.classList.add('hidden');
                    toggleIcon.classList.remove('rotate-180');
                }
            } else {
                completedCurrentPage = pageNumber;
            }
            renderTasks(null, listType); // فراخوانی renderTasks با listType
        });
        return button;
    };

    const createEllipsis = () => {
        const span = document.createElement('span');
        span.className = 'px-2 py-1 text-gray-500 dark:text-gray-400';
        span.textContent = '...';
        return span;
    };

    let startPage, endPage;

    // منطق نمایش دکمه‌های صفحه (برای نمایش حداکثر maxPageButtons دکمه)
    if (totalPages <= maxPageButtons) {
        startPage = 1;
        endPage = totalPages;
    } else {
        const half = Math.floor(maxPageButtons / 2);
        startPage = currentPage - half;
        endPage = currentPage + half;

        if (startPage < 1) {
            startPage = 1;
            endPage = maxPageButtons;
        }
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = totalPages - maxPageButtons + 1;
        }
    }

    // اضافه کردن دکمه صفحه اول و سه نقطه (در صورت نیاز)
    if (startPage > 1) {
        containerElement.appendChild(createPageButton(1));
        if (startPage > 2) {
            containerElement.appendChild(createEllipsis());
        }
    }

    // اضافه کردن دکمه‌های صفحه میانی
    for (let i = startPage; i <= endPage; i++) {
        containerElement.appendChild(createPageButton(i, i === currentPage));
    }

    // اضافه کردن سه نقطه و دکمه صفحه آخر (در صورت نیاز)
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            containerElement.appendChild(createEllipsis());
        }
        containerElement.appendChild(createPageButton(totalPages));
    }

    // دکمه بعدی
    const nextBtn = document.createElement('button');
    nextBtn.className = `p-1 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`;
    nextBtn.innerHTML = `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>`;
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.title = "صفحه بعدی";
    nextBtn.addEventListener('click', () => {
        if (listType === 'active') {
            activeCurrentPage = Math.min(totalPages, activeCurrentPage + 1);
            // NEW: Close completed tasks section immediately for active task pagination
            if (!completedTasksSection.classList.contains('hidden')) {
                completedTasksSection.classList.add('hidden');
                toggleIcon.classList.remove('rotate-180');
            }
        } else {
            completedCurrentPage = Math.min(totalPages, completedCurrentPage + 1);
        }
        renderTasks(null, listType); // فراخوانی renderTasks با listType
    });
    containerElement.appendChild(nextBtn);
}


function renderAchievementsIntoModal() {
    achievementsModalBody.innerHTML = '';

    const achievedList = [];
    const unachievedList = [];

    achievementsData.forEach(achievement => {
        let isAchieved = false;
        const currentTotalTasksCompleted = tasks.filter(task => task.completed && task.importance !== 'note').length;

        if (achievement.type === 'level') {
            const levelInfo = levelPointsThresholds.find(l => l.name === achievement.name);
            if (levelInfo && zPoint >= levelInfo.points) {
                isAchieved = true;
            }
        } else if (achievement.type === 'totalTasks') {
            if (currentTotalTasksCompleted >= achievement.value) {
                isAchieved = true;
            }
        } else if (achievement.type === 'points') {
            if (zPoint >= achievement.value) {
                isAchieved = true;
            }
        } else if (achievement.type === 'firstPin') {
            if (hasPinnedTaskEver) {
                isAchieved = true;
            }
        }

        if (isAchieved) {
            achievedList.push({ ...achievement, unlockedDate: achievementUnlockDates[achievement.name] });
        } else {
            unachievedList.push(achievement);
        }
    });

    achievedList.sort((a, b) => {
        const dateA = new Date(a.unlockedDate || 0);
        const dateB = new Date(b.unlockedDate || 0);
        return dateB.getTime() - dateA.getTime();
    });

    unachievedList.sort((a, b) => {
        if (a.type === 'level' && b.type !== 'level') return -1;
        if (a.type !== 'level' && b.type === 'level') return 1;
        if (a.type === 'level' && b.type === 'level') return a.level - b.level;
        return (a.value || 0) - (b.value || 0);
    });

    const sortedAchievements = [...achievedList, ...unachievedList];

    if (sortedAchievements.length === 0) {
        const noAchievementsMessage = document.createElement('p');
        noAchievementsMessage.className = 'text-gray-500 dark:text-gray-400 text-center col-span-full py-4';
        noAchievementsMessage.textContent = 'هنوز دستاوردی کسب نشده است.';
        achievementsModalBody.appendChild(noAchievementsMessage);
    } else {
        sortedAchievements.forEach(achievement => {
            const achievementItem = document.createElement('div');
            const isAchieved = unlockedAchievements.includes(achievement.name);

            achievementItem.className = `achievement-item-card ${isAchieved ? '' : 'unachieved'}`;

            achievementItem.innerHTML = `
                <i class="${isAchieved ? achievement.icon : 'fa-solid fa-lock'} icon"></i>
                <span class="name">${achievement.name}</span>
                `;

             if (isAchieved) {
                achievementItem.addEventListener('click', () => {
                    if (achievement.type === 'level') {
                        showDetailModal(achievement.type, achievement.name);
                    } else {
                        showDetailModal('achievement', achievement.name);
                    }
                });
            }

            achievementsModalBody.appendChild(achievementItem);
        });
    }
}

addTaskBtn.addEventListener('click', () => {
    const taskName = taskInput.value.trim();
    const importance = importanceSelect.value;
    let customPoints = 0;

    if (taskName.length === 0) {
        showMessageBox('لطفاً نام وظیفه را وارد کنید.', 'info');
        return;
    }

    const currentMaxLength = importance === 'note' ? NOTE_TASK_MAXLENGTH : DEFAULT_TASK_MAXLENGTH;
    if (taskName.length > currentMaxLength) {
        showMessageBox(`مقدار ورودی نباید بیش از ${currentMaxLength} کاراکتر باشد.`, 'error');
        return;
    }

    if (importance === 'custom') {
        const convertedPoints = convertPersianNumbersToEnglish(customPointsInput.value);
        customPoints = parseInt(convertedPoints, 10);
        if (isNaN(customPoints) || customPoints <= 0 || customPoints > MAX_CUSTOM_POINTS) {
            showMessageBox(`لطفاً یک مقدار پوینت سفارشی معتبر (حداکثر ${MAX_CUSTOM_POINTS}) وارد کنید.`, 'info');
            return;
        }
    }

    const newTask = {
        id: Date.now().toString(),
        name: taskName,
        completed: false,
        importance: importance,
        customPoints: importance === 'custom' ? customPoints : undefined,
        isPinned: false,
        pinnedAt: null
    };
    tasks.push(newTask);
    taskInput.value = '';
    customPointsInput.value = '';
    importanceSelect.value = 'normal';
    customPointsInput.classList.add('hidden');
    taskInput.setAttribute('maxlength', DEFAULT_TASK_MAXLENGTH);
    saveToLocalStorage();
    renderTasks(newTask.id);
    showMessageBox('وظیفه جدید با موفقیت اضافه شد!', 'success');
});

toggleCompletedTasksBtn.addEventListener('click', () => {
    completedTasksSection.classList.toggle('hidden');
    toggleIcon.classList.toggle('rotate-180');
    renderPaginationControls(completedTasksPagination, tasks.filter(task => task.completed).length, completedCurrentPage, 'completed');
});

function handleTaskClick(e) {
    const taskItemElement = e.target.closest('.task-item');
    if (!taskItemElement) return;

    const taskId = taskItemElement.dataset.id;
    const target = e.target;
    const task = tasks.find(t => t.id === taskId);

    if (isReorderingMode) {
        if (taskId === reorderingTaskId) {
            const action = target.closest('button')?.dataset.action;
            if (action === 'move-up') {
                moveTask(taskId, 'up');
            }
            else if (action === 'move-down') {
                moveTask(taskId, 'down');
            }
        }
        e.preventDefault();
        return;
    }

    // Prevent clicks on completed notes unless it's the menu button
    if (task && task.importance === 'note' && task.completed && !target.closest('.three-dot-menu-btn')) {
        e.preventDefault();
        return;
    }

    const isCheckbox = (target.tagName === 'INPUT' && target.type === 'checkbox');
    const isMenuButton = target.closest('.three-dot-menu-btn');
    const action = target.closest('button')?.dataset.action;

    if (isCheckbox) {
        toggleTaskCompletion(taskId, taskItemElement);
    } else if (isMenuButton) {
        if (task) {
            showTaskActionsMenu(taskId, isMenuButton, task.completed);
        }
    } else if (action === 'pin-task' || action === 'unpin-task') {
        pinTask(taskId);
    } else {
        // Only allow click to complete for non-note tasks
        if (task && task.importance !== 'note') {
            toggleTaskCompletion(taskId, taskItemElement);
        }
    }
}

activeTaskList.addEventListener('click', handleTaskClick);
completedTasksContainer.addEventListener('click', handleTaskClick);


function toggleTaskCompletion(taskId, taskItemElement) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
        const task = tasks[taskIndex];

        // یادداشت‌ها از طریق چک‌باکس تکمیل نمی‌شوند، فقط از طریق منو خط می‌خورند.
        if (task.importance === 'note') {
            return;
        }

        let pointsGained = 0;
        let focusAfterRender = null;

        if (!task.completed) {
            // تکمیل یک وظیفه
            // ابتدا وظیفه را از موقعیت فعلی‌اش در آرایه حذف کنید.
            tasks.splice(taskIndex, 1);

            task.completed = true; // وظیفه را تکمیل شده علامت بزنید.
            task.isPinned = false; // وقتی تکمیل می‌شود، پین آن را بردارید.
            task.pinnedAt = null; // تاریخ پین شدن را پاک کنید.

            // محاسبه پوینت‌های کسب شده
            if (task.importance === 'important') {
                pointsGained = pointsPerImportantTask;
            } else if (task.importance === 'normal') {
                pointsGained = pointsPerNormalTask;
            } else if (task.importance === 'custom' && task.customPoints) {
                pointsGained = task.customPoints;
                totalCustomTasksCompleted++;
            }
            zPoint += pointsGained; // پوینت‌ها را اضافه کنید.
            showMessageBox('وظیفه تکمیل شد!', 'success'); // پیام موفقیت نمایش دهید.
            showPointsGainFeedback(pointsGained, taskItemElement); // بازخورد بصری پوینت‌ها را نمایش دهید.

            // بازسازی آرایه tasks برای قرار دادن وظیفه تازه تکمیل شده
            // در ابتدای بخش وظایف تکمیل شده.
            const activeTasks = tasks.filter(t => !t.completed); // وظایف فعال فعلی
            const otherCompletedTasks = tasks.filter(t => t.completed); // وظایف از قبل تکمیل شده
            // آرایه tasks را به این صورت بازسازی کنید: وظایف فعال، سپس وظیفه تازه تکمیل شده، سپس بقیه وظایف تکمیل شده.
            tasks = [...activeTasks, task, ...otherCompletedTasks];

            focusAfterRender = task.id; // برای فوکوس پس از رندر، ID وظیفه را نگه دارید.

        } else {
            // بازگرداندن (لغو تکمیل) یک وظیفه
            // پوینت‌های کسر شده را محاسبه کنید.
            let pointsDeducted = 0;
            if (task.importance === 'important') {
                pointsDeducted = pointsPerImportantTask;
            } else if (task.importance === 'normal') {
                pointsDeducted = pointsPerNormalTask;
            } else if (task.importance === 'custom' && task.customPoints) {
                pointsDeducted = task.customPoints;
                totalCustomTasksCompleted--;
            }
            zPoint -= pointsDeducted; // پوینت‌ها را کسر کنید.
            if (zPoint < 0) zPoint = 0; // اطمینان حاصل کنید که پوینت‌ها منفی نمی‌شوند.

            // شیء وظیفه موجود را اصلاح کنید (به جای ایجاد یک شیء جدید)
            task.completed = false; // وظیفه را به حالت فعال برگردانید.
            task.isPinned = false; // اطمینان حاصل کنید که وقتی بازگردانی می‌شود پین نیست.
            task.pinnedAt = null;

            // وظیفه را از موقعیت فعلی‌اش (بخش تکمیل شده) حذف کنید.
            tasks.splice(taskIndex, 1);
            // آن را دوباره به انتهای آرایه tasks اضافه کنید (به عنوان یک وظیفه فعال).
            // تابع renderTasks مسئول مرتب‌سازی آن در لیست فعال خواهد بود.
            tasks.push(task);
            focusAfterRender = task.id; // برای فوکوس پس از رندر، ID وظیفه اصلی را نگه دارید.

            showMessageBox(`وظیفه بازنشانی شد!`, 'success'); // پیام بازنشانی نمایش دهید.
        }
        saveToLocalStorage(); // داده‌ها را در Local Storage ذخیره کنید.
        renderTasks(focusAfterRender); // رابط کاربری را دوباره رندر کنید.
    }
}


function pinTask(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
        const task = tasks[taskIndex];
        task.isPinned = !task.isPinned;

        if (task.isPinned) {
            task.pinnedAt = new Date().toISOString();
            if (!hasPinnedTaskEver) {
                hasPinnedTaskEver = true;
            }
        } else {
            task.pinnedAt = null;
        }

        saveToLocalStorage();
        renderTasks(taskId);
        showMessageBox(`وظیفه "${truncateText(task.name, 15)}" ${task.isPinned ? 'پین شد!' : 'از پین خارج شد.'}`, 'info');
    }
}


function showTaskActionsMenu(taskId, buttonElement, isCompletedTask) {
    document.querySelectorAll('.task-action-menu').forEach(menu => menu.remove());

    if (isReorderingMode) {
        return;
    }

    const menu = document.createElement('div');
    menu.className = 'task-action-menu';
    menu.style.position = 'absolute';
    menu.style.zIndex = '100';
    menu.style.visibility = 'hidden'; // Hide initially to calculate position

    document.body.appendChild(menu);

    const task = tasks.find(t => t.id === taskId);
    let menuHtml = ``;

    if (task.importance === 'note') {
        if (isCompletedTask) {
            // Menu for completed notes
            menuHtml = `
                <button data-action="restore-note">
                    <i class="fa-solid fa-undo ml-2"></i>
                    برگرداندن یادداشت
                </button>
            `;
        } else {
            // Menu for active notes
            menuHtml = `
                <button data-action="edit-task">
                    <i class="fa-solid fa-pen ml-2"></i>
                    ویرایش
                </button>
				<button data-action="${task.isPinned ? 'unpin-task' : 'pin-task'}">
                    <i class="fa-solid fa-thumbtack ml-2 ${task.isPinned ? 'fa-rotate-90' : ''}"></i>
                    ${task.isPinned ? 'برداشتن پین' : 'پین کردن'}
                </button>
                <button data-action="strike-through-note">
                    <i class="fa-solid fa-strikethrough ml-2"></i>
                    خط زدن
                </button>
                <button data-action="activate-reorder" data-task-id="${taskId}">
                    <i class="fa-solid fa-arrows-up-down ml-2"></i>
                    تغییر چیدمان
                </button>
                <button data-action="delete-task">
                    <i class="fa-solid fa-trash-can ml-2"></i>
                    حذف
                </button>
            `;
        }
    } else {
        if (isCompletedTask) {
            // Menu for completed non-note tasks
            menuHtml = `
                <button data-action="copy-task">
                    <i class="fa-solid fa-copy ml-2"></i>
                    کپی
                </button>
            `;
        } else {
            // Menu for active non-note tasks
            menuHtml = `
                <button data-action="edit-task">
                    <i class="fa-solid fa-pen ml-2"></i>
                    ویرایش
                </button>
                <button data-action="activate-reorder" data-task-id="${taskId}">
                    <i class="fa-solid fa-arrows-up-down ml-2"></i>
                    تغییر چیدمان
                </button>
                <button data-action="${task.isPinned ? 'unpin-task' : 'pin-task'}">
                    <i class="fa-solid fa-thumbtack ml-2 ${task.isPinned ? 'fa-rotate-90' : ''}"></i>
                    ${task.isPinned ? 'برداشتن پین' : 'پین کردن'}
                </button>
                <button data-action="delete-task">
                    <i class="fa-solid fa-trash-can ml-2"></i>
                    حذف
                </button>
            `;
        }
    }
    menu.innerHTML = menuHtml;

    const rect = buttonElement.getBoundingClientRect();
    const padding = 5;

    let menuTop = rect.bottom + window.scrollY + 5;
    let menuLeft = rect.left + window.scrollX;

    // Adjust if menu goes off screen to the right
    if (menuLeft + menu.offsetWidth > window.innerWidth - padding) {
        menuLeft = window.innerWidth - menu.offsetWidth - padding;
    }
    // Adjust if menu goes off screen to the left
    if (menuLeft < padding) {
        menuLeft = padding;
    }

    // Adjust if menu goes off screen to the bottom
    if (menuTop + menu.offsetHeight > window.innerHeight + window.scrollY - padding) {
        menuTop = rect.top + window.scrollY - menu.offsetHeight - 5;
        // If it still goes off screen to the top, position at top-left of viewport
        if (menuTop < padding + window.scrollY) {
            menuTop = padding + window.scrollY;
        }
    }

    menu.style.top = `${menuTop}px`;
    menu.style.left = `${menuLeft}px`;
    menu.style.visibility = 'visible'; // Show after position calculation

    menu.addEventListener('click', (e) => {
        const action = e.target.closest('button')?.dataset.action;
        if (action) {
            menu.remove();
            document.removeEventListener('click', closeMenu); // Remove global listener
            if (action === 'edit-task') {
                showEditTaskModal(taskId);
            }
            else if (action === 'activate-reorder') {
                activateReorderMode(taskId);
            } else if (action === 'delete-task') {
                deleteTask(taskId);
            } else if (action === 'copy-task') {
                copyTask(taskId);
            } else if (action === 'pin-task' || action === 'unpin-task') {
                pinTask(taskId);
            } else if (action === 'strike-through-note') {
                strikeThroughNote(taskId);
            } else if (action === 'restore-note') {
                restoreNote(taskId);
            }
        }
    });

    // Close menu when clicking outside
    const closeMenu = (e) => {
        const isInteractiveElement = e.target.closest('input, select, button, [type="checkbox"]');

        // If click is outside menu and not on the button that opened it, and not on another interactive element
        if (!menu.contains(e.target) && !buttonElement.contains(e.target) && !isInteractiveElement) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        } else if (isInteractiveElement && !menu.contains(e.target)) {
            // If click is on an interactive element but not inside the menu itself, close the menu.
            // This prevents the menu from staying open if you click a checkbox next to it.
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    };
    // Add a small delay before adding the global click listener to prevent immediate closing
    // if the menu button itself triggers a click event after the menu is rendered.
    setTimeout(() => {
        document.addEventListener('click', closeMenu);
    }, 50);
}

function activateReorderMode(taskId) {
    isReorderingMode = true;
    reorderingTaskId = taskId;
    document.querySelectorAll('.task-action-menu').forEach(menu => menu.remove()); // Close any open menus
    renderTasks(taskId); // Re-render to show reorder buttons and highlight the selected task
}

function deactivateReorderMode() {
    isReorderingMode = false;
    reorderingTaskId = null;
    renderTasks(); // Re-render to go back to normal view
    showMessageBox('چیدمان وظیفه با موفقیت تغییر کرد!', 'success');
}

finishReorderBtn.addEventListener('click', deactivateReorderMode);

function moveTask(taskId, direction) {
    const activeTasks = tasks.filter(task => !task.completed);
    const taskIndexInActive = activeTasks.findIndex(task => task.id === taskId);

    if (taskIndexInActive === -1) {
        showMessageBox('خطا: وظیفه برای جابجایی یافت نشد.', 'error');
        return;
    }

    const newIndex = direction === 'up' ? taskIndexInActive - 1 : taskIndexInActive + 1;

    if (newIndex < 0 || newIndex >= activeTasks.length) {
        showMessageBox('نمی‌توان وظیفه را بیشتر جابجا کرد.', 'info');
        return;
    }

    const [movedTask] = activeTasks.splice(taskIndexInActive, 1);
    activeTasks.splice(newIndex, 0, movedTask);

    // If a pinned task is manually reordered, it should be unpinned.
    if (movedTask.isPinned) {
        movedTask.isPinned = false;
        movedTask.pinnedAt = null;
        showMessageBox('وظیفه به دلیل تغییر چیدمان دستی از پین خارج شد.', 'info');
    }

    // Reconstruct the main tasks array, keeping completed tasks at the end
    const completedTasks = tasks.filter(task => task.completed);
    tasks = [...activeTasks, ...completedTasks];

    // Calculate the new page for the moved task to ensure focus
    const updatedActiveTasks = tasks.filter(task => !task.completed);
    const newIndexInActiveList = updatedActiveTasks.findIndex(task => task.id === taskId);

    const newPage = Math.ceil((newIndexInActiveList + 1) / TASKS_PER_PAGE);
    if (newPage !== activeCurrentPage) {
        activeCurrentPage = newPage;
    }

    saveToLocalStorage();
    renderTasks(taskId); // Re-render and focus on the moved task
}

function strikeThroughNote(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
        const task = tasks[taskIndex];
        if (task.importance === 'note' && !task.completed) {
            task.completed = true;
            task.isPinned = false; // Notes are unpinned when struck through
            task.pinnedAt = null;
            // Remove from current position
            tasks.splice(taskIndex, 1);
            // Insert at the beginning of the completed tasks section
            const active = tasks.filter(t => !t.completed);
            const completed = tasks.filter(t => t.completed);
            tasks = [...active, task, ...completed]; // Insert 'task' at the beginning of completed section
			
            saveToLocalStorage();
            renderTasks(taskId); // Re-render and focus on the task in its new location
            showMessageBox(`یادداشت "${truncateText(task.name, 15)}" خط خورد.`, 'success');
        }
    }
}

function restoreNote(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
        const task = tasks[taskIndex];
        if (task.importance === 'note' && task.completed) {
            task.completed = false;
            task.isPinned = false; // Ensure it's not pinned when restored
            task.pinnedAt = null;
            // Remove the note from its current position (completed section)
            const restoredNote = tasks.splice(taskIndex, 1)[0];
            // Add it to the end of the active tasks (which means end of the overall tasks array)
            tasks.push(restoredNote);
            saveToLocalStorage();
            renderTasks(taskId); // Re-render and focus on the task in its new location
            showMessageBox(`یادداشت "${truncateText(task.name, 15)}" بازگردانی شد.`, 'info');
        }
    }
}


function showEditTaskModal(taskId) {
    currentTaskBeingEditedId = taskId;
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        showMessageBox('خطا: وظیفه برای ویرایش یافت نشد.', 'error');
        return;
    }

    editTaskNameInput.value = task.name;
    editTaskImportanceSelect.value = task.importance;

    editTaskNameInput.setAttribute('maxlength', task.importance === 'note' ? NOTE_TASK_MAXLENGTH : DEFAULT_TASK_MAXLENGTH);

    if (task.importance === 'custom') {
        editTaskCustomPointsInput.classList.remove('hidden');
        editTaskCustomPointsInput.value = task.customPoints || '';
        editTaskCustomPointsInput.focus();
    } else {
        editTaskCustomPointsInput.classList.add('hidden');
        editTaskCustomPointsInput.value = '';
    }

    editTaskImportanceSelect.onchange = null; // Remove previous listener to prevent duplicates
    editTaskImportanceSelect.addEventListener('change', handleEditTaskImportanceChange);

    editTaskModal.classList.remove('hidden');
    // Force reflow to ensure transitions play correctly
    void editTaskModal.offsetWidth;
    editTaskModal.classList.add('show');
    editTaskNameInput.focus();
}

importanceSelect.addEventListener('change', () => {
    const selectedImportance = importanceSelect.value;
    if (selectedImportance === 'custom') {
        customPointsInput.classList.remove('hidden');
        customPointsInput.focus();
        taskInput.setAttribute('maxlength', DEFAULT_TASK_MAXLENGTH);
    } else if (selectedImportance === 'note') {
        customPointsInput.classList.add('hidden');
        customPointsInput.value = '';
        taskInput.setAttribute('maxlength', NOTE_TASK_MAXLENGTH);
    } else {
        customPointsInput.classList.add('hidden');
        customPointsInput.value = '';
        taskInput.setAttribute('maxlength', DEFAULT_TASK_MAXLENGTH);
    }
});

function handleEditTaskImportanceChange() {
    const selectedImportance = editTaskImportanceSelect.value;
    if (selectedImportance === 'custom') {
        editTaskCustomPointsInput.classList.remove('hidden');
        editTaskCustomPointsInput.focus();
        editTaskNameInput.setAttribute('maxlength', DEFAULT_TASK_MAXLENGTH);
    } else if (selectedImportance === 'note') {
        editTaskCustomPointsInput.classList.add('hidden');
        editTaskCustomPointsInput.value = '';
        editTaskNameInput.setAttribute('maxlength', NOTE_TASK_MAXLENGTH);
    } else {
        editTaskCustomPointsInput.classList.add('hidden');
        editTaskCustomPointsInput.value = '';
        editTaskNameInput.setAttribute('maxlength', DEFAULT_TASK_MAXLENGTH);
    }
}

function saveEditedTask() {
    const taskId = currentTaskBeingEditedId;
    const newTaskName = editTaskNameInput.value.trim();
    const newImportance = editTaskImportanceSelect.value;
    let newCustomPoints = undefined;

    if (newTaskName.length === 0) {
        showMessageBox('نام وظیفه نمی‌تواند خالی باشد.', 'info');
        return;
    }

    const currentMaxLength = newImportance === 'note' ? NOTE_TASK_MAXLENGTH : DEFAULT_TASK_MAXLENGTH;
    if (newTaskName.length > currentMaxLength) {
        showMessageBox(`مقدار ورودی نباید بیش از ${currentMaxLength} کاراکتر باشد.`, 'error');
        return;
    }

    if (newImportance === 'custom') {
        const convertedPoints = convertPersianNumbersToEnglish(editTaskCustomPointsInput.value);
        newCustomPoints = parseInt(convertedPoints, 10);
        if (isNaN(newCustomPoints) || newCustomPoints <= 0 || newCustomPoints > MAX_CUSTOM_POINTS) {
            showMessageBox(`لطفاً یک مقدار پوینت سفارشی معتبر (حداکثر ${MAX_CUSTOM_POINTS}) وارد کنید.`, 'info');
            return;
        }
    }

    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
        tasks[taskIndex].name = newTaskName;
        tasks[taskIndex].importance = newImportance;
        tasks[taskIndex].customPoints = newCustomPoints;
        // If a task changes to/from note type, reset its completion status if it makes sense
        if (tasks[taskIndex].importance === 'note' && tasks[taskIndex].completed && newImportance !== 'note') {
            tasks[taskIndex].completed = false; // If it was a completed note and now it's not a note, uncomplete it.
        } else if (tasks[taskIndex].importance !== 'note' && newImportance === 'note') {
            tasks[taskIndex].completed = false; // If it was a completed non-note and now it's a note, uncomplete it.
        }

        saveToLocalStorage();
        renderTasks(taskId);
        showMessageBox('وظیفه با موفقیت ویرایش شد!', 'success');
        editTaskModal.classList.remove('show');
        setTimeout(() => {
            editTaskModal.classList.add('hidden');
        }, 50);
    } else {
        showMessageBox('خطا: وظیفه برای ویرایش یافت نشد.', 'error');
    }
}

saveEditedTaskBtn.addEventListener('click', saveEditedTask);


cancelEditTaskBtn.addEventListener('click', () => {
    editTaskModal.classList.remove('show');
    setTimeout(() => {
        editTaskModal.classList.add('hidden');
    }, 50);
    showMessageBox('ویرایش وظیفه لغو شد.', 'info');
});

function deleteTask(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
        const taskItemElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
        const taskToDelete = tasks[taskIndex];
        taskToDelete.isPinned = false; // Unpin deleted task
        taskToDelete.pinnedAt = null;

        const deletedTaskCopy = { ...taskToDelete, originalIndex: taskIndex }; // Store original index for undo

        tasks.splice(taskIndex, 1); // Remove task from array
        saveToLocalStorage();

        // Animate removal if element exists, then show undo message
        if (taskItemElement) {
            taskItemElement.style.transform = `translateX(-100vw)`;
            taskItemElement.style.opacity = '0';
            taskItemElement.addEventListener('transitionend', () => {
                renderTasks(); // Re-render after animation
                showMessageBox(`وظیفه "${truncateText(deletedTaskCopy.name, 15)}" حذف شد. برای بازگردانی ضربه بزنید.`, 'info', {
                    position: 'bottom-center',
                    isUndo: true,
                    duration: 7000, // Changed to 7 seconds
                    taskData: deletedTaskCopy
                });
            }, { once: true });
        } else {
            // If element not in DOM (e.g., on another page), just re-render and show message
            renderTasks();
            showMessageBox(`وظیفه "${truncateText(deletedTaskCopy.name, 15)}" حذف شد. برای بازگردانی ضربه بزنید.`, 'info', {
                position: 'bottom-center',
                isUndo: true,
                duration: 7000, // Changed to 7 seconds
                taskData: deletedTaskCopy
                });
        }
    } else {
        showMessageBox('خطا: وظیفه برای حذف یافت نشد.', 'error');
    }
}

function copyTask(taskId) {
    const originalTask = tasks.find(t => t.id === taskId);
    if (originalTask) {
        const newTask = {
            id: Date.now().toString() + Math.random().toString().substring(2, 8), // New unique ID
            name: originalTask.name,
            completed: false, // Copied task is always active
            importance: originalTask.importance,
            customPoints: originalTask.customPoints,
            isPinned: false, // Copied task is not pinned
            pinnedAt: null
        };
        tasks.push(newTask); // Add to the end of the tasks array
        saveToLocalStorage();
        renderTasks(newTask.id); // Re-render and focus on the new task
        showMessageBox(`وظیفه "${truncateText(newTask.name, 15)}" به وظایف فعال کپی شد!`, 'success');
    } else {
        showMessageBox('خطا: وظیفه اصلی برای کپی یافت نشد.', 'error');
    }
}

function undoLastDeletion(taskToRestore) {
    if (taskToRestore) {
        // Determine insertion index: try original index, otherwise append to end
        let insertIndex = tasks.length;
        if (taskToRestore.originalIndex !== undefined && taskToRestore.originalIndex <= tasks.length) {
            insertIndex = taskToRestore.originalIndex;
        }

        // Prevent re-adding if task somehow already exists (e.g., race condition)
        if (!tasks.some(t => t.id === taskToRestore.id)) {
            tasks.splice(insertIndex, 0, taskToRestore); // Insert at calculated index
            saveToLocalStorage();
            renderTasks(taskToRestore.id); // Re-render and focus on the restored task
            showMessageBox(`وظیفه "${truncateText(taskToRestore.name, 15)}" بازگردانی شد.`, 'info');
        } else {
            console.warn(`Task with ID ${taskToRestore.id} already exists, not re-adding.`);
        }
    }
}


function applyTheme(theme) {
    const htmlElement = document.documentElement;
    if (theme === 'dark') {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }
    applyLevelTheme(level); // Reapply theme-dependent colors
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Check system preference if no theme saved
        applyTheme('dark');
    } else {
        applyTheme('light');
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const newSystemTheme = e.matches ? 'dark' : 'light';
        applyTheme(newSystemTheme);
    });
}

menuBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent click from propagating to window and closing dropdowns

    // Close points dropdown if open
    if (!pointsDropdownContent.classList.contains('hidden')) {
        pointsDropdownContent.classList.remove('opacity-100', 'scale-y-100', 'is-open');
        pointsDropdownContent.classList.add('opacity-0', 'scale-y-95');
        dropdownIndicator.classList.remove('rotate-180');
        pointsDropdownToggle.classList.remove('is-open');
        pointsDropdownContent.addEventListener('transitionend', () => {
            pointsDropdownContent.classList.add('hidden');
        }, { once: true });
    }

    menuDropdown.classList.toggle('hidden'); // Toggle visibility of menu dropdown
});

window.addEventListener('click', (e) => {
    const isClickInsideMenu = menuBtn.contains(e.target) || menuDropdown.contains(e.target);
    const isInteractiveElement = e.target.closest('input, select, button, [type="checkbox"]');

    if (!isClickInsideMenu && !isInteractiveElement) {
        menuDropdown.classList.add('hidden');
    } else if (isInteractiveElement && !isClickInsideMenu) {
        // If an interactive element is clicked outside the menu, close the menu
        menuDropdown.classList.add('hidden');
    }
});

pointsDropdownToggle.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent click from propagating to window and closing other dropdowns

    // Close main menu dropdown if open
    if (!menuDropdown.classList.contains('hidden')) {
        menuDropdown.classList.add('hidden');
    }

    const isHidden = pointsDropdownContent.classList.contains('hidden');

    if (isHidden) {
        pointsDropdownContent.classList.remove('hidden');
        void pointsDropdownContent.offsetHeight; // Trigger reflow for transition
        pointsDropdownContent.classList.add('opacity-100', 'scale-y-100', 'is-open');
        dropdownIndicator.classList.add('rotate-180');
        pointsDropdownToggle.classList.add('is-open');
    } else {
        pointsDropdownContent.classList.remove('opacity-100', 'scale-y-100', 'is-open');
        pointsDropdownContent.classList.add('opacity-0', 'scale-y-95');
        dropdownIndicator.classList.remove('rotate-180');
        pointsDropdownToggle.classList.remove('is-open');
        pointsDropdownContent.addEventListener('transitionend', () => {
            pointsDropdownContent.classList.add('hidden');
        }, { once: true });
    }
});

window.addEventListener('click', (e) => {
    // Close points dropdown if click is outside both the toggle and the content
    if (!pointsDropdownToggle.contains(e.target) && !pointsDropdownContent.contains(e.target)) {
        if (!pointsDropdownContent.classList.contains('hidden')) {
            pointsDropdownContent.classList.remove('opacity-100', 'scale-y-100', 'is-open');
            pointsDropdownContent.classList.add('opacity-0', 'scale-y-95');
            dropdownIndicator.classList.remove('rotate-180');
            pointsDropdownToggle.classList.remove('is-open');
            pointsDropdownContent.addEventListener('transitionend', () => {
                pointsDropdownContent.classList.add('hidden');
            }, { once: true });
        }
    }
});


profileMenuItem.addEventListener('click', (e) => {
    e.preventDefault();
    menuDropdown.classList.add('hidden');

    profileModal.classList.remove('hidden');
    void profileModalContent.offsetWidth; // Trigger reflow
    profileModalContent.classList.remove('opacity-0', 'scale-95');
    profileModalContent.classList.add('opacity-100', 'scale-100');

    const totalTasks = tasks.length;
    const completedTasksCount = tasks.filter(task => task.completed && task.importance !== 'note').length;
    const completedNotesCount = tasks.filter(task => task.completed && task.importance === 'note').length;
    const activeNotesCount = tasks.filter(task => !task.completed && task.importance === 'note').length;


    let daysSinceCreation = 'نامشخص';
    if (userCreationDate) {
        const creationDate = new Date(userCreationDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - creationDate.getTime());
        daysSinceCreation = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const achievedAchievementsCount = achievementsData.filter(achievement => {
        let isAchieved = false;
        const currentTotalTasksCompleted = tasks.filter(task => task.completed && task.importance !== 'note').length;

        if (achievement.type === 'level') {
            const levelInfo = levelPointsThresholds.find(l => l.name === achievement.name);
            if (levelInfo && zPoint >= levelInfo.points) {
                isAchieved = true;
            }
        } else if (achievement.type === 'totalTasks') {
            if (currentTotalTasksCompleted >= achievement.value) {
                isAchieved = true;
            }
        } else if (achievement.type === 'points') {
            if (zPoint >= achievement.value) {
                isAchieved = true;
            }
        } else if (achievement.type === 'firstPin') {
            if (hasPinnedTaskEver) {
                isAchieved = true;
            }
        }
        return isAchieved;
    }).length;

    const totalAchievements = achievementsData.length;

    let formattedCreationDate = formatPersianDate(userCreationDate);


    const profileItems = [
        { label: 'نام کاربری', value: userName || 'ناشناس', color: 'blue', icon: 'fa-user' },
        { label: 'کل وظایف', value: totalTasks, color: 'green', icon: 'fa-list-check' },
        { label: 'وظایف تکمیل شده', value: completedTasksCount, color: 'teal', icon: 'fa-check-double' },
        { label: 'تعداد پوینت', value: zPoint, color: 'yellow', icon: 'fa-coins' },
        { label: 'سطح', value: level, color: 'orange', icon: levelPointsThresholds[level - 1].icon.replace('fa-solid ', '') },
        { label: 'عمر کاربری', value: `${daysSinceCreation} روز`, color: 'sky', icon: 'fa-calendar-days' },
        { label: 'تعداد دستاوردها', value: `${achievedAchievementsCount}/${totalAchievements}`, color: 'indigo', icon: 'fa-trophy' },
        { label: 'یادداشت‌های فعال', value: activeNotesCount, color: 'orange', icon: 'fa-note-sticky' },
        { label: 'یادداشت‌های خط خورده', value: completedNotesCount, color: 'gray', icon: 'fa-check' }
    ];

    let profileItemsHtml = profileItems.map((item, index) => {
        const isLastItem = index === profileItems.length - 1;
        const isOddCount = profileItems.length % 2 !== 0;
        const colSpanClass = isLastItem && isOddCount ? 'sm:col-span-2' : '';

        return `
            <div class="p-3 rounded-lg bg-${item.color}-50 dark:bg-${item.color}-900 text-${item.color}-800 dark:text-${item.color}-200 flex items-center justify-between ${colSpanClass}">
                <span class="font-semibold">${item.label}:</span>
                <span>${item.value}</span>
            </div>
        `;
    }).join('');

    profileItemsHtml += `
        <div class="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 flex items-center justify-between col-span-full">
            <span class="font-semibold">تاریخ شروع:</span>
            <span>${formattedCreationDate}</span>
        </div>
    `;


    profileModalBody.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            ${profileItemsHtml}
        </div>
    `;
});

closeProfileModalBtn.addEventListener('click', () => {
    profileModalContent.classList.remove('opacity-100', 'scale-100');
    profileModalContent.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        profileModal.classList.add('hidden');
    }, 50);
});

achievementsMenuItem.addEventListener('click', (e) => {
    e.preventDefault();
    menuDropdown.classList.add('hidden');

    updateGamificationDisplay();
    showAchievementsModal();
});

function showAchievementsModal() {
    achievementsModal.classList.remove('hidden');
    void achievementsModalContent.offsetWidth;
    achievementsModalContent.classList.remove('opacity-0', 'scale-95');
    achievementsModalContent.classList.add('opacity-100', 'scale-100');

    renderAchievementsIntoModal();
}

closeAchievementsModalBtn.addEventListener('click', () => {
    achievementsModalContent.classList.remove('opacity-100', 'scale-100');
    achievementsModalContent.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        achievementsModal.classList.add('hidden');
    }, 50);
});

function showAchievementNotificationModal(iconClass, title, message) {
    showMessageBox(title, 'success', { type: 'achievement', iconClass: iconClass, description: message });
}

closeAchievementNotificationModalBtn.addEventListener('click', () => {
    achievementNotificationModalContent.classList.remove('opacity-100', 'scale-100');
    achievementNotificationModalContent.classList.add('opacity-0', 'scale-95');

    setTimeout(() => {
        achievementNotificationModal.classList.add('hidden');
        isAchievementNotificationDisplaying = false;
        setTimeout(() => {
            processAchievementNotificationQueue();
        }, 600); // Small delay to allow transition to finish before processing next
    }, 350);
});


helpMenuItem.addEventListener('click', (e) => {
    e.preventDefault();
    menuDropdown.classList.add('hidden');

    helpModal.classList.remove('hidden');
    void helpModalContent.offsetWidth; // Trigger reflow
    helpModalContent.classList.remove('opacity-0', 'scale-95');
    helpModalContent.classList.add('opacity-100', 'scale-100');

    helpModalBody.innerHTML = `
        <h3 class="text-xl sm:text-2xl font-bold mb-2 help-heading-blue">به زای تسک خوش آمدید!</h3>
        <p class="semi-formal-text">زای تسک یک پلتفرم مدیریت وظایف گیمیفای شده است که با هدف افزایش انگیزه و بهره‌وری شما طراحی شده است. با انجام وظایف، پوینت کسب می‌کنید، سطح خود را ارتقا می‌دهید و دستاوردهای ویژه‌ای را باز می‌کنید.</p>

        <h3 class="text-xl sm:text-2xl font-bold mb-2 mt-4 help-heading-blue">نحوه استفاده از برنامه</h3>
        <p class="semi-formal-text">
            <strong class="text-gray-600 dark:text-gray-300">۱. افزودن وظیفه جدید:</strong>
            برای اضافه کردن یک وظیفه، نام آن را در فیلد "نام وظیفه" وارد کنید. سپس، می‌توانید اهمیت آن را از طریق منوی کشویی "اهمیت" انتخاب کنید:
            <ul class="list-disc list-inside mt-2 mb-2 text-justify">
                <li class="semi-formal-text"><strong class="text-red-600 dark:text-red-300">مهم:</strong> وظایف با اولویت بالا که پوینت بیشتری به شما می‌دهند.</li>
                <li class="semi-formal-text"><strong class="text-gray-600 dark:text-gray-300">عادی:</strong> وظایف روزمره با پوینت استاندارد.</li>
                <li class="semi-formal-text"><strong class="text-blue-600 dark:text-blue-300">سفارشی:</strong> می‌توانید میزان پوینت دریافتی برای این وظیفه را (تا حداکثر ${MAX_CUSTOM_POINTS} پوینت) به صورت دستی وارد کنید.</li> <li class="semi-formal-text"><strong class="text-orange-600 dark:text-orange-300">یادداشت:</strong> این نوع وظایف برای ثبت نکات، ایده‌ها یا اطلاعاتی هستند که نیازی به تکمیل شدن ندارند و پوینت گیمیفیکیشن نمی‌دهند. یادداشت‌ها پس از خط خوردن به بخش وظایف تکمیل شده منتقل می‌شوند و قابل کلیک نیستند. حداکثر طول متن برای یادداشت‌ها ۱۵۰ کاراکتر است.</li>
            </ul>
        </p>
        <p class="semi-formal-text">پس از وارد کردن اطلاعات، روی دکمه "افزودن وظیفه" کلیک کنید.</p>
        <p class="semi-formal-text">
            <strong class="text-gray-600 dark:text-gray-300">۲. تکمیل وظیفه:</strong>
            برای علامت زدن یک وظیفه به عنوان "تکمیل شده" (به جز یادداشت‌ها)، کافیست روی چک‌باکس کنار آن کلیک کنید. با این کار، وظیفه به بخش "وظایف تکمیل شده" منتقل می‌شود و پوینت‌های مربوطه به حساب شما اضافه می‌گردد.
        </p>
        <p class="semi-formal-text">
            <strong class="text-gray-600 dark:text-gray-300">۳. ویرایش وظیفه:</strong>
            برای تغییر نام یا اهمیت یک وظیفه فعال، روی آیکون سه نقطه (<i class="fa-solid fa-ellipsis-v"></i>) در کنار آن کلیک کرده و گزینه "ویرایش" را انتخاب کنید.
        </p>
        <p class="semi-formal-text">
            <strong class="text-gray-600 dark:text-gray-300">۴. حذف وظیفه:</strong>
            برای حذف یک وظیفه (فعال یا تکمیل شده)، روی آیکون سه نقطه (<i class="fa-solid fa-ellipsis-v"></i>) کنار آن کلیک کرده و گزینه "حذف" را انتخاب کنید. پس از حذف، یک پیام "بازگردانی" برای مدت کوتاهی ظاهر می‌شود تا در صورت اشتباه، بتوانید وظیفه را برگردانید.
        </p>
        <p class="semi-formal-text">
            <strong class="text-gray-600 dark:text-gray-300">۵. تغییر چیدمان وظایف:</strong>
            برای تغییر دستی ترتیب وظایف فعال، روی آیکون سه نقطه (<i class="fa-solid fa-arrows-up-down"></i>) کنار وظیفه مورد نظر کلیک کرده و "تغییر چیدمان" را انتخاب کنید. سپس با استفاده از فلش‌های بالا و پایین، موقعیت وظیفه را جابجا کنید. پس از اتمام، دکمه "پایان" را فشار دهید.
        </p>
        <p class="semi-formal-text">
            <strong class="text-gray-600 dark:text-gray-300">۶. پین کردن وظیفه:</strong>
            می‌توانید وظایف مهم را به بالای لیست وظایف فعال "پین" کنید. برای این کار، روی آیکون سه نقطه (<i class="fa-solid fa-thumbtack"></i>) کنار وظیفه کلیک کرده و "پین کردن" را انتخاب کنید. وظایف پین شده همیشه در ابتدای لیست نمایش داده می‌شوند.
        </p>
        <p class="semi-formal-text">
            <strong class="text-gray-600 dark:text-gray-300">۷. مشاهده وظایف تکمیل شده:</strong>
            برای نمایش یا پنهان کردن لیست وظایف تکمیل شده، روی دکمه "وظایف تکمیل شده" در پایین صفحه کلیک کنید.
        </p>
        <p class="semi-formal-text">
            <strong class="text-gray-600 dark:text-gray-300">۸. مدیریت دسته‌های پیش‌فرض:</strong>
            از طریق منوی اصلی (آیکون سه نقطه در بالا سمت چپ) و انتخاب "دسته‌ها"، می‌توانید دسته‌های وظایف خود را مدیریت کنید.
            <ul class="list-disc list-inside mt-2 mb-2 text-justify">
                <li class="semi-formal-text"><strong class="text-blue-600 dark:text-blue-300">افزودن دسته:</strong> می‌توانید دسته‌های جدیدی با نام دلخواه (حداکثر ${CATEGORY_NAME_MAXLENGTH} کاراکتر) ایجاد کنید. حداکثر تعداد دسته‌ها ${MAX_CATEGORIES} عدد است.</li>
                <li class="semi-formal-text"><strong class="text-yellow-600 dark:text-yellow-300">ویرایش دسته:</strong> برای ویرایش نام دسته یا افزودن/حذف وظایف از آن، روی آیکون سه نقطه کنار دسته کلیک کرده و "ویرایش" را انتخاب کنید. توجه داشته باشید که وظایف داخل دسته‌ها نمی‌توانند از نوع "سفارشی" باشند و نام آن‌ها نباید خالی باشد.</li>
                <li class="semi-formal-text"><strong class="text-green-600 dark:text-green-300">افزودن وظایف از دسته:</strong> با کلیک بر روی آیکون سه نقطه کنار دسته و انتخاب "افزودن وظایف"، می‌توانید وظایف موجود در آن دسته را به لیست وظایف فعال خود اضافه کنید.</li>
                <li class="semi-formal-text"><strong class="text-red-600 dark:text-red-300">حذف دسته:</strong> برای حذف یک دسته، روی آیکون سه نقطه کنار آن کلیک کرده و "حذف" را انتخاب کنید.</li>
            </ul>
        </p>


        <h3 class="text-xl sm:text-2xl font-bold mb-2 mt-4 help-heading-blue">سیستم گیمیفیکیشن</h3> <p class="semi-formal-text">
            <strong class="text-gray-600 dark:text-gray-300">پوینت:</strong>
            پوینت‌ها نمادین هستند و میزان فعالیت و پیشرفت شما را نشان می‌دهند.
            <ul class="list-disc list-inside mt-2 mb-2 text-justify">
                <li class="semi-formal-text">وظایف عادی: ${pointsPerNormalTask} پوینت</li>
                <li class="semi-formal-text">وظایف مهم: ${pointsPerImportantTask} پوینت</li>
                <li class="semi-formal-text">وظایف سفارشی: تا ${MAX_CUSTOM_POINTS} پوینت (بر اساس مقدار وارد شده)</li>
                <li class="semi-formal-text"><strong class="text-orange-600 dark:text-orange-300">یادداشت:</strong> این نوع وظایف برای ثبت نکات، ایده‌ها یا اطلاعاتی هستند که نیازی به تکمیل شدن ندارند و پوینت گیمیفیکیشن نمی‌دهند. حداکثر طول متن برای یادداشت‌ها ۱۵۰ کاراکتر است.</li>
            </ul>
        </p>
        <p class="semi-formal-text">
            <strong class="text-gray-600 dark:text-gray-300">سطوح:</strong> با کسب پوینت، به سطوح بالاتر صعود خواهید کرد. هر سطح جدید، یک نام و آیکون منحصر به فرد دارد. می‌توانید با کلیک بر روی نمایشگر سطح در بالای صفحه، جزئیات هر سطح را مشاهده کنید. در زیر لیست تمامی سطوح را مشاهده می‌کنید:
        </p>
        <div id="helpLevelsContainer" class="flex flex-wrap gap-2 mt-1 mb-4">
            </div>
        <p class="semi-formal-text">
            <strong class="text-gray-600 dark:text-gray-300">دستاوردها:</strong> زای تسک دارای مجموعه‌ای از دستاوردها است که با رسیدن به نقاط عطف خاصی (مانند تکمیل تعداد مشخصی وظیفه، رسیدن به سطح خاص، یا حفظ زنجیره روزانه) باز می‌شوند. می‌توانید تمام دستاوردهای خود را از طریق منوی اصلی (آیکون سه نقطه در بالا سمت چپ) و انتخاب "دستاوردها" مشاهده کنید. دستاوردهای بازنشده به صورت قفل نمایش داده می‌شوند. در زیر لیست تمامی دستاوردها را مشاهده می‌کنید:
        </p>
        <div id="helpAchievementsContainer" class="flex flex-wrap gap-2 mt-1 mb-4">
            </div>

        <h3 class="text-xl sm:text-2xl font-bold mb-2 mt-4 help-heading-blue">پشتیبان‌گیری و بازیابی داده‌ها</h3>
        <p class="semi-formal-text">
            <strong class="text-gray-600 dark:text-gray-300">امنیت داده‌ها:</strong>
            تمام داده‌های شما به صورت امن و فقط در حافظه محلی مرورگر شما ذخیره می‌شوند و هیچ اطلاعاتی به هیچ سروری ارسال نمی‌شود. این به معنای حریم خصوصی کامل است، اما مسئولیت پشتیبان‌گیری از داده‌ها با خود شماست.
        </p>
        <p class="semi-formal-text">
            <strong class="text-gray-600 dark:text-gray-300">پشتیبان‌گیری (خروجی گرفتن):</strong>
            برای ایجاد یک نسخه پشتیبان از داده‌های خود، از منوی اصلی، گزینه "پشتیبان‌گیری" را انتخاب کرده و سپس روی دکمه "ذخیره داده‌ها" کلیک کنید. یک فایل JSON حاوی تمام وظایف، پوینت‌ها، سطح و دستاوردهای شما دانلود خواهد شد. این فایل را در مکانی امن نگهداری کنید.
        </p>
        <p class="semi-formal-text">
            <strong class="text-gray-600 dark:text-gray-300">بازیابی (ورودی گرفتن):</strong>
            برای بازیابی داده‌ها از یک فایل پشتیبان، در همان بخش "پشتیبان‌گیری"، روی "انتخاب فایل" کلیک کرده و فایل JSON پشتیبان خود را انتخاب کنید. سپس "بارگذاری از فایل" را فشار دهید. این کار داده‌های فعلی برنامه شما را با داده‌های موجود در فایل جایگزین می‌کند.
        </p>

        <h3 class="text-xl sm:text-2xl font-bold mb-2 mt-4 help-heading-blue">بروزرسانی برنامه</h3>
        <p class="semi-formal-text">
            این برنامه از <strong class="text-gray-600 dark:text-gray-300">سرویس پس‌زمینه (Service Worker)</strong> برای ارائه تجربه آفلاین و بارگذاری سریع استفاده می‌کند. برای اطمینان از اینکه همیشه آخرین نسخه برنامه را دارید و از جدیدترین ویژگی‌ها بهره‌مند می‌شوید، می‌توانید روی گزینه "بروزرسانی برنامه" در منوی اصلی کلیک کنید. این کار کش برنامه را پاک کرده و آخرین نسخه را از سرور بارگذاری می‌کند.
        </p>

        <h3 class="text-xl sm:text-2xl font-bold mb-2 mt-4 help-heading-blue">حمایت مالی</h3>
        <p class="semi-formal-text text-center">
            این بخش در حال حاضر غیرفعال است. از علاقه شما سپاسگزاریم!
        </p>

        <p class="semi-formal-text text-center">
            هدف زای تسک ایجاد انگیزه و کمک به سازماندهی بهتر وظایف شماست. امیدواریم از استفاده از آن لذت ببرید و در مسیر موفقیت خود پیشرفت کنید!
        </p>
    `;
    renderHelpSpinners();
});

closeHelpModalBtn.addEventListener('click', () => {
    helpModalContent.classList.remove('opacity-100', 'scale-100');
    helpModalContent.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        helpModal.classList.add('hidden');
    }, 50);
});

function renderHelpSpinners() {
    const helpLevelsContainer = document.getElementById('helpLevelsContainer');
    const helpAchievementsContainer = document.getElementById('helpAchievementsContainer');

    if (!helpLevelsContainer || !helpAchievementsContainer) return;

    helpLevelsContainer.innerHTML = '';
    helpAchievementsContainer.innerHTML = '';

    levelPointsThresholds.forEach((levelInfo, index) => {
        const levelSpan = document.createElement('span');
        levelSpan.className = `clickable-badge level-badge`;
        levelSpan.innerHTML = `<i class="${levelInfo.icon} ml-2"></i><span>سطح ${index + 1}: ${levelInfo.name}</span>`;
        levelSpan.onclick = () => showDetailModal('level', levelInfo.name);
        helpLevelsContainer.appendChild(levelSpan);
    });

    const sortedAchievementsForHelp = [...achievementsData].sort((a, b) => {
        const typeOrder = { 'level': 0, 'totalTasks': 1, 'points': 2, 'firstPin': 3 };
        if (typeOrder[a.type] !== typeOrder[b.type]) {
            return typeOrder[a.type] - typeOrder[b.type];
        }
        if (a.type === 'level') return a.level - b.level;
        return (a.value || 0) - (b.value || 0);
    });

    sortedAchievementsForHelp.forEach(achievement => {
        const achievementSpan = document.createElement('span');
        achievementSpan.className = `clickable-badge achievement-badge`;
        achievementSpan.innerHTML = `<i class="${achievement.icon} ml-2"></i><span>${achievement.name}</span>`;
        achievementSpan.onclick = () => showDetailModal('achievement', achievement.name);
        helpAchievementsContainer.appendChild(achievementSpan);
    });
}


aboutMenuItem.addEventListener('click', (e) => {
    e.preventDefault();
    menuDropdown.classList.add('hidden');

    aboutModal.classList.remove('hidden');
    void aboutModalContent.offsetWidth;
    aboutModalContent.classList.remove('opacity-0', 'scale-95');
    aboutModalContent.classList.add('opacity-100', 'scale-100');

    aboutModalBody.innerHTML = `
        <p class="semi-formal-text">بسم الله الرحمن الرحیم</p>
        <div class="semi-formal-text text-justify mt-4 mb-4">
            <p>زای تسک، حاصل تلاش و تعهدی فشرده است که در مدت زمان محدودی (حدود دو هفته) و با تمرکز بی‌وقفه بر روی آن شکل گرفت. این پروژه بیش از ۲۰۰ بار برای اطمینان از عملکرد صحیح و سازگاری با نمایشگرهای مختلف، مورد بررسی و رفع اشکال قرار گرفته است. زای تسک به عنوان نسخه‌ی نهایی این ایده، دیگر به‌روزرسانی نخواهد شد و به صورت یک ابزار پایدار ارائه می‌شود.</p>
        </div>
        <p class="mb-3 text-justify">این پروژه با توکل به خدا و با هدف خدمت‌رسانی ارائه شده است؛ باشد که مورد پذیرش او قرار گیرد.</p>
        <p class="mb-3 text-justify">تمامی حقوق متعلق به <strong class="text-gray-600 dark:text-gray-300"><a href="https://amuleo.ir" target="_blank" rel="noopener noreferrer">عمو لئو</a></strong> است.</p>
        <p class="semi-formal-text">تاریخ: 11 خرداد ۱۴۰۴</p>
    `;
});

closeAboutModalBtn.addEventListener('click', () => {
    aboutModalContent.classList.remove('opacity-100', 'scale-100');
    aboutModalContent.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        aboutModal.classList.add('hidden');
    }, 50);
});

backupMenuItem.addEventListener('click', (e) => {
    e.preventDefault();
    menuDropdown.classList.add('hidden');

    backupModal.classList.remove('hidden');
    void backupModalContent.offsetWidth; // Trigger reflow
    backupModalContent.classList.remove('opacity-0', 'scale-95');
    backupModalContent.classList.add('opacity-100', 'scale-100');

    // Reset file input and display name
    importFileInput.value = '';
    selectedFileNameSpan.textContent = 'فایلی انتخاب نشده است.';
});

closeBackupModalBtn.addEventListener('click', () => {
    backupModalContent.classList.remove('opacity-100', 'scale-95');
    backupModalContent.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        backupModal.classList.add('hidden');
    }, 50);
});

updateAppMenuItem.addEventListener('click', async (e) => {
    e.preventDefault();
    menuDropdown.classList.add('hidden');

    updateConfirmModal.classList.remove('hidden');
    void updateConfirmModalContent.offsetWidth; // Trigger reflow
    updateConfirmModalContent.classList.remove('opacity-0', 'scale-95');
    updateConfirmModalContent.classList.add('opacity-100', 'scale-100');
});

confirmUpdateBtn.addEventListener('click', async () => {
    updateConfirmModalContent.classList.remove('opacity-100', 'scale-100');
    updateConfirmModalContent.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        updateConfirmModal.classList.add('hidden');
    }, 50);

    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
				 registration = await navigator.serviceWorker.ready;
                showMessageBox('بروزرسانی برنامه آغاز شد. لطفاً صبر کنید...', 'info');
                // Send message to service worker to start deep update
                registration.active.postMessage({ type: 'START_DEEP_UPDATE' });

                // Listen for response from service worker to perform final cleanup and reload
                navigator.serviceWorker.addEventListener('message', (event) => {
                    if (event.data && event.data.type === 'PERFORM_LOCAL_STORAGE_CLEANUP_AND_RELOAD') {
                        performLocalStorageCleanupAndReload(event.data.keysToPreserve);
                    }
                }, { once: true }); // Use { once: true } to remove listener after first message

            } else {
                // Fallback if no active service worker found
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.all(registrations.map(reg => reg.unregister())); // Unregister all existing service workers
                showMessageBox('Service Worker یافت نشد یا غیرفعال بود. کش مرورگر پاک شده و صفحه مجدداً بارگذاری می‌شود.', 'info');
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName))); // Clear all caches
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        } catch (error) {
            console.error('بروزرسانی Service Worker با خطا مواجه شد:', error);
            showMessageBox('خطا در بروزرسانی برنامه. لطفاً دوباره امتحان کنید.', 'error');
        }
    } else {
        showMessageBox('مرورگر شما از سرویس پس‌زمینه (Service Worker) پشتیبانی نمی‌کند.', 'info');
    }
});

cancelUpdateBtn.addEventListener('click', () => {
    updateConfirmModalContent.classList.remove('opacity-100', 'scale-100');
    updateConfirmModalContent.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        updateConfirmModal.classList.add('hidden');
    }, 50);
    showMessageBox('بروزرسانی برنامه لغو شد.', 'info');
});

closeUpdateModalBtn.addEventListener('click', () => {
    updateConfirmModalContent.classList.remove('opacity-100', 'scale-100');
    updateConfirmModalContent.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        updateConfirmModal.classList.add('hidden');
    }, 50);
});


function performLocalStorageCleanupAndReload(keysToPreserve) {
    const preservedData = {};
    keysToPreserve.forEach(key => {
        const value = localStorage.getItem(key);
        if (value !== null) {
            preservedData[key] = value;
        }
    });

    localStorage.clear(); // Clear all local storage

    // Restore preserved data
    for (const key in preservedData) {
        localStorage.setItem(key, preservedData[key]);
    }

    showMessageBox('برنامه بروزرسانی شد! صفحه در حال بارگذاری مجدد است.', 'success');
    setTimeout(() => {
        window.location.reload(); // Reload the page to apply updates
    }, 500);
}


donateMenuItem.addEventListener('click', (e) => {
    e.preventDefault();
    showMessageBox('این بخش در حال حاضر غیرفعال است. از علاقه شما سپاسگزاریم!', 'info');
    menuDropdown.classList.add('hidden');
});

resetMenuItem.addEventListener('click', (e) => {
    e.preventDefault();
    menuDropdown.classList.add('hidden');

    resetConfirmModal.classList.remove('hidden');
    void resetConfirmModalContent.offsetWidth; // Trigger reflow
    resetConfirmModalContent.classList.remove('opacity-0', 'scale-95');
    resetConfirmModalContent.classList.add('opacity-100', 'scale-100');
});

confirmResetBtn.addEventListener('click', () => {
    localStorage.clear(); // Clear all local storage data
    location.reload(); // Reload the page
});

cancelResetBtn.addEventListener('click', () => {
    resetConfirmModalContent.classList.remove('opacity-100', 'scale-100');
    resetConfirmModalContent.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        resetConfirmModal.classList.add('hidden');
    }, 50);
});

closeResetModalBtn.addEventListener('click', () => {
    resetConfirmModalContent.classList.remove('opacity-100', 'scale-100');
    resetConfirmModalContent.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        resetConfirmModal.classList.add('hidden');
    }, 50);
});

startBtn.addEventListener('click', () => {
    const inputName = userNameInput.value.trim();
    if (inputName.length === 0) {
        showMessageBox('لطفاً نام خود را وارد کنید.', 'info');
        return;
    }
    if (inputName.length > 15) {
        showMessageBox('مقدار ورودی نباید بیش از ۱۵ کاراکتر باشد.', 'error');
        return;
    }

    userName = inputName;
    if (!userCreationDate) {
        userCreationDate = new Date().toISOString(); // Set creation date only once
    }
    saveToLocalStorage();
    welcomeModalContent.classList.remove('opacity-100', 'scale-100');
    welcomeModalContent.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        welcomeModal.classList.add('hidden');
        updateGamificationDisplay(); // Update display with new user info
        startMotivationRotation(); // Start motivation quotes rotation
        setTimeout(() => {
            processNotificationQueue(); // Process any pending notifications
            processAchievementNotificationQueue(); // Process any pending achievement notifications
        }, 100);
    }, 50);
    showMessageBox(`${userName} عزیز، خوش آمدید!`, 'success');
});

exportDataBtn.addEventListener('click', () => {
    const dataToSave = {
        tasks: tasks,
        zPoint: zPoint,
        level: level,
        totalCustomTasksCompleted: totalCustomTasksCompleted,
        userName: userName,
        userCreationDate: userCreationDate,
        unlockedAchievements: unlockedAchievements,
        achievementUnlockDates: achievementUnlockDates,
        hasPinnedTaskEver: hasPinnedTaskEver,
        currentMotivationIndex: currentMotivationIndex,
        defaultCategories: defaultCategories, // Include default categories
        theme: localStorage.getItem('theme') // Include current theme
    };
    const jsonString = JSON.stringify(dataToSave, null, 2); // Pretty print JSON
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const date = new Date();
    const dateString = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    a.download = `tasks_backup_${dateString}_zaytechtappy.json`; // Dynamic filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Clean up URL object
    showMessageBox('فایل پشتیبان با موفقیت دانلود شد!', 'success');
});

importFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        selectedFileNameSpan.textContent = e.target.files[0].name;
    } else {
        selectedFileNameSpan.textContent = 'فایلی انتخاب نشده است.';
    }
});

importDataBtn.addEventListener('click', () => {
    const file = importFileInput.files[0];
    if (!file) {
        showMessageBox('لطفاً یک فایل پشتیبان برای بارگذاری انتخاب کنید.', 'info');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const dataString = e.target.result;
            const importedData = JSON.parse(dataString);

            // Reset current state before importing
            tasks = [];
            zPoint = 0;
            level = 1;
            totalCustomTasksCompleted = 0;
            userName = null;
            userCreationDate = null;
            unlockedAchievements = [];
            achievementUnlockDates = {};
            hasPinnedTaskEver = false;
            currentMotivationIndex = 0;
            defaultCategories = []; // Reset default categories
            let importedTheme = null;

            // Populate data from imported file, with type checking and fallbacks
            if (importedData && typeof importedData === 'object') {
                if (Array.isArray(importedData.tasks)) {
                    tasks = importedData.tasks.map(task => ({
                        id: typeof task.id === 'string' ? task.id : Date.now().toString() + Math.random().toString().substring(2, 8), // Ensure ID is string and unique if missing
                        name: typeof task.name === 'string' ? task.name : 'وظیفه نامشخص',
                        completed: typeof task.completed === 'boolean' ? task.completed : false,
                        importance: typeof task.importance === 'string' && ['important', 'normal', 'custom', 'note'].includes(task.importance) ? task.importance : 'normal',
                        customPoints: typeof task.customPoints === 'number' ? task.customPoints : undefined,
                        isPinned: typeof task.isPinned === 'boolean' ? task.isPinned : false,
                        pinnedAt: typeof task.pinnedAt === 'string' || task.pinnedAt === null ? task.pinnedAt : null
                    }));
                }

                if (typeof importedData.zPoint === 'number') {
                    zPoint = importedData.zPoint;
                } else {
                    zPoint = 0;
                }
                if (typeof importedData.level === 'number') {
                    level = importedData.level;
                } else {
                    level = 1;
                }
                if (typeof importedData.totalCustomTasksCompleted === 'number') {
                    totalCustomTasksCompleted = importedData.totalCustomTasksCompleted;
                } else {
                    totalCustomTasksCompleted = 0;
                }
                if (typeof importedData.userName === 'string' || importedData.userName === null) {
                    userName = importedData.userName;
                } else {
                    userName = null;
                }
                if (typeof importedData.userCreationDate === 'string' || importedData.userCreationDate === null) {
                    userCreationDate = importedData.userCreationDate;
                } else {
                    userCreationDate = null;
                }
                if (Array.isArray(importedData.unlockedAchievements)) {
                    unlockedAchievements = importedData.unlockedAchievements;
                } else {
                    unlockedAchievements = [];
                }
                if (typeof importedData.achievementUnlockDates === 'object' && importedData.achievementUnlockDates !== null) {
                    achievementUnlockDates = importedData.achievementUnlockDates;
                } else {
                    achievementUnlockDates = {};
                }
                if (typeof importedData.hasPinnedTaskEver === 'boolean') {
                    hasPinnedTaskEver = importedData.hasPinnedTaskEver;
                } else {
                    hasPinnedTaskEver = false;
                }
                if (typeof importedData.currentMotivationIndex === 'number') {
                    currentMotivationIndex = importedData.currentMotivationIndex;
                } else {
                    currentMotivationIndex = 0;
                }
                if (Array.isArray(importedData.defaultCategories)) { // Import default categories
                    defaultCategories = importedData.defaultCategories.map(category => ({
                        id: typeof category.id === 'string' ? category.id : Date.now().toString() + Math.random().toString().substring(2, 8),
                        name: typeof category.name === 'string' ? category.name : 'دسته نامشخص',
                        tasks: Array.isArray(category.tasks) ? category.tasks.map(task => ({
                            name: typeof task.name === 'string' ? task.name : 'وظیفه نامشخص',
                            importance: typeof task.importance === 'string' && ['important', 'normal', 'custom', 'note'].includes(task.importance) ? task.importance : 'normal', // Custom not allowed for category tasks
                            customPoints: typeof task.customPoints === 'number' ? task.customPoints : undefined,
                        })) : []
                    }));
                } else {
                    defaultCategories = [];
                }
                if (typeof importedData.theme === 'string') {
                    importedTheme = importedData.theme;
                } else {
                    importedTheme = null;
                }
            } else {
                showMessageBox('فرمت داده‌های وارد شده نامعتبر است. لطفاً یک فایل پشتیبان معتبر را وارد کنید.', 'error');
                return;
            }

            // Apply imported theme
            if (importedTheme) {
                localStorage.setItem('theme', importedTheme);
                applyTheme(importedTheme);
            } else {
                localStorage.removeItem('theme'); // Clear if no theme in backup
                initializeTheme(); // Revert to default/system theme
            }

            saveToLocalStorage(); // Save the newly imported data
            renderTasks(); // Re-render the UI
            updateMotivationQuote(false); // Update motivation quote without animation
            startMotivationRotation(); // Restart motivation rotation

            backupModalContent.classList.remove('opacity-100', 'scale-95');
            backupModalContent.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                backupModal.classList.add('hidden');
            }, 50);
            showMessageBox('داده‌ها با موفقیت بارگذاری شدند!', 'success');

        } catch (error) {
            console.error("Error parsing imported data:", error);
            showMessageBox('خطا در پردازش فایل وارد شده. اطمینان حاصل کنید که یک فایل JSON معتبر است.', 'error');
        }
    };
    reader.onerror = (e) => {
        console.error("Error reading file:", e);
        showMessageBox('خطا در خواندن فایل.', 'error');
    };
    reader.readAsText(file); // Read the file as text
});

function showDetailModal(type, identifier) {
    detailModalTitle.textContent = '';
    detailModalBody.innerHTML = '';

    let contentHtml = '';
    let item;

    if (type === 'level') {
        const levelName = identifier;
        item = levelPointsThresholds.find(l => l.name === levelName);
        if (item) {
            const unlockedDate = achievementUnlockDates[item.name];
            const formattedDate = formatPersianDate(unlockedDate);

            detailModalTitle.textContent = `سطح ${item.level || (levelPointsThresholds.indexOf(item) + 1)}: ${item.name}`;
            contentHtml = `
                <p class="semi-formal-text"><strong class="text-blue-600 dark:text-blue-300">توضیحات:</strong> ${item.motivational}</p>
                <p class="semi-formal-text"><strong class="text-blue-600 dark:text-blue-300">پوینت مورد نیاز:</strong> ${item.points}</p>
                <p class="semi-formal-text"><strong class="text-blue-600 dark:text-blue-300">تاریخ کسب:</strong> ${formattedDate}</p> `;
        } else {
            detailModalTitle.textContent = 'سطح نامشخص';
            contentHtml = '<p class="semi-formal-text">اطلاعاتی برای این سطح یافت نشد.</p>';
        }
    } else if (type === 'achievement') {
        const achievementName = identifier;
        item = achievementsData.find(ach => ach.name === achievementName);
        if (item) {
            detailModalTitle.textContent = `دستاورد: ${item.name}`;
            const isAchieved = unlockedAchievements.includes(item.name);
            const unlockedDate = achievementUnlockDates[item.name];
            const formattedDate = formatPersianDate(unlockedDate);

            contentHtml = `
                <p class="semi-formal-text"><strong class="text-blue-600 dark:text-blue-300">توضیحات:</strong> ${item.description}</p>
                <p class="semi-formal-text"><strong class="text-blue-600 dark:text-blue-300">وضعیت:</strong> ${isAchieved ? 'باز شده' : 'باز نشده'}</p>
                <p class="semi-formal-text"><strong class="text-blue-600 dark:text-blue-300">تاریخ باز شدن:</strong> ${formattedDate}</p> `;
        } else {
            detailModalTitle.textContent = 'دستاورد نامشخص';
            contentHtml = '<p class="semi-formal-text">اطلاعاتی برای این دستاورد یافت نشو.</p>';
        }
    }

    detailModalBody.innerHTML = contentHtml;

    detailModal.classList.remove('hidden');
    void detailModalContent.offsetWidth; // Trigger reflow
    detailModalContent.classList.remove('opacity-0', 'scale-95');
    detailModalContent.classList.add('opacity-100', 'scale-100');
}

closeDetailModalBtn.addEventListener('click', () => {
    detailModalContent.classList.remove('opacity-100', 'scale-100');
    detailModalContent.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        detailModal.classList.add('hidden');
    }, 50);
});

function updateMotivationQuote(animate = true) {
    if (animate) {
        motivationTextSpan.classList.add('animate-out');
        motivationTextSpan.addEventListener('animationend', function handler() {
            motivationTextSpan.removeEventListener('animationend', handler);
            motivationTextSpan.classList.remove('animate-out');
            currentMotivationIndex = (currentMotivationIndex + 1) % motivationQuotes.length;
            motivationTextSpan.textContent = motivationQuotes[currentMotivationIndex];
            motivationTextSpan.classList.add('animate-in');
            motivationTextSpan.addEventListener('animationend', function handler2() {
                motivationTextSpan.removeEventListener('animationend', handler2);
                motivationTextSpan.classList.remove('animate-in');
            }, { once: true });
        }, { once: true });
    } else {
        motivationTextSpan.textContent = motivationQuotes[currentMotivationIndex];
        motivationTextSpan.classList.remove('animate-out', 'animate-in'); // Ensure no animation classes are present
        motivationTextSpan.style.opacity = '1';
        motivationTextSpan.style.transform = 'translateY(0)';
        currentMotivationIndex = (currentMotivationIndex + 1) % motivationQuotes.length; // Advance index for next call
    }
    saveToLocalStorage();
}

function startMotivationRotation() {
    if (motivationInterval) {
        clearInterval(motivationInterval); // Clear any existing interval
    }
    updateMotivationQuote(false); // Display initial quote immediately
    motivationInterval = setInterval(updateMotivationQuote, 7000); // Rotate every 7 seconds
}

// Default Categories functionality
defaultCategoriesMenuItem.addEventListener('click', (e) => {
    e.preventDefault();
    menuDropdown.classList.add('hidden');
    showDefaultCategoriesModal();
});

function showDefaultCategoriesModal() {
    defaultCategoriesModal.classList.remove('hidden');
    void defaultCategoriesModalContent.offsetWidth;
    defaultCategoriesModalContent.classList.remove('opacity-0', 'scale-95');
    defaultCategoriesModalContent.classList.add('opacity-100', 'scale-100');
    renderDefaultCategories();
    newCategoryInput.focus();
}

closeDefaultCategoriesModalBtn.addEventListener('click', () => {
    defaultCategoriesModalContent.classList.remove('opacity-100', 'scale-100');
    defaultCategoriesModalContent.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        defaultCategoriesModal.classList.add('hidden');
    }, 50);
});

addCategoryBtn.addEventListener('click', () => {
    const categoryName = newCategoryInput.value.trim();
    if (categoryName.length === 0) {
        showMessageBox('لطفاً نام دسته را وارد کنید.', 'info');
        return;
    }
    if (categoryName.length > CATEGORY_NAME_MAXLENGTH) {
        showMessageBox(`نام دسته نباید بیش از ${CATEGORY_NAME_MAXLENGTH} کاراکتر باشد.`, 'error');
        return;
    }
    if (defaultCategories.some(cat => cat.name === categoryName)) {
        showMessageBox('دسته‌ای با این نام از قبل وجود دارد.', 'info');
        return;
    }
    if (defaultCategories.length >= MAX_CATEGORIES) { // Check for max categories
        showMessageBox(`شما نمی‌توانید بیش از ${MAX_CATEGORIES} دسته اضافه کنید.`, 'info');
        return;
    }

    const newCategory = {
        id: Date.now().toString(),
        name: categoryName,
        tasks: []
    };
    defaultCategories.push(newCategory);
    newCategoryInput.value = '';
    saveToLocalStorage();
    renderDefaultCategories();
    showMessageBox('دسته جدید با موفقیت اضافه شد!', 'success');

    // Automatically open the edit modal for the newly created category
    showEditCategoryModal(newCategory.id);
});

function renderDefaultCategories() {
    defaultCategoriesList.innerHTML = '';
    if (defaultCategories.length === 0) {
        const noCategoriesMessage = document.createElement('p');
        noCategoriesMessage.className = 'text-gray-500 dark:text-gray-400 text-center py-4';
        noCategoriesMessage.textContent = 'هنوز دسته‌ای ایجاد نشده است.';
        defaultCategoriesList.appendChild(noCategoriesMessage);
        return;
    }

    defaultCategories.forEach(category => {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm mb-2';
        // Changed to use a menu button for category actions
        categoryItem.innerHTML = `
            <span class="text-lg font-medium text-gray-800 dark:text-gray-100">${category.name}</span>
            <div class="flex items-center space-x-2 space-x-reverse mr-2">
                <button data-id="${category.id}" data-action="category-menu"
                    class="three-dot-menu-btn bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 100-2 1 1 0 000 2zm0 7a1 1 0 100-2 1 1 0 000 2zm0 7a1 1 0 100-2 1 1 0 000 2z"></path>
                    </svg>
                </button>
            </div>
        `;
        defaultCategoriesList.appendChild(categoryItem);
    });

    defaultCategoriesList.querySelectorAll('button[data-action="category-menu"]').forEach(button => {
        button.addEventListener('click', (e) => {
            const categoryId = e.currentTarget.dataset.id;
            showCategoryActionsMenu(categoryId, e.currentTarget);
        });
    });
}

function showCategoryActionsMenu(categoryId, buttonElement) {
    document.querySelectorAll('.task-action-menu').forEach(menu => menu.remove()); // Reuse task-action-menu class for styling

    const menu = document.createElement('div');
    menu.className = 'task-action-menu'; // Using existing style
    menu.style.position = 'absolute';
    menu.style.zIndex = '100';
    menu.style.visibility = 'hidden';

    document.body.appendChild(menu);

    menu.innerHTML = `
        <button data-action="add-tasks-from-category" data-id="${categoryId}">
            <i class="fa-solid fa-plus ml-2"></i>
            افزودن وظایف
        </button>
        <button data-action="edit-category" data-id="${categoryId}">
            <i class="fa-solid fa-pen ml-2"></i>
            ویرایش دسته
        </button>
        <button data-action="delete-category" data-id="${categoryId}">
            <i class="fa-solid fa-trash-can ml-2"></i>
            حذف دسته
        </button>
    `;

    const rect = buttonElement.getBoundingClientRect();
    const padding = 5;

    let menuTop = rect.bottom + window.scrollY + 5;
    let menuLeft = rect.left + window.scrollX;

    // Adjust if menu goes off screen to the right
    if (menuLeft + menu.offsetWidth > window.innerWidth - padding) {
        menuLeft = window.innerWidth - menu.offsetWidth - padding;
    }
    // Adjust if menu goes off screen to the left
    if (menuLeft < padding) {
        menuLeft = padding;
    }

    // Adjust if menu goes off screen to the bottom
    if (menuTop + menu.offsetHeight > window.innerHeight + window.scrollY - padding) {
        menuTop = rect.top + window.scrollY - menu.offsetHeight - 5;
        // If it still goes off screen to the top, position at top-left of viewport
        if (menuTop < padding + window.scrollY) {
            menuTop = padding + window.scrollY;
        }
    }

    menu.style.top = `${menuTop}px`;
    menu.style.left = `${menuLeft}px`;
    menu.style.visibility = 'visible';

    menu.addEventListener('click', (e) => {
        const action = e.target.closest('button')?.dataset.action;
        const id = e.target.closest('button')?.dataset.id;
        if (action) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
            if (action === 'add-tasks-from-category') {
                showAddCategoryTasksModal(id);
            } else if (action === 'edit-category') {
                showEditCategoryModal(id);
            } else if (action === 'delete-category') {
                deleteCategory(id);
            }
        }
    });

    const closeMenu = (e) => {
        if (!menu.contains(e.target) && !buttonElement.contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    };
    setTimeout(() => {
        document.addEventListener('click', closeMenu);
    }, 50);
}


function showAddCategoryTasksModal(categoryId) {
    const category = defaultCategories.find(cat => cat.id === categoryId);
    if (!category) {
        showMessageBox('خطا: دسته یافت نشد.', 'error');
        return;
    }

    addCategoryTasksTitle.textContent = category.name;
    categoryTasksInputContainer.innerHTML = '';

    if (category.tasks.length === 0) {
        categoryTasksInputContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-4">این دسته وظیفه‌ای ندارد.</p>';
        addCategoryTaskBtn.disabled = true;
    } else {
        addCategoryTaskBtn.disabled = false;
        category.tasks.forEach((task, index) => {
            const taskDiv = document.createElement('div');
            taskDiv.className = 'flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-lg';
            taskDiv.innerHTML = `
                <span class="text-gray-800 dark:text-gray-100">${task.name}</span>
                <input type="checkbox" data-index="${index}" checked class="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-400 rounded focus:ring-blue-500 dark:focus:ring-blue-300">
            `;
            categoryTasksInputContainer.appendChild(taskDiv);
        });
    }

    defaultCategoriesModal.classList.add('hidden'); // Hide default categories modal
    addCategoryTasksModal.classList.remove('hidden');
    void addCategoryTasksModalContent.offsetWidth;
    addCategoryTasksModalContent.classList.remove('opacity-0', 'scale-95');
    addCategoryTasksModalContent.classList.add('opacity-100', 'scale-100');

    addCategoryTaskBtn.onclick = () => addTasksFromCategory(categoryId);
}

closeAddCategoryTasksModalBtn.addEventListener('click', () => {
    addCategoryTasksModalContent.classList.remove('opacity-100', 'scale-100');
    addCategoryTasksModalContent.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        addCategoryTasksModal.classList.add('hidden');
    }, 50);
    showDefaultCategoriesModal(); // Return to default categories modal
});

cancelAddCategoryTasksBtn.addEventListener('click', () => {
    addCategoryTasksModalContent.classList.remove('opacity-100', 'scale-100');
    addCategoryTasksModalContent.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        addCategoryTasksModal.classList.add('hidden');
    }, 50);
    showDefaultCategoriesModal(); // Return to default categories modal
    showMessageBox('افزودن وظایف از دسته لغو شد.', 'info');
});

function addTasksFromCategory(categoryId) {
    const category = defaultCategories.find(cat => cat.id === categoryId);
    if (!category) return;

    const checkboxes = categoryTasksInputContainer.querySelectorAll('input[type="checkbox"]:checked');
    let addedCount = 0;
    let firstAddedTaskId = null; // متغیری برای ذخیره ID اولین وظیفه اضافه شده

    checkboxes.forEach(checkbox => {
        const taskIndex = parseInt(checkbox.dataset.index, 10);
        const taskToAdd = category.tasks[taskIndex];

        if (taskToAdd) {
            const newTask = {
                id: Date.now().toString() + Math.random().toString().substring(2, 8),
                name: taskToAdd.name,
                completed: false,
                importance: taskToAdd.importance,
                customPoints: taskToAdd.customPoints,
                isPinned: false,
                pinnedAt: null
            };
            tasks.push(newTask);
            if (firstAddedTaskId === null) { // ID اولین وظیفه اضافه شده را ذخیره کن
                firstAddedTaskId = newTask.id;
            }
            addedCount++;
        }
    });

    if (addedCount > 0) {
        saveToLocalStorage();
        // ID اولین وظیفه اضافه شده را به renderTasks ارسال کن
        renderTasks(firstAddedTaskId);
        showMessageBox(`${addedCount} وظیفه از دسته "${category.name}" اضافه شد!`, 'success');
    } else {
        showMessageBox('هیچ وظیفه‌ای برای اضافه کردن انتخاب نشده بود.', 'info');
    }

    addCategoryTasksModalContent.classList.remove('opacity-100', 'scale-100');
    addCategoryTasksModalContent.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        addCategoryTasksModal.classList.add('hidden');
    }, 50);
}

function showEditCategoryModal(categoryId) {
    currentCategoryBeingEditedId = categoryId;
    const category = defaultCategories.find(cat => cat.id === categoryId);
    if (!category) {
        showMessageBox('خطا: دسته برای ویرایش یافت نشد.', 'error');
        return;
    }

    editCategoryTitle.textContent = category.name;
    editCategoryNameInput.value = category.name;
    editCategoryNameInput.setAttribute('maxlength', CATEGORY_NAME_MAXLENGTH); // Set max length for category name

    renderEditCategoryTasks(category.tasks);

    defaultCategoriesModal.classList.add('hidden'); // Hide default categories modal
    editCategoryModal.classList.remove('hidden');
    void editCategoryModalContent.offsetWidth;
    editCategoryModalContent.classList.remove('opacity-0', 'scale-95');
    editCategoryModalContent.classList.add('opacity-100', 'scale-100');
    editCategoryNameInput.focus();
}

closeEditCategoryModalBtn.addEventListener('click', () => {
    editCategoryModalContent.classList.remove('opacity-100', 'scale-100');
    editCategoryModalContent.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        editCategoryModal.classList.add('hidden');
    }, 50);
    showDefaultCategoriesModal(); // Return to default categories modal
});

cancelEditCategoryBtn.addEventListener('click', () => {
    editCategoryModalContent.classList.remove('opacity-100', 'scale-100');
    editCategoryModalContent.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        editCategoryModal.classList.add('hidden');
    }, 50);
    showDefaultCategoriesModal(); // Return to default categories modal
    showMessageBox('ویرایش دسته لغو شد.', 'info');
});

addNewTaskToCategoryBtn.addEventListener('click', () => {
    const category = defaultCategories.find(cat => cat.id === currentCategoryBeingEditedId);
    if (!category) return;

    // First, capture current values from existing inputs
    const currentTasksInInputs = [];
    const taskItems = editCategoryTasksContainer.querySelectorAll('.category-task-item');
    taskItems.forEach(item => {
        const nameInput = item.querySelector('input[type="text"]');
        const importanceSelectElement = item.querySelector('select');
        const customPointsInput = item.querySelector('input[type="number"]');

        const taskName = nameInput.value.trim();
        const importance = importanceSelectElement.value;
        let customPoints = undefined;

        if (importance === 'custom') {
            const convertedPoints = convertPersianNumbersToEnglish(customPointsInput.value);
            customPoints = parseInt(convertedPoints, 10);
        }
        currentTasksInInputs.push({ name: taskName, importance, customPoints });
});

// Add the new empty task to this captured array
    currentTasksInInputs.push({
        name: '',
        importance: 'normal',
        customPoints: undefined
    });
	
	// Update the category's tasks and re-render
    category.tasks = currentTasksInInputs;
    renderEditCategoryTasks(category.tasks);
    // Focus on the newly added input field
    const lastInput = editCategoryTasksContainer.querySelector('.category-task-item:last-child input[type="text"]');
    if (lastInput) {
        lastInput.focus();
    }
});

saveEditedCategoryBtn.addEventListener('click', () => {
    const category = defaultCategories.find(cat => cat.id === currentCategoryBeingEditedId);
    if (!category) return;

    const newCategoryName = editCategoryNameInput.value.trim();
    if (newCategoryName.length === 0) {
        showMessageBox('نام دسته نمی‌تواند خالی باشد.', 'info');
        return;
    }
    if (newCategoryName.length > CATEGORY_NAME_MAXLENGTH) {
        showMessageBox(`نام دسته نباید بیش از ${CATEGORY_NAME_MAXLENGTH} کاراکتر باشد.`, 'error');
        return;
    }
    if (defaultCategories.some(cat => cat.name === newCategoryName && cat.id !== category.id)) {
        showMessageBox('دسته‌ای با این نام از قبل وجود دارد.', 'info');
        return;
    }

    category.name = newCategoryName;

    const updatedTasks = [];
    const taskItems = editCategoryTasksContainer.querySelectorAll('.category-task-item');
    let hasError = false;

    taskItems.forEach(item => {
        const nameInput = item.querySelector('input[type="text"]');
        const importanceSelect = item.querySelector('select');
        const customPointsInput = item.querySelector('input[type="number"]');

        const taskName = nameInput.value.trim();
        const importance = importanceSelect.value;
        let customPoints = undefined;

        if (taskName.length === 0) {
            showMessageBox('نام وظیفه در دسته نمی‌تواند خالی باشد.', 'error');
            hasError = true;
            return;
        }

        const currentMaxLength = importance === 'note' ? NOTE_TASK_MAXLENGTH : DEFAULT_TASK_MAXLENGTH;
        if (taskName.length > currentMaxLength) {
            showMessageBox(`مقدار ورودی وظیفه نباید بیش از ${currentMaxLength} کاراکتر باشد.`, 'error');
            hasError = true;
            return;
        }

        if (importance === 'custom') { // Custom tasks are not allowed in categories
            showMessageBox('وظایف سفارشی در دسته‌ها مجاز نیستند.', 'error');
            hasError = true;
            return;
        }
        // If importance is not custom, customPoints should be undefined
        customPoints = undefined;

        updatedTasks.push({ name: taskName, importance, customPoints });
    });

    if (hasError) return;

    category.tasks = updatedTasks;
    saveToLocalStorage();
    renderDefaultCategories();
    showMessageBox('دسته با موفقیت ویرایش شد!', 'success');

    editCategoryModalContent.classList.remove('opacity-100', 'scale-100');
    editCategoryModalContent.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        editCategoryModal.classList.add('hidden');
    }, 50);
    showDefaultCategoriesModal(); // Return to default categories modal
});

function renderEditCategoryTasks(tasksInCategories) {
    editCategoryTasksContainer.innerHTML = '';
    if (tasksInCategories.length === 0) {
        const noTasksMessage = document.createElement('p');
        noTasksMessage.className = 'text-gray-500 dark:text-gray-400 text-center py-4';
        noTasksMessage.textContent = 'این دسته وظیفه‌ای ندارد. می‌توانید وظیفه جدید اضافه کنید.';
        editCategoryTasksContainer.appendChild(noTasksMessage);
        return;
    }

    tasksInCategories.forEach((task, index) => {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'category-task-item flex flex-col gap-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm mb-2';
        taskDiv.innerHTML = `
            <div class="flex items-center gap-2">
                <input type="text" value="${task.name}" placeholder="نام وظیفه..." maxlength="${task.importance === 'note' ? NOTE_TASK_MAXLENGTH : DEFAULT_TASK_MAXLENGTH}"
                       class="flex-grow p-2 border rounded-lg text-sm text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-700 text-right">
                <button data-index="${index}" data-action="delete-task-from-category" class="p-2 rounded-full bg-red-200 hover:bg-red-300 dark:bg-red-700 dark:hover:bg-red-600 text-red-800 dark:text-red-100 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400" title="حذف وظیفه">
                    <i class="fa-solid fa-trash-can text-xs"></i>
                </button>
            </div>
            <div class="flex items-center gap-2">
                <select class="flex-grow p-2 border rounded-lg text-sm text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-700 appearance-none text-right">
                    <option value="important" ${task.importance === 'important' ? 'selected' : ''}>مهم</option>
                    <option value="normal" ${task.importance === 'normal' ? 'selected' : ''}>عادی</option>
                    <option value="note" ${task.importance === 'note' ? 'selected' : ''}>یادداشت</option>
                </select>
                <input type="number" value="${task.customPoints || ''}" placeholder="پوینت" min="1" max="${MAX_CUSTOM_POINTS}"
                       class="w-20 p-2 border rounded-lg text-sm text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-700 text-right hidden">
            </div>
        `;
        editCategoryTasksContainer.appendChild(taskDiv);

        const importanceSelectElement = taskDiv.querySelector('select');
        const customPointsInput = taskDiv.querySelector('input[type="number"]');
        const taskNameInput = taskDiv.querySelector('input[type="text"]');

        importanceSelectElement.addEventListener('change', (e) => {
            // Custom option removed, so no need to show/hide customPointsInput based on select value
            // Ensure customPointsInput remains hidden
            customPointsInput.classList.add('hidden');
            customPointsInput.value = '';

            taskNameInput.setAttribute('maxlength', e.target.value === 'note' ? NOTE_TASK_MAXLENGTH : DEFAULT_TASK_MAXLENGTH);
        });

        taskDiv.querySelector('[data-action="delete-task-from-category"]').addEventListener('click', (e) => {
            const category = defaultCategories.find(cat => cat.id === currentCategoryBeingEditedId);
            if (category) {
                const taskIndexToDelete = parseInt(e.currentTarget.dataset.index, 10);
                category.tasks.splice(taskIndexToDelete, 1);
                renderEditCategoryTasks(category.tasks); // Re-render to update indices and display
                showMessageBox('وظیفه از دسته حذف شد.', 'info');
            }
        });
    });
}

function deleteCategory(categoryId) {
    const categoryIndex = defaultCategories.findIndex(cat => cat.id === categoryId);
    if (categoryIndex > -1) {
        const categoryName = defaultCategories[categoryIndex].name;
        defaultCategories.splice(categoryIndex, 1);
        saveToLocalStorage();
        renderDefaultCategories();
        showMessageBox(`دسته "${categoryName}" حذف شد!`, 'success');
    }
}


window.onload = function () {
    let storedUserName = localStorage.getItem('userName');
    if (storedUserName && storedUserName !== 'null') {
        userName = storedUserName;
    } else {
        welcomeModal.classList.remove('hidden'); // Show welcome modal if no username
    }
    initializeTheme(); // Set up theme
    loadFromLocalStorage(); // Load saved data

    if (userName) {
        renderTasks(); // Render tasks if user exists
        updateGamificationDisplay(); // Update gamification elements
        startMotivationRotation(); // Start motivation quotes
        setTimeout(() => {
            processNotificationQueue(); // Process any pending notifications
            processAchievementNotificationQueue(); // Process any pending achievement notifications
        }, 100);
    } else {
        welcomeModal.classList.remove('hidden');
        void welcomeModalContent.offsetWidth; // Trigger reflow for transition
        welcomeModalContent.classList.remove('opacity-0', 'scale-95');
        welcomeModalContent.classList.add('opacity-100', 'scale-100');
        userNameInput.focus(); // Focus on input field
    }
};


// PWA Installation Logic - MODIFIED
const installAppLink = document.getElementById('installAppLink');

// Remove deferredPrompt and related event listeners as per new requirement
// let deferredPrompt = null;
// window.addEventListener('beforeinstallprompt', (e) => { ... });
// window.addEventListener('appinstalled', () => { ... });

installAppLink.addEventListener('click', async (e) => {
    e.preventDefault();
    menuDropdown.classList.add('hidden'); // Close menu dropdown

    if (navigator.onLine) {
        // User is online, redirect to zytask.ir/insapp
        window.location.href = 'https://zytask.ir/insapp';
    } else {
        // User is offline, show message
        showMessageBox('لطفاً به اینترنت متصل شوید.', 'info', {
            position: 'bottom-center',
            duration: 7000,
            link: null, // No link for offline message
            linkText: ''
        });
    }
});


// Service Worker registration logic (unchanged from previous version)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // A new service worker is installed and ready to activate
                            // You might prompt the user to refresh here or handle it automatically
                        }
                    });
                });
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
}

// Share App Link (unchanged)
const shareAppLink = document.getElementById('shareAppLink');
if ('share' in navigator) {
    shareAppLink.classList.remove('hidden');
    shareAppLink.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await navigator.share({
                title: 'زای تسک',
                text: 'برنامه مدیریت تسک‌ها را امتحان کنید!',
                url: window.location.href
            });
            console.log('Action: Content shared successfully.');
        } catch (error) {
            console.error('Error sharing:', error);
        }
    });
} else {
    shareAppLink.classList.add('hidden');
    console.warn('Warning: Web Share API is not supported in this browser.');
}
