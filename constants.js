export const MAX_TABLE_INT = 12; /* Highest value in multiplication table */
export const MAX_PROPOSALS = 6; /* Number of answers in multiple choice */
export const NUM_QUESTIONS = 64; /* Number of questions asked */

// export const TESTING = false; 
export const TESTING = true; 

export const SUCCEED = 1;
export const FAIL = 0;

export const DELETE = 'delete';
export const PLAY = 'play';

/* Events */
export const ADD_PLAYER_EV = 'add_player';
export const PLAY_DELETE_EV = 'play_delete';
export const DELETE_ALL_EV = 'delete_all';
export const ANSWER_EV = 'answer';
export const RESTART_EV = 'restart';

/* Parameters */
export const MAX_COMBINATIONS = 100; // Number of combinations to be asked
export const TIMEOUT = 10000; // Milliseconds before next question
export const ANSWER_DELAY = 1500; // Milliseconds to display answer layout
export const CORRECT_POINTS = 10;
export const PLOT_WIDTH = 500;
export const PLOT_HEIGHT = 300;
export const MAX_DELETE_SCORE = 100; // Players over this can't be deleted

/* Local Storage */
export const PLAYERS = 'players';

/* Paths */
export const IMG_PATH = './assets/img/'
export const STAR_PNG = 'star-24x24.png';
