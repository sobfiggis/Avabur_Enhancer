// ==UserScript==
// @name         Avabur Enhancer
// @namespace    https://github.com/sobfiggis/Avabur_Enhancer
// @version      0.9.3
// @description  Tracks certain data within the game to create additional features and calculate additional informaiton.
// @author       In Game Name: Kajin
// @match        https://*.avabur.com/game.php
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.8.0/spectrum.min.js
// @downloadURL  https://raw.githubusercontent.com/sobfiggis/Avabur_Enhancer/master/Avabur_Enhancer.js
// ==/UserScript==

/**************************************************/
/****************** USER OPTIONS ******************/
/**************************************************/
var ENABLE_QUEST_COMPLETE_NOTICE = true;
var ENABLE_XP_GOLD_RESOURCE_PER_HOUR = true;
var ENABLE_BATTLE_TRACKER = true;
var ENABLE_CLAN_DONATION_TABLE_MOD = true;
var ENABLE_INGREDIENT_TRACKER = true;
var ENABLE_DROP_TRACKER = true;
var ENABLE_QUEST_BOOST_REAL_REDUCTION = true;
var ENABLE_CHAT_BATTLE_SWAP = true;
var ENABLE_CHAT_USER_COLOR_PICKER = true;
var perHourColor = "99cc99";
var perHourSize = "12"; // Default is 14

/**************************************************/
/**************** END USER OPTIONS ****************/
/**************************************************/

var peopleMod = {};
var questNoticeOn = false;
var numBattles = 0;
var numRounds = 0;
var numAttacks = 0;
var numMulti = 0;
var numHits = 0;
var numMisses = 0;
var numUntrackedHits = 0;
var numCrits = 0;
var numUntrackedCrits = 0;
var numCounters = 0;
var numSpells = 0;
var numHeals = 0;
var numHealableRounds = 0;
var numEvade = 0;
var numAttacksTaken = 0;
var hitTot = 0;
var hitMax = 0;
var hitMin = 999999999;
var hitAvg = 0;
var critTot = 0;
var critMax = 0;
var critMin = 999999999;
var critAvg = 0;
var spellTot = 0;
var spellMax = 0;
var spellMin = 999999999;
var spellAvg = 0;
var counterTot = 0;
var counterMax = 0;
var counterMin = 999999999;
var counterAvg = 0;
var healTot = 0;
var healMax = 0;
var healAvg = 0;
var healMin = 999999999;

if (localStorage.peopleMod) {
    peopleMod = JSON.parse(localStorage.peopleMod);
}

// THIS SECTION RUNS ONCE WHEN THE PAGE LOADS
$(function() {
    $('head').append('<style>.ui-icon, .ui-widget-content .ui-icon {background-image: none;}.closeCustomWindow {position: absolute;right: -12px;top: -12px;font-size: 20px;text-align: center;border-radius: 40px;border: 1px solid black;background: transparent linear-gradient(to bottom, #008681 0%, #003533 100%) repeat scroll 0% 0%;width: 30px;}.closeCustomWindow a {text-decoration: none;}.customWindowWrapper {display: none;z-index: 99;position: absolute !important;top: 120px;left: 15%;}.customWindowContent {padding: 5px;border-bottom-right-radius: 5px;border-bottom-left-radius: 5px}.customWindowContent table {width: 100%;font-size: 12px;}.customWindowContent tbody {border: 1px solid #01B0AA;border-top: none;}.customWindowContent th {text-align: center;color: #FF7;border: 1px solid #01B0AA;}.customWindowContent thead th {background-color: #01736D;font-size: 14px;}.customWindowContent td {text-align: center;}.customWindowContent .bRight {border-right: 1px solid #01B0AA;}</style>');
    if (ENABLE_CHAT_BATTLE_SWAP) {
        addChatSwap();
    }
    if (ENABLE_CHAT_USER_COLOR_PICKER) {
        addChatColorPicker();
    }
    if (ENABLE_XP_GOLD_RESOURCE_PER_HOUR) {
        addTimeCounter();
    }
    if (ENABLE_BATTLE_TRACKER) {
        addBattleTracker();
    }
    if (ENABLE_CLAN_DONATION_TABLE_MOD) {
        addClanDonationMod();
    }
    if (ENABLE_INGREDIENT_TRACKER) {
        addIngredientTracker();
    }
    if (ENABLE_DROP_TRACKER) {
        addDropTracker();
    }
    if (ENABLE_XP_GOLD_RESOURCE_PER_HOUR || ENABLE_DROP_TRACKER) {
        timeCounter();
        setInterval(timeCounter, 1000);
    }
    addMarketButton();

});

// THIS SECTION IS RUN EVERY TIME THE BROWSER RECEIVES A DYNAMIC UPDATE USING AJAX
$(document).ajaxComplete(function(event, xhr, settings) {
    if (settings.url == "autobattle.php" && (ENABLE_BATTLE_TRACKER || ENABLE_INGREDIENT_TRACKER)) {
        parseAutobattlePhp(JSON.parse(xhr.responseText));
    } else if (settings.url == "autotrade.php" && ENABLE_INGREDIENT_TRACKER) {
        parseAutoTradePhp(JSON.parse(xhr.responseText));
    } else if (settings.url == "autocraft.php" && ENABLE_INGREDIENT_TRACKER) {
        parseAutocraftPhp(JSON.parse(xhr.responseText));
    } else if (settings.url == "clan_donations.php" && ENABLE_CLAN_DONATION_TABLE_MOD) {
        parseClanDonationsPhp();
    } else if (settings.url == "reset_session_stats.php" && ENABLE_XP_GOLD_RESOURCE_PER_HOUR) {
        parseResetSessionStatsPhp();
    } else if (settings.url == "boosts.php") {
        parseBoostsPhp(JSON.parse(xhr.responseText));
    } else if (settings.url == "market.php") {
        $(document).ready(function() {
            addIngredientButton();
        });
    }
});

// FUNCTIONS TO ADD GUI AREAS TO THE DOM

function addTimeCounter() {
    $('#battleGains').find('td').first().removeAttr('colspan').after('<td class="timeCounter" title="' + Date.now() + '"><span class="timeCounterHr">00</span>:<span class="timeCounterMin">00</span>:<span class="timeCounterSec">00</span></td>');
    $('#tradeskillGains').find('td').first().removeAttr('colspan').after('<td class="timeCounter" title="' + Date.now() + '"><span class="timeCounterHr">00</span>:<span class="timeCounterMin">00</span>:<span class="timeCounterSec">00</span></td>');
    $('#craftingBoxGains').find('td').first().removeAttr('colspan').after('<td class="timeCounter" title="' + Date.now() + '"><span class="timeCounterHr">00</span>:<span class="timeCounterMin">00</span>:<span class="timeCounterSec">00</span></td>');
    $('#gainsXP').parent().after('<tr class="hidden-xs hidden-sm visible-md visible-lg" style="color: #' + perHourColor + '; font-size: ' + perHourSize + 'px"></td><td id="battleToLevel" colspan="2" style="text-align: center;"></td></tr>');
    $('#gainsXP').parent().after('<tr class="hidden-xs hidden-sm visible-md visible-lg" style="color: #' + perHourColor + '; font-size: ' + perHourSize + 'px"></td><td id="xpPerHr" colspan="2" style="text-align: center;"></td></tr>');
    $('#gainsGold').parent().after('<tr class="hidden-xs hidden-sm visible-md visible-lg" style="color: #' + perHourColor + '; font-size: ' + perHourSize + 'px"><td id="goldPerHr" colspan="2" style="text-align: center;"></td></tr>');
    $('#gainsClanXP').parent().after('<tr class="hidden-xs hidden-sm visible-md visible-lg" style="color: #' + perHourColor + '; font-size: ' + perHourSize + 'px"><td id="clanXpPerHr" colspan="2" style="text-align: center;"></td></tr>');
    $('#gainsClanGold').parent().after('<tr class="hidden-xs hidden-sm visible-md visible-lg" style="color: #' + perHourColor + '; font-size: ' + perHourSize + 'px"><td id="clanGoldPerHr" colspan="2" style="text-align: center;"></td></tr>');
    $('#gainsResources').parent().after('<tr class="visible-xs-inline-block visible-sm-inline-block visible-md visible-lg" style="color: #' + perHourColor + '; font-size: ' + perHourSize + 'px"><td id="resPerHr" colspan="2" style="text-align: center;"></td></tr>');
    $('#gainsClanResources').parent().after('<tr class="visible-xs-inline-block visible-sm-inline-block visible-md visible-lg" style="color: #' + perHourColor + '; font-size: ' + perHourSize + 'px"><td id="clanResPerHr" colspan="2" style="text-align: center;"></td></tr>');
    $('#bq_info').after('<div class="center"><span class="minsToQuest"></span></div>');
    $('#tq_info').after('<div class="center"><span class="minsToHarvestQuest"></span></div>');
}

