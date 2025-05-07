console.log('Search.js loaded');
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded in search.js');
  
  // Debug information
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  
  console.log('Search input found:', !!searchInput);
  console.log('Search results found:', !!searchResults);
  
  if (searchInput && searchResults) {
    // Add visible feedback that script is working
    searchResults.innerHTML = '<p>Search initialized. Type in the search box to begin...</p>';
    
    // Add a simple event listener to show script is functional
    searchInput.addEventListener('input', function() {
      if (this.value.length > 0) {
        searchResults.innerHTML = '<p>You typed: ' + this.value + '</p><p>Full search results will appear below...</p>';
      } else {
        searchResults.innerHTML = '<p>Search initialized. Type in the search box to begin...</p>';
      }
    });
  } else {
    console.error('Search elements not found - cannot initialize search');
    // Try adding to body if search elements aren't found
    document.body.innerHTML += '<div style="color: red; padding: 20px; border: 2px solid red;">Search script loaded but cannot find search elements</div>';
  }
document.addEventListener('DOMContentLoaded', function() {
  // Get search input element
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  
  if (!searchInput || !searchResults) {
    console.error('Search elements not found');
    return;
  }
  
  console.log('Search components initialized');
  
  // Current language from HTML tag
  const currentLang = document.documentElement.lang || 'en';
  console.log('Current language:', currentLang);
  
  // Load the language-specific index
  fetch('/' + currentLang + '/index.json')
    .then(response => {
      console.log('Fetch response status:', response.status);
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      console.log('Index loaded, entries:', data.length);
      
      // Current language
      const currentLang = document.documentElement.lang || 'en';
      console.log('Current language:', currentLang);
      
      // Filter data to current language
      const langData = data.filter(item => item.language === currentLang);
      console.log('Filtered for current language:', langData.length);
      
      // Build the index
      const idx = lunr(function() {
        this.ref('uri');
        this.field('title', { boost: 10 });
        this.field('content');
        this.field('tags', { boost: 5 });
        
        langData.forEach(function(doc) {
          this.add(doc);
        }, this);
      });
      
      console.log('Lunr index built successfully');
      
      // Add event listener for search
      searchInput.addEventListener('input', function() {
        const query = this.value;
        if (query.length < 2) {
          searchResults.innerHTML = '';
          return;
        }
        
        console.log('Searching for:', query);
        
        try {
          const results = idx.search(query);
          console.log('Results found:', results.length);
          displayResults(results, langData);
        } catch (e) {
          console.error('Search error:', e);
          searchResults.innerHTML = '<p>Search error. Please try different keywords.</p>';
        }
      });
      
      // Display function
      function displayResults(results, langData) {
        if (results.length === 0) {
          searchResults.innerHTML = '<p>No results found.</p>';
          return;
        }
        
        let html = '<ul class="search-results-list">';
        results.forEach(result => {
          const item = langData.find(page => page.uri === result.ref);
          if (item) {
            html += `
              <li>
                <a href="${item.uri}">
                  <h3>${item.title}</h3>
                  <p>${item.content.substring(0, 150)}...</p>
                </a>
              </li>
            `;
          }
        });
        html += '</ul>';
        searchResults.innerHTML = html;
      }
    })
    .catch(error => {
      console.error('Error loading search index:', error);
      searchResults.innerHTML = '<p>Failed to load search index. Please try again later.</p>';
    });
});