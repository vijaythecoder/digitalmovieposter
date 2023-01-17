<template>
  <div>
    <div class="bg-gray-900 h-screen w-screen -rotate-90" @click="toggleFullScreen">
      <template v-for="movie in movies" >
        <div :key="movie.id">
          <img class="transition-opacity absolute ease-in duration-[2000ms] opacity-0 h-screen w-screen"  :src="'https://image.tmdb.org/t/p/original/' + movie.poster_path" alt="">
          <div class="absolute bg-sky-500/[.06] bottom-0 w-full h-40">
            hello
          </div>
        </div>
      </template>
    </div>

  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'IndexPage',
  data () {
    return {
      message: 'This is a message',
      movies: [],
      imagesElements: []
    }
  },
  mounted () {

    axios.get('https://api.themoviedb.org/3/trending/' + (this.$route.query.type ?? 'all') + '/' + (this.$route.query.time ?? 'day') + '?api_key=' + this.$route.query.apikey).then(response => {
      this.movies = response.data.results
      setTimeout(() => {
        this.startAnimation()
      }, 100);
    })
  },
  methods: {
    startAnimation () {
      const images = document.querySelectorAll('img');
      let counter = 0;
      images[counter].classList.add('opacity-100');

      setInterval(() => {
        if (images.length === counter) {
          counter = 0
        }
        if (images[counter] !== undefined) {
          images[counter].classList.remove('opacity-100');
        }

        counter = counter+1;

        if (images[counter] !== undefined) {
          images[counter].classList.add('opacity-100');
        }
      }, 10000)

    },

    toggleFullScreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }

}

}
</script>
