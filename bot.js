const builder = require('botbuilder');
const restify = require('restify');
const mdbUtils = require('./movieUtils');

const server = restify.createServer();

server.listen(3978, () => {
    console.log('listening to port 3978')
});
const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
const bot = new builder.UniversalBot(connector);

server.post('/api/messages', connector.listen());

const intents = new builder.IntentDialog();

bot.dialog('/', intents);

intents.onDefault([
    (session, args, next) => {
        if (!session.userData.name){
            session.beginDialog('/who');
        }
        else {
            next();
        }
    },
    session =>
        session.send(`hi ${session.userData.name}! how can help you with movies today?`)
]);

intents.matches(/movie/i, [
    session => {
        session.beginDialog('/genre');
    },
    (session, results) => {
        console.log(results.genre);
        var genre = results.genre.id;
        if (genre > 0){
            session.dialogData.genre = genre;
            session.beginDialog('/year');
        }
        else {
            session.send('thank you for your visit! bye.');
            session.endDialog();
        }
    },
    (session, results) => {
        console.log(results.year);
        session.dialogData.year = results.year;
        session.send(`we're good! let me check for you...`);
        session.sendTyping();

        mdbUtils
            .getMovie(session.dialogData.genre, session.dialogData.year, true)
            .then((results) => {
                if (results.movies){
                    var movies = results.movies;
                    console.log(movies);
                    var cards = [];
                    var card;
                    var posterImage = "";
                    for (var i = 0; i < 4; i++){
                        posterImage = movies[i].poster_path ? `${mdbUtils.CONFIG.images.secure_base_url}${mdbUtils.CONFIG.images.poster_sizes[2]}${movies[i].poster_path}` : `https://placeholdit.imgix.net/~text?txtsize=35&txt=${movies[i].title}&w=300&h=160`
                        card = new builder.HeroCard(session)
                            .title(movies[i].title)
                            .subtitle(`released on ${movies[i].release_date}`)
                            .text(movies[i].overview)
                            .images([
                                builder.CardImage.create(session, posterImage)
                            ])
                            .buttons([
                                builder.CardAction.openUrl(session, `https://www.themoviedb.org/movie/${movies[i].id}`, 'See details')
                            ]);
                        cards.push(card);
                    }
                    var reply = new builder.Message(session)
                        .attachmentLayout(builder.AttachmentLayout.carousel)
                        .attachments(cards);

                    session.send(reply);
                    session.endDialog();
                }
                else if (results.errors){
                    msg.text(`oops, an error occurred. how can I help you?`);
                }
            });
    }
]);

bot.dialog('/who', [
    session =>
        builder.Prompts.text(session, 'hi! my name is DanielBot. and yours?'),

    (session, results) => {
        session.userData.name = results.response;
        session.endDialog()
    }
]);

bot.dialog('/genre', [
    session =>
        builder.Prompts.choice(session, 'please select a genre', mdbUtils.CONFIG.genres),

    (session, results) => {
        var genre = mdbUtils.CONFIG.genres[results.response.entity.toLowerCase()];
        session.endDialogWithResult({genre: genre});
    }
]);

bot.dialog('/year', [
    session =>
        builder.Prompts.text(session, 'please enter a release year'),

    (session, results) => {
        var year = results.response.match(/\d{4}/g);
        session.endDialogWithResult({year: year});
    }
])