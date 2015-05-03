var hue = require("node-hue-api"),
    hueAPI = hue.HueApi,
    lightState = hue.lightState,
    log = require('logule').init(module, 'Hue');

var sleep = require('sleep');


var config = require("./config.js"),
    leye = config.left,     // left eye
    reye = config.right;    // right eye

var api;
var eyeGroupId;
var currentLevel = 0;

function BlueHue(){

    var self = this;

    if (! (this instanceof BlueHue)){
        return new BlueHue();
    }

    api = new hueAPI(config.hostname, config.username, 20000, config.port);
    api.config().then(groupSetup()).then(displayResult).done();


  

}

var groupSetup = function(){

    api.groups().then(checkgroup).done();
    
        
}

var checkgroup = function(result){

    var humixEyeExist = false;
    
    
    for(var i = 0; i < result.length; i++) {

        if(result[i].name == "humixEye"){
            humixEyeExist = true;
            eyeGroupId = result[i].id;
        }
    }
    
    if(!humixEyeExist){

        log.info("about to create humix group");
        //api.createGroup("humixEye", [leye, reye]).then(displayResult);
    }else{

        log.info("humix group exist, id:" + eyeGroupId);
    }
    
}

var displayResult = function(result) {
    log.info(JSON.stringify(result, null, 2));
};

BlueHue.prototype.setLightNo = function (light_no){

    this.light_no = light_no;
}

BlueHue.prototype.turnOn = function(light_no){

    log.info(" turn on the light ");

    var setOnState = lightState.create().on();
    api.setLightState(light_no, setOnState);
}

BlueHue.prototype.setReady = function(light_no){

    log.info("Set light in standby mode. ");

    var setReadyState = lightState.create().on().rgb(255,150,0).bri(50).shortAlert();
    api.setLightState(light_no, setReadyState);
}


BlueHue.prototype.turnOff = function(light_no){

    log.info(" turn off the light ");
    
    var setOffState = lightState.create().off();
    api.setLightState(light_no, setOffState);
}


BlueHue.prototype.setColor = function(light_no, R, G, B){

    log.info("set light color. light_no: " + light_no);

    var setColorState = lightState.create().rgb(R,G,B);
    api.setLightState(light_no, setColorState);
}

// Humix Actions

BlueHue.prototype.turnOnEye = function(){

    log.info(" turn on eye ");


    var setOnState = lightState.create().on();
    api.setGroupLightState(eyeGroupId, setOnState);
    
    //this.turnOn(leye);
    //this.turnOn(reye);
    
};

BlueHue.prototype.turnOffEye = function(){

    log.info(" turn off eye ");

    var setOffState = lightState.create().off();
    api.setGroupLightState(eyeGroupId, setOffState);

//    this.turnOff(leye);
//    this.turnOff(reye);

};

BlueHue.prototype.setEyeColor = function(color, level){

    log.info(" set eye color, color:"+color+", level:"+level);

    var colorState;
    if(color == 'green'){

        colorState = lightState.create().rgb(0,255,0).bri(level);
    }else if ( color == 'blue'){

        colorState = lightState.create().rgb(0,0,255).bri(level);
    }

//    api.setGroupLightState(eyeGroupId, colorState);
    api.setLightState(leye, colorState);
    api.setLightState(reye, colorState);

    currentLevel = level;
}


BlueHue.prototype.blinkEye = function(){

    log.info(" blinking");
    
    var setOff = lightState.create().off().transitionFast();

    api.setGroupLightState(eyeGroupId, setOff).then(onDelay).done();
    
    //api.setLightState(reye, setBlinkState);
    
}

var onDelay = function(){

    sleep.sleep(1);
    var setOn = lightState.create().on().bri(currentLevel).transitionFast();
    api.setGroupLightState(eyeGroupId,setOn);
    
}



BlueHue.prototype.awakeEffect = function(){


    log.info(" awake effect ");
    
    var setOnState = lightState.create().on().bri(255).transitionSlow();
//    var awakeState = lightState.create().off();//.rgb(0,0,255);

    api.setGroupLightState(eyeGroupId, setOnState).then(brightPromise).done();;
}

var brightPromise = function(){

//    sleep.sleep(1);
    
    var setBright = lightState.create().bri(255).transition(3000);
    api.setGroupLightState(eyeGroupId,setBright).then(normalPromise);
    
};

var normalPromise = function(){

    sleep.sleep(10);

    log.info("back to normal");
    var setNormal = lightState.create().bri(10);
    api.setGroupLightState(eyeGroupId,setNormal);
};



exports = module.exports = BlueHue;