function addChatColorPicker() {
    $('head').append('<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.8.0/spectrum.min.css"><style>.sp-replacer{border: 1px solid #01b0aa; background: #01736D;}</style>');
    $('#profileOptionProfile').after(' . <input type="text" id="profileOptionColor" />');

    // Initialize color picker
    $("#profileOptionColor").spectrum({
        showInput: true,
        showInitial: true,
        allowEmpty: true,
        clickoutFiresChange: false,
        change: function(color) {
            if (color === null && ($('#profileOptionUsername').text() in peopleMod)) {
                peopleMod[$('#profileOptionUsername').text()] = 'white';
                modChatColors();
                delete peopleMod[$('#profileOptionUsername').text()];
                savePeopleMod();
            } else {
                peopleMod[$('#profileOptionUsername').text()] = color.toHexString();
                modChatColors();
                savePeopleMod();
            }
        }
    });

    // Add observer to chat to change colors on new comments.
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes !== null)
                modChatColors();
            if ($('#profileOptionUsername').text() in peopleMod)
                $("#profileOptionColor").spectrum("set", peopleMod[$('#profileOptionUsername').text()]);
            else {
                $("#profileOptionColor").spectrum("set", '');
                //$('#profileOptionTooltip .sp-preview-inner').css('background-color', 'transparent');
                //$('#profileOptionTooltip .sp-preview-inner').addClass('sp-clear-display');
            }
        });
    });
    observer.observe($('#chatMessageList')[0], {
        childList: true,
        characterData: true
    });
    observer.observe($('#profileOptionTooltip')[0], {
        attributes: true,
        characterData: true
    });
}

function addBattleTracker() {
    // Add wrapper for the battle tracker
    $('#modalWrapper').after('<div id="battleTrackerWrapper" style="width: 450px;" class="container ui-element border2 ui-draggable customWindowWrapper"><div class="row"><h4 id="battleTrackerTitle" class="center toprounder ui-draggable-handle">Battle Tracker</h4><span id="closeBattleTracker" class="closeCustomWindow"><a>×</a></span><div class="customWindowContent"><table><thead><tr><th colspan="3">Battles: <span id="battleTrackerBattles"></span></th><th colspan="3">Rounds: <span id="battleTrackerRounds"></span></th></tr></thead><tbody><tr><th>Action</th><th style="border-right: none;">Count/Max</th><th style="border-left: none;">Percent</th><th style="border-right: none;">Min</th><th style="border-right: none; border-left: none;">Max</th><th style="border-left: none;">Average</th></tr><tr><td class="bRight">Hit</td><td id="battleTrackerHitCnt"></td><td id="battleTrackerHitPerc" class="bRight"></td><td id="battleTrackerHitMin"></td><td id="battleTrackerHitMax"></td><td id="battleTrackerHitAvg"></td></tr><tr><td class="bRight">Crit</td><td id="battleTrackerCritCnt"></td><td id="battleTrackerCritPerc" class="bRight"></td><td id="battleTrackerCritMin"></td><td id="battleTrackerCritMax"></td><td id="battleTrackerCritAvg"></td></tr><tr><td class="bRight">Spell</td><td id="battleTrackerSpellCnt"></td><td id="battleTrackerSpellPerc" class="bRight"></td><td id="battleTrackerSpellMin"></td><td id="battleTrackerSpellMax"></td><td id="battleTrackerSpellAvg"></td></tr><tr><td class="bRight">Counter</td><td id="battleTrackerCounterCnt"></td><td id="battleTrackerCounterPerc" class="bRight"></td><td id="battleTrackerCounterMin"></td><td id="battleTrackerCounterMax"></td><td id="battleTrackerCounterAvg"></td></tr><tr><td class="bRight">Heal</td><td id="battleTrackerHealCnt"></td><td id="battleTrackerHealPerc" class="bRight"></td><td id="battleTrackerHealMin"></td><td id="battleTrackerHealMax"></td><td id="battleTrackerHealAvg"></td></tr><tr><td class="bRight">Multistrike</td><td id="battleTrackerMultiCnt"></td><td id="battleTrackerMultiPerc" class="bRight"></td><td colspan="3"></td></tr><tr><tr><td class="bRight">Evade</td><td id="battleTrackerEvadeCnt"></td><td id="battleTrackerEvadePerc" class="bRight"></td><td colspan="3"></td></tr></tbody></table></div></div></div>');

    // Make it a draggable and resizable window
    $('#battleTrackerWrapper').draggable({
        handle: '#battleTrackerTitle'
    }).resizable({
        minHeight: 201,
        minWidth: 350
    });

    // Enable the close button on the battle tracker window
    $('#closeBattleTracker').on('click', function(e) {
        e.preventDefault();
        $('#battleTrackerWrapper').fadeOut('medium');
    });

    // Replace the Battle Stats label with one that opens the battle tracker window.
    $('#battleGains>h5').before('<a style="text-decoration: none;" onclick="$(\'#battleTrackerWrapper\').fadeIn(\'medium\');"><h5 class="toprounder center">Battle Stats</h5></a>').remove();
}

