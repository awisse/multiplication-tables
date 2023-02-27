## What
This is a simple multiplication table quiz web app. Inspired by
[LucaRainone](https://github.com/LucaRainone/multiplication-tables-webapp).

[Demo](https://multiplication.awisse.ca/)

## Features

1. Different users with their own history of results and problem lists.

2. Six multiple choice answers. Four are close to the correct answer, one is
   random.

3. On the result page, percentage of correct answers and the all-time high
   score.

4. On the result page, a graph with the history of results. An animation of a
   star for a new high score provided the score is above 60%. An animation
   for the first time the user hits 100%. The star indicates the high score.

5. One hundred random problems per game out of a maximum possible of 121
   (=11x11). There are no multiplications by one.

6. A correct answer reduces the probability of the same question being asked
   again. A wrong or missed answer increases the probability of the same
   question being asked again. The probabilities are persistent between
   sessions (saved in `localStorage`) but not between different computers.

7. Scoring:
   * A maximum of 10 seconds to answer. After that, the correct answer is
     highlighted for 2 seconds and the next question follows automatically.
   * A minimum of ten points for a correct answer.
   * Ten minus the number of seconds to the correct answer is added to the
     score.  Example: If it takes three seconds to answer, seven is added to
     the score for a total of 17 points for the correct answer.

8. Consequently: set aside between 11 and 20 minutes per quiz (for 100
   questions).

9. A "hidden" feature (CTRL-META-s: Watch the top left corner of the page)
   allows exporting the user/result database in JSON format. This
   database can then be imported on another computer (CTRL-META-s twice).
   Pressing (CTRL-META-s) repeatedly cycles through "Save...", "Import..."
   and hidden. There are a few syntax checks during import. The file won't be
   accepted and doesn't overwrite anything if it can't be parsed properly.

10. Another "hidden" feature (Alt-Shift: Watch the buttons next to the players)
    allows the deletion of a player as long as her score is below 100
    (can't delete your sister because her
    score is better than yours :smirk:). This is mostly to allow immediate deletion
    of a misspelled newly added player name. A player can always be deleted
    by **carefully** modifying the exported JSON database and reimporting it.

11. **For experts**: A backup copy of the JSON database is kept in `localStorage` when
    a JSON file is imported. There is presently no user interface option to recover 
    this backup. A confirmation dialog will be needed as the user can easily overwrite 
    recent results with a possibly very old backup.


## Why
I have two grandchildren in elementary school. I want to help them master the
multiplication tables up to 12.

## Contributing

Fixes and contributions are welcome.

## Translations

Presently available in French and English.

The localized files are inside the `src/js/locale` directory. Use
any of the {langCode}.js file as a template and add your {langCode}.js file.
In `src/js/locale/default.js`, add your language file with the corresponding
ISO 639-1 langCode. The ISO code will be automatically added to the menu.

## Miscellaneous comments and possible modifications

The number of questions asked is fixed at 100 and not configurable.
Otherwise, high scores and the history graph, even scaled, would not make
sense as the difficulty between the quizzes it not uniform.

Divisions to be added in the future.
