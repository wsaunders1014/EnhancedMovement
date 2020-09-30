<p>This module aims to track and differentiate the different types of movement a token has during combat in DnD 5e.</p>
<p>&nbsp;While in combat, when a token is selected, adds a HUD at bottom left with a Turn Indicator(grey, red, and green), Token Name, Movement Mode, Input box for Speed, and the unit size of the scene.</p>
<p>Also adds a grey box to Token showing the movement speed. Players can only see movement boxes on tokens they own. GM can see token speed for all.</p>
<p><img src="https://i.imgur.com/u08vtVw.jpg" alt="Gm and Player view" width="868" height="453" /></p>
<p>Add Dash button to token HUD, inactive:</p>
<p><img src="https://i.imgur.com/UJsmTk5.jpg" alt="" width="710" height="347" /></p>
<p>Active:</p>
<p><img src="https://i.imgur.com/oo69MgO.jpg" alt="" width="683" height="315" /></p>
<p>Allows user to choose movement mode based on Token's actor. Note, walking speed must be main movement, and special movement box must match syntax: 'fly 30 ft' and separated by comma, "fly 30 ft, burrow 40ft" for multiple speeds. This is how SRD automatically implements it. Supported movement modes(other than walk which is automatic): Fly, Swim, Burrow, and Climb(climb is not fully implemented yet)</p>
<p><img src="https://i.imgur.com/er5kCl1.jpg" alt="" width="303" height="198" /></p>
<p>Some finer points:</p>
<p>Tokens can not move with zero speed. Initially I planned to block movement on tokens who were not the active combatant, however I think there will be issues with certain dnd features that allow a token to move as a reaction, ie Rogue Scout's Level 3 Feature. I plan on implementing a system where the DnD can unlock/lock player movement, once that's in place I will probably reinstitute blocking token movement out of turn.</p>
<p>Tokens in the combat tracker will have their token's remaining speed set to 0 when it's not their turn. If a class feature allows them to move they(or DM) can either create a macro to fire or they can edit the input on the Tracker in the left bottom corner. It will fire a warning.</p>
<p>Tokens not in combat will keep their speed and can move out of combat UP TO their token's speed PER ROUND. This allows the tokens outside of combat to still honor the '6 second round.' If for instance they are far away, they can move each round towards the fight until they get close enough to roll initiative.(of course you can just add them to the combat tracker initially as well).</p>
<p>GM's can move tokens with zero move speed by holding ALT while dragging or using movement keys.</p>
<p>This is a complicated system so I'm sure I've not found all the bugs, please visit: https://github.com/wsaunders1014/EnhancedMovement and add an issue if you find it.</p>
<p>&nbsp;</p>
<p>Future expansions:</p>
<p>I built this with integration of the Terrain Layer module and it's a dependency. Eventually movement will auto reflect Terrain Layer's effect. Terrain will affect movement type and speed, for instance moving into a Water Terrain Square will force the token to use Swim speed, etc. Flying creatures will ignore Difficult Terrain that's ground based, etc.</p>
<p>Eventually the turn tracker light will be a button for player to end turn.</p>
<p>Further UI tweaks and bugfixes will be coming down the line as well.</p>