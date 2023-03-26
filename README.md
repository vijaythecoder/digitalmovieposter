# Movie Poster Frame
This project is from my TikTok Video https://www.tiktok.com/@vijaysmarthome/video/7176371953446440234?is_copy_url=1&is_from_webapp=v1

To use this project, You need to get an API Key from the themoviedb.org.

Create an account on themoviedb.org and then goto settings, API section grab the API key that says API Key (v3 auth) or use the below link  once you login
https://www.themoviedb.org/settings/api

Once you have the API Key, Replace the XXXXXXX in the following url and use it on your TV browser to play the slideshow of the latest TV shows. One important thing is, once its loaded using the remote tap/touch on the poster which will make it full screen. 
```
https://vijaythecoder.github.io/digitalmovieposter/?apikey=XXXXXXXXX
```

## Customization
You can customise the app to show different posters using the URL Parameters. 

### To Show TV Movies
For example if you want to show the movie poster of John Wick which and it has ID of **324552**, you can grab this id from the themoviedb.org. If you look at the example URL below
after /movie/ you can see the number so thats the ID of the movie. 
https://www.themoviedb.org/movie/324552-john-wick-chapter-2
Now we have the id, you can add the parameter `&movies=324552` to show the john wick and also add multiple movie ids separating with commas. The final exmaple would look like below
```
https://vijaythecoder.github.io/digitalmovieposter/?apikey=XXXXXXXXX&movies=245891,604,238
```
### To Show TV Shows
In the same way you can show TV show posters too and after adding TV show ids in the same way, the final url would look like below
```
https://vijaythecoder.github.io/digitalmovieposter/?apikey=XXXXXXXXX&movies=245891,604,238&tv=246,72637
```

### To Show Trending Movies/TV Shows 

```
https://vijaythecoder.github.io/digitalmovieposter/?apikey=XXXXXXXXX&movies=245891,604,238&tv=246,72637&trending=1
```
The above url will show all the trending tv shows and movies this week, to customize more, for example if you want to show only popular tv shows and not movies add `&type=tv` and vice versa for movies `&type=movies`
The official documentation for those values can be found here https://developers.themoviedb.org/3/trending/get-trending




## Todo:
1. Show Latest Movies in Theaters, DVDs, Streaming.
2. Ability to configure which one which one of the above to show
3. Ability to choose Platforms like HBO, Netflix, Disney, etc.
4. Show extra info on the poster if needed like IMDB Rating, Now on playing on HBO, Netflix, etc.

