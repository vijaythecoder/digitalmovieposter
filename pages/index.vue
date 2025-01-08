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
            :key="movie.uniqueId"
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
            <div v-if="showInfo && imageLoaded" 
                 class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent pt-20 pb-6">
              <div class="relative p-6">
                <h2 class="text-2xl font-bold mb-2 text-white">{{ movie.title || movie.name }}</h2>
                
                <!-- Release Info & Metadata -->
                <div class="flex flex-wrap items-center gap-3 mb-3">
                  <span class="text-sm text-gray-300">
                    {{ formatDate(movie.release_date || movie.first_air_date) }}
                  </span>
                  
                  <!-- TV Show Info -->
                  <template v-if="movie.content_type === 'tv'">
                    <span class="text-sm text-gray-300">
                      {{ movie.number_of_seasons }} Season{{ movie.number_of_seasons !== 1 ? 's' : '' }}
                    </span>
                    <span v-if="movie.latest_season" class="text-sm text-emerald-400">
                      Latest: Season {{ movie.latest_season.season_number }}
                    </span>
                  </template>

                  <!-- Runtime for Movies -->
                  <span v-else-if="movie.runtime" class="text-sm text-gray-300">
                    {{ Math.floor(movie.runtime / 60) }}h {{ movie.runtime % 60 }}m
                  </span>
                </div>

                <!-- Watch Providers -->
                <div class="flex flex-wrap items-center gap-2 mb-3">
                  <!-- Netflix Badge -->
                  <div v-if="movie.watch_providers?.flatrate?.some(p => p.provider_id === 8)"
                       class="netflix-badge">
                    <img src="@/assets/netflix-logo.svg" alt="Netflix" class="h-4">
                    <span>Now Streaming</span>
                  </div>

                  <!-- Theatrical Release -->
                  <div v-if="isInTheaters(movie)"
                       class="px-3 py-1 rounded-full text-sm bg-yellow-500 text-black font-medium">
                    In Theaters
                  </div>

                  <!-- Other Streaming Services -->
                  <div v-if="movie.watch_providers?.flatrate"
                       class="flex items-center gap-2">
                    <span v-for="provider in getOtherProviders(movie.watch_providers.flatrate)"
                          :key="provider.provider_id"
                          class="px-3 py-1 rounded-full text-sm bg-gray-700 text-white">
                      {{ provider.provider_name }}
                    </span>
                  </div>
                </div>

                <!-- Overview -->
                <p v-if="movie.overview" class="text-gray-300 text-sm line-clamp-2">
                  {{ movie.overview }}
                </p>

                <!-- Additional Metadata -->
                <div class="mt-3 flex flex-wrap items-center gap-2">
                  <span v-if="movie.vote_average" 
                        class="px-2 py-1 rounded bg-gray-800 text-sm text-yellow-400">
                    ★ {{ movie.vote_average.toFixed(1) }}
                  </span>
                  <span v-for="genre in movie.genres?.slice(0, 3)" 
                        :key="genre.id"
                        class="px-2 py-1 rounded bg-gray-800 text-sm text-gray-300">
                    {{ genre.name }}
                  </span>
                </div>
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
import { streamingService } from '@/services/streaming'

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
      isFullScreen: false, // Track fullscreen state
      imageLoaded: false,
      interval: null
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
    try {
      // Get settings from URL
      const params = new URLSearchParams(window.location.search);
      
      // Set rotation from URL
      const rotation = params.get('rotation');
      if (rotation) {
        this.rotation = parseInt(rotation);
      }

      // Set other settings
      this.showInfo = params.get('showInfo') !== 'false';
      this.slideDuration = parseInt(params.get('slideDuration')) || 30;
      
      if (params.get('apikey')) {
        this.fetchMovies();
      } else {
        this.error = 'Please provide an API key in the settings';
      }
    } catch (err) {
      console.error('Error in mounted:', err);
      this.error = err.message;
    }
  },
  beforeDestroy() {
    this.stopSlideshow()
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
  },
  methods: {
    async fetchMovies() {
      try {
        const params = new URLSearchParams(window.location.search);
        const settings = {};
        for (const [key, value] of params.entries()) {
          settings[key] = value;
        }

        let allMovies = [];
        const seenIds = new Set(); // Track seen movie IDs

        // Helper function to add movies with unique ID check
        const addMovies = (movies, source) => {
          if (!movies) return;
          movies.forEach(movie => {
            const movieId = movie.id;
            if (!seenIds.has(movieId)) {
              seenIds.add(movieId);
              allMovies.push({
                ...movie,
                uniqueId: `${movieId}-${source}`, // Add unique identifier
                source
              });
            }
          });
        };

        // Fetch streaming content if services are enabled
        const streamingServices = settings.streamingServices?.split(',').filter(Boolean) || [];
        const fetchPromises = [];

        // If no streaming services selected, fetch trending content
        if (streamingServices.length === 0) {
          try {
            const trendingMovies = await streamingService.getTrendingContent(settings.apikey);
            addMovies(trendingMovies, 'Trending');
          } catch (error) {
            console.error('Error fetching trending content:', error);
          }
        } else {
          // Fetch from selected streaming services
          if (streamingServices.includes('netflix')) {
            fetchPromises.push(
              streamingService.getNetflixContent(settings.apikey)
                .then(content => {
                  addMovies(content.thisWeek, 'Netflix - New This Week');
                  addMovies(content.topShows, 'Netflix - Top Shows');
                  addMovies(content.topMovies, 'Netflix - Top Movies');
                })
                .catch(error => console.error('Error fetching Netflix content:', error))
            );
          }

          if (streamingServices.includes('hbo')) {
            fetchPromises.push(
              streamingService.getHBOContent(settings.apikey)
                .then(content => {
                  addMovies(content.thisWeek, 'HBO Max - New This Week');
                  addMovies(content.topShows, 'HBO Max - Top Shows');
                  addMovies(content.topMovies, 'HBO Max - Top Movies');
                })
                .catch(error => console.error('Error fetching HBO content:', error))
            );
          }

          if (streamingServices.includes('disney')) {
            fetchPromises.push(
              streamingService.getDisneyContent(settings.apikey)
                .then(content => {
                  addMovies(content.thisWeek, 'Disney+ - New This Week');
                  addMovies(content.topShows, 'Disney+ - Top Shows');
                  addMovies(content.topMovies, 'Disney+ - Top Movies');
                })
                .catch(error => console.error('Error fetching Disney+ content:', error))
            );
          }

          if (streamingServices.includes('prime')) {
            fetchPromises.push(
              streamingService.getPrimeContent(settings.apikey)
                .then(content => {
                  addMovies(content.thisWeek, 'Prime Video - New This Week');
                  addMovies(content.topShows, 'Prime Video - Top Shows');
                  addMovies(content.topMovies, 'Prime Video - Top Movies');
                })
                .catch(error => console.error('Error fetching Prime Video content:', error))
            );
          }

          if (streamingServices.includes('hulu')) {
            fetchPromises.push(
              streamingService.getHuluContent(settings.apikey)
                .then(content => {
                  addMovies(content.thisWeek, 'Hulu - New This Week');
                  addMovies(content.topShows, 'Hulu - Top Shows');
                  addMovies(content.topMovies, 'Hulu - Top Movies');
                })
                .catch(error => console.error('Error fetching Hulu content:', error))
            );
          }

          if (streamingServices.includes('peacock')) {
            fetchPromises.push(
              streamingService.getPeacockContent(settings.apikey)
                .then(content => {
                  addMovies(content.thisWeek, 'Peacock - New This Week');
                  addMovies(content.topShows, 'Peacock - Top Shows');
                  addMovies(content.topMovies, 'Peacock - Top Movies');
                })
                .catch(error => console.error('Error fetching Peacock content:', error))
            );
          }

          if (streamingServices.includes('paramount')) {
            fetchPromises.push(
              streamingService.getParamountContent(settings.apikey)
                .then(content => {
                  addMovies(content.thisWeek, 'Paramount+ - New This Week');
                  addMovies(content.topShows, 'Paramount+ - Top Shows');
                  addMovies(content.topMovies, 'Paramount+ - Top Movies');
                })
                .catch(error => console.error('Error fetching Paramount+ content:', error))
            );
          }

          if (streamingServices.includes('apple')) {
            fetchPromises.push(
              streamingService.getAppleContent(settings.apikey)
                .then(content => {
                  addMovies(content.thisWeek, 'Apple TV+ - New This Week');
                  addMovies(content.topShows, 'Apple TV+ - Top Shows');
                  addMovies(content.topMovies, 'Apple TV+ - Top Movies');
                })
                .catch(error => console.error('Error fetching Apple TV+ content:', error))
            );
          }

          // Wait for all streaming content to be fetched
          await Promise.all(fetchPromises);
        }

        // Shuffle if enabled
        if (settings.shuffle === 'true') {
          allMovies = allMovies.sort(() => Math.random() - 0.5);
        }

        this.movies = allMovies;
        this.loading = false;
      } catch (error) {
        console.error('Error fetching movies:', error);
        this.error = 'Error loading movies. Please check your API key and try again.';
        this.loading = false;
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return ''
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    isInTheaters(movie) {
      if (!movie.release_date) return false;
      const releaseDate = new Date(movie.release_date);
      const now = new Date();
      const daysSinceRelease = (now - releaseDate) / (1000 * 60 * 60 * 24);
      return daysSinceRelease <= 90; // Consider in theaters for 90 days after release
    },
    getOtherProviders(providers) {
      if (!providers) return [];
      // Filter out Netflix since it has its own badge
      return providers.filter(p => p.provider_id !== 8);
    },
    startSlideshow() {
      if (this.interval) return;
      const duration = parseInt(this.$route.query.slideDuration) || 30;
      this.interval = setInterval(() => {
        this.currentIndex = (this.currentIndex + 1) % this.movies.length;
      }, duration * 1000);
    },
    stopSlideshow() {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    },
    handleVisibilityChange() {
      if (document.hidden) {
        this.stopSlideshow();
      } else {
        this.startSlideshow();
      }
    },
    handleImageLoad() {
      this.imagesLoaded++
      this.imageLoaded = true
      // Start slideshow when first image is loaded
      if (this.imagesLoaded === 1) {
        this.startSlideshow()
      }
    },
    getMoviePoster(movie) {
      const imagePath = movie.poster_path || movie.backdrop_path
      return imagePath ? this.imageBaseUrl + imagePath : null
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
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Netflix branding */
.netflix-badge {
  background-color: #E50914;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.netflix-badge img {
  height: 1rem;
  width: auto;
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