function addDropTracker() {
    // Add tracker content to the modal list
    $('#modalWrapper').after('<div id="dropsTrackerWrapper" style="width: 450px;" class="container ui-element border2 ui-draggable customWindowWrapper"><div class="row"><h4 id="dropsTrackerTitle" class="center toprounder ui-draggable-handle">Drop Tracker</h4><span id="closeDropsTracker" class="closeCustomWindow"><a>×</a></span><div class="customWindowContent"><table id="dropsTable"><thead><tr id="dropsTableTimer"><th class="bRight" style="max-width: 95px;">Categories</th><th colspan="2" class="bRight">Kills: <span class="numKills">0</span></th><th colspan="2" class="bRight">Harvests: <span class="numHarvests">0</span><th colspan="2" class="bRight">Crafts: <span class="numCrafts">0</span></th></th><th class="timeCounter" title="' + Date.now() + '" style="max-width: 80px;"><span class="timeCounterHr">00</span>:<span class="timeCounterMin">00</span>:<span class="timeCounterSec">00</span></th></tr></thead><tbody><tr><td class="bRight">Stats</td><td class="numStatsK">0</td><td class="bRight"><span class="percent" data-n="numStatsK" data-d="numKills">0.00</span> %</td><td class="numStatsH">0</td><td class="bRight"><span class="percent" data-n="numStatsH" data-d="numHarvests">0.00</span> %</td><td class="numStatsC">0</td><td class="bRight"><span class="percent" data-n="numStatsC" data-d="numCrafts">0.00</span> %</td><td id="statsPerHr"></td></tr><tr><td class="bRight">Loot</td><td class="numLootK">0</td><td class="bRight"><span class="percent" data-n="numLootK" data-d="numKills">0.00</span> %</td><td class="numLootH">0</td><td class="bRight"><span class="percent" data-n="numLootH" data-d="numHarvests">0.00</span> %</td><td class="numLootC">0</td><td class="bRight"><span class="percent" data-n="numLootC" data-d="numCrafts">0.00</span> %</td><td id="lootPerHr"></td></tr><tr><td class="bRight">Ingredients</td><td class="numIngredientsK">0</td><td class="bRight"><span class="percent" data-n="numIngredientsK" data-d="numKills">0.00</span> %</td><td class="numIngredientsH">0</td><td class="bRight"><span class="percent" data-n="numIngredientsH" data-d="numHarvests">0.00</span> %</td><td class="numIngredientsC">0</td><td class="bRight"><span class="percent" data-n="numIngredientsC" data-d="numCrafts">0.00</span> %</td><td id="ingredientsPerHr"></td></tr><tr><td class="bRight">Locket Quest Proc</td><td class="numQuestK">0</td><td class="bRight"><span class="percent"data-n="numQuestK" data-d="numKills">0.00</span>%</td><td class="numQuestH">0</td><td class="bRight"><span class="percent" data-n="numQuestH" data-d="numHarvests">0.00</span> %</td><td class="numQuestC">0</td><td class="bRight"><span class="percent" data-n="numQuestC" data-d="numCrafts">0.00</span> %</td><td id="LocketQuestPerHr"></td></tr><tr><td class="bRight">Quest Items</td><td class="itemQuestK">0</td><td class="bRight"><span class="percent"data-n="itemQuestK" data-d="numKills">0.00</span>%</td><td class="itemQuestH">0</td><td class="bRight"><span class="percent" data-n="itemQuestH" data-d="numHarvests">0.00</span> %</td><td class="itemQuestC">0</td><td class="bRight"><span class="percent" data-n="itemQuestC" data-d="numCrafts">0.00</span> %</td><td id="qItemPerHr"></td></tr><tr><td class="bRight">Total Platinum</td><td></td><td class="bRight"><span class="platTotalK">0</span></td><td></td><td class="bRight"><span class="platTotalH">0</span></td><td></td><td class="bRight"><span class="platTotalC">0</span></td><td id="platHour"></td></tr></tbody><thead><tr><th class="bRight">Stats</th><th colspan="2" class="bRight">K Stats: <span class="numStatsK">0</span></th><th colspan="2" class="bRight">H Stats: <span class="numStatsH">0</span></th><th colspan="2" class="bRight">C Stats: <span class="numStatsC">0</span></th><td><a id="resetDropTable">Reset</a></td></tr></thead><tbody><tr><td class="bRight">Strength</td><td class="strK">0</td><td class="bRight"><span class="percent" data-n="strK" data-d="numStatsK">0.00</span> %</td><td class="strH">0</td><td class="bRight"><span class="percent" data-n="strH" data-d="numStatsH">0.00</span> %</td><td class="strC">0</td><td class="bRight"><span class="percent" data-n="strC" data-d="numStatsC">0.00</span> %</td></tr><tr><td class="bRight">Health</td><td class="heaK">0</td><td class="bRight"><span class="percent" data-n="heaK" data-d="numStatsK">0.00</span> %</td><td class="heaH">0</td><td class="bRight"><span class="percent" data-n="heaH" data-d="numStatsH">0.00</span> %</td><td class="heaC">0</td><td class="bRight"><span class="percent" data-n="heaC" data-d="numStatsC">0.00</span> %</td></tr><tr><td class="bRight">Coordination</td><td class="coordK">0</td><td class="bRight"><span class="percent" data-n="coordK" data-d="numStatsK">0.00</span> %</td><td class="coordH">0</td><td class="bRight"><span class="percent" data-n="coordH" data-d="numStatsH">0.00</span> %</td><td class="coordC">0</td><td class="bRight"><span class="percent" data-n="coordC" data-d="numStatsC">0.00</span> %</td></tr><tr><td class="bRight">Agility</td><td class="agiK">0</td><td class="bRight"><span class="percent" data-n="agiK" data-d="numStatsK">0.00</span> %</td><td class="agiH">0</td><td class="bRight"><span class="percent" data-n="agiH" data-d="numStatsH">0.00</span> %</td><td class="agiC">0</td><td class="bRight"><span class="percent" data-n="agiC" data-d="numStatsC">0.00</span> %</td></tr><tr><td class="bRight">Counter</td><td class="counterK">0</td><td class="bRight"><span class="percent" data-n="counterK" data-d="numStatsK">0.00</span> %</td><td></td><td class="bRight"></td><td></td><td class="bRight"></td></tr><tr><td class="bRight">Healing</td><td class="healingK">0</td><td class="bRight"><span class="percent" data-n="healingK" data-d="numStatsK">0.00</span> %</td><td></td><td class="bRight"></td><td></td><td class="bRight"></td></tr><tr><td class="bRight">Weapon</td><td class="weaponK">0</td><td class="bRight"><span class="percent" data-n="weaponK" data-d="numStatsK">0.00</span> %</td><td></td><td class="bRight"></td><td></td><td class="bRight"></td></tr><tr><td class="bRight">Evasion</td><td class="evasionK">0</td><td class="bRight"><span class="percent" data-n="evasionK" data-d="numStatsK">0.00</span> %</td><td></td><td class="bRight"></td><td></td><td class="bRight"></td></tr></tbody><thead><tr><th class="bRight">Loot</th><th colspan="2" class="bRight">K Loot: <span class="numLootK">0</span></th><th colspan="2" class="bRight">H Loot: <span class="numLootH">0</span></th><th colspan="2" class="bRight">C Loot: <span class="numLootC">0</span></th></tr></thead><tbody><tr><td class="bRight">Gear & Gems</td><td class="gearK">0</td><td class="bRight"><span class="percent" data-n="gearK" data-d="numLootK">0.00</span> %</td><td class="gearH">0</td><td class="bRight"><span class="percent" data-n="gearH" data-d="numLootH">0.00</span> %</td><td class="gearC">0</td><td class="bRight"><span class="percent" data-n="gearC" data-d="numLootC">0.00</span> %</td></tr><tr><td class="bRight">Gold</td><td class="goldK">0</td><td class="bRight"><span class="percent" data-n="goldK" data-d="numLootK">0.00</span> %</td><td class="goldH">0</td><td class="bRight"><span class="percent" data-n="goldH" data-d="numLootH">0.00</span> %</td><td class="goldC">0</td><td class="bRight"><span class="percent" data-n="goldC" data-d="numLootC">0.00</span> %</td></tr><tr><td class="bRight">Platinum</td><td class="platK">0</td><td class="bRight"><span class="percent" data-n="platK" data-d="numLootK">0.00</span> %</td><td class="platH">0</td><td class="bRight"><span class="percent" data-n="platH" data-d="numLootH">0.00</span> %</td><td class="platC">0</td><td class="bRight"><span class="percent" data-n="platC" data-d="numLootC">0.00</span> %</td></tr><tr><td class="bRight">Crafting Mats</td><td class="craftK">0</td><td class="bRight"><span class="percent" data-n="craftK" data-d="numLootK">0.00</span> %</td><td class="craftH">0</td><td class="bRight"><span class="percent" data-n="craftH" data-d="numLootH">0.00</span> %</td><td class="craftC">0</td><td class="bRight"><span class="percent" data-n="craftC" data-d="numLootC">0.00</span> %</td></tr><tr><td class="bRight">Gem Fragment</td><td class="fragK">0</td><td class="bRight"><span class="percent" data-n="fragK" data-d="numLootK">0.00</span> %</td><td class="fragH">0</td><td class="bRight"><span class="percent" data-n="fragH" data-d="numLootH">0.00</span> %</td><td class="fragC">0</td><td class="bRight"><span class="percent" data-n="fragC" data-d="numLootC">0.00</span> %</td></tr><tr><td class="bRight">Crystals (lol)</td><td class="crystalK">0</td><td class="bRight"><span class="percent" data-n="crystalK" data-d="numLootK">0.00</span> %</td><td class="crystalH">0</td><td class="bRight"><span class="percent" data-n="crystalH" data-d="numLootH">0.00</span> %</td><td class="crystalC">0</td><td class="bRight"><span class="percent" data-n="crystalC" data-d="numLootC">0.00</span> %</td></tr></tbody></table></div></div></div>');
    $('#resetDropTable').on('click', function() {
        $('#dropsTableTimer .timeCounter').attr('title', Date.now());
        $('#dropsTableTimer .timeCounter>span').text('00');
        $('.numKills, .numHarvests, .numStatsK, .numStatsH, .numLootK, .numLootH, .numIngredientsK, .numIngredientsH, .strK, .strH, .strC, .heaK, .heaH, .heaC, .coordK, .coordH, .coordC, .agiK, .agiH, .agiC, .counterK, .healingK, .weaponK, .evasionK, .gearK, .gearH, .gearC, .goldK, .goldH, .goldC, .platK, .platH, .craftK, .craftH, .craftC, .fragK, .fragH, .fragC, .crystalK, .crystalH, .crystalC, .numQuestH, .numQuestK, .numQuestC, .itemQuestH, .itemQuestK, .itemQuestC, .platTotalK, .platTotalH, .numCrafts, .numStatsC, .platC, .platTotalC, .numLootC, .numIngredientsC').text('0');
        $('.percent').text('0.00');
    });

    // Make it a draggable and resizable window
    $('#dropsTrackerWrapper').draggable({
        handle: '#dropsTrackerTitle'
    }).resizable({
        minHeight: 397,
        minWidth: 350
    });

    // Enable the close button on the battle tracker window
    $('#closeDropsTracker').on('click', function(e) {
        e.preventDefault();
        $('#dropsTrackerWrapper').fadeOut('medium');
    });

    // Replace the Recent Activity label with one that opens the drop tracker window.
    $('#activityWrapper>h5').before('<a style="text-decoration: none;" onclick="$(\'#dropsTrackerWrapper\').fadeIn(\'medium\');"><h5 class="center toprounder">Recent Activity</h5></a>').remove();
}

