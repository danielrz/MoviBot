/**
 * Created by danielr on 2/16/17.
 */
const mdb = require('moviedb')(process.env.MOVIE_DB_API_KEY);
var Promise = require('bluebird');

    const CONFIG = { //got from https://developers.themoviedb.org/3/configuration and from https://developers.themoviedb.org/3/genres
        "images": {
            "base_url": "http://image.tmdb.org/t/p/",
            "secure_base_url": "https://image.tmdb.org/t/p/",
            "backdrop_sizes": [
                "w300",
                "w780",
                "w1280",
                "original"
            ],
            "logo_sizes": [
                "w45",
                "w92",
                "w154",
                "w185",
                "w300",
                "w500",
                "original"
            ],
            "poster_sizes": [
                "w92",
                "w154",
                "w185",
                "w342",
                "w500",
                "w780",
                "original"
            ],
            "profile_sizes": [
                "w45",
                "w185",
                "h632",
                "original"
            ],
            "still_sizes": [
                "w92",
                "w185",
                "w300",
                "original"
            ]
        },
        "change_keys": [
            "adult",
            "air_date",
            "also_known_as",
            "alternative_titles",
            "biography",
            "birthday",
            "budget",
            "cast",
            "certifications",
            "character_names",
            "created_by",
            "crew",
            "deathday",
            "episode",
            "episode_number",
            "episode_run_time",
            "freebase_id",
            "freebase_mid",
            "general",
            "genres",
            "guest_stars",
            "homepage",
            "images",
            "imdb_id",
            "languages",
            "name",
            "network",
            "origin_country",
            "original_name",
            "original_title",
            "overview",
            "parts",
            "place_of_birth",
            "plot_keywords",
            "production_code",
            "production_companies",
            "production_countries",
            "releases",
            "revenue",
            "runtime",
            "season",
            "season_number",
            "season_regular",
            "spoken_languages",
            "status",
            "tagline",
            "title",
            "translations",
            "tvdb_id",
            "tvrage_id",
            "type",
            "video",
            "videos"
        ],
        "genres": {
            action: {
                id: 28,
            },
            adventure: {
                id: 12,
            },
            animation: {
                id: 16,
            },
            comedy: {
                id: 35,
            },
            documentary: {
                id: 99,
            },
            drama: {
                id: 18,
            },
            horror: {
                id: 27,
            },
            mystery: {
                id: 9648,
            },
            romance: {
                id: 10749,
            },
            '(quit)': {
                id: 0,
            },
        }
    };

const _shuffle = (array) => {
    var currentIndex = array.length, temporaryValue, randomIndex ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
};


const getMovie = (genre, year, shuffle) => {
    return new Promise(function (resolve) {
        // Call the Movie DB API passing the genre and release year and sorting by popularity
        mdb.discoverMovie({
            sort_by: 'popularity.desc',
            with_genres: genre,
            primary_release_year: year,
        }, (err, res) => {
            // If there's no error
            if (!err) {
                var movies = shuffle ? _shuffle(res.results) : res.results;
                // Choose a random movie from the array of movies
                resolve({movies: movies})
            } else { // There's an error
                resolve({error: "Error while fetching movies"});
            }

        });
    });
};
module.exports = {
    CONFIG: CONFIG,
    getMovie: getMovie
};



