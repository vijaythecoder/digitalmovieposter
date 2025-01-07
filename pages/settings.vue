<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 py-6 flex flex-col justify-center sm:py-12">
    <div class="relative py-3 sm:max-w-xl sm:mx-auto w-full px-4 sm:px-0">
      <div class="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
      <div class="relative bg-white shadow-lg sm:rounded-3xl px-4 py-10 sm:p-20">
        <div class="max-w-md mx-auto">
          <div class="divide-y divide-gray-200">
            <div class="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
              <div class="text-center mb-12">
                <h2 class="text-3xl font-extrabold text-gray-900 mb-2">Digital Movie Poster</h2>
                <p class="text-sm text-gray-500">Configure your movie poster display settings</p>
              </div>
              
              <form @submit.prevent="generateURL" class="space-y-8">
                <!-- API Key -->
                <div class="space-y-2">
                  <label class="text-sm font-bold text-gray-700 block">MovieDB API Key *</label>
                  <input 
                    v-model="settings.apikey" 
                    type="password"
                    required
                    class="w-full px-4 py-3 rounded-lg border-2 border-gray-200 outline-none focus:border-indigo-500 transition-colors"
                    placeholder="Enter your API key"
                  >
                  <p class="text-xs text-gray-500 mt-1">Get your API key from 
                    <a href="https://www.themoviedb.org/settings/api" target="_blank" class="text-indigo-600 hover:text-indigo-800 font-medium">
                      TheMovieDB →
                    </a>
                  </p>
                </div>

                <!-- Content Type -->
                <div class="space-y-2">
                  <label class="text-sm font-bold text-gray-700 block">Content Source</label>
                  <div class="flex space-x-4">
                    <button 
                      type="button"
                      @click="settings.contentType = 'trending'"
                      :class="[
                        'flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                        settings.contentType === 'trending' 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      ]"
                    >
                      Trending
                    </button>
                    <button 
                      type="button"
                      @click="settings.contentType = 'specific'"
                      :class="[
                        'flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                        settings.contentType === 'specific' 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      ]"
                    >
                      Specific Content
                    </button>
                  </div>
                </div>

                <!-- Trending Settings -->
                <div v-if="settings.contentType === 'trending'" class="space-y-6">
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-gray-700 block">Content Type</label>
                    <select 
                      v-model="settings.type"
                      class="w-full px-4 py-3 rounded-lg border-2 border-gray-200 outline-none focus:border-indigo-500 transition-colors appearance-none bg-white"
                    >
                      <option value="all">All Content</option>
                      <option value="movie">Movies Only</option>
                      <option value="tv">TV Shows Only</option>
                    </select>
                  </div>

                  <div class="space-y-2">
                    <label class="text-sm font-bold text-gray-700 block">Time Window</label>
                    <div class="flex space-x-4">
                      <button 
                        type="button"
                        @click="settings.time = 'day'"
                        :class="[
                          'flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                          settings.time === 'day' 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        ]"
                      >
                        Today
                      </button>
                      <button 
                        type="button"
                        @click="settings.time = 'week'"
                        :class="[
                          'flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                          settings.time === 'week' 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        ]"
                      >
                        This Week
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Specific Content IDs -->
                <div v-else class="space-y-6">
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-gray-700 block">Movie IDs</label>
                    <input 
                      v-model="settings.movies"
                      placeholder="e.g., 550,680,13"
                      class="w-full px-4 py-3 rounded-lg border-2 border-gray-200 outline-none focus:border-indigo-500 transition-colors"
                    >
                    <p class="text-xs text-gray-500 mt-1">Comma-separated MovieDB movie IDs</p>
                  </div>

                  <div class="space-y-2">
                    <label class="text-sm font-bold text-gray-700 block">TV Show IDs</label>
                    <input 
                      v-model="settings.tv"
                      placeholder="e.g., 1399,66732"
                      class="w-full px-4 py-3 rounded-lg border-2 border-gray-200 outline-none focus:border-indigo-500 transition-colors"
                    >
                    <p class="text-xs text-gray-500 mt-1">Comma-separated MovieDB TV show IDs</p>
                  </div>
                </div>

                <!-- Display Settings -->
                <div class="space-y-6">
                  <h3 class="text-lg font-bold text-gray-900 border-b pb-2">Display Settings</h3>
                  
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-gray-700 block">Slide Duration</label>
                    <div class="flex items-center space-x-4">
                      <input 
                        v-model.number="settings.timer"
                        type="range"
                        min="1"
                        max="60"
                        class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      >
                      <span class="text-sm font-medium text-gray-700 w-20 text-right">
                        {{ settings.timer }} seconds
                      </span>
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="text-sm font-bold text-gray-700 block">Screen Rotation</label>
                    <div class="grid grid-cols-2 gap-4">
                      <button 
                        v-for="rotation in rotationOptions"
                        :key="rotation.value"
                        type="button"
                        @click="settings.rotate = rotation.value"
                        :class="[
                          'px-4 py-3 rounded-lg text-sm font-medium transition-colors text-center',
                          settings.rotate === rotation.value
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        ]"
                      >
                        {{ rotation.label }}
                      </button>
                    </div>
                  </div>

                  <div class="flex items-center space-x-3">
                    <button
                      type="button"
                      @click="settings.shuffle = !settings.shuffle"
                      :class="[
                        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                        settings.shuffle ? 'bg-indigo-600' : 'bg-gray-200'
                      ]"
                    >
                      <span
                        :class="[
                          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                          settings.shuffle ? 'translate-x-5' : 'translate-x-0'
                        ]"
                      />
                    </button>
                    <label class="text-sm font-bold text-gray-700">Shuffle Content</label>
                  </div>
                </div>

                <!-- Generated URL -->
                <div v-if="generatedURL" class="space-y-4 bg-gray-50 p-6 rounded-xl">
                  <h3 class="text-lg font-bold text-gray-900">Your Display URL</h3>
                  <div class="bg-white p-4 rounded-lg border-2 border-gray-100">
                    <p class="text-sm break-all text-gray-600">{{ generatedURL }}</p>
                  </div>
                  <div class="flex space-x-4">
                    <button 
                      @click="copyURL" 
                      type="button"
                      class="flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      Copy URL
                    </button>
                    <a 
                      :href="generatedURL"
                      target="_blank"
                      class="flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      Open Display
                    </a>
                  </div>
                </div>

                <button 
                  type="submit"
                  class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-[1.02]"
                >
                  Generate Display URL
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsPage',
  data() {
    return {
      settings: {
        apikey: '',
        contentType: 'trending',
        type: 'all',
        time: 'day',
        movies: '',
        tv: '',
        timer: 10,
        rotate: '0',
        shuffle: false
      },
      generatedURL: '',
      rotationOptions: [
        { value: '0', label: 'No Rotation' },
        { value: '-90', label: 'Rotate Left' },
        { value: '90', label: 'Rotate Right' },
        { value: '180', label: 'Upside Down' }
      ]
    }
  },
  methods: {
    generateURL() {
      const params = new URLSearchParams()
      
      // Always add API key
      params.append('apikey', this.settings.apikey)

      // Add content-specific parameters
      if (this.settings.contentType === 'trending') {
        params.append('trending', 'true')
        params.append('type', this.settings.type)
        params.append('time', this.settings.time)
      } else {
        if (this.settings.movies) {
          params.append('movies', this.settings.movies)
        }
        if (this.settings.tv) {
          params.append('tv', this.settings.tv)
        }
      }

      // Add display settings
      if (this.settings.timer !== 10) {
        params.append('timer', this.settings.timer)
      }
      if (this.settings.rotate !== '0') {
        params.append('rotate', this.settings.rotate)
      }
      if (this.settings.shuffle) {
        params.append('shuffle', 'true')
      }

      // Generate the full URL
      const baseURL = window.location.origin
      this.generatedURL = `${baseURL}/?${params.toString()}`
    },
    async copyURL() {
      try {
        await navigator.clipboard.writeText(this.generatedURL)
        alert('URL copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy URL:', err)
        alert('Failed to copy URL. Please copy it manually.')
      }
    }
  }
}
</script>

<style>
/* Custom styles for range input */
input[type="range"]::-webkit-slider-thumb {
  @apply appearance-none w-6 h-6 bg-indigo-600 rounded-full cursor-pointer;
}
input[type="range"]::-moz-range-thumb {
  @apply w-6 h-6 bg-indigo-600 rounded-full cursor-pointer border-0;
}
</style>
