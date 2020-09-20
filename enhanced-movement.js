
import MovementGrid from './classes/MovementGrid.js';

import { Overwrite } from './js/Overwrite.js';
let speed;
let combat;
let cToken;
let stopMovement = false;
let gmAltPress = false;
Overwrite.init();

Hooks.on('init',()=>{
	CONFIG.debug.hooks = true;
	//CONFIG.debug.mouseInteraction = true;
	//console.log(new PathManager)
	game.settings.register('EnhancedMovement', 'enableGrid', {
		name: "Grid Movement Preview",
		hint: "Displays all points character can move within their speed during combat.",
		scope: "client",
		config: true,
		default: true,
		type: Boolean
      //onChange: x => window.location.reload()
    });
	game.settings.register('EnhancedMovement', 'preventMove', {
		name: "Prevent Movement",
		hint: "Restricts movement during combat to only the current token. Will still fire warning.",
		scope: "world",
		config: true,
		default: true,
		type: Boolean
      //onChange: x => window.location.reload()
    });
 //    game.settings.register('EnhancedMovement', 'disableNonGridMove', {
	// 	name: "Disable Non Grid Movement",
	// 	hint: "During combat, restricts player movement to grid.",
	// 	scope: "world",
	// 	config: true,
	// 	default: true,
	// 	type: Boolean
 //      //onChange: x => window.location.reload()
	// })
	game.settings.register('EnhancedMovement', 'speedLimit', {
		name: "Restrict token movement to its speed?",
		hint: "During combat, prevent token from exceeding its speed. Out of combat, tokens can only move up to their max speed at a time. ",
		scope: "world",
		config: true,
		default: true,
		type: Boolean
      //onChange: x => window.location.reload()
    });

});


Hooks.on('ready',()=>{
	//canvas.grid.addHighlightLayer(`EnhancedMovement.${game.userId}`);
	 if (game.user.isGM){
		$(window).on('keydown',(e)=>{
			switch(e.which){
				case 18:
					gmAltPress = true;
					break;
				default:
					break;
			}
			
		})
		$(window).on('keyup',(e)=>{
			switch(e.which){
				case 18:
					gmAltPress = false;
					break;
				default:
					break;
			}
			
		})
	}
})
//COMBAT HOOKS
Hooks.on('createCombat',(combat,data,userID)=>{

})

