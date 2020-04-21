const { QnAMaker } = require('botbuilder-ai');
const { CardFactory } = require('botbuilder-core');
const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const {LuisHelper} = require('./luisHelper')
const {Assessment} = require('./assessment.js')
const { StateDialog } = require('../forwarditemDialog.js');
const STATE_RESPONSE = 'stateDialog';
const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';
const ASSMENT = 'assment'

// const insightsModule = new InsightsModule(process.env.minsightsSecret, process.env.minsightsRef);


const FORWARD_ITEM = 'forwarditem';

class MainDialog extends ComponentDialog {
    constructor(logger) {
        super('MainDialog');
        if (!logger) {
            logger = console;
            logger.log('[MainDialog]: logger not passed in, defaulting to console');
        }
        this.logger = logger;
        // Define the main dialog and its related components.
        // This is a sample "book a flight" dialog.
    
        this.addDialog(new StateDialog(STATE_RESPONSE));
        this.addDialog(new Assessment(ASSMENT));
        this.addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
            this.actStep.bind(this)
        ]));
        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a DialogContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} dialogContext
     */
    async run(context, accessor, ids, conversation) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);
        const dialogContext = await dialogSet.createContext(context);
        dialogContext.context.noneId = ids
        dialogContext.context.convo = conversation
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }
    async actStep(stepContext) {
        console.log("Main dialog", stepContext.context._activity.text)
       

        
    
         if (process.env.LuisAppId && process.env.LuisAPIKey && process.env.LuisAPIHostName) {
            // Call LUIS and gather any potential .
            var Details = {}
            console.log("**************************************** step4 **********************");
            Details = await LuisHelper.executeLuisQuery(this.logger, stepContext.context, stepContext);
            console.log("Details", Details)
            if (Details.intent) {
                if (Details.intent == "Intent_assesment") {
                    this.logger.log('LUIS extracted these booking details:', Details);
                    return await stepContext.beginDialog(ASSMENT)
                }
            }
            else
             {
                return await stepContext.continueDialog();
            }
           
        }
    }
}
module.exports.MainDialog = MainDialog;