const speedUI = {
	walk:{
		name:'walk',
		icon:"fas fa-walking"
	},
	dash:{
		name:'dash',
		icon:"fas fa-running"
	},
	swim:{
		name:'swim',
		icon:"fas fa-swimmer"
	},
	fly:{
		name:'fly',
		icon:"wings"
	},
	climb:{
		name:'climb',
		icon:"fas fa-hand-rock"
	},
	burrow:{
		name:'burrow',
		icon:"shovel"
	}
}
export default class SpeedHUD extends FormApplication {
	constructor(options={}){
		super(options);
		this.object = {};
		this.mode = null;
		this.token = false;
		this.em = null;
	
		this.data = {
			on:"",
			name:"",
			modeIcon:null,
			speedUnit: 'FT',
			remainingSpeed:0,
			modes: null,
			modeList:null
		}
		Hooks.on('updateSpeedHUD',(hud)=>{
			console.log(hud);
		})
	}
	// set currentToken(val){
	// 	this._currentToken = val;

	// }
	get modes(){
		return this.movementTypes;
	}
	listModes(mode,otherModes){
		let list = [];
		for (let key in otherModes){
			if(key != this.mode) list.push(key);
		}
		return list;
	}

	/* I'm not dealing with multiple tokens. I'm only worried about singular tokens */
	get controlled(){
		return canvas.tokens.controlled[0] || false;
	}
	/*
    * Assign the default options which are supported by the entity edit sheet
    * @type {Object}
    */
    static get defaultOptions() {
    	return mergeObject(super.defaultOptions, {
	      id: "speedHUD",
	      classes: ["app"],
	      popOut: false,
	      template: "modules/EnhancedMovement/templates/speedHUD.html"
		});
    }
    getData(options={}) {
    	console.log('getData')
	    return {
	      active:(this.token) ? true:false,
	      data:this.data,
	      options: this.options,
	      ui:speedUI
	    }
  	}
	
	setPosition(options) {
	   	this.element.css({bottom:window.innerHeight - $('#players').offset().top+15})
 	}
 	_injectHTML(html, options) {
	    $('body').append(html);
	    this._element = html;
	   
	}
	activateListeners(html) {
	 	const moveSpeed = this.element.find('#moveSpeed');
	 	const mode = this.element.find('#mode');
	 	// moveSpeed.on('input',(e)=>{
	 	// 	console.log(e.target.innerText)
	 	// 	
	 	// })
	 	moveSpeed.keypress(function(e) {
	 		if(e.which == 13){ this.blur(); e.preventDefault(); return false;}
		    if (isNaN(String.fromCharCode(e.which))) e.preventDefault();
		});
		moveSpeed.on('focus',(e)=>{
			console.log('focus')
		})
		moveSpeed.on('blur',(e)=>{
			let speed = parseFloat(e.target.innerText);
			this.updateMovement(speed);

			console.log('blur')
		})
		$('body').on('click','#speedHUD li',(e)=>{
			//console.log('test',$(e.target).attr('data-type'))
			this.updateMode($(e.target).attr('data-type'),true)
		})
	}
	/***
	*
	*
	***/

	updateMovement(speed){
		this.em.remainingSpeed = speed;
		this.token.refresh();
		this.token.setFlag('EnhancedMovement','remainingSpeed',speed)
		Hooks.call('updateSpeedHUD',this);
	}
	/*
	type: (string) 'fly' or 'swim'
	speed: (Number) 30 or 7.5
	*/
	addMode(type,speed){
		this.em.addMovementType(type,speed);
		this.updateHUD({},true)
	}
	updateTracker(rerender = true){
		if(game.combat != null && game.combat.round > 0 && game.combat.combatants.length > 0){
			if(this.token.id == game.combat.combatant.tokenId)
				this.data.on = 'on';
			else
				this.data.on = 'off';
			
		}else{
			this.data.on = '';
		}
		
		if(rerender) this.render();
	}
	updateMode(mode,rerender = false){

		this.em.switchType(mode)
	 	
	 	this.updateHUD({},rerender)
	 	

	 	switch(mode){
	 		case 'dash':
	 			break;

	 		default:
	 		break;
	 	}
	}
	updateHUD(updates={},render=false){
		console.log(this.token)
		if(this.token == false){
			this.data = mergeObject(this.data,updates);
		}else{
			this.em = this.token.EnhancedMovement;
			this.movementTypes = this.em.movementTypes;
			console.log(this.movementTypes)
			this.mode = this.em.movementMode;
			this.data.modes = this.modes;
			this.updateTracker(false)
			//console.log(this.movementTypes)
			this.data.name = (this.token) ? this.token.data.name:"";
			updates = mergeObject(updates,{
				
				modeIcon:speedUI[this.mode].icon,
				speedUnit: canvas.scene.data.gridUnits,
				remainingSpeed:Math.max(this.em.remainingSpeed,0),
				modeList:this.listModes(this.mode,this.movementTypes)
			});
			this.data = mergeObject(this.data,updates);
		}
		if(render)
		this.render(true);
	}
	get modeIcon(){
		return this.movementTypes[this.mode].modeIcon;
	}
	/*get canMove(){
		if(game.combat.combatant.tokenId == this.controlled.id)
			return true;
	}*/

}
Hooks.on('renderPlayerList',()=>{
	canvas.hud.speedHUD.element.css({bottom:window.innerHeight - $('#players').offset().top+15})
})