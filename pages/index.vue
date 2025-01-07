<template>
  <div>
    <div 
      class="bg-gray-900 h-screen w-screen relative" 
      :class="rotationClass"
      @click="handleMainClick"
    >
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
            <div v-if="showInfo" class="absolute bottom-0 left-0 right-0 text-white">
              <div class="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
              <div class="relative p-6">
                <h2 class="text-2xl font-bold mb-2">{{ movie.title || movie.name }}</h2>
                <p class="text-sm opacity-90">{{ movie.release_date || movie.first_air_date }}</p>
              </div>
            </div>
          </div>
        </transition-group>

        <!-- Control Buttons -->
        <div v-if="showControls" class="control-buttons absolute top-4 right-4 flex space-x-3 z-50 p-2 rounded-xl bg-black/20 backdrop-blur-md shadow-lg" @click.stop>
          <button 
            @click="toggleFullScreen" 
            class="p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-lg shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
            </svg>
          </button>
          <button 
            @click="hideControls" 
            class="p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-lg shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
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
      imagesLoaded: 0,
      rotation: 0,
      showInfo: true, // Default value
      showControls: true, // New state for control buttons
      isFullScreen: false // Track fullscreen state
    }
  },
  computed: {
    rotationClass() {
      return {
        '-rotate-90': this.rotation === -90,
        'rotate-90': this.rotation === 90,
        'rotate-180': this.rotation === 180,
        'rotate-0': this.rotation === 0
      }
    }
  },
  created() {
    // Get timer from query params
    if (this.$route.query.timer) {
      this.slideDuration = parseInt(this.$route.query.timer) * 1000
    }
    
    // Get rotation from query params
    if (this.$route.query.rotate) {
      this.rotation = parseInt(this.$route.query.rotate)
    }
  },
  mounted() {
    // Get URL parameters
    const params = new URLSearchParams(window.location.search)
    this.apiKey = params.get('apikey')
    
    // Convert string 'true'/'false' to boolean
    const showInfoParam = params.get('showInfo')
    this.showInfo = showInfoParam === null ? true : showInfoParam === 'true'
    
    this.getMovieDBPosters()
    
    // Set up visibility change listener
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
        
        // Check for API key and redirect if not found
        if (!this.$route.query.apikey) {
          this.$router.push('/settings')
          return
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
    handleMainClick(e) {
      // Only toggle controls if not clicking on the controls themselves
      if (!e.target.closest('.control-buttons')) {
        this.showControls = true
      }
    },

    hideControls() {
      this.showControls = false
    },

    async toggleFullScreen() {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen()
          this.isFullScreen = true
        } else {
          await document.exitFullscreen()
          this.isFullScreen = false
        }
        this.hideControls()
      } catch (err) {
        console.error('Error toggling fullscreen:', err)
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

/* Add transform-origin for better rotation behavior */
.-rotate-90,
.rotate-90,
.rotate-180,
.rotate-0 {
  transform-origin: center center;
  transition: transform 0.3s ease;
}

/* Adjust container based on rotation */
.-rotate-90,
.rotate-90 {
  width: 100vh !important;
  height: 100vw !important;
  position: fixed;
  top: 50%;
  left: 50%;
  transform-origin: center;
}

.-rotate-90 {
  transform: translate(-50%, -50%) rotate(-90deg);
}

.rotate-90 {
  transform: translate(-50%, -50%) rotate(90deg);
}

.rotate-180 {
  transform: rotate(180deg);
}

.rotate-0 {
  transform: rotate(0deg);
}
</style>