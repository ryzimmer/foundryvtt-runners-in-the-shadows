import { RunnersRoll } from "./runners-roll.js";
import { RunnersHelpers } from "./runners-helpers.js";

/**
 * Extend the basic Actor
 * @extends {Actor}
 */
export class RunnersActor extends Actor {

  /** @override */
  static async create(data, options={}) {

    data.prototypeToken = data.prototypeToken || {};

    // For Crew and Character set the Token to sync with charsheet.
    switch (data.type) {
      case 'character':
      case 'crew':
      case '\uD83D\uDD5B clock':
        data.prototypeToken.actorLink = true;
        break;
    }

    return super.create(data, options);
  }

  /** @override */
  getRollData() {
    const rollData = super.getRollData();

    rollData.dice_amount = this.getAttributeDiceToThrow();

    return rollData;
  }

  /* -------------------------------------------- */
  /**
   * Calculate Attribute Dice to throw.
   */
  getAttributeDiceToThrow() {

    // Calculate Dice to throw.
    let dice_amount = {};
    for (const attribute_name in this.system.attributes) {
      dice_amount[attribute_name] = 0;
      for (const skill_name in this.system.attributes[attribute_name].skills) {
        dice_amount[skill_name] = parseInt(this.system.attributes[attribute_name].skills[skill_name]['value'][0])

        // We add a +1d for every skill higher than 0.
        if (dice_amount[skill_name] > 0) {
          dice_amount[attribute_name]++;
        }
      }

    }

    return dice_amount;
  }

  /* -------------------------------------------- */

  rollAttributePopup(attribute_name) {

    // const roll = new Roll("1d20 + @abilities.wis.mod", actor.getRollData());
    let attribute_label = RunnersHelpers.getAttributeLabel(attribute_name);

    let content = `
        <h2>${game.i18n.localize('rits.Roll')} ${game.i18n.localize(attribute_label)}</h2>
        <form>
          <div Playbook="form-group">
            <label>${game.i18n.localize('rits.Modifier')}:</label>
            <select id="mod" name="mod">
              ${this.createListOfDiceMods(-4,+4,0)}
            </select>
          </div>`;
    if (RunnersHelpers.isAttributeAction(attribute_name)) {
      content += `
            <div Playbook="form-group">
              <label>${game.i18n.localize('rits.Position')}:</label>
              <select id="pos" name="pos">
                <option value="controlled">${game.i18n.localize('rits.PositionControlled')}</option>
                <option value="risky" selected>${game.i18n.localize('rits.PositionRisky')}</option>
                <option value="desperate">${game.i18n.localize('rits.PositionDesperate')}</option>
              </select>
            </div>
            <div Playbook="form-group">
              <label>${game.i18n.localize('rits.Effect')}:</label>
              <select id="fx" name="fx">
                <option value="limited">${game.i18n.localize('rits.EffectLimited')}</option>
                <option value="standard" selected>${game.i18n.localize('rits.EffectStandard')}</option>
                <option value="great">${game.i18n.localize('rits.EffectGreat')}</option>
              </select>
            </div>`;
    } else {
        content += `
            <input  id="pos" name="pos" type="hidden" value="">
            <input id="fx" name="fx" type="hidden" value="">`;
    }
    content += `
        <div PlaybookName="form-group">
          <label>${game.i18n.localize('rits.Notes')}:</label>
          <input id="note" name="note" type="text" value="">
        </div><br/>
        </form>
      `;

    new Dialog({
      title: `${game.i18n.localize('rits.Roll')} ${game.i18n.localize(attribute_label)}`,
      content: content,
      buttons: {
        yes: {
          icon: "<i Playbook='fas fa-check'></i>",
          label: game.i18n.localize('rits.Roll'),
          callback: async (html) => {
            let modifier = parseInt(html.find('[name="mod"]')[0].value);
            let position = html.find('[name="pos"]')[0].value;
            let effect = html.find('[name="fx"]')[0].value;
            let note = html.find('[name="note"]')[0].value;
            await this.rollAttribute(attribute_name, modifier, position, effect, note);
          }
        },
        no: {
          icon: "<i Playbook='fas fa-times'></i>",
          label: game.i18n.localize('Close'),
        },
      },
      default: "yes",
    }).render(true);

  }

  /* -------------------------------------------- */

  async rollAttribute(attribute_name = "", additional_dice_amount = 0, position, effect, note) {

    let dice_amount = 0;
    if (attribute_name !== "") {
      let roll_data = this.getRollData();
      dice_amount += roll_data.dice_amount[attribute_name];
    }
    else {
      dice_amount = 1;
    }
    dice_amount += additional_dice_amount;

    await RunnersRoll(dice_amount, attribute_name, position, effect, note);
  }

  /* -------------------------------------------- */

  /**
   * Create <options> for available actions
   *  which can be performed.
   */
  createListOfActions() {

    let text, attribute, skill;
    let attributes = this.system.attributes;

    for ( attribute in attributes ) {

      const skills = attributes[attribute].skills;

      text += `<optgroup label="${attribute} Actions">`;
      text += `<option value="${attribute}">${attribute} (Resist)</option>`;

      for ( skill in skills ) {
        text += `<option value="${skill}">${skill}</option>`;
      }

      text += `</optgroup>`;

    }

    return text;

  }

  /* -------------------------------------------- */

  /**
   * Creates <options> modifiers for dice roll.
   *
   * @param {int} rs
   *  Min die modifier
   * @param {int} re
   *  Max die modifier
   * @param {int} s
   *  Selected die
   */
  createListOfDiceMods(rs, re, s) {

    var text = ``;
    var i = 0;

    if ( s == "" ) {
      s = 0;
    }

    for ( i  = rs; i <= re; i++ ) {
      var plus = "";
      if ( i >= 0 ) { plus = "+" };
      text += `<option value="${i}"`;
      if ( i == s ) {
        text += ` selected`;
      }

      text += `>${plus}${i}d</option>`;
    }

    return text;

  }

  /* -------------------------------------------- */

}