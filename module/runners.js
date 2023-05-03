/**
 * A simple and flexible system for world-building using an arbitrary collection of character and item attributes
 * Author: Atropos
 * Software License: GNU GPLv3
 */

// Import Modules
import { registerSystemSettings } from "./settings.js";
import { preloadHandlebarsTemplates } from "./runners-templates.js";
import { RunnersRoll, simpleRollPopup } from "./runners-roll.js";
import { RunnersHelpers } from "./runners-helpers.js";
import { RunnersActor } from "./runners-actor.js";
import { RunnersItem } from "./runners-item.js";
import { RunnersItemSheet } from "./runners-item-sheet.js";
import { RunnersActorSheet } from "./runners-actor-sheet.js";
import { RunnersCrewSheet } from "./runners-crew-sheet.js";
import { RunnersClockSheet } from "./runners-clock-sheet.js";
import { RunnersNPCSheet } from "./runners-npc-sheet.js";
import { RunnersFactionSheet } from "./runners-faction-sheet.js";
import { RunnersActiveEffect } from "./runners-active-effect.js";
import * as migrations from "./migration.js";

window.RunnersHelpers = RunnersHelpers;

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */
Hooks.once("init", async function () {
  console.log(`Initializing Runners in the Shadows System`);

  game.Runners = {
    dice: RunnersRoll
  };
  game.system.RunnersClocks = {
    sizes: [4, 6, 8]
  };

  game.system.traumas = [ "cold", "haunted", "obsessed", "paranoid", "reckless", "soft", "unstable", "vicious" ];

  CONFIG.Item.documentClass = RunnersItem;
  CONFIG.Actor.documentClass = RunnersActor;
  CONFIG.ActiveEffect.documentClass = RunnersActiveEffect;

  // Register System Settings
  registerSystemSettings();

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("Runners", RunnersActorSheet, { types: ["character"], makeDefault: true });
  Actors.registerSheet("Runners", RunnersCrewSheet, { types: ["crew"], makeDefault: true });
  Actors.registerSheet("Runners", RunnersFactionSheet, { types: ["factions"], makeDefault: true });
  Actors.registerSheet("Runners", RunnersClockSheet, { types: ["\uD83D\uDD5B clock"], makeDefault: true });
  Actors.registerSheet("Runners", RunnersNPCSheet, { types: ["npc"], makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("Runners", RunnersItemSheet, { makeDefault: true });
  await preloadHandlebarsTemplates();

  Actors.registeredSheets.forEach(element => console.log(element.Actor.name));


  // Is the value Turf side.
  Handlebars.registerHelper('is_turf_side', function (value, options) {
    if (["left", "right", "top", "bottom"].includes(value)) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });

  Handlebars.registerHelper('and', function () {
    // Get function args and remove last one (meta object); every(Boolean) checks AND
    return Array.prototype.slice.call(arguments, 0, arguments.length - 1).every(Boolean);
  });

  Handlebars.registerHelper('or', function () {
    // Get function args and remove last one (meta object); every(Boolean) checks AND
    return Array.prototype.slice.call(arguments, 0, arguments.length - 1).some(Boolean);
  });

  Handlebars.registerHelper('pc', function( string ) {
    return RunnersHelpers.getProperCase( string );
  });

  // Multiboxes.
  Handlebars.registerHelper('multiboxes', function (selected, options) {

    let html = options.fn(this);

    // Fix for single non-array values.
    if (!Array.isArray(selected)) {
      selected = [selected];
    }

    if (typeof selected !== 'undefined') {
      selected.forEach(selected_value => {
        if (selected_value !== false) {
          let escapedValue = RegExp.escape(Handlebars.escapeExpression(selected_value));
          let rgx = new RegExp(' value=\"' + escapedValue + '\"');
          let oldHtml = html;
          html = html.replace(rgx, "$& checked");
          while ((oldHtml === html) && (escapedValue >= 0)) {
            escapedValue--;
            rgx = new RegExp(' value=\"' + escapedValue + '\"');
            html = html.replace(rgx, "$& checked");
          }
        }
      });
    }
    return html;
  });

  // Trauma Counter
  Handlebars.registerHelper('traumacounter', function(selected, max, options) {

    let html = options.fn(this);

    let count = 0;
    for (const trauma in selected) {
      if (selected[trauma] === true) {
        count++;
      }
    }

    if (count > max) count = max;

    const rgx = new RegExp(' value=\"' + count + '\"');
    return html.replace(rgx, "$& checked=\"checked\"");

  });

  // NotEquals handlebar.
  Handlebars.registerHelper('noteq', (a, b, options) => {
    return (a !== b) ? options.fn(this) : '';
  });

  // ReputationTurf handlebar.
  Handlebars.registerHelper('repturf', (turfs_amount, options) => {
    let html = options.fn(this);
    var turfs_amount_int = parseInt(turfs_amount);

    // Can't be more than 6.
    if (turfs_amount_int > 6) {
      turfs_amount_int = 6;
    }

    for (let i = 13 - turfs_amount_int; i <= 12; i++) {
      const rgx = new RegExp(' value=\"' + i + '\"');
      html = html.replace(rgx, "$& disabled");
    }
    return html;
  });

  Handlebars.registerHelper('crew_vault_nuyen', (max_nuyen, options) => {

    let html = options.fn(this);
    for (let i = 1; i <= max_nuyen; i++) {

      html += "<input type=\"radio\" id=\"crew-nuyen-vault-" + i + "\" data-dType=\"Number\" name=\"system.vault.value\" value=\"" + i + "\"><label for=\"crew-nuyen-vault-" + i + "\"></label>";
    }

    return html;
  });

  Handlebars.registerHelper('crew_experience', (_id, options) => {

    let html = options.fn(this);
    for (let i = 1; i <= 10; i++) {

      html += `<input type="radio" id="crew-${_id}-experience-${i}" data-dType="Number" name="system.experience" value="${i}" dtype="Radio"><label for="crew-${_id}-experience-${i}"></label>`;
    }

    return html;
  });

  // Enrich the HTML replace /n with <br>
  Handlebars.registerHelper('html', (options) => {

    let text = options.hash['text'].replace(/\n/g, "<br />");

    return new Handlebars.SafeString(text);
  });

  // "N Times" loop for handlebars.
  //  Block is executed N times starting from n=1.
  //
  // Usage:
  // {{#times_from_1 10}}
  //   <span>{{this}}</span>
  // {{/times_from_1}}
  Handlebars.registerHelper('times_from_1', function (n, block) {

    var accum = '';
    for (var i = 1; i <= n; ++i) {
      accum += block.fn(i);
    }
    return accum;
  });

  // "N Times" loop for handlebars.
  //  Block is executed N times starting from n=0.
  //
  // Usage:
  // {{#times_from_0 10}}
  //   <span>{{this}}</span>
  // {{/times_from_0}}
  Handlebars.registerHelper('times_from_0', function (n, block) {

    var accum = '';
    for (var i = 0; i <= n; ++i) {
      accum += block.fn(i);
    }
    return accum;
  });

  // Concat helper
  // https://gist.github.com/adg29/f312d6fab93652944a8a1026142491b1
  // Usage: (concat 'first 'second')
  Handlebars.registerHelper('concat', function () {
    var outStr = '';
    for (var arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });


  /**
   * @inheritDoc
   * Takes label from Selected option instead of just plain value.
   */

  Handlebars.registerHelper('selectOptionsWithLabel', function (choices, options) {

    const localize = options.hash['localize'] ?? false;
    let selected = options.hash['selected'] ?? null;
    let blank = options.hash['blank'] || null;
    selected = selected instanceof Array ? selected.map(String) : [String(selected)];

    // Create an option
    const option = (key, object) => {
      if (localize) object.label = game.i18n.localize(object.label);
      let isSelected = selected.includes(key);
      html += `<option value="${key}" ${isSelected ? "selected" : ""}>${object.label}</option>`
    };

    // Create the options
    let html = "";
    if (blank) option("", blank);
    Object.entries(choices).forEach(e => option(...e));

    return new Handlebars.SafeString(html);
  });


  /**
   * Create appropriate Runners clock
   */

  Handlebars.registerHelper('runners-clock', function (parameter_name, type, current_value, uniq_id) {

    let html = '';

    if (current_value === null || current_value === 'null') {
      current_value = 0;
    }

    if (parseInt(current_value) > parseInt(type)) {
      current_value = type;
    }

    // Label for 0
    html += `<label class="clock-zero-label" for="clock-0-${uniq_id}}"><i class="fab fa-creative-commons-zero nullifier"></i></label>`;
    html += `<div id="runners-clock-${uniq_id}" class="runners-clock clock-${type} clock-${type}-${current_value}" style="background-image:url('systems/runners-in-the-shadows/styles/assets/progressclocks-svg/Progress Clock ${type}-${current_value}.svg');">`;

    let zero_checked = (parseInt(current_value) === 0) ? 'checked' : '';
    html += `<input type="radio" value="0" id="clock-0-${uniq_id}}" data-dType="String" name="${parameter_name}" ${zero_checked}>`;

    for (let i = 1; i <= parseInt(type); i++) {
      let checked = (parseInt(current_value) === i) ? 'checked' : '';
      html += `
        <input type="radio" value="${i}" id="clock-${i}-${uniq_id}" data-dType="String" name="${parameter_name}" ${checked}>
        <label for="clock-${i}-${uniq_id}"></label>
      `;
    }

    html += `</div>`;
    return html;
  });

});

/**
 * Once the entire VTT framework is initialized, check to see if we should perform a data migration
 */
Hooks.once("ready", function () {

  // Determine whether a system migration is required
  const currentVersion = game.settings.get("rits", "systemMigrationVersion");
  const NEEDS_MIGRATION_VERSION = 2.15;

  let needMigration = (currentVersion < NEEDS_MIGRATION_VERSION) || (currentVersion === null);

  // Perform the migration
  if (needMigration && game.user.isGM) {
    migrations.migrateWorld();
  }
});

/*
 * Hooks
 */

// getSceneControlButtons
Hooks.on("renderSceneControls", async (app, html) => {
  let dice_roller = $('<li class="scene-control" title="Dice Roll"><i class="fas fa-dice"></i></li>');
  dice_roller.click(async function () {
    await simpleRollPopup();
  });
  html.children().first().append(dice_roller);

});

//For Clocks UI
// Hooks.once("init", () => {
//   log(`Init ${game.data.system.id}`);
// });

// Hooks.on("getSceneControlButtons", async (controls) => {
//   await ClockTiles.getSceneControlButtons(controls);
// });

// Hooks.on("renderTileHUD", async (hud, html, tile) => {
//   await ClockTiles.renderTileHUD(hud, html, tile);
// });

// Hooks.on("renderTokenHUD", async (hud, html, token) => {
//   let rootElement = document.getElementsByClassName('vtt game')[0];
//   if( await ClockSheet.renderTokenHUD(hud, html, token) ) {
//     rootElement.classList.add('hide-ui');
//   } else {
//     rootElement.classList.remove('hide-ui');
//   }
// });

// Hooks.on("dropCanvasData", async (canvas, data) => {
//   if( data.type === "Item" ){
//     await SaVHelpers.createTile( canvas, data );
//   }
// });
