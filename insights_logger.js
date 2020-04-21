// ======================================== IMPORT STATEMENTS ================================================//
const request = require('request');
const crypto = require("crypto");
//============================================= VARIABLE DECLARATION ==============================================//
var token1 = process.env.M_INSIGHTS_TOKEN;
var ref1 = process.env.M_INSIGHTS_REF;
// ================================================= MINSIGHTS CREDENTIALS =============================================//
function insightdetails(token, ref) {
   return new Promise(resolve => {
      info = {
         "token": token,
         "reference": ref
      }
      resolve(info);
   });
}

exports.InsightsModule = class {
   constructor(token, ref) {
      this.token = token1;
      this.ref = ref1;
      insightdetails(token, ref)
   }

   logTurnContext(activity, id) {
      //console.log("Type : ", activity.type)
      return new Promise(function (fulfill, reject) {
         var messageData = {}
         if (!activity.text) {
            fulfill()
         }
         else {
            messageData.id = activity.id;
            messageData.conversationID = activity.conversation.id;
            messageData.timestamp = new Date();
            messageData.channel = activity.channelId;
            messageData.text = activity.text;
            messageData.recipient = activity.recipient.name;
            messageData.origin = "User";
            messageData.type = activity.type;
            messageData.user = activity.from;
            messageData.dialogId = id;
            if (messageData.text != null) {
               reportMessage(messageData, info).then(() => {
                  //console.log("User: ", messageData.text)
                  fulfill();
               }).catch(() => {
                  reject();
               })
            }
         }
      })
   }

   logSendContext(activities, id) {
      return new Promise(function (fulfill, reject) {
         //console.log("Type : ", activities[0].type)
         // if (activities[0].type == "waitingForAttachment" || (activities[0].type == "attachmentReceived") || activities[0].type =="typing") {
         //    fulfill()
         // }
         if (activities[0].type == 'trace') {
            var activity = activities[0];
            var messageData = {}
            messageData.replyToId = activity.replyToId;
            messageData.conversationID = activity.conversation.id;
            messageData.timestamp = new Date();
            //messageData.intent = activities[0].value.luisResult.topScoringIntent.intent;
            messageData.intent = activities[0].value.luisResult.topScoringIntent.intent;
            messageData.origin = "Bot";
            messageData.type = activity.type;
            messageData.dialogId = id;
            reportMessage(messageData, info).then(() => {
               fulfill();
            }).catch(() => {
               reject();
            })
         }
         if (activities[0].type == 'message') {
            var activity = activities[0];
            //console.log("bot : ", activity.text)
            var messageData = {}
            messageData.id = crypto.randomBytes(8).toString("hex");
            messageData.replyToId = activity.replyToId;
            messageData.conversationID = activity.conversation.id;
            messageData.timestamp = new Date();
            messageData.channel = activity.channelId;
            messageData.text = activity.text;
            messageData.recipient = activity.recipient.name;
            messageData.user = activity.from;
            messageData.origin = "Bot";
            messageData.type = activity.type;
            messageData.dialogId = id;
            reportMessage(messageData, info).then(() => {
               fulfill();
            }).catch(() => {
               reject();
            })
         }
         else {
            fulfill()
         }
      })
   }
}

function reportMessage(messageData, info) {
   var requestPayload = {
      url: process.env.url + "/conversation/v4/register/",
      method: 'POST',
      json: true,
      headers: {
         refid: info.reference
      },
      auth: {
         bearer: info.token
      },
      body: messageData
   };
   return new Promise(function (fulfill, reject) {
      request.post(requestPayload, function (err, response, body) {
         if (!err) {
            fulfill();
         } else {
           console.log("There is an error", err)
            reject();
         }
      });
   })
}


