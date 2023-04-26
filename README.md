# FoundryVTT Runners in the Shadows character and crew sheets

Can be added as a system using manifest file: https://github.com/ryzimmer/foundryvtt-runners-in-the-shadows/releases/download/test/system.json

## Usage
`"Item" - all Playbooks, crew types, upgrades, items, abilities, upgrades, etc.`

- To reset reputation, exp, etc counters just click on the label name.
- Health clock can be reset by clicking on "Healing" table header.
- To add items you can click a corresponding link or drag items from compendium/game to the sheet.
- All "Playbook/crew" specific items are prefixed with first letters

- I don't want the "Playbook/crew items" to be prepopulated, so the character sheet contains less "compendium" info.
- To see the description of Playbook, Vice, Background, etc you can just click added item and see all the info in the popup.
- When adding a new item you can hower a "question-circle" icon to see the item's description.
- To add Custom abilities just add a new "Foundry Item" of the corresponding type and fill all the necessary info. Then drag it to the sheet or add via button on a sheet.

Playbooks:
- (A)  Adept
- (D)  Decker
- (F)  Face
- (M) Magician
- (R) Rigger
- (S) Street Samurai

Crew Types:
- (AS)  Assassins
- (B)  Bravos
- (C)  Cult
- (H)  Hawkers
- (Sh) Shadows
- (Sm) Smugglers

## Screenshots

### Character Sheet, Crew Sheet and Playbook
![alt screen][screenshot_all]

### Compendium
![alt screen][screenshot_compendium]

### Rolls
![alt screen][screenshot_roll_1]
![alt screen][screenshot_roll_2]

## Clocks
Clocks are now here!
- To add clock go to Actors tab and create a new Actor of type "🕛 clock".
- To share it to other players just drag it to a scene.

### Operators list
- `addition` - is added when item is attached and substracted when removed
- `attribute_change` - changes the "attribute" to value and when removed - uses the "attribute_default" to restore

## To be done in the nearest future
- Friends/rivals section
- Stress/Harm dynamic values (can be modified by abilities but for now are hardcoded)

## Troubleshooting
- If you can't find the drag-n-dropped item, refer to "All Items" tab on each sheet.

## Credits
- This work is based on Runners in the Shadows (found at http://www.Runnersinthedark.com/), product of One Seven Design, developed and authored by John Harper, and licensed for our use under the Creative Commons Attribution 3.0 Unported license (http://creativecommons.org/licenses/by/3.0/).
- Some assets were taken from here (thank you  timdenee and joesinghaus): https://github.com/joesinghaus/runners-in-the-shadows


[screenshot_all]: ./images/screenshot_all.png "screenshot_all"
[screenshot_compendium]: ./images/screenshot_compendium.png "screenshot_compendium"
[screenshot_roll_1]: ./images/screenshot_roll_1.png "screenshot_roll_1"
[screenshot_roll_2]: ./images/screenshot_roll_2.png "screenshot_roll_2"