function addClanDonationMod() {
    // Add a checkbox button and lable to the clan donators list tab.
    $('#myClanDonationTable').before('<label style="display: block; padding-left: 15px; text-indent: -15px; margin-top:-25px"><input type="checkbox" id="toggleDonationPercent" style="width: 13px; height: 13px; padding: 0; margin: 0; vertical-align: bottom; position: relative; top: -3px; *overflow: hidden;" /> Show %</label>');

    // Enable the checkbox to toggle the values in the table from original to percentages and back.
    $('#toggleDonationPercent').change(function() {
        var format = $(this).is(':checked') ? 'percFormat' : 'origFormat';
        $('.donator_list_crystals, .donator_list_platinum, .donator_list_gold, .donator_list_food, .donator_list_wood, .donator_list_iron, .donator_list_stone, .donator_list_experience').each(function() {
            $(this).text($(this).attr(format));
        });
    });
}

function addIngredientTracker() {
    // Add wrapper for the ingredient tracker
    $('#modalWrapper').after('<div id="ingredientTrackerWrapper" style="width: 300px" class="container ui-element border2 ui-draggable customWindowWrapper"><div class="row"><h4 id="ingredientTrackerTitle" class="center toprounder ui-draggable-handle">Ingredient Tracker</h4><span id="closeIngredientTracker" class="closeCustomWindow"><a>×</a></span><div class="customWindowContent"><div id="ingredientTrackerContentWrapper" style="height: 250px;"><table><thead><tr><th>Ingredient</th><th>Enemy / Tool</th></tr></thead><tbody id="ingredientDropList">' + loadIngredientDropList() + '</tbody></table></div></div></div></div>');

    // Make it a draggable and resizable window
    $('#ingredientTrackerWrapper').draggable({
        handle: '#ingredientTrackerTitle'
    }).resizable({
        minHeight: 200,
        minWidth: 300,
        resize: function(e, ui) {
            $('#ingredientTrackerContentWrapper').height($('#ingredientTrackerWrapper').height() - $('#ingredientTrackerTitle').outerHeight(true) - 10);
        }
    });

    // Enable the close button on the ingredient tracker window
    $('#closeIngredientTracker').on('click', function(e) {
        e.preventDefault();
        $('#ingredientTrackerWrapper').fadeOut('medium');
    });

    $('#ingredientTrackerContentWrapper').mCustomScrollbar();

    // Replace the Ingredient Stats label with one that opens the ingredient tracker window.
    $('#clearLootGains').after('<a style="float: right; margin-right: 15px; text-decoration: none;" onclick="$(\'#ingredientTrackerWrapper\').fadeIn(\'medium\');">Ingredient Tracker</a>');
}

function addChatSwap() {
    if (typeof Storage == "undefined")
        alert('Local Storage is not supported on this browser. Chat Swap preference will not be saved next session');
    var arrow = "▼";
    if (localStorage.chatmove == "true") {
        var e1 = $('#contentWrapper'),
            e2 = $('#chatWrapper');
        e1.insertAfter(e2);
        e2.insertAfter('#navWrapper');
        $('#effectInfo').insertBefore('#activityWrapper');
        $('#houseNotificationWrapper').insertBefore('#activityWrapper');
        arrow = "▲";
        $('#chatMessageListWrapper').height($('#bottomWrapper').offset().top - $('#chatMessageListWrapper').offset().top - 2);
    }
    $('<div style="position: absolute;font-size: 14px;color: #01B0AA;left: 12px;cursor: pointer;padding: 1px;" font-size:="">' + arrow + '</div>').prependTo('#areaWrapper>h5').click(function() {
        localStorage.chatmove = !(localStorage.chatmove == "true");
        var e1 = $('#chatWrapper'),
        		e2 = $('#contentWrapper');
        if (localStorage.chatmove == "true") {
            e1 = $('#contentWrapper');
            e2 = $('#chatWrapper');
            $('#effectInfo').insertBefore('#activityWrapper');
            $('#houseNotificationWrapper').insertBefore('#activityWrapper');
            $(this).html('▲');
        } else {
            $('#effectInfo').appendTo('#rightWrapper');
            $('#houseNotificationWrapper').appendTo('#rightWrapper');
            $(this).html('▼');
        }
        e1.insertAfter(e2);
        e2.insertAfter('#navWrapper');
        $('#chatMessageListWrapper').height($('#bottomWrapper').offset().top - $('#chatMessageListWrapper').offset().top - 2);
    });
}

// PARSE A VARIETY OF INCOMING JSON DATA

