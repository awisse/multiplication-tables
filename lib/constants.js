export const MAX_TABLE_INT = 12; /* Highest value in multiplication table */
export const MAX_PROPOSALS = 6; /* Number of answers in multiple choice */
export const NUM_QUESTIONS = 64; /* Number of questions asked */

export const TESTING = false; 
//export const TESTING = true; 

export const SUCCEED = 1;
export const FAIL = 0;

export const DELETE = "delete";
export const PLAY = "play";

/* View Events */
export const ADD_PLAYER_EV = "add_player";
export const PLAY_DELETE_EV = "play_delete";
export const KEY_DOWN_EV = "key_down";
export const KEY_UP_EV = "key_up";
export const DELETE_ALL_EV = "delete_all";
export const ANSWER_EV = "answer";
export const RESTART_EV = "restart";
export const SAVE_EV = "save";
export const LOAD_EV = "load";
/* Model Events */
export const PLAYERS_CHANGED_EV = "players_changed";

/* Parameters */
export const MAX_COMBINATIONS = 5; // Number of combinations to be asked
export const TIMEOUT = 10000; // Milliseconds before next question
export const MOVE_STAR_DELAY = 200; // Milliseconds before the star moves
export const ANSWER_DELAY = 1500; // Milliseconds to display answer layout
export const CORRECT_POINTS = 10; // Points for correct answer
export const PLOT_WIDTH = 500;
export const PLOT_HEIGHT = 300;
export const MIN_STAR_PCT = 0.6; // Minimum percentage to deserve a star
export const STAR_SIZE = 20; // Size of the star on the high score in pixels
export const BIG_STAR_SIZE = 0.9; /* Percentage of plot area */
// Players with a score higher than this can't be deleted: 
export const MAX_DELETE_SCORE = 100; 

/* Local Storage */
export const PLAYERS = "players";
export const BACKUP = "players-backup";

/* Paths */
/* Images */
export const IMG_PATH = "./assets/img/";
export const STAR_PNG = "star.png";
export const HPCT_PNG = "100percent.png";
/* Sounds */
export const SOUND_PATH = "./assets/sounds/";
export const PASS_SND = SOUND_PATH + "pass.wav";
export const FAIL_SND = SOUND_PATH + "fail.wav";
export const APPLAUSE_SND = SOUND_PATH + "SMALL_CROWD_APPLAUSE.wav";
export const CHEERING_SND = SOUND_PATH + "cheering.wav";
export const WARNING_SND = SOUND_PATH + "bikehorn.wav";
/* JSON */
export const PLAYERS_JSON = "players.json";

/* States */
export const NAMES_PAGE = 0;
export const QUIZ_PAGE = 1;
export const RESULT_PAGE = 2;
