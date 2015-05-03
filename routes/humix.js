var express = require('express');
var router = express.Router();
var BlueHue = require('../lib/hue.js');

log = require('logule').init(module, 'humix_control');


var hue = new BlueHue();

var stateEnum = {

    STATE_ON : "state_on",
    STATE_OFF : "state_off"
};

var currentEyeState;
var blinkEventID;
var disableBlink = false;

router.get('/awake', function(req,res){

    log.info('awaking, current state'+currentEyeState);


    if(currentEyeState != stateEnum.STATE_ON){

        hue.awakeEffect();
//        hue.turnOnEye();
        currentEyeState = stateEnum.STATE_ON;
    }
    
    res.write("roger that");
    res.end();

    // random blink

    setInterval(function(){
        if(!disableBlink)
           hue.blinkEye();

    }, Math.floor((Math.random() * 30) + 1) * 1000);


    setTimeout(function(){

        log.info("say hello");
        var exec = require('child_process').exec, child;

        child = exec('aplay voice/hello.wav', function (error, stdout, stderr) {
        
        console.log('stdout: ' + stdout);
        if (error !== null) {
             console.log('exec error: ' + error);
        }
    });
    // child();

    }, 2000);

    
    log.info(" blink event id:"+ blinkEventID);
    disableBlink = false;
});

router.get('/sleep', function(req,res){

    log.info('sleeping, current state:' + currentEyeState);

    //if(currentEyeState != stateEnum.STATE_OFF){
        //hue.sleepEffect();
        hue.turnOffEye();
    //    currentEyeState = stateEnum.STATE_OFF;
    //}

    log.info("say goodbye");
    var exec = require('child_process').exec, child;

    child = exec('aplay voice/byebye.wav', function (error, stdout, stderr) {

    console.log('stdout: ' + stdout);
        if (error !== null) {
             console.log('exec error: ' + error);
        }
    });
    disableBlink = true;
    res.write("roger that");
    res.end();
});

router.get('/blink', function(req,res){

    log.info('blinking');

    hue.blinkEye();
        
    res.write("roger that");
    res.end();
});


router.post('/feel', function(req, res) {
    
    log.info('hue feel:'+ req.body);

    var emo_score = req.body.emotion_score;

    log.info(" emo score :" + emo_score);


    var level = Math.abs(emo_score);
    if (level != 0){

        level = (level /100) * 255
    }
    
    hue.setEyeColor( emo_score > 0 ? "green" : "blue" , Math.abs(level));

    res.write("roger that");
    res.end();    
});

router.post('/speak', function(req, res) {
    
    log.info('speak feel:'+ req.body);

    res.write("roger that");
    res.end();    
});


function scoreMapping(score){

    
    
}


module.exports = router;



