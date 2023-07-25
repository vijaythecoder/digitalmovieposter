<template>
  <div>
    <div class="bg-gray-900 h-screen w-screen -rotate-90" @click="toggleFullScreen">
      <div v-if="nowPlayingMovie.thumb">
        <img class="transition-opacity absolute ease-in duration-[2000ms] h-screen w-screen"  :src="plexUrl + nowPlayingMovie.thumb + '?X-Plex-Token=' + plexToken" alt="">
      </div>
      <vueper-slides
        v-else
        fade
        autoplay
        :bullets="false"
        :arrows="false"
        fixed-height="100vh"
        :duration="$route.query.timer*1000"
      >
        <vueper-slide
          v-for="(movie, i) in movies"
          :key="i"
          :image=" movie.currentPlaying ? movie.poster_path : 'https://image.tmdb.org/t/p/original' + movie.poster_path"
          class="no-shadow"
        >
          <template #content v-if="movie.currentPlaying">
            <div class="text-white bg-red-900 p-5 bg-opacity-80 text-center text-3xl">
              NOW PLAYING
            </div>
          </template>
        </vueper-slide>
      </vueper-slides>
    </div>

  </div>
</template>

<script>
import axios from 'axios'
import { VueperSlides, VueperSlide } from 'vueperslides'
import 'vueperslides/dist/vueperslides.css'

export default {
  name: 'IndexPage',
  components: { VueperSlides, VueperSlide },
  data () {
    return {
      message: 'This is a message',
      movies: [],
      interval: {},
      nowPlayingMovie: {},
      plexUrl: '',
      plexToken: ''
    }
  },
  mounted () {
    this.getMovieDBPosters()
    // setInterval(() => {
    //   this.getPlexNowPlaying()
    // }, 5000)

  },
  methods: {
    getMovieDBPosters () {
      if (this.$route.query.trending || (!this.$route.query.tv && !this.$route.query.movies)) {
        axios.get('https://api.themoviedb.org/3/trending/' + (this.$route.query.type ?? 'all') + '/' + (this.$route.query.time ?? 'day') + '?api_key=' + this.$route.query.apikey).then(response => {
          this.movies = response.data.results
        })
      }

      // The follow api request to themoviedb.org is in foreach loop, which is very bad way to do the requests but the moviedb.org API is limited to fetch only 1 movie/tv show at a time but they have a ticket in their backlog to allow us to fetch multiple movies at the same time using IDs.

      const movieIDs = this.$route.query?.movies?.split(',');
      if (movieIDs && movieIDs.length > 0) {
        movieIDs.forEach(movieID => {
          axios.get('https://api.themoviedb.org/3/movie/' + movieID + '?api_key=' + this.$route.query.apikey).then(response => {
            this.movies.unshift(response.data)
          })
        })
      }

      const tvIDs = this.$route.query?.tv?.split(',');
      if (tvIDs && tvIDs.length > 0) {
        tvIDs.forEach(tvID => {
          axios.get('https://api.themoviedb.org/3/tv/' + tvID + '?api_key=' + this.$route.query.apikey).then(response => {
            this.movies.unshift(response.data)
          })
        })
      }

    },

    toggleFullScreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    },

    getPlexNowPlaying () {
      this.plexToken = ''
      this.plexUrl = ''
      console.log('getPlex')
      axios.get(this.plexUrl + '/status/sessions?X-Plex-Token=' + this.plexToken).then(response => {
        console.log(response)
        if (response.data?.MediaContainer.Metadata) {
          const currentPlaying = response.data?.MediaContainer?.Metadata[0];
          this.movies = [
            {
              "poster_path": this.plexUrl + currentPlaying.thumb + '?X-Plex-Token=' + this.plexToken,
              "title": currentPlaying.title,
              "currentPlaying": true
            }
          ]
        }
        else if (this.movies[0].currentPlaying) {
          this.movies = []
          this.getMovieDBPosters()
        }

      })
    }
}

}
</script>
