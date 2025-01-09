import axios from 'axios';

const PROVIDER_IDS = {
  netflix: 8,
  hbo: 384,     // HBO Max
  disney: 337,   // Disney+
  prime: 9,      // Amazon Prime
  hulu: 15,      // Hulu
  peacock: 386,  // Peacock
  paramount: 531, // Paramount+
  apple: 350,    // Apple TV+
};

export const streamingService = {
  async getContentDetails(apiKey, type, id) {
    try {
      // Get detailed info
      const details = await axios.get(
        `https://api.themoviedb.org/3/${type}/${id}`,
        { params: { api_key: apiKey } }
      );

      // Get watch providers
      const providers = await axios.get(
        `https://api.themoviedb.org/3/${type}/${id}/watch/providers`,
        { params: { api_key: apiKey } }
      );

      // For TV shows, get additional season info
      let seasons = null;
      if (type === 'tv' && details.data.seasons && details.data.seasons.length > 0) {
        seasons = details.data.number_of_seasons;
        const lastSeason = details.data.seasons[details.data.seasons.length - 1];
        details.data.latest_season = lastSeason;
      }

      const watchProviders = providers.data.results?.US || {};
      return {
        ...details.data,
        watch_providers: {
          flatrate: watchProviders.flatrate || [],
          free: watchProviders.free || [],
          ads: watchProviders.ads || [],
          rent: watchProviders.rent || [],
          buy: watchProviders.buy || []
        },
        content_type: type,
        number_of_seasons: seasons
      };
    } catch (error) {
      console.error('Error fetching content details:', error);
      return {
        watch_providers: {
          flatrate: [],
          free: [],
          ads: [],
          rent: [],
          buy: []
        },
        content_type: type,
        number_of_seasons: null
      };
    }
  },

  async getProviderContent(apiKey, providerId, providerName) {
    try {
      // Get this week's releases
      const thisWeekReleases = await axios.get(`https://api.themoviedb.org/3/discover/movie`, {
        params: {
          api_key: apiKey,
          with_watch_providers: providerId,
          watch_region: 'US',
          'primary_release_date.gte': new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          'primary_release_date.lte': new Date().toISOString().split('T')[0]
        }
      });

      // Get top rated shows
      const topShows = await axios.get(`https://api.themoviedb.org/3/discover/tv`, {
        params: {
          api_key: apiKey,
          with_watch_providers: providerId,
          watch_region: 'US',
          sort_by: 'popularity.desc',
          limit: 10
        }
      });

      // Get top rated movies
      const topMovies = await axios.get(`https://api.themoviedb.org/3/discover/movie`, {
        params: {
          api_key: apiKey,
          with_watch_providers: providerId,
          watch_region: 'US',
          sort_by: 'popularity.desc',
          limit: 10
        }
      });

      // Fetch detailed information for each item
      const getDetailsForResults = async (results, type) => {
        const detailedResults = [];
        for (const item of results) {
          const details = await this.getContentDetails(apiKey, type, item.id);
          if (details) {
            detailedResults.push(details);
          }
        }
        return detailedResults;
      };

      const [thisWeekDetails, topShowsDetails, topMoviesDetails] = await Promise.all([
        getDetailsForResults(thisWeekReleases.data.results, 'movie'),
        getDetailsForResults(topShows.data.results, 'tv'),
        getDetailsForResults(topMovies.data.results, 'movie')
      ]);

      return {
        thisWeek: thisWeekDetails,
        topShows: topShowsDetails,
        topMovies: topMoviesDetails
      };
    } catch (error) {
      console.error(`Error fetching ${providerName} content:`, error);
      throw error;
    }
  },

  async getTrendingContent(apiKey) {
    try {
      // Get trending movies and TV shows
      const [trendingMovies, trendingTV] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/trending/movie/week`, {
          params: {
            api_key: apiKey,
            page: 1
          }
        }),
        axios.get(`https://api.themoviedb.org/3/trending/tv/week`, {
          params: {
            api_key: apiKey,
            page: 1
          }
        })
      ]);

      // Get detailed information for each trending item
      const detailedMovies = await Promise.all(
        trendingMovies.data.results.map(movie => 
          this.getContentDetails(apiKey, 'movie', movie.id)
        )
      );

      const detailedTVShows = await Promise.all(
        trendingTV.data.results.map(show => 
          this.getContentDetails(apiKey, 'tv', show.id)
        )
      );

      // Combine and filter out any null results
      return [...detailedMovies, ...detailedTVShows].filter(Boolean);
    } catch (error) {
      console.error('Error fetching trending content:', error);
      return [];
    }
  },

  async getNetflixContent(apiKey) {
    const content = await this.getProviderContent(apiKey, PROVIDER_IDS.netflix, 'Netflix');
    return content;
  },

  async getHBOContent(apiKey) {
    const content = await this.getProviderContent(apiKey, PROVIDER_IDS.hbo, 'HBO Max');
    return content;
  },

  async getDisneyContent(apiKey) {
    const content = await this.getProviderContent(apiKey, PROVIDER_IDS.disney, 'Disney+');
    return content;
  },

  async getPrimeContent(apiKey) {
    const content = await this.getProviderContent(apiKey, PROVIDER_IDS.prime, 'Amazon Prime');
    return content;
  },

  async getHuluContent(apiKey) {
    const content = await this.getProviderContent(apiKey, PROVIDER_IDS.hulu, 'Hulu');
    return content;
  },

  async getPeacockContent(apiKey) {
    const content = await this.getProviderContent(apiKey, PROVIDER_IDS.peacock, 'Peacock');
    return content;
  },

  async getParamountContent(apiKey) {
    const content = await this.getProviderContent(apiKey, PROVIDER_IDS.paramount, 'Paramount+');
    return content;
  },

  async getAppleContent(apiKey) {
    const content = await this.getProviderContent(apiKey, PROVIDER_IDS.apple, 'Apple TV+');
    return content;
  }
};
