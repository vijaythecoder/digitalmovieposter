<template>
  <div>
    <div class="bg-gray-900 h-screen w-screen -rotate-90" @click="toggleFullScreen">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center h-full">
        <div class="text-white text-2xl">Loading...</div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="flex items-center justify-center h-full">
        <div class="text-white text-2xl bg-red-600 p-4 rounded">{{ error }}</div>
      </div>

      <!-- Slideshow -->
      <div v-else class="relative h-full w-full">
        <transition-group 
          name="fade" 
          tag="div" 
          class="relative h-full"
        >
          <div 
            v-for="(movie, index) in movies" 
            :key="movie.id || index"
            v-show="currentIndex === index"
            class="absolute inset-0 h-full w-full"
          >
            <img 
              :src="getMoviePoster(movie)"
              :alt="movie.title || movie.name"
              class="h-full w-full object-cover"
              @load="handleImageLoad"
            >
            
            <!-- Movie Info Overlay -->
            <div class="absolute bottom-0 left-0 right-0 text-white bg-black bg-opacity-50 p-4">
              <h2 class="text-2xl font-bold">{{ movie.title || movie.name }}</h2>
              <p class="text-sm">{{ movie.release_date || movie.first_air_date }}</p>
            </div>
          </div>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'IndexPage',
  data() {
    return {
      movies: [],
      currentIndex: 0,
      loading: true,
      error: null,
      imageBaseUrl: 'https://image.tmdb.org/t/p/original',
      slideInterval: null,
      slideDuration: 10000, // Default 10 seconds
      imagesLoaded: 0
    }
  },
  created() {
    // Set slide duration from query params
    if (this.$route.query.timer) {
      this.slideDuration = parseInt(this.$route.query.timer) * 1000
    }
  },
  mounted() {
    this.getMovieDBPosters()
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
  },
  beforeDestroy() {
    this.stopSlideshow()
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
  },
  methods: {
    startSlideshow() {
      this.stopSlideshow() // Clear any existing interval
      this.slideInterval = setInterval(() => {
        this.currentIndex = (this.currentIndex + 1) % this.movies.length
      }, this.slideDuration)
    },
    stopSlideshow() {
      if (this.slideInterval) {
        clearInterval(this.slideInterval)
        this.slideInterval = null
      }
    },
    handleVisibilityChange() {
      if (document.hidden) {
        this.stopSlideshow()
      } else {
        this.startSlideshow()
      }
    },
    handleImageLoad() {
      this.imagesLoaded++
      // Start slideshow when first image is loaded
      if (this.imagesLoaded === 1) {
        this.startSlideshow()
      }
    },
    getMoviePoster(movie) {
      const imagePath = movie.poster_path || movie.backdrop_path
      return imagePath ? this.imageBaseUrl + imagePath : null
    },
    async getMovieDBPosters() {
      try {
        this.loading = true
        this.error = null
        this.movies = []
        this.imagesLoaded = 0
        
        if (!this.$route.query.apikey) {
          throw new Error('MovieDB API key is required. Please add it to the URL as ?apikey=YOUR_API_KEY')
        }

        // Handle trending movies/shows
        if (this.$route.query.trending || (!this.$route.query.tv && !this.$route.query.movies)) {
          const type = this.$route.query.type || 'all'
          const time = this.$route.query.time || 'day'
          const response = await axios.get(
            `https://api.themoviedb.org/3/trending/${type}/${time}?api_key=${this.$route.query.apikey}`
          )
          if (response.data.results?.length) {
            this.movies = response.data.results
          }
        }

        // Handle specific movie IDs
        const movieIDs = this.$route.query?.movies?.split(',').filter(id => id.trim())
        if (movieIDs?.length) {
          const moviePromises = movieIDs.map(movieID =>
            axios.get(`https://api.themoviedb.org/3/movie/${movieID.trim()}?api_key=${this.$route.query.apikey}`)
          )
          const responses = await Promise.all(moviePromises)
          this.movies.push(...responses.map(response => response.data))
        }

        // Handle specific TV show IDs
        const tvIDs = this.$route.query?.tv?.split(',').filter(id => id.trim())
        if (tvIDs?.length) {
          const tvPromises = tvIDs.map(tvID =>
            axios.get(`https://api.themoviedb.org/3/tv/${tvID.trim()}?api_key=${this.$route.query.apikey}`)
          )
          const responses = await Promise.all(tvPromises)
          this.movies.push(...responses.map(response => response.data))
        }

        if (!this.movies.length) {
          throw new Error('No movies or TV shows found. Please check your query parameters.')
        }

        // Shuffle if requested
        if (this.$route.query.shuffle === 'true') {
          this.movies = this.movies.sort(() => Math.random() - 0.5)
        }

        this.loading = false
      } catch (err) {
        this.error = err.message || 'Failed to load movies'
        console.error('Error loading movies:', err)
        this.loading = false
      }
    },
    toggleFullScreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
      } else if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>