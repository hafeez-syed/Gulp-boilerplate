/**
 * Created by Hafeez on 9/23/2016.
 */
var notifier = require('node-notifier'),
    util = require('gulp-util');

function messages() {
    return {
        logMessage: logMessage,
        handleNotification: handleNotification
    };
    
    function handleNotification(message) {
        notifier.notify({
            title: 'BREAKING NEWS . . . ',
            icon: (__dirname + '/../notifieravatar.png'), // Absolute path to Icon
            sound: true,
            wait: true,
            message: message.toString()
        }, function(err, res) {
            if(res) {
                //logMessage('Response = ' + res);
            }
        });
        
        if (typeof this.emit === 'function') this.emit('end');
    }
    
    function logMessage(msg) {
        if (typeof(msg) === 'object') {
            for (var item in msg) {
                if (msg.hasOwnProperty(item)) {
                    print(msg[item]);
                }
            }
        } else {
            print(msg);
        }
        
        function print(msg) {
            var messageString = '*************************';
            util.log(messageString, util.colors.blue(msg), messageString);
            util.beep();
        }
    }
}


module.exports = messages;