function parseBoostsPhp(data) {
    $('#permanentBoostWrapper>div:eq(5)').find('input.boost_count').val();
    var curReduced = 100 - 100 / (1 + data.boosts[4].tv / 100);
    var nxtReduced = 100 - 100 / (1 + (data.boosts[4].tv + 1) / 100);
    $('#questBoostInfo').remove();
    $('#permanentBoostWrapper>div:eq(5)>div:eq(1)').find('div.boost_unmaxed').before('<span id="questBoostInfo" style="position: absolute;left: 0;">Cur: (' + curReduced.toFixed(2) + '%)<br />Nxt: (' + nxtReduced.toFixed(2) + '%)</span>');
}

function parseAutocraftPhp(craft) {
    if (ENABLE_QUEST_COMPLETE_NOTICE && (craft.a.qf.indexOf("You have completed your quest!  Visit the") > -1)) {
        fadeOutNonQuest();
    } else if (questNoticeOn) {
        fadeInNonQuest();
    }

    if (craft.a.m && ENABLE_DROP_TRACKER) {
        incrementCell('numCrafts');

        if (craft.a.qf.indexOf("The Questmaster") > -1) {
            incrementCell('numQuestC');
        }

        if (craft.a.qf.indexOf("You found") > -1) {
            incrementCell('itemQuestC');
        }

        if (craft.a.sr) {
            incrementCell('numStatsC');
            var id = "";
            switch (/.*?>(.*?)</im.exec(craft.a.sr)[1]) {
                case 'strength':
                    id = 'strC';
                    break;
                case 'health':
                    id = 'heaC';
                    break;
                case 'coordination':
                    id = 'coordC';
                    break;
                case 'agility':
                    id = 'agiC';
                    break;
            }
            incrementCell(id);
        }

        if (craft.a.dr && ((craft.a.dr.indexOf("platinum coin") > -1))) {
            incrementCell('platC');
            var id = 'platTotalC';
            var cutoff = craft.a.dr.indexOf('platinum coin');
            var platInc = craft.a.dr.substring(0, cutoff);
            var platT = platInc.replace(/\D+/g, '');
            incrementC(id, Number(platT));
        }
        if (craft.a.dr) {
            incrementCell('numLootC');
            var id = "";
            switch (/(Tooltip).*?>|>.*?(platinum coin|gold coin|crafting|gem frag|crystal).*?</.exec(craft.a.dr).splice(1, 2).join("")) {
                case 'Tooltip':
                    id = "gearC";
                    break;
                case 'gold coin':
                    id = "goldC";
                    break;
                case 'crafting':
                    id = "craftC";
                    break;
                case 'gem frag':
                    id = "fragC";
                    break;
                case 'crystal':
                    id = "crystalC";
            }
            incrementCell(id);
        }
        calcPercentCells();
    }
}

function parseAutobattlePhp(battle) {
    if (ENABLE_QUEST_COMPLETE_NOTICE && battle.b.qf.indexOf("You have completed your quest!  Visit the") > -1) {
        fadeOutNonQuest();
    } else if (questNoticeOn) {
        fadeInNonQuest();
    }

    // An ingredient has dropped for Ingredient Tracker
    if (battle.b.ir && ENABLE_INGREDIENT_TRACKER) {
        if (typeof Storage !== "undefined") {
            if (!localStorage.LocDrops) {
                localStorage.LocDrops = "{}";
            }
            var item = (battle.b.ir).replace(/\+|<.*?>/img, "");
            var enemy = battle.b.m.n;
            var drops = JSON.parse(localStorage.LocDrops);
            if (drops[item] === undefined) {
                drops[item] = {};
            }
            drops[item][enemy] = "";
            localStorage.LocDrops = JSON.stringify(drops);
        } else {
            console.log("No Web Storage support to track drops.");
            $('#ingredientDropList').html(loadIngredientDropList());
        }
    }

    // Battle was won and Drop Tracker enabled
    if (battle.b.r && ENABLE_DROP_TRACKER) {
        incrementCell('numKills');

        if (battle.b.qf.indexOf("The Questmaster") > -1) {
            incrementCell('numQuestK');
        }

        if (battle.b.qf.indexOf("You found") > -1) {
            incrementCell('itemQuestK');
        }

        // This means an ingredient has dropped
        if (battle.b.ir)
            incrementCell('numIngredientsK');

        // This means a stat has dropped
        if (battle.b.sr) {
            incrementCell('numStatsK');
            var id = "";
            switch (/.*?>(.*?)</im.exec(battle.b.sr)[1]) {
                case 'strength':
                    id = 'strK';
                    break;
                case 'health':
                    id = 'heaK';
                    break;
                case 'coordination':
                    id = 'coordK';
                    break;
                case 'agility':
                    id = 'agiK';
                    break;
                case 'counter attacking':
                case 'counter attack':
                    id = 'counterK';
                    break;
                case 'healing':
                    id = 'healingK';
                    break;
                case 'evasion':
                    id = 'evasionK';
                    break;
                case 'unarmed combat':
                case 'melee weapons':
                case 'ranged weapons':
                case 'magical weapons':
                    id = 'weaponK';
            }
            incrementCell(id);
        }

        // this counts platinum coin drops and platinum coin totals!
        if (battle.b.dr && ((battle.b.dr.indexOf("platinum coin") > -1))) {
            incrementCell('platK');
            var id = 'platTotalK';
            var cutoff = battle.b.dr.indexOf('platinum coin');
            var platInc = battle.b.dr.substring(0, cutoff);
            var platT = platInc.replace(/\D+/g, '');
            incrementC(id, Number(platT));
        }
        // This means loot has dropped
        if (battle.b.dr) {
            incrementCell('numLootK');
            var id = "";
            switch (/(Tooltip).*?>|>.*?(platinum coin|gold coin|crafting|gem frag|crystal).*?</.exec(battle.b.dr).splice(1, 2).join("")) {
                case 'Tooltip':
                    id = "gearK";
                    break;
                case 'gold coin':
                    id = "goldK";
                    break;
                case 'crafting':
                    id = "craftK";
                    break;
                case 'gem frag':
                    id = "fragK";
                    break;
                case 'crystal':
                    id = "crystalK";
            }
            incrementCell(id);
        }
        calcPercentCells();
    }

    // Everything after this is for the Battle Tracker
    // Also, we cannot track combat if round-by-round option is not on.
    if (battle.b.bt === null || !ENABLE_BATTLE_TRACKER)
        return;

    numBattles++;
    numRounds += battle.b.ro;
    numAttacksTaken += battle.b.p.d + battle.b.m.h;

    numCounters += battle.b.p.ca;
    counterTot += battle.b.p.cd;
    counterAvg = (counterTot / numCounters).toFixed(0);
    numSpells += battle.b.p.sc;
    spellTot += battle.b.p.sd;
    spellAvg = (spellTot / numSpells).toFixed(0);
    numHeals += battle.b.p.hep;
    healTot += battle.b.p.he;
    healAvg = (healTot / numHeals).toFixed(0);
    numEvade += battle.b.p.d;

    var takenDamage = false;
    // Loop through the actions.
    for (var act of battle.b.bt) {
        if (act.npc === null)
            if (act.type == "heal") {
                healMax = Math.max(healMax, act.dmg);
                healMin = Math.min(healMin, act.dmg);
            } else if (act.type == "counter") {
            counterMax = Math.max(counterMax, act.dmg);
            counterMin = Math.min(counterMin, act.dmg);
        } else if (act.type == "spell") {
            spellMax = Math.max(spellMax, act.dmg);
            spellMin = Math.min(spellMin, act.dmg);
        } else if (act.type == "hit") {
            // Track other variables
            numAttacks += act.hits + act.misses;
            numHits += act.hits;
            numMisses += act.misses;
            numCrits += act.crit;
            if (act.hits + act.misses > 1) {
                numMulti += act.hits + act.misses - 1;
                // If all attacks in multi are crit, add to crit total. Min/Max not tracked across multistrike.
                if (act.hits == act.crit) {
                    critTot += act.dmg;
                }
                // If no attacks in multi are crit, add to hit total. Min/Max not tracked across multistrike.
                else if (!act.crit) {
                    hitTot += act.dmg;
                }
                // If some attacks in multi are crit but not all, we cannot track totals properly so tally up untracked hits to get a proper average.
                else {
                    numUntrackedHits += act.hits;
                    numUntrackedCrits += act.crit;
                }
            } else if (act.crit) {
                critTot += act.dmg;
                critMax = Math.max(critMax, act.dmg);
                critMin = Math.min(critMin, act.dmg);
                critAvg = (critTot / (numCrits - numUntrackedCrits)).toFixed(0);
            } else {
                hitTot += act.dmg;
                hitMax = Math.max(hitMax, act.dmg);
                if (act.dmg) {
                    hitMin = Math.min(hitMin, act.dmg);
                }
                hitAvg = (hitTot / (numHits - numCrits - numUntrackedHits + numUntrackedCrits)).toFixed(0);
            }
        } else {
            console.log("Unknown player attack type: " + act.type + ": " + xhr.responseText);
        } else {
            if (act.type == "hit") {
                if (act.hits && act.dmg) {
                    takenDamage = true;
                }
                if (takenDamage) {
                    numHealableRounds++;
                }
            } else {
                console.log("Unknown enemy attack type: " + act.type + ": " + xhr.responseText);
            }
        }
    }
    if (!battle.b.r) {
        numHealableRounds--;
    }

    // Update the table in the battle tracker window
    $('#battleTrackerBattles').text(numBattles);
    $('#battleTrackerRounds').text(numRounds);
    $('#battleTrackerHitCnt').text(numHits + ' / ' + numAttacks);
    $('#battleTrackerHitPerc').text((numHits * 100 / numAttacks).toFixed(2) + " %");
    if (numHits) {
        $('#battleTrackerHitMin').text(hitMin);
        $('#battleTrackerHitMax').text(hitMax);
        $('#battleTrackerHitAvg').text(hitAvg);
    }
    $('#battleTrackerCritCnt').text(numCrits + ' / ' + numHits);
    $('#battleTrackerCritPerc').text((numCrits * 100 / numHits).toFixed(2) + " %");
    if (numCrits) {
        $('#battleTrackerCritMin').text(critMin);
        $('#battleTrackerCritMax').text(critMax);
        $('#battleTrackerCritAvg').text(critAvg);
    }
    $('#battleTrackerSpellCnt').text(numSpells + ' / ' + numHits);
    $('#battleTrackerSpellPerc').text((numSpells * 100 / numHits).toFixed(2) + " %");
    if (numSpells) {
        $('#battleTrackerSpellMin').text(spellMin);
        $('#battleTrackerSpellMax').text(spellMax);
        $('#battleTrackerSpellAvg').text(spellAvg);
    }
    $('#battleTrackerCounterCnt').text(numCounters + ' / ' + numAttacksTaken);
    $('#battleTrackerCounterPerc').text((numCounters * 100 / numAttacksTaken).toFixed(2) + " %");
    if (numCounters) {
        $('#battleTrackerCounterMin').text(counterMin);
        $('#battleTrackerCounterMax').text(counterMax);
        $('#battleTrackerCounterAvg').text(counterAvg);
    }
    $('#battleTrackerHealCnt').text(numHeals + ' / ' + numHealableRounds);
    $('#battleTrackerHealPerc').text((numHeals * 100 / numHealableRounds).toFixed(2) + " %");
    if (numHeals) {
        $('#battleTrackerHealMin').text(healMin);
        $('#battleTrackerHealMax').text(healMax);
        $('#battleTrackerHealAvg').text(healAvg);
    }
    $('#battleTrackerMultiCnt').text(numMulti + ' / ' + numRounds);
    $('#battleTrackerMultiPerc').text((numMulti * 100 / numRounds).toFixed(2) + " %");
    $('#battleTrackerEvadeCnt').text(numEvade + ' / ' + numAttacksTaken);
    $('#battleTrackerEvadePerc').text((numEvade * 100 / numAttacksTaken).toFixed(2) + " %");
}

