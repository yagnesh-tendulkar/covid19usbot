// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { ConfirmPrompt, ChoicePrompt, TextPrompt, WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { DateResolverDialog } = require('./dateResolverDialog');
const Card = require('../cards')
const { CardFactory, MessageFactory } = require('botbuilder-core');
const CHOICE_PROMPT = 'ChoicePrompt';
const CONFIRM_PROMPT = 'ConfirmPrompt';
const DATE_RESOLVER_DIALOG = 'dateResolverDialog';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';
async function showages(stepContext) {
    var suggest = CardFactory.heroCard('', [], ['Younger than 2 years old', '2-4 years', '5-9 years', '10-18 years', '19-29 years', '30-39 years', '70-79 years', '80+ years'])
    return await stepContext.prompt(TEXT_PROMPT, { prompt: { attachments: [suggest] } });
}

class Assessment extends ComponentDialog {
    constructor(id) {
        super(id || 'Assessment');
        this.addDialog(new TextPrompt(TEXT_PROMPT, this.textvalidator))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new ChoicePrompt(CHOICE_PROMPT))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.askConfirmation.bind(this),
                this.validate.bind(this),
                this.gender.bind(this),
                this.age.bind(this),
                this.state.bind(this),
                this.symptoms.bind(this),
                this.history.bind(this),
                this.travel.bind(this),
                this.area.bind(this),
                this.contact.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }
    //==================================================assessment intial message================================================
    async askConfirmation(stepContext) {
        await stepContext.context.sendActivity({ type: 'typing' });
        console.log("heyyyyy")
        await stepContext.context.sendActivity("The purpose of the Coronavirus Self-Checker is to help you make decisions about seeking appropriate medical care. This system is not intended for the diagnosis or treatment of disease or other conditions, including COVID-19. This system is intended only for people who are currently located in the United States. Please note that I’m not a medical expert and this is just a COVID-19 symptom checker, so for any life-threatening cases please consult a medical professional or call 911 immediately.")
        const promptOptions = {
            prompt: " Do you agree to the terms?",
            choices: [
                {
                    value: 'I agree',
                    synonyms: ['yes', 'ok', 'agreed']
                },
                {
                    value: 'I don’t agree',
                    synonyms: ['not', 'not agree', 'disagree']
                }
            ]

        };

        return await stepContext.prompt(CHOICE_PROMPT, promptOptions);
    }
    //==================================================terms and conditions================================================
    async validate(stepContext) {
        const FinalData = stepContext.options;
        FinalData.terms = stepContext.result.value;
        console.log(stepContext.result, "=============")
        if (stepContext.result.value == 'I agree') {
            return await stepContext.continueDialog();
        }
        else {
            await stepContext.context.sendActivity("Your consent is required to move forward with the self-assessment. Please click on Yes to agree our terms")
            return await stepContext.beginDialog(this.id)
        }
    }
    //==================================================state buttons================================================
    async gender(stepContext) {

        await stepContext.context.sendActivity("I’m here to guide you through the Coronavirus Self-Checker.")
        await stepContext.context.sendActivity("To provide information on the right level of care, we are going to ask you a series of questions. Let’s get started.")
        const promptOptions = {
            prompt: "Where are you located?",
            choices: [
                {
                    value: 'United States',
                    synonyms: ['US', 'unitedstates', 'america']
                },
                {
                    value: 'Outside the US',
                    synonyms: ['not', 'not agree', 'disagree']
                }
            ]

        };

        return await stepContext.prompt(CHOICE_PROMPT, promptOptions);
    }
    //==================================================if US or Outside US================================================

    async age(stepContext) {
        const FinalData = stepContext.options;
        FinalData.country = stepContext.result.value;
        console.log("*********************************", stepContext.result)
        if (stepContext.result.value == 'United States') {
            await stepContext.context.sendActivity({ attachments: [CardFactory.adaptiveCard(Card["symptoms"])] })
            return await stepContext.prompt(TEXT_PROMPT, { prompt: "" });
        }
        else {
            await stepContext.context.sendActivity("Your consent is required to move forward with the self-assessment. Please click on Yes to agree our terms")
            return await stepContext.beginDialog(this.id)
        }


    }
    //==================================================After selected state================================================
    async state(stepContext) {
        const FinalData = stepContext.options;
        FinalData.age = stepContext.result;
        return await stepContext.prompt(CONFIRM_PROMPT, { prompt: "Are you ill, or caring for someone who is ill?" });
    }
    //================================================illness Yes/NO===================================
    async symptoms(stepContext) {
        if (stepContext.result) {
            const promptOptions = {
                prompt: "Are you answering for yourself or someone else?",
                choices: [
                    {
                        value: 'Myself',
                        synonyms: ['Myself', 'me', 'personally', 'my own inbox', 'own', 'my own']
                    },
                    {
                        value: 'Behalf of Someone',
                        synonyms: ['behalf', 'someone', 'others', 'another']
                    }
                ]

            };

            return await stepContext.prompt(CHOICE_PROMPT, promptOptions);
        } else {
            await stepContext.prompt(TEXT_PROMPT, { prompt: "Sounds like you are feeling ok. This Coronavirus Self-Checker system is for those who may be sick. Learn more about COVID-19 and what you can do to help on the CDC website(https://www.cdc.gov/coronavirus/2019-ncov/index.html). Please also see your local area’s website: Florida Department of Health (state related gov website link)" });
            return await stepContext.endDialog()
        }
    }
    //=============================================show ages============================
    async history(stepContext) {
        const FinalData = stepContext.options;
        FinalData.about = stepContext.result.value;
        if (stepContext.result.value == "Myself") {
            await stepContext.context.sendActivity("What is your age?")
            return await showages(stepContext)
        } else {
            await stepContext.context.sendActivity("What is their age?")
            return await showages(stepContext)
        }
    }

    //=====================show buttons based on ages=======================================
    async travel(stepContext) {
        const FinalData = stepContext.options;
        FinalData.age = stepContext.result;
        console.log("========================after getting ages========================", stepContext.result)
        if (stepContext.result == 'Younger than 2 years old') {//below 2 years
            var suggest = CardFactory.heroCard('', [], ['Not experiencing any life-threatening symptoms', 'Extremely fast or shallow breathing', 'Bluish lips or face', 'Not waking up or interacting when awake', 'So irritable that the child does not want to be held', 'Seizures'])
            return await stepContext.prompt(TEXT_PROMPT, { prompt: { attachments: [suggest] } });

        } else (stepContext.result == '2-4 years') //2-4 years
        var suggest = CardFactory.heroCard('What is your gender?', [], ['Male', 'Female', 'Other'])
        return await stepContext.prompt(TEXT_PROMPT, { prompt: { attachments: [suggest] } });
    }


    async area(stepContext) {
        const FinalData = stepContext.options;
        FinalData.travel = stepContext.result;
        console.log(FinalData)
        if (stepContext.result == "Not experiencing any life-threatening symptoms" && FinalData.age === 'Younger than 2 years old') {
            await stepContext.context.sendActivity("Sorry, this Coronavirus Self-Checker is for people who are at least 2 years old Call your child’s healthcare provider today. Tell them if your sick child has had contact with someone with COVID-19 or if they have recently been to an area where COVID-19 is spreading.")
            return await stepContext.endDialog()
        } else {
        }
    }


    async contact(stepContext) {
        const FinalData = stepContext.options;
        FinalData.area = stepContext.result;
        return await stepContext.prompt(CONFIRM_PROMPT, { prompt: " Have you been in contact with anybody with COVID-19?" });
    }


    async finalStep(stepContext) {
        const FinalData = stepContext.options;
        FinalData.contact = stepContext.result;


        console.log(stepContext.options)
        if (stepContext.result === true) {

        } else {
            return await stepContext.endDialog();
        }
    }
    async textvalidator(promptcontext) {
        return true;
    }

}

module.exports.Assessment = Assessment;
