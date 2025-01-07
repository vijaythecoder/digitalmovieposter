<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 py-3 sm:py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-xl shadow-xl overflow-hidden">
        <div class="flex">
          <!-- Left Navigation -->
          <div class="hidden sm:flex sm:flex-col w-64 bg-gray-50 p-6 border-r border-gray-200">
            <div class="flex-1">
              <div class="mb-8">
                <h2 class="text-lg font-bold text-gray-900">Settings</h2>
                <p class="text-sm text-gray-500 mt-1">Configure your display</p>
              </div>

              <nav class="space-y-2">
                <a 
                  v-for="(section, index) in ['api', 'content', 'display']" 
                  :key="section"
                  @click="activeSection = section"
                  class="flex items-center px-4 py-3 rounded-lg cursor-pointer transition-colors"
                  :class="activeSection === section ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'"
                >
                  <span class="w-6 h-6 flex items-center justify-center rounded-full bg-white border-2 mr-3"
                        :class="activeSection === section ? 'border-indigo-600 text-indigo-600' : 'border-gray-400 text-gray-400'">
                    {{ index + 1 }}
                  </span>
                  <span class="font-medium capitalize">{{ section === 'api' ? 'API Setup' : section === 'content' ? 'Content Selection' : 'Display Options' }}</span>
                </a>
              </nav>
            </div>

            <!-- Sidebar Actions -->
            <div class="space-y-4 pt-6 mt-6 border-t border-gray-200">
              <div class="space-y-3">
                <div class="relative">
                  <input 
                    type="text" 
                    :value="generatedURL" 
                    readonly
                    placeholder="Enter API key to generate URL"
                    class="w-full pr-10 px-3 py-2 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg"
                    :class="!settings.apikey ? 'text-gray-400' : ''"
                  >
                  <button 
                    @click="copyURL"
                    type="button"
                    :disabled="!generatedURL"
                    class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:hover:text-gray-400"
                    :title="copySuccess ? 'Copied!' : !generatedURL ? 'Enter API key first' : 'Copy URL'"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                  </button>
                </div>

                <a 
                  :href="generatedURL"
                  target="_blank"
                  :class="!generatedURL ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''"
                  class="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <span>Open Display</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                </a>
              </div>

              <p class="text-xs text-gray-500 text-center">
                Settings are automatically saved
              </p>
            </div>
          </div>

          <!-- Right Content -->
          <div class="flex-1 p-4 sm:p-8">
            <form @submit.prevent="generateURL" class="max-w-2xl mx-auto space-y-8">
              <!-- API Configuration -->
              <div v-show="activeSection === 'api'" class="space-y-6">
                <div class="border-b border-gray-200 pb-4">
                  <h3 class="text-lg font-bold text-gray-900">API Configuration</h3>
                  <p class="text-sm text-gray-500 mt-1">Set up your MovieDB API access</p>
                </div>

                <div class="space-y-4">
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
                </div>
              </div>

              <!-- Content Selection -->
              <div v-show="activeSection === 'content'" class="space-y-6">
                <div class="border-b border-gray-200 pb-4">
                  <h3 class="text-lg font-bold text-gray-900">Content Selection</h3>
                  <p class="text-sm text-gray-500 mt-1">Choose what content to display</p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <!-- Content Type -->
                  <div class="space-y-4">
                    <div class="space-y-2">
                      <label class="text-sm font-bold text-gray-700 block">Content Source</label>
                      <div class="flex flex-col space-y-2">
                        <button 
                          type="button"
                          @click="settings.contentType = 'trending'"
                          :class="[
                            'px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left',
                            settings.contentType === 'trending' 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          ]"
                        >
                          <span class="block font-bold">Trending</span>
                          <span class="text-xs opacity-80">Show popular content</span>
                        </button>
                        <button 
                          type="button"
                          @click="settings.contentType = 'specific'"
                          :class="[
                            'px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left',
                            settings.contentType === 'specific' 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          ]"
                        >
                          <span class="block font-bold">Specific Content</span>
                          <span class="text-xs opacity-80">Choose exact movies/shows</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Content Settings -->
                  <div class="space-y-4">
                    <!-- Trending Settings -->
                    <div v-if="settings.contentType === 'trending'" class="space-y-4">
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

                    <!-- Specific Content Settings -->
                    <div v-else class="space-y-4">
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
                  </div>
                </div>
              </div>

              <!-- Display Settings -->
              <div v-show="activeSection === 'display'" class="space-y-6">
                <div class="border-b border-gray-200 pb-4">
                  <h3 class="text-lg font-bold text-gray-900">Display Options</h3>
                  <p class="text-sm text-gray-500 mt-1">Configure how content is shown</p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <!-- Left Column -->
                  <div class="space-y-6">
                    <div class="space-y-2">
                      <label class="text-sm font-bold text-gray-700 block">Show Movie Info</label>
                      <button 
                        type="button"
                        @click="toggleShowInfo"
                        class="w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-colors"
                        :class="settings.showInfo ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white'"
                      >
                        <div class="text-left">
                          <span class="block text-sm font-medium" :class="settings.showInfo ? 'text-indigo-700' : 'text-gray-700'">
                            {{ settings.showInfo ? 'Showing' : 'Hidden' }}
                          </span>
                          <span class="text-xs text-gray-500">Movie title and release date</span>
                        </div>
                        <div class="relative inline-flex h-6 w-11">
                          <span 
                            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                            :class="[
                              settings.showInfo ? 'translate-x-5 ring-2 ring-indigo-600' : 'translate-x-0 ring-2 ring-gray-200'
                            ]"
                          />
                        </div>
                      </button>
                    </div>

                    <div class="space-y-2">
                      <label class="text-sm font-bold text-gray-700 block">Shuffle Content</label>
                      <button 
                        type="button"
                        @click="toggleShuffle"
                        class="w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-colors"
                        :class="settings.shuffle ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white'"
                      >
                        <div class="text-left">
                          <span class="block text-sm font-medium" :class="settings.shuffle ? 'text-indigo-700' : 'text-gray-700'">
                            {{ settings.shuffle ? 'Random Order' : 'Sequential' }}
                          </span>
                          <span class="text-xs text-gray-500">Content display order</span>
                        </div>
                        <div class="relative inline-flex h-6 w-11">
                          <span 
                            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                            :class="[
                              settings.shuffle ? 'translate-x-5 ring-2 ring-indigo-600' : 'translate-x-0 ring-2 ring-gray-200'
                            ]"
                          />
                        </div>
                      </button>
                    </div>
                  </div>

                  <!-- Right Column -->
                  <div class="space-y-6">
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
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="mt-8">
        <a 
          href="https://savvyagents.ai?utm_source=movieposter&utm_medium=settings&utm_campaign=watermark" 
          target="_blank"
          class="block bg-white rounded-xl shadow-xl overflow-hidden hover:bg-gray-50 transition-colors duration-200"
        >
          <div class="px-6 py-6 flex flex-col items-center text-center">
            <div class="w-full max-w-[240px] mb-4">
              <img 
                src="/savvyagents.png" 
                alt="SavvyAgents.ai" 
                class="w-full h-auto object-contain"
              />
            </div>
            <p class="text-gray-600 text-sm font-medium">
              Powered by SavvyAgents.ai
            </p>
            <p class="text-gray-500 text-sm mt-1">
              AI phone agents for small businesses
            </p>
            <div class="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium text-sm mt-4 group">
              <span class="mr-1">Learn More</span>
              <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsPage',
  data() {
    return {
      activeSection: 'api',
      sections: ['api', 'content', 'display'],
      settings: {
        apikey: '',
        contentType: 'trending',
        type: 'all',
        time: 'day',
        movies: '',
        tv: '',
        timer: 10,
        rotate: '0',
        shuffle: false,
        showInfo: true
      },
      generatedURL: '',
      rotationOptions: [
        { value: '0', label: 'No Rotation' },
        { value: '-90', label: 'Rotate Left' },
        { value: '90', label: 'Rotate Right' },
        { value: '180', label: 'Upside Down' }
      ],
      copySuccess: false
    }
  },
  watch: {
    settings: {
      handler(newSettings) {
        localStorage.setItem('settings', JSON.stringify(newSettings))
        this.generateURL()
      },
      deep: true
    }
  },
  methods: {
    copyURL() {
      navigator.clipboard.writeText(this.generatedURL).then(() => {
        this.copySuccess = true
        setTimeout(() => {
          this.copySuccess = false
        }, 2000)
      })
    },
    generateURL() {
      if (!this.settings.apikey) return
      const baseUrl = window.location.origin
      const params = new URLSearchParams()
      Object.entries(this.settings).forEach(([key, value]) => {
        params.set(key, value)
      })
      this.generatedURL = `${baseUrl}?${params.toString()}`
    },
    toggleShowInfo() {
      this.settings.showInfo = !this.settings.showInfo
      // Force reactivity update
      this.settings = { ...this.settings }
    },
    toggleShuffle() {
      this.settings.shuffle = !this.settings.shuffle
      // Force reactivity update
      this.settings = { ...this.settings }
    }
  },
  mounted() {
    const savedSettings = localStorage.getItem('settings')
    if (savedSettings) {
      this.settings = { ...this.settings, ...JSON.parse(savedSettings) }
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
