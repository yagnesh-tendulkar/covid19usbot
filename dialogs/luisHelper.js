// ========================================== IMPORT NPM MODULES ===============================//
const { LuisRecognizer } = require('botbuilder-ai');
const { CardFactory } = require('botbuilder-core');
const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const request = require('request')

function timeout() {
    return new Promise(resolve => {
        setTimeout(resolve, 1500);
    });
}




class LuisHelper {
    /**
     * Returns an object with preformatted LUIS results for the bot's dialogs to consume.
     * @param {*} logger
     * @param {TurnContext} context
     * 
     */

    async dispatchToTopIntentAsync(context, intent, recognizerResult) {
        return new Promise((resolve, reject) => {
            if (intent == "q_covid-QnA") {
                console.log("++++++++++++++++++++++++++++++++++++++++++++++in qna")
                var options = {
                    'method': 'POST',
                    'url': 'https://covid19-assistant.azurewebsites.net/qnamaker/knowledgebases/ce35ec42-8f1e-475b-b176-49e7dfd3b83f/generateAnswer',
                    'headers': {
                        'Authorization': ' EndpointKey d90962ea-9bf5-46a9-8299-ca50a84948c4',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ "question": context.activity.text }),
                    //json:true

                };
                request(options, async function (error, response, body) {

                    //console.log(a)
                    if (error) throw new Error(error);
                    else {
                        body = JSON.parse(body)
                        console.log("QNA api", body)
                        await context.sendActivity(body.answers[0].answer)
                    }
                    return await context.endAllDialogs();

                });
            }

            else {
                console.log("Else part")
                console.log( recognizerResult.luisResult.connectedServiceResult.topScoringIntent.intent, intent)
                var intent1 = recognizerResult.luisResult.connectedServiceResult.topScoringIntent.intent
                var suggest = CardFactory.heroCard('Do you Want to take an assessment?', [], ['Start Assessment'])
                var terms = CardFactory.heroCard('Do you agree to the terms?', [], ['Yes','No'])
                var Details = {}
                if (intent1 == 'Intent_assesment') {
                    // logger.log('************************************* GREETING_INTENT *********************************');
                    // context.sendActivity({ type: 'typing' });
                               
                    // context.sendActivity("The main aim of this Coronavirus (COVID-19) self-assessment is to help you take proper medical decisions per guidelines provided by WHO. Please note that I’m not a medical expert and this is just a COVID-19 symptom checker, so for any life-threatening cases please consult a medical professional or call 911.");
                    // timeout()                    
                    // context.sendActivity({ attachments: [terms] });
                    Details.intent = intent1;
                    console.log("details",Details)
                    resolve(Details)
                    // return intent1

                    
                }
                if (intent1 == 'capability') {
                    // logger.log('************************************* GREETING_INTENT *********************************');
                    context.sendActivity({ type: 'typing' });
                    // await timeout()

                    context.sendActivity(" I can answer any questions on COVID-19 and am also capable of conducting a general assessment for COVID-19 symptoms");
                    timeout()
                    context.sendActivity({ attachments: [suggest] });
                }



                // resolve(recognizerResult.luisResult.connectedServiceResult.topScoringIntent.intent)
            }
        })

        //     const QArecognizer = new QnAMaker({
        //         knowledgeBaseId: "23591dd3-559c-427e-82b3-c6a5d14a3f2b",
        //         EndpointKey : "290a2185-ec7f-4fa8-9568-f843455c2695",
        //         endpoint: "https://ipgtestqna.azurewebsites.net/qnamaker"
        //        // host: "https://ipgtestqna.azurewebsites.net/qnamaker/knowledgebases/23591dd3-559c-427e-82b3-c6a5d14a3f2b/generateAnswer"
        //     });
        //     console.log("inside qna")
        //     console.log(QArecognizer)
        //     const results = await QArecognizer.getAnswers(context);
        //     console.log("inside result", results)
        //     if (results.length > 0) {
        //         //await context.sendActivity("Hello");
        //      await context.sendActivity(`${ results[0].answer }`);