function parseAutoTradePhp(harvest) {
    if (ENABLE_QUEST_COMPLETE_NOTICE && harvest.a.qf.indexOf("You have completed your quest!  Visit the") > -1) {
        fadeOutNonQuest();
    } else if (questNoticeOn) {
        fadeInNonQuest();
    }

    // Track Location Drops
    if (ENABLE_INGREDIENT_TRACKER) {
        if (harvest.a.ir) {
            var item = (harvest.a.ir).replace(/\+|<.*?>/img, "");
            var tool = harvest.a.t;
            if (typeof Storage !== "undefined") {
                if (!localStorage.LocDrops)
                    localStorage.LocDrops = "{}";
                var drops = JSON.parse(localStorage.LocDrops);
                if (drops[item] === undefined) {
                    drops[item] = {};
                }
                drops[item][tool] = "";
                localStorage.LocDrops = JSON.stringify(drops);
            } else {
                console.log("No Web Storage support to track drops.");
            }
            $('#ingredientDropList').html(loadIngredientDropList());
        }
    }

    // Drop Tracker enabled
    if (ENABLE_DROP_TRACKER) {
        incrementCell('numHarvests');

        if (harvest.a.qf[1].indexOf("The Questmaster") > -1) {
            incrementCell('numQuestH');
        }

        if (harvest.a.qf[1].indexOf("You found") > -1) {
            incrementCell('itemQuestH');
        }

        // This means an ingredient has dropped
        if (harvest.a.ir) {
            incrementCell('numIngredientsH');
        }

        if (harvest.a.ir) {
            incrementCell('numQuestH');
        }

        // This means a stat has dropped
        if (harvest.a.sr) {
            incrementCell('numStatsH');
            var id = "";
            switch (/\+.*?>(.*?)</im.exec(harvest.a.sr)[1]) {
                case 'strength':
                    id = 'strH';
                    break;
                case 'health':
                    id = 'heaH';
                    break;
                case 'coordination':
                    id = 'coordH';
                    break;
                case 'agility':
                    id = 'agiH';
                    break;
                default:
                    console.log('Unknown Harvest Stat Drop: ' + harvest.a.sr);
            }
            incrementCell(id);
        }
        // counts platinum coins found while harvesting
        if (harvest.a.dr && (harvest.a.dr.indexOf("platinum coins") > -1)) {
            var id = 'platTotalH';
            var platInc = Number((harvest.a.dr.match(/(\d+|\d{1,3}(,\d{3})*)(\.\d+)? platinum coin/)[1] || 0));
            var cutoff = harvest.a.dr.indexOf('platinum coin');
            var platInc = harvest.a.dr.substring(0, cutoff);
            var platT = platInc.replace(/\D+/g, '');
            incrementC(id, Number(platT));
        }

        // This means loot has dropped
        if (harvest.a.dr) {
            incrementCell('numLootH');
            var id = "";
            switch (/(Tooltip).*?>|>.*?(gold coin|crafting|gem frag|crystal).*?</.exec(harvest.a.dr).splice(1, 2).join("")) {
                case 'Tooltip':
                    id = "gearH";
                    break;
                case 'gold coin':
                    id = "goldH";
                    break;
                case 'crafting':
                    id = "craftH";
                    break;
                case 'gem frag':
                    id = "fragH";
                    break;
                case 'crystal':
                    id = "crystalH";
                		break;
                default:
                    console.log('Unknown Harvest Loot Drop: ' + harvest.a.dr);
            }
            incrementCell(id);
        }
        calcPercentCells();
    }
}

