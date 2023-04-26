
import { RunnersSheet } from "./Runners-sheet.js";
import { RunnersActiveEffect } from "./Runners-active-effect.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {RunnersSheet}
 */
export class RunnersActorSheet extends RunnersSheet {

  /** @override */
	static get defaultOptions() {
	  return foundry.utils.mergeObject(super.defaultOptions, {
  	  Playbooks: ["runners-in-the-shadows", "sheet", "actor", "pc"],
  	  template: "systems/runners-in-the-shadows/templates/actor-sheet.html",
      width: 700,
      height: 970,
      tabs: [{navSelector: ".tabs", contentSelector: ".tab-content", initial: "abilities"}]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  async getData(options) {
    const superData = super.getData( options );
    const sheetData = superData.data;
    sheetData.owner = superData.owner;
    sheetData.editable = superData.editable;
    sheetData.isGM = game.user.isGM;

    // Prepare active effects
    sheetData.effects = RunnersActiveEffect.prepareActiveEffectCategories(this.actor.effects);

    // Calculate Load
    let loadout = 0;
    sheetData.items.forEach(i => {loadout += (i.type === "item") ? parseInt(i.system.load) : 0});

    //Sanity Check
    if (loadout < 0) {
      loadout = 0;
    }
    if (loadout > 10) {
      loadout = 10;
    }

    sheetData.system.loadout = loadout;

    // Encumbrance Levels
    let load_level=["rits.Light","rits.Light","rits.Light","rits.Light","rits.Normal","rits.Normal","rits.Heavy","rits.Encumbered",
			"rits.Encumbered","rits.Encumbered","rits.OverMax"];
    let mule_level=["rits.Light","rits.Light","rits.Light","rits.Light","rits.Light","rits.Light","rits.Normal","rits.Normal",
			"rits.Heavy","rits.Encumbered","rits.OverMax"];

    sheetData.system.load_levels = {"rits.Light":"rits.Light", "rits.Normal":"rits.Normal", "rits.Heavy":"rits.Heavy"};

    sheetData.system.description = await TextEditor.enrichHTML(sheetData.system.description, {secrets: sheetData.owner, async: true});

    return sheetData;
  }

  /* -------------------------------------------- */

  /** @override */
	activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Update Inventory Item
    html.find('.item-body').click(ev => {
      const element = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(element.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click( async ev => {
      const element = $(ev.currentTarget).parents(".item");
      await this.actor.deleteEmbeddedDocuments("Item", [element.data("itemId")]);
      element.slideUp(200, () => this.render(false));
    });

    // manage active effects
    html.find(".effect-control").click(ev => RunnersActiveEffect.onManageActiveEffect(ev, this.actor));
  }

  /* -------------------------------------------- */

}
