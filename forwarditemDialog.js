// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// ==========================================  IMPORT STATEMENTS =========================================//
const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';
// ====================================  MAIN CLASS STARTS =========================================//
class StateDialog extends ComponentDialog {
    constructor(id) {
        super(id || 'StateDialog');
        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.statePrompt.bind(this),
                this.finalStep.bind(this)
            ]));
 
        this.initialDialogId = WATERFALL_DIALOG;
    }
    async statePrompt(stepContext) {
        const statedetails = stepContext.options;
        var a = MiscResponse.state;
        return await stepContext.prompt(TEXT_PROMPT, { prompt: a[Math.round(Math.random() * 1)] });
    }
    async finalStep(stepContext) {
        await stepContext.context.sendActivity('Good to Know!');
        return await stepContext.endDialog();
 
    }
}
 
module.exports.StateDialog = StateDialog;