function parseClanDonationsPhp() {
    var tCryst = 0,
        tPlat = 0,
        tGold = 0,
        tFood = 0,
        tWood = 0,
        tIron = 0,
        tStone = 0,
        tExp = 0;
    $('#toggleDonationPercent').attr("checked", false);

    // Get totals from each resource column
    $('.donator_list_crystals').each(function() {
        tCryst += parseInt($(this).attr('title').replace(/,/g, ''));
    });
    $('.donator_list_platinum').each(function() {
        tPlat += parseInt($(this).attr('title').replace(/,/g, ''));
    });
    $('.donator_list_gold').each(function() {
        tGold += parseInt($(this).attr('title').replace(/,/g, ''));
    });
    $('.donator_list_food').each(function() {
        tFood += parseInt($(this).attr('title').replace(/,/g, ''));
    });
    $('.donator_list_wood').each(function() {
        tWood += parseInt($(this).attr('title').replace(/,/g, ''));
    });
    $('.donator_list_iron').each(function() {
        tIron += parseInt($(this).attr('title').replace(/,/g, ''));
    });
    $('.donator_list_stone').each(function() {
        tStone += parseInt($(this).attr('title').replace(/,/g, ''));
    });
    $('.donator_list_experience').each(function() {
        tExp += parseInt($(this).attr('title').replace(/,/g, ''));
    });

    // Add additional attributes to each cell that contain it's original value and the percent format
    $('.donator_list_crystals').each(function() {
        $(this).attr({
            'origFormat': $(this).text(),
            'percFormat': (parseInt($(this).attr('title').replace(/,/g, '')) * 100 / tCryst).toFixed(2) + " %"
        });
    });
    $('.donator_list_platinum').each(function() {
        $(this).attr({
            'origFormat': $(this).text(),
            'percFormat': (parseInt($(this).attr('title').replace(/,/g, '')) * 100 / tPlat).toFixed(2) + " %"
        });
    });
    $('.donator_list_gold').each(function() {
        $(this).attr({
            'origFormat': $(this).text(),
            'percFormat': (parseInt($(this).attr('title').replace(/,/g, '')) * 100 / tGold).toFixed(2) + " %"
        });
    });
    $('.donator_list_food').each(function() {
        $(this).attr({
            'origFormat': $(this).text(),
            'percFormat': (parseInt($(this).attr('title').replace(/,/g, '')) * 100 / tFood).toFixed(2) + " %"
        });
    });
    $('.donator_list_wood').each(function() {
        $(this).attr({
            'origFormat': $(this).text(),
            'percFormat': (parseInt($(this).attr('title').replace(/,/g, '')) * 100 / tWood).toFixed(2) + " %"
        });
    });
    $('.donator_list_iron').each(function() {
        $(this).attr({
            'origFormat': $(this).text(),
            'percFormat': (parseInt($(this).attr('title').replace(/,/g, '')) * 100 / tIron).toFixed(2) + " %"
        });
    });
    $('.donator_list_stone').each(function() {
        $(this).attr({
            'origFormat': $(this).text(),
            'percFormat': (parseInt($(this).attr('title').replace(/,/g, '')) * 100 / tStone).toFixed(2) + " %"
        });
    });
    $('.donator_list_experience').each(function() {
        $(this).attr({
            'origFormat': $(this).text(),
            'percFormat': (parseInt($(this).attr('title').replace(/,/g, '')) * 100 / tExp).toFixed(2) + " %"
        });
    });
}

function parseResetSessionStatsPhp() {
    $('#battleGains .timeCounter, #tradeskillGains .timeCounter, #craftingBoxGains .timeCounter').attr('title', Date.now());
    $('#battleGains .timeCounter>span, #tradeskillGains .timeCounter>span, #craftingBoxGains .timeCounter>span').text('00');
}

// ADDITIONAL FUNCTIONS
function incrementCell(id) {
    $('.' + id).text(parseInt($('.' + id).first().text()) + 1);
}

function incrementC(id, amount) {
    $('.' + id).text(parseInt($('.' + id).first().text()) + amount);
}

function calcPercentCells() {
    $('.percent').each(function() {
        var idN = parseInt($('.' + $(this).attr('data-n')).first().text());
        var idD = parseInt($('.' + $(this).attr('data-d')).first().text());
        if (idD != 0) {
            $(this).text((idN * 100 / idD).toFixed(2));
        }
    });
}

function unique(list) {
    var result = [];
    $.each(list, function(i, e) {
        if ($.inArray(e, result) == -1) result.push(e);
    });
    return result;
}

