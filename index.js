// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// index.js is used to setup and configure your bot

// Import required pckages
const path = require('path');
const restify = require('restify');
const request=require('request')
var statement = require('./dialogs/luisHelper');
// Import required bot services. See https://aka.ms/bot-services to learn more about the different parts of a bot.
const { BotFrameworkAdapter, MemoryStorage, ConversationState, UserState, localStorage } = require('botbuilder');
const { BlobStorage } = require('botbuilder-azure')
const appInsights = require("applicationinsights");
const telemetry = appInsights.defaultClient;

// This bot's main dialog.
const { DialogAndWelcomeBot } = require('./bots/dialogAndWelcomeBot');
const { MainDialog } = require('./dialogs/mainDialog');
const { InsightsModule } = require('./insights_logger');

// Note: Ensure you have a .env file and include LuisAppId, LuisAPIKey and LuisAPIHostName.
const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });
// const insightsModule = new InsightsModule(process.env.minsightsSecret, process.env.minsightsRef);
// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters..
const insightsModule = new InsightsModule(process.env.M_INSIGHTS_TOKEN, process.env.M_INSIGHTS_REF);
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    channelService: process.env.ChannelService,
    openIdMetadata: process.env.BotOpenIdMetadata
});

//app insights start
// 




adapter.use(async (turnContext, next) => {

    insightsModule.logTurnContext(turnContext.activity)
    //userMessages.push(turnContext.activity)
    // hook up a handler to process any outgoing activities sent during this turn
    turnContext.onSendActivities(async (sendContext, activities, nextSend) => {

        if (activities[0].type == "trace") {
            // console.log("Type trace", activities[0])
            await insightsModule.logSendContext(activities);
        }
        else {
            // console.log("Type message",activities[0]);
           await insightsModule.logSendContext(activities);
        }

        await nextSend();

        // post-processing outgoing activities
    });

    await next();

    // post-processing of the current incoming activity 
    // console.log(`Processing activity ${turnContext.activity.id.text} finishing. `);    
    // console.log(userMessages);
    //console.log(botMessages)
});



// adapter.use(async (turnContext, next) => {
//     if (turnContext.activity.type == "event") {
//         //statement.getinterceptor(turnContext);
//        // console.log("Inside Event")
//         if (turnContext.activity.name === "initReponse") {
//             await turnContext.sendActivity("Hi! I'm vBot. It's nice to meet you.");
//             await new Promise(resolve => {
//                 setTimeout(resolve, 1000);
//             });
//             await turnContext.sendActivity("How can I help you today?");
//         }
//         else if (turnContext.activity.name === "SAPTM") {
//             await turnContext.sendActivity("Hey There! SAP Time Management can be tricky to deal with. Is there anything that I can assist you with?");
//         }

//     }

//    // insightsModule.logTurnContext(turnContext.activity)
//     // hook up a handler to process any outgoing activities sent during this turn
//     turnContext.onSendActivities(async (sendContext, activities, nextSend) => {
//        /* console.log("**************************************  Bot Meessage ************************");
//         console.log(activities);
//         console.log("**************************************  Bot Meessage ************************")*/
//         if (activities[0].type == "trace") {
//             //console.log("trace")
//            // console.log(activities[0]);
//            // insightsModule.logSendContext(activities);

//         }
//         else {
//             console.log("Else")
//             //console.log(activities[0]);
//            // insightsModule.logSendContext(activities);
//         }

//         await nextSend();

//         // post-processing outgoing activities
//     });

//     await next();

//     // post-processing of the current incoming activity 
//     // console.log(`Processing activity ${turnContext.activity.id.text} finishing. `);    
//     // console.log(userMessages);
//     //console.log(botMessages)
// });

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights.
    console.error(`\n [onTurnError]: ${error}`);
    // Send a message to the user
    await context.sendActivity(`I am sorry, but I am having trouble contacting the back end server for the required information. Please refresh the page and try again, or try again after sometime.`);
    telemetry.trackException({
        exception: "The back end server error which you are facing can be caused due to one of the following \n\n --- \n\n 1)API Manager is down. 2)App service is down. 3)User has given the wrong input"
    });
    // Clear out state
    await conversationState.delete(context);
};

// Define a state store for your bot. See https://aka.ms/about-bot-state to learn more about using MemoryStorage.
// A bot requires a state store to persist the dialog and user state between messages.
let conversationState, userState;

// For local development, in-memory storage is used.
// CAUTION: The Memory Storage used here is for local bot debugging only. When the bot
// is restarted, anything stored in memory will be gone.
const memoryStorage = new MemoryStorage();
conversationState = new ConversationState(memoryStorage);
userState = new UserState(memoryStorage);

// CAUTION: You must ensure your product environment has the NODE_ENV set
//          to use the Azure Blob storage or Azure Cosmos DB providers.

// Add botbuilder-azure when using any Azure services.
//const { BlobStorage } = require('botbuilder-azure');
// // Get service configuration
/*const blobStorageConfig = botConfig.findServiceByNameOrId(STORAGE_CONFIGURATION_ID);
const blobStorage = new BlobStorage({
    containerName: ('chatbotstorage'),
   storageAccountOrConnectionString: 'DefaultEndpointsProtocol=https;AccountName=vantagebotconversation;AccountKey=Dd219CzebiA/0K6oAixwRvdKA4Q9+58EPFG1z95zeyOqzyLYG5Idj1rxNt3plpvY9hxP5SKa8DHECHnteH/O9Q==;EndpointSuffix=core.windows.net',
});*/
/*const blobStorage = new BlobStorage({
    containerName: 'container3310',
    storageAccountOrConnectionString: 'blobstorage3310',
    storageAccessKey: 'J5S7scMibl1WLlJ/DIclYQXTpngXWIdBbHDHvBe7woWwN3iNSiXYTHPIN+wUny7ZZLlbJlWOdZ+K88t+cpIR3w=='
})
conversationState = new ConversationState(blobStorage);
userState = new UserState(blobStorage);*/

// Pass in a logger to the bot. For this sample, the logger is the console, but alternatives such as Application Insights and Event Hub exist for storing the logs of the bot.
const logger = console;

// Create the main dialog..
const dialog = new MainDialog(logger);
const bot = new DialogAndWelcomeBot(conversationState, userState, dialog, logger);
appInsights.setup(process.env.InstrumentationKey)
    .setAutoCollectExceptions(true);
appInsights.start();

// Create HTTP server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nSee https://aka.ms/connect-to-bot for more information`);
});
//ping test
server.get('/api/bot/pingtest', (req, res) => {
    res.send("App service is working")
})


// Listen for incoming activities and route them to your bot main dialog.
server.post('/api/messages', (req, res) => {
    // Route received a request to adapter for processing
    adapter.processActivity(req, res, async (turnContext) => {
        // route to bot activity handler.
        await bot.run(turnContext);
    });
});

//Bot Status API
server.use(restify.plugins.queryParser())
server.get("/api/bot/status", function (req, res) {
    console.log("ReferenceID", process.env.M_INSIGHTS_REF)

    if (req.query.id == process.env.MicrosoftAppId) {
        var options = {
            method: 'GET',
            url: process.env.url + '/bots/status?email=' + req.query.useremail,
            headers:
            {
                refid: process.env.M_INSIGHTS_REF,

            },

            auth: {
                bearer: process.env.M_INSIGHTS_TOKEN
            },


            json: true
        };
        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            res.json({
                online: body
            })
        });

    }
    else {
        res.send("Bot is in Offline state. It will be available in couple of hours. Stay tuned")
    }

})