var restify = require('restify');
var builder = require('botbuilder');
var cognitiveservices = require('./lib/botbuilder-cognitiveservices');
var botbuilderteams = require('botbuilder-teams');
//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    //appId: process.env.MICROSOFT_APP_ID,
    //appPassword: process.env.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', connector.listen());
console.log("Information of call:");
console.log(server);

var bot = new builder.UniversalBot(connector);
bot.set('storage', new builder.MemoryBotStorage());         // Register in-memory state storage

//=========================================================
// Bots Dialogs
//=========================================================

var qnaRecognizer = new cognitiveservices.QnAMakerRecognizer({
    knowledgeBaseId: 'f1a97bb6-4c1d-46dc-93e9-1fb6880004ad',
    subscriptionKey: '1810a77688a841b998cb658bfa8c50fe'
});

//var LuisModelUrl = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/e1a796ef-d580-4be6-9cf3-b2e22a1d9ddc?subscription-key=81ed66d356b345219e4c3049622c1b97&verbose=true&timezoneOffset=0&q=';      // set your LUIS url with LuisActionBinding models (see samples/LuisActionBinding/LUIS_MODEL.json)
//var luisRecognizer = new builder.LuisRecognizer(LuisModelUrl);

// Setup dialog
var intentsDialog = new builder.IntentDialog({ recognizers: [qnaRecognizer ] });//luisRecognizer
bot.dialog('/', intentsDialog);

// QnA Maker
intentsDialog.matches('qna', (session, args, next) => {
    var answerEntity = builder.EntityRecognizer.findEntity(args.entities, 'answer');
    session.send(answerEntity.entity);
});
//Removed Luis Actions to Test QnA Maker
// LUIS Action Binding
//var SampleActions = require('./lib/all');
//cognitiveservices.LuisActionBinding.bindToBotDialog(bot, intentsDialog, LuisModelUrl, SampleActions);



// Default message
intentsDialog.onDefault(session => session.send('Sorry, I didn\'t understand that.'));