        //     }
        //     return null;
        // }




    }
    static async executeLuisQuery(logger, context) {

        try {

            const recognizer = new LuisRecognizer({
                applicationId: process.env.LuisAppId,
                endpointKey: process.env.LuisAPIKey,
                endpoint: `https://${process.env.LuisAPIHostName}`
            }, {}, true);

            const recognizerResult = await recognizer.recognize(context);
            console.log("+++++++", recognizerResult)
            // var intent = LuisRecognizer.topIntent(recognizerResult);
            // console.log(intent)
            const dispatchrecognizeresult = recognizerResult.luisResult.topScoringIntent;
            console.log(dispatchrecognizeresult)
            const intent = dispatchrecognizeresult.intent;

            var luis = new LuisHelper()
            var intent2 = await luis.dispatchToTopIntentAsync(context, intent, recognizerResult);

            console.log(intent2)

            return intent2
            // // const recognizerResult = await recognizer.recognize(context);
            // // const intent = LuisRecognizer.topIntent(recognizerResult);


            // // ========================================= GENERAL DIALOGS   =============================================================//
            // if (intent == 'Intent_assesment') {
            //     logger.log('************************************* GREETING_INTENT *********************************');
            //     context.sendActivity({ type: 'typing' });
            //     await timeout()
            //     await context.sendActivity("Intent_assesment triggered");

            // }
            // else if (intent == 'Capabilities') {
            //     logger.log('*************************************  CAPABILITY_INTENT *********************************');
            //     context.sendActivity({ type: 'typing' });
            //     await timeout()
            //     await context.sendActivity("Hey, I can help you get your questions answered about Miracle Software Systems. You can say, \n\n i. Can you give me some information about Miracle? \n ii. What does Miracle do? \n iii. How easy is it to build a chat-bot with Miracle?")

            // }

            // else if (intent == 'Miracle_Info') {
            //     logger.log('*************************************  MIRACLE_INFO_INTENT  *********************************');
            //     context.sendActivity({ type: 'typing' });
            //     await timeout()
            //     await context.sendActivity("Miracle Software Systems is a software integration service provider based out of Novi, Michigan.");

            // }
            // else if (intent == 'Miracle_Cap') {
            //     logger.log('************************************* MIRACLE_CAP_INTENT *********************************');
            //     context.sendActivity({ type: 'typing' });
            //     await timeout()
            //     await context.sendActivity("Miracle specializes in multiple fields including Cognitive services, IoT and even Augmented and Virtual reality!");

            // }
            // else if (intent == 'Miracle_bot') {
            //     logger.log('************************************* MIRACLE_BOT_INTENT *********************************');
            //     context.sendActivity({ type: 'typing' });
            //     await timeout()
            //     await context.sendActivity("Building chatbots with Miracle is as easy as 1-2-3! Just talk to one of our employees at the booth and they'll help you understand RIPS - The Rapid Innovation and Prototyping Service - the integral part of Miracle's bot building practice.");

            // }

            // else if (intent == 'None') {
            //     logger.log('*************************************  NONE_INTENT *********************************');
            //     context.sendActivity({ type: 'typing' });
            //     await timeout()
            //     await context.sendActivity("I am not sure how to help with that yet. Have you checked out mInsights? Miracle's new insights platform that can help you train me better.");

            // }
            // else if (intent == 'Thankyou') {
            //     logger.log('************************************* THANKYOU_INTENT *********************************');
            //     context.sendActivity({ type: 'typing' });
            //     await timeout()
            //     await context.sendActivity("You're welcome. have a great day!");

            // }
            // else if (intent == 'Anythingelse') {
            //     logger.log("************************************* ANYTHING_ELSE_INTENT *********************************");
            //     context.sendActivity({ type: 'typing' });
            //     await timeout()
            //     await context.sendActivity("I am not sure how to help with that yet. Have you checked out mInsights? Miracle's new insights platform that can help you train me better");

            // }
        } catch (err) {
            logger.warn(`LUIS Exception: ${err} Check your LUIS configuration`);

        }

    }


    /*static parseCompositeEntity(result, compositeName, entityName) {
        const compositeEntity = result.entities[compositeName];
        if (!compositeEntity || !compositeEntity[0]) return undefined;

        const entity = compositeEntity[0][entityName];
        if (!entity || !entity[0]) return undefined;

        const entityValue = entity[0][0];
        return entityValue;
    }

    static parseDatetimeEntity(result) {
        const datetimeEntity = result.entities['datetime'];
        if (!datetimeEntity || !datetimeEntity[0]) return undefined;

        const timex = datetimeEntity[0]['timex'];
        if (!timex || !timex[0]) return undefined;

        const datetime = timex[0].split('T')[0];
        return datetime;
    }*/
}

module.exports.LuisHelper = LuisHelper;