function timeCounter() {
    if (ENABLE_XP_GOLD_RESOURCE_PER_HOUR) {

        //  Starting here grab the numbers required for calculating the # of battles until level
        var btlC = $('#currentXP').attr('title');
        var batCur = (btlC).replace(/\D+/g, '');
        var btlT = $('#levelCost').text().replace(/[^0-9\.]+/g, '');
        var batTot;

        if ((Number(btlT) <= 10000) && (Number(btlT) >= 100)) {
            batTot = Number(Number(btlT) * 1000000);
        } else if (Number(btlT) <= 99.99) {
            batTot = Number(Number(btlT) * 1000000000);
        } else if (Number(btlT) > 10000) {
            batTot = Number(btlT);
        }

        var batNum = $('.battleExpGain').eq(0).text().replace(/\D+/g, '');
        // Ends here

        var diffSec = Math.round((Date.now() - Number($('#battleGains .timeCounter').first().attr('title'))) / 1000);

        $('#battleGains .timeCounterHr, #tradeskillGains .timeCounterHr, #craftingBoxGains .timeCounterHr').text(('0' + Math.floor(diffSec / 3600)).slice(-2));
        $('#battleGains .timeCounterMin, #tradeskillGains .timeCounterMin, #craftingBoxGains .timeCounterMin').text(('0' + Math.floor(diffSec / 60) % 60).slice(-2));
        $('#battleGains .timeCounterSec, #tradeskillGains .timeCounterSec, #craftingBoxGains .timeCounterSec').text(('0' + diffSec % 60).slice(-2));
        $('#xpPerHr').text(Math.floor(Number($('#gainsXP').attr('data-value')) / (diffSec / 3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
        $('#clanXpPerHr').text(Math.floor(Number($('#gainsClanXP').attr('data-value')) / (diffSec / 3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
        $('#goldPerHr').text(Math.floor(Number($('#gainsGold').attr('data-value')) / (diffSec / 3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
        $('#clanGoldPerHr').text(Math.floor(Number($('#gainsClanGold').attr('data-value')) / (diffSec / 3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
        $('#resPerHr').text(Math.floor(Number($('#gainsResources').attr('data-value')) / (diffSec / 3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
        $('#clanResPerHr').text(Math.floor(Number($('#gainsClanResources').attr('data-value')) / (diffSec / 3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
        $('#battleToLevel').text(Math.floor((Number(batTot) - Number(batCur)) / Number(batNum)).toString() + " kills until level.");



    }

    if (ENABLE_DROP_TRACKER) {
        // starting here, this is the quest length calculator
        var diffSec = Math.round((Date.now() - Number($('#dropsTableTimer .timeCounter').first().attr('title'))) / 1000);
        var timeInSeconds = Math.floor(diffSec);
        var numKills = $('.numKills').text();
        var killsPerSec = (Number(numKills) / timeInSeconds);
        var killsPerMin = (killsPerSec * 60);
        var questCur = $('#bq_info').children('span').eq(0).text().replace(/\D+/g, '');
        var questTot = $('#bq_info').children('span').eq(1).text().replace(/\D+/g, '');
        var timeForQuest = (Number(questTot) - Number(questCur)) / Number(killsPerMin);
        var tfq;

// battle quest calc
        if ($('#bq_info').text().indexOf("Recover") > -1) {
            tfq = ((timeForQuest * 10) / 10);
            var qP = Number($(".itemQuestK").text());
            tfq = Math.floor((tfq / (qP / numKills)));
            // if quest timer is below 60, use minutes
            if (tfq < 60) {
                $('.minsToQuest').text("Around " + (tfq).toString() + " minutes left.");
            }
            // if quest timer is above 59, use hours and minutes.
            else if (tfq > 59) {
                var hourz = ((tfq - (tfq % 60)) / 60);
                tfq = (tfq - (hourz * 60));
                $('.minsToQuest').text("Around " + (hourz).toString() + " hrs " + (tfq).toString() + " minutes left.");
            }
        } else {
            tfq = Math.floor(((timeForQuest * 10) / 10));

            // if quest time is below 60, use minutes
            if (tfq < 60) {
                $('.minsToQuest').text("Around " + (tfq).toString() + " minutes left.");
            }
            // if quest timer is above 59 minutes use hrs and minutes.
            else if (tfq > 59) {
                var hourz = ((tfq - (tfq % 60)) / 60);
                tfq = (tfq - (hourz * 60));
                $('.minsToQuest').text("Around " + (hourz).toString() + " hrs " + (tfq).toString() + " minutes left.");
            }
        }

// harvest quest calculator

        if ($('#tq_info').text().length > -1) {
            var numHarvs = $('.numHarvests').text();
            var harvestsPerSec = (Number(numHarvs) / timeInSeconds);
            var harvestsPerMin = (harvestsPerSec * 60);
            var qC = $('#tq_info').children('span').eq(0).text().replace(/\D+/g, '');
            var qT = $('#tq_info').children('span').eq(1).text().replace(/\D+/g, '');
            var timeForHarvQuest = (Number(qT) - Number(qC)) / Number(harvestsPerMin);
            var tfqh;

            tfqh = Math.floor(((timeForHarvQuest * 10) / 10));
            // if quest timer is below 60, use minutes
            if (tfqh < 60) {
                $('.minsToHarvestQuest').text("Around " + (tfqh).toString() + " minutes left.");
            }
            // if quest timer is above 59, use hours and minutes.
            else if (tfqh > 59) {
                var hourz = ((tfqh - (tfqh % 60)) / 60);
                tfqh = (tfqh - (hourz * 60));
                $('.minsToHarvestQuest').text("Around " + (hourz).toString() + " hrs " + (tfqh).toString() + " minutes left.");
            }
        }

        // quest time calculator ends here.

        $('#dropsTableTimer .timeCounterHr').text(('0' + Math.floor(diffSec / 3600)).slice(-2));
        $('#dropsTableTimer .timeCounterMin').text(('0' + Math.floor(diffSec / 60) % 60).slice(-2));
        $('#dropsTableTimer .timeCounterSec').text(('0' + diffSec % 60).slice(-2));
        $('#statsPerHr').text(Math.floor((Number($('.numStatsK').first().text()) + Number($('.numStatsH').first().text()) + Number($('.numStatsC').first().text())) / (diffSec / 3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
        $('#lootPerHr').text(Math.floor((Number($('.numLootK').first().text()) + Number($('.numLootH').first().text()) + Number($('.numLootC').first().text())) / (diffSec / 3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
        $('#ingredientsPerHr').text(Math.floor((Number($('.numIngredientsK').first().text()) + Number($('.numIngredientsH').first().text()) + Number($('.numIngredientsC').first().text())) / (diffSec / 3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
        $('#LocketQuestPerHr').text(Math.floor((Number($('.numQuestK').first().text()) + Number($('.numQuestH').first().text()) + Number($('.numQuestC').first().text())) / (diffSec / 3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
        $('#qItemPerHr').text(Math.floor((Number($('.itemQuestK').first().text()) + Number($('.itemQuestH').first().text()) + Number($('.itemQuestC').first().text())) / (diffSec / 3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
        $('#platHour').text(Math.floor((Number($('.platTotalK').first().text()) + Number($('.platTotalH').first().text()) + Number($('.platTotalC').first().text())) / (diffSec / 3600)).toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") + " / Hr");
    }
}

function loadIngredientDropList() {
    var dropList = "";
    if (!localStorage.LocDrops || localStorage.LocDrops == "{}") {
        return "";
    }
    var drops = JSON.parse(localStorage.LocDrops);
    for (var drop in drops) {
        dropList += '<tr><td rowspan="' + Object.keys(drops[drop]).length + '">' + drop + '</td>';
        for (var enemy in drops[drop]) {
            dropList += "<td>" + enemy + "</td></tr><tr>";
        }
        dropList = dropList.slice(0, -4);
    }
    return dropList;
}

function fadeOutNonQuest() {
    $('#header, #bottomWrapper, #footer, #navigationWrapper, #contentWrapper, #chatWrapper, #wrapper>div.row>div:not(:first-child)').fadeTo('opacity', 0.2);
    questNoticeOn = true;
}

function fadeInNonQuest() {
    $('#header, #bottomWrapper, #footer, #navigationWrapper, #contentWrapper, #chatWrapper, #wrapper>div.row>div:not(:first-child)').fadeTo('opacity', 1, function() {
        $(this).css('opacity', '');
    });
    questNoticeOn = false;
}

function savePeopleMod() {
    localStorage.peopleMod = JSON.stringify(peopleMod);
}

function modChatColors() {
    $('#chatMessageList').find('.profileLink').each(function() {
        if ($(this).text() in peopleMod) {
            var text = $(this).next();
            // Check if this is main channel by the text of the 3rd span. Whispers are special cases, other non-main channels start a [channelName] output.
            var e = $(this).closest('li').find('span:eq(2)').text();
            if (e.indexOf('Whisper') == -1 && e != '[')
                text.css('color', peopleMod[$(this).text()]);
        }
    });
}

// This adds the market quick sell button.
function addMarketButton() {
    $('#marketSell').parent().after('<div class="col-md-4 mt10"><input id="quickSell" value="Quick Sell" type="button" style="width: 80%; padding: 1.5px !important;"></div>');
    $('#quickSell').click(function() {
        var sPrice = $('.marketListings').closest('table').find(' tbody tr td:nth-child(2)').eq(0).text().replace(/\D+/g, '');
        var amount = $('#currentCurrency').text().replace(/\D+/g, '');
        $('#sellingPrice').val($('#sellingPrice').val() + (sPrice - 1));
        $('#amountToSell').val($('#amountToSell').val() + amount);

        $("#marketSell").click();
    });
}

// This adds the ingredient quick sell button.
function addIngredientButton() {
    if ($("#quicksIngred").length < 1) {
        $("#marketIngredientSell").parent().after('<div class="center"><input id="quicksIngred" value="Quick Sell" type="button"></div>');
    }

    $('#quicksIngred').click(function() {
        var sPrice = $('#modal2Content').find($('.marketListings')).find('tbody tr:nth-child(1) td:nth-child(2)').eq(0).text().replace(/\D+/g, '');
        var amount = $('#modal2Content').find('div:first').text().replace(/\D+/g, '');
        $('#marketPrice').val($('#marketPrice').val() + (sPrice - 1));
        $('#marketIngredientAmount').val($('#marketIngredientAmount').val() + amount);
        $("#marketIngredientSell").click();
    });
}

// End