Hooks.on('updateCombat',(combat,data,diff,userID)=>{
	console.log(combat,data)
	//console.log(combat.previous.round,combat.previous.turn,combat.current.round,combat.current.turn,data,diff,userID)
	let token = (typeof combat.combatant != 'undefined') ? canvas.tokens.get(combat.combatant.tokenId):null;
	if(combat.combatant != null && typeof data.turn != 'undefined' && data.turn != combat.previous.turn){
		console.log('speed: ',combat.combatant.actor.data.data.attributes.speed.value)
		//combat.setFlag('EnhancedMovement','data',{speed:parseFloat(combat.combatant.actor.data.data.attributes.speed.value),startingPoint:{x:combat.combatant.token.x,y:combat.combatant.token.y}})
	}
	if(combat.current.round > combat.previous.round){
		//NEW ROUND

	}else if (combat.current.round < combat.previous.round){
		//OLD ROUND
	}
	if(diff.diff){
		if(data.hasOwnProperty('turn') && combat.combatant !=null){
			//New Turn
			console.log('new turn');
			token.setFlag('EnhancedMovement','nDiagonal',0)
			token.setFlag('EnhancedMovement','remainingSpeed',token.maxSpeed)
		}
		if(data.hasOwnProperty('round') && !data.hasOwnProperty('turn') && combat.combatant !=null){
			//New Round, but same turn, ie only one person in combat tracker
			token.setFlag('EnhancedMovement','nDiagonal',0)
			token.setFlag('EnhancedMovement','remainingSpeed',token.maxSpeed)
		}
		if(data.active){
			//Combat was created. 
		}
		
	}

})
Hooks.on('deleteCombat',async (combat)=>{
	combat.combatants.map((combatant)=>{
		let token = canvas.tokens.get(combatant.tokenId);
		token.setFlag('EnhancedMovement','nDiagonal',0)
		token.setFlag('EnhancedMovement','remainingSpeed',token.maxSpeed);
		token.movementGrid.clear();
		//if(token._controlled) token.movementGrid.highlightGrid();
	})
})
Hooks.on('createCombatant',(combat,combatant,data,)=>{

})
//TOKEN HOOKS
Hooks.on('controlToken',(token,controlled)=>{
	//If user selects multiple tokens, this will be last one selected
	cToken = (controlled) ? token:null;
	// if(controlled)
	// 	token._drawSpeedUI();
	// else
	// 	token._clearSpeedUI();
	if((game.combat !== null) && typeof game.combat.combatant != 'undefined'){ 

		if(controlled && game.combat.combatant.tokenId == token.id && game.combat.round >0){
			if(token.movementGrid == null)
				token.movementGrid = new MovementGrid(token)
			token.movementGrid.highlightGrid();
			
		
		}else{
			if(token.movementGrid != null)
				token.movementGrid.clear();
		}
	}
})
let nDiagonal = 0;
Hooks.on('preUpdateToken', (scene,tokenData,updates,diff)=>{
	console.log(tokenData,updates)
	//If combat is started, track movement.
	let token = canvas.tokens.get(tokenData._id)
	console.log('token: ',token._velocity)

	if(game.combat !== null && (typeof updates.y != 'undefined' || typeof updates.x != 'undefined')){
		//COMBAT exists and token moved.
		if( game.combat.started && game.combat.combatant.tokenId == tokenData._id){
			let nDiagonal = token.getFlag('EnhancedMovement','nDiagonal') || 0;
			const prev = {x:token._validPosition.x,y:token._validPosition.y}
			const next = {x:updates.x || token.x,y:updates.y || token.y}
			console.log(prev,next)
			const ny = Math.abs(next.y-prev.y) / canvas.dimensions.size;
			const nx = Math.abs(next.x-prev.x) / canvas.dimensions.size;
			let nd = Math.min(nx, ny);
		    let ns = Math.abs(ny - nx);
		    nDiagonal += nd;
		    token.data.flags.EnhancedMovement.nDiagonal = nDiagonal;
		    token.setFlag('EnhancedMovement','nDiagonal',nDiagonal);
		    let distance = 0;
			if(canvas.grid.diagonalRule == '555'){
				 distance = (ns + nd) * canvas.scene.data.gridDistance;
			}else if(canvas.grid.diagonalRule =='5105'){
			
			    let nd10 = Math.floor(nDiagonal / 2) - Math.floor((nDiagonal - nd) / 2);
      			let spaces = (nd10 * 2) + (nd - nd10) + ns;
			    distance = spaces * canvas.dimensions.distance;
			}
			if(gmAltPress) distance = 0;
			// if(Math.abs(next.x - prev.x) > canvas.dimensions.size && Math.abs(next.y-prev.y)> canvas.dimensions.size)
				 
			// else
			// 	let distance = 5;

			console.log(distance);
		    

			let speed = token.remainingSpeed;
			
			//console.log(speed - distance)
			let modSpeed = speed - distance;
			console.log(modSpeed)
			if(modSpeed < 0 && !gmAltPress){
				/// need to broadcast this.

				ui.notifications.warn("Creature has exceeded their movement speed this turn.", {permanent: false});
				return false;
			}else{
				token.remainingSpeed = (modSpeed < 0) ? 0:modSpeed;
				token.setFlag('EnhancedMovement','remainingSpeed',modSpeed);
			}
		}else if(!gmAltPress && game.combat.started && game.settings.get('EnhancedMovement','preventMove') && game.combat.combatants.findIndex((i)=>{return i.tokenId == token.id}) !== -1){
			ui.notifications.warn("It is not your move.", {permanent: false});
			return false;
		}
	}
})
let interval = null;
Hooks.on('updateToken',(scene,tokenData,updates,diff)=>{
	let token = canvas.tokens.get(tokenData._id)
	//Combat has started
	//console.log(tokenData)
	if(game.combat !== null && game.combat.started){
		if(token.movementGrid != null)
			token.movementGrid.clear();

		if(token._controlled && getProperty(updates,'flags.EnhancedMovement.remainingSpeed')){
			token.movementGrid.highlightGrid();
		}
	}
	
		
	if(updates.hasOwnProperty('x') || updates.hasOwnProperty('y')){
		token.movementGrid.clear();
		if(interval == null) {
			interval = setInterval(()=>{
				
				if(token._movement == null){
					clearInterval(interval);
					interval = null;
					Hooks.call('moveToken',token)
				}
			},100)
		}
	}
	
})
Hooks.on('moveToken',(token)=>{
	if(game.combat !== null && game.combat.started){
		if(game.combat.combatant.tokenId == token.id)
			token.movementGrid.highlightGrid();
	}
	token.previousLocation.push({x:token.x,y:token.y}); 
})

//ACTOR HOOKS
Hooks.on('updateActor',async (actor,data,diff,userID)=>{
	if(game.combat !== null && game.combat.started){
		if(game.combat.combatant.actor.id == actor.id){
			if(typeof data.data.attributes.speed.value != undefined) {
				await game.combat.setFlag('EnhancedMovement','data',{speed:parseFloat(game.combat.combatant.actor.data.data.attributes.speed.value)})
				canvas.tokens.controlled.forEach((token)=>{
					console.log(token)
					if(token.movementGrid.visible)
						token.movementGrid.highlightGrid();
				})
			}
		}
	}
})
function getTokensFromActor(actor){
	return canvas.tokens.placeables.filter(t => t.actor.id === actor.id);
}

// Set movement speed in token flag.
//Stop token movement when combat is active and it's not their turn.
//if it is their turn and combat is active, deduct movement.

/* Credit to @Vance in Foundry Discord for these macros*/
function get5eGridDist(one, two) {
  let gs = canvas.grid.size;
  let d1 = Math.abs((one.x - two.x) / gs);
  let d2 = Math.abs((one.y - two.y) / gs);
  let dist = Math.max(d1, d2);
  dist = dist * canvas.scene.data.gridDistance;
  return dist;
}
function get5eGridDistAlt(one, two) {
  let gs = canvas.grid.size;
  let d1 = Math.abs((one.x - two.x) / gs);
  let d2 = Math.abs((one.y - two.y) / gs);
  let maxDim = Math.max(d1, d2);
  let minDim = Math.min(d1, d2);

  let dist = (maxDim + Math.floor(minDim / 2)) * canvas.scene.data.gridDistance;
  return dist;
}
/*********************************************************** */