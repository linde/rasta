

# Original prompt

```
i would like to create a static single page application to rank season tickets. 

the app should start with a simple modern looking form which allows the upload of a CSV delimited file. it should then allow mapping of the columns for game date, time, opponent, location. 

from those values, it should then display a form to rank the unique values from the upload. these values should be bucketed intelligently (times to hour buckets) and also there should be a derived value which indicates mid-week day games. 

the form to set these values should be easily accessible to re-rank along the way (ie a gear button in the app).  

once ranked, the games should then be grouped by series so that if two games from the same series are near in the rankings, they collapse into a selection group. within the group the order should be the raw rank order.

please use commonly used tooling -- react, webpack, and whatever free CSS is commonly used and looks clean and modern. that said, please minimize dependancies.

please also create an overall brief README.md that outlines what is in the project and also a DESIGN.md that explains how the app. lastly please add unit tests for any libraries and e2e tests which we will extend through usage and debugging.
```

# Follow-ups


```
please title the app, "RaSTA (Rank a Season's Ticket Automatically)". also, please rank the subsequent list by rank descending.
```


```
i have supplied an example in the "examples/GameTicketPromotionPrice.csv" directory. please use this for tests also, please link to it from the upload screen with a link prompt "... or use this example from the 2026 gmen".  if the following columns are present in the file insenstive to letter case, use them for the respective columns:  "START DATE" for game date; "START TIME" for the time; "DESCRIPTION" for opponent; and "LOCATION" for location.
```

```
i incorrectly made tickets singular -- it should be "Rank a Season's Tickets Automatically". also, we dont need the "Welcome to the Season Ticket Ranker" in the mapping screen. please remove it. also, the Oppenent in the default should come from "SUBJECT"
```

```
we dont need the "Welcome to the Season Ticket Ranker" large banner. remove it. also, please make the prompt for the sample file, to be a link for "example" not a button.
```

```
please remove the "at ..." text in the opponents, if it exists.
```

```
for series, please dont display them in a drop down.  display the min and max dates in a range (ie "Mar 13, 2026" and "Mar 14, 2026" and "Mar 16, 2026" would be "Mar 13-16, 2026"). in the parenthesis where the time is, please put the month/date without the year).  Also please put an abbrev day of the week in the leftmost date field.
```

```
please move the day of week to be in the parenthesis with the respective dates. be sure to also show the respective time with the month day
```

```
please make the "Settings" button a gear and to the left of it, please make a share button that when clicked copies the text of the ranked games to the clipboard and explains this has occured to the user 
```

```
please rename "Time Buckets" to be "Game TIme"; also move time time settings above the opponent list
```

```
move Locations up to the top of the settings.  also provide a little padding between the option selections
```

```
please make a npm script to compile the app into a dist directory. please exclude the dist directory from github. also, in the readme, please document common steps including publishing. please provide an example gsutil example to publish the compiled directory to a google cloud storage bucket recursively.
```

```
when i run the local server via `python -m http.server --port 8080` and dont specify the base directory then load localhost:8080/dist/ in the browser i am getting 404s becasue the app expects to be in the root director.  please make it work within a subdirectory
``

```
settings needs to keep the existing ranking preferences from the previous screen. 
```

```
in the ranking preferences, please have a reset icon to reset to zero for all the values. this should be on the "ranking preferences" line in the right corner
```

```
please add a feature to have a little grey delete "x" that removes the entry manually from the list.  the x should not appear in the clipboard content. it should appear at the end of the row.  for multi-game series, replace the [x] button with a "expand" button that shows the games in the series in rows and have the 'x" button for each so they can individually be excluded from the series.  collect the exclusions in a section called "Exclusions" below the final list of Ranked Games
```

# Backlog


```
create a mechanism to map the current download location for all baseball teams season ticket files for the current season. and allow selection by team instead of having people drop in the file.  if this is done, please store the correct mapping for the file in a static array associated with the selection
```

```
Create a ranking preference macro that defaults the sort to the previous seasons' win/loss percentage.
```