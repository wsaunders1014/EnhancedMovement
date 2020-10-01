v0.0.2 -
Some small css tweaks to the tracker
Fixed some major issues with Hex maps
Honestly don't even remember, but a lot of little bug fixes.

<p>This module aims to track and differentiate the different types of movement a token has during combat in DnD 5e as well as implement automatic Difficult Terrain tracking through the dependent Terrain Layer module.</p>
When combat starts, all token's movement speeds are reset to their default max. A user can see the different movement modes a token has in the Movement tracker. For instance an Adult Blue Dragon has a walk speed of 40, burrow speed of 30, and a flying speed of 80. This module currently only supports the PHB RAW interpretation of tracking multiple movement types. 

>If you have more than one speed, such as your walking speed and a flying speed, you can switch back and forth between your speeds during your move. Whenever you switch, subtract the distance you've already moved from the new speed. The result determines how much farther you can move. If the result is 0 or less, you can't use the new speed during the current move.
>
>For example, if you have a speed of 30 and a flying speed of 60 because a wizard cast the fly spell on you, you could fly 20 feet, then walk 10 feet, and then leap into the air to fly 30 feet more.


When combat is started, each token's current movement speed is displayed ON their token as well for ease. Players can only see movement of token's they own, but the GM can see all tokens.

The Movement Tracker features a turn indicator, the token's name, the current movement mode with a list of the token's other modes shown when you hover over it, an input box for the token's current remaining speed, and the scene unit measurement.

Bringing up the HUD of the token will show a new button to the left of the Altitude indicator. This button activates the token's dash speed, doubling it per DnD5e rules. As long as a token hasn't exceeded their normal speed, they can click it again to cancel the dash.

Tokens must have speed to move while combat is active. This includes tokens not in the combat tracker. Tokens in the tracker will have their speed set to zero after their turn. Tokens out of combat will regain their speed each new round. Initially, I wanted to block token movement outside of it's turn but there are features which allow a player to move as a reaction. Until there's a way for the GM to lock and unlock token movement, I am only firing a client side warning when the token moves outside of its turn.

When combat ends, all token speeds are reset. 

I've started to integrate Difficult Terrain as well. Use the Terrain layer to paint grid points. Currently the only DT type is 'ground' so flying creatures ignore Difficult Terrain by default.
Tokens also have a toggle function to set whether it ignores difficult terrain all together if you want to change it with a macro simply do..
```javascript
tokenReference.EnhancedMovement.toggleIgnoreDifficultTerrain()
```

Some notes:
Speeds SHOULD be persistent between sessions if you end a game during a combat encounter. As this is an ALPHA, though there may be edge cases I've missed.
GM can move tokens without consuming movement speed by holding ALT while dragging or moving tokens with keys.
I have not tested this with multiple combat encounters and I'm pretty certain it won't work.

As this is an alpha I am very open to feedback on what could be improved or if there are bugs you find please create an issue!


<p><img src="https://i.imgur.com/u08vtVw.jpg" alt="Gm and Player view" width="868" height="453" /></p>
<p><img src="https://i.imgur.com/UJsmTk5.jpg" alt="" width="710" height="347" /></p>
<p><img src="https://i.imgur.com/oo69MgO.jpg" alt="" width="683" height="315" /></p>
<p><img src="https://i.imgur.com/er5kCl1.jpg" alt="" width="303" height="198" /></p>
