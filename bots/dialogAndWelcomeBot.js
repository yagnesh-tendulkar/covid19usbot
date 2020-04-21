// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { CardFactory } = require('botbuilder-core');
const { DialogBot } = require('./dialogBot');


class DialogAndWelcomeBot extends DialogBot {
    constructor(conversationState, userState, dialog, logger) {
        super(conversationState, userState, dialog, logger);
		//console.log("============================== logger======================")
//console.log(logger);
        this.onMembersAdded(async context => {
			//console.log("============================== Context ======================")
//console.log(logger);
//console.log(context);

            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    //await context.sendActivity("Hi! I'm Irwin. It's nice to meet you.")
                        /*await new Promise(resolve => {
                            setTimeout(resolve, 1000);
                        });
                        await context.sendActivity("How can I help you today?")*/
                }
            }
        });
    }
}

module.exports.DialogAndWelcomeBot = DialogAndWelcomeBot;
