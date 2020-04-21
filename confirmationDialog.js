// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// =================================================== IMPORT NPM MODULES =====================================//

const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog, ConfirmPrompt } = require('botbuilder-dialogs');
// ====================================== IMPORT RESPONSE FILES ==============================================//
var MiscResponse = require('../Responses/misc_response.json');
const appInsights = require("applicationinsights");
appInsights.setup(process.env.instrumentationKey).start()
const telemetry = appInsights.defaultClient;
// ====================================== IMPORT MISC FILES =================================================//

var payload = require("../payload.json");
var remedyFields = require('../remedyFields/remedyFields')

/**
 * importing attachment dialog
 */
const { AttachmentDialog } = require('./attachmentDialog.js')
//=========================================  VARIABLE DECLARATION =========================//
var convoID;
var characterlength = 1000;
const CONFIRM_PROMPT = 'confirmPrompt';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';
const ATTACH = 'attachment'
// ===============================   EXPORTS FUNCTION FOR GETTING THE CONVERSATION ID ==============================//
module.exports.getinterceptor = function (response) {
    conversationid = response.activity.conversation.id;
    convo(conversationid);
};
function convo(Details) {
    return new Promise(resolve => {
        convoID = Details
        resolve(convoID);
    });
}
//======================================= EXPORTS FUNCTION TO GET THE DIALOG ID ===============================//
// module.exports.getmessageData = function (response) {
//     dialogid = response.dialogId;
//     dialogId(dialogid);
// };
// function dialogId(dialog) {
//     return new Promise(resolve => {
//         resolve(dialog);
//     });
// }
// ======================================== SET TIMEOUT FUNCTION =============================================//
function timeout() {
    return new Promise(resolve => {
        setTimeout(resolve, 2000);
    });
}


//======================================== MAIN CLASS STARTS ==========================//


class ConfirmDialog extends ComponentDialog {
    constructor(id) {
        super(id);

        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new AttachmentDialog(ATTACH))
            .addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.questionPrompt.bind(this),
                this.FinalMessage.bind(this),
                this.uploadAttachment.bind(this),
                this.logAttachment.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async questionPrompt(stepContext) {
        stepContext.values.ticketid = stepContext.options.ticketnumber
        stepContext.values.incidentnumber = stepContext.options.incidentnumber;
        stepContext.values.entryid = stepContext.options.entryid;
        stepContext.values.accesstoken = stepContext.options.accesstoken;
        stepContext.values.proposedsolution = stepContext.options.proposedsolution;
        stepContext.values.saptaberror = stepContext.options.saptaberror;
        stepContext.values.summary = stepContext.options.summary;
        stepContext.values.id = [];
        stepContext.values.id.push(stepContext.context.id);
        await timeout();
        return await stepContext.prompt(CONFIRM_PROMPT, 'Was I able to solve the problem?');
    }

    async FinalMessage(stepContext) {
        stepContext.values.id.push(stepContext.context.id);
        if (stepContext.result == true) {
            remedyFields.detaileddescription(convoID, stepContext.context.noneId, false, true, true).then(function (data) {
                stepContext.values.detailedinfo = data;
                remedyFields.worklog(convoID, '', false, true, true).then(function (info) {
                    remedyFields.uploadWorklog(data.Detaildescription, stepContext.options, convoID + ".txt")
                    remedyFields.contentlength(stepContext.options.intent, stepContext.values.detailedinfo, info, characterlength, "", stepContext.values.proposedsolution, stepContext.values.saptaberror, true).then(async function (data1) {
                        stepContext.values.ticketpayload = data1.payload;
                        remedyFields.updatedetails(stepContext.values.ticketid, stepContext.values.accesstoken, stepContext.values.entryid, "close", stepContext.values.ticketpayload).then(function () {
                            remedyFields.updatedetails(stepContext.values.ticketid, stepContext.values.accesstoken, stepContext.values.entryid, "close", stepContext.values.ticketpayload);
                        })
                    })
                })
            })
            // =================== IF WE WANT TO CREATE TICKET PLEASE UNCOMMENT THE BELOW FUNCTION CALL  AND COMMENT THE INCIDENT VARIABLE IF NOT COMMENT THE CLOSINGTICKET FUNCTION AND UNCOMMENT THE INCIDENT VARIABLE  ====================//
            await stepContext.context.sendActivity(MiscResponse.confirmation_yes);
            stepContext.values.id = [];
            let convoState = stepContext.context.convo;
            convoState.delete(stepContext.context)
            return await stepContext.endDialog();
        }
        else {
            // return await stepContext.prompt(CONFIRM_PROMPT, MiscResponse.attachmentresponse.attachment_prompt);
            return await stepContext.prompt(TEXT_PROMPT,MiscResponse.outofscope)
        }
    }
    async uploadAttachment(stepContext) {
        return await stepContext.beginDialog('attachment', stepContext.options)
    }
    async logAttachment(stepContext) {
        remedyFields.detaileddescription(convoID, stepContext.context.noneId, false, true, false).then(function (data) {
            stepContext.values.detailedinfo = data;
            remedyFields.worklog(convoID, '', false, true, false).then(function (info) {
                remedyFields.contentlength(stepContext.options.intent, stepContext.values.detailedinfo, info, characterlength, stepContext.values.summary, "", "", false).then(async function (data1) {
                    stepContext.values.ticketpayload = data1.payload;
                    remedyFields.uploadWorklog(data.Detaildescription, stepContext.options, convoID + ".txt").then(() => {
                        console.log("API call success")
                    }).catch(() => {
                        console.log("API call failed")
                    })
                    remedyFields.updatedetails(stepContext.values.ticketid, stepContext.values.accesstoken, stepContext.values.entryid, "update", stepContext.values.ticketpayload).then(function () {
                    })
                })
            })
        })
        await stepContext.context.sendActivity(MiscResponse.attachmentresponse.yes + stepContext.values.incidentnumber);

        // ======================================= CODE SNIPPET TRACE THE LOGS IN APPLICATION INSIGHTS ===============================//
        telemetry.trackTrace({
            message: "User is not satisfied with the Bot response. For your reference, your remedy ticket number is " + stepContext.values.incidentnumber,
            severity: 1
        });
        stepContext.values.id = [];
        let convoState = stepContext.context.convo;
        convoState.delete(stepContext.context)
        return await stepContext.endDialog();
    }
}
module.exports.ConfirmDialog = ConfirmDialog;
