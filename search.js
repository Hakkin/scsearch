document.addEventListener("DOMContentLoaded", function() {
  initPlayer(50);
  searchDisplay();
  
  function searchDisplay() {
    var searchDate = document.getElementById("search-date");
    var advancedSearch = document.getElementById("advanced-search");
    var advancedSearchDate = document.getElementById("advanced-search-date");
    var betweenLabel = document.getElementById("between-label");
    var endDateElement = document.getElementById("date2");
    
    if (searchDate.value == "custom")
    {
      advancedSearch.style.display = "";
      if (advancedSearchDate.value == "between") {
        betweenLabel.style.display = "";
        endDateElement.style.display = "";
      } else {
        betweenLabel.style.display = "none";
        endDateElement.style.display = "none";
      }
    } else {
      advancedSearch.style.display = "none";
    }
  };
  
  document.getElementById("search-date").addEventListener("change",function() {
    searchDisplay();
  });
  document.getElementById("advanced-search-date").addEventListener("change",function() {
    searchDisplay();
  });
  
  var next_href;
  
  var loadMore = document.getElementsByClassName("load-more")[0];
  var loadMoreBtn = document.getElementById("load-more-btn");
  
  loadMoreBtn.addEventListener("click", function() {
    loadMore.style.display = "none";
    loadResults(next_href);
  });
  
  var adding;
  
  function loadResults(href) {
    var resultElement = document.getElementById("results");
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.addEventListener("load", function() {
      var parsedJSON = JSON.parse(xmlhttp.responseText);
      
      var addPlayer = function(i) {
        if (i < parsedJSON.collection.length) {
          var playerElement = createPlayer(parsedJSON.collection[i]);
          
          resultElement.appendChild(playerElement);
          adding = window.setTimeout(function() {
            playerElement.className += " fadein";
            addPlayer(++i);
          }, 0);
        } else if (next_href) {
          loadMore.style.display = "";
        }
      }
      
      next_href = parsedJSON.next_href;
      
      addPlayer(0);
    });
    
    xmlhttp.open("GET", href, true);
    xmlhttp.send();
  }
  
  document.getElementById("searchform").addEventListener("submit", function(evt) {
    evt.preventDefault();
    
    if (adding) {
      clearTimeout(adding);
    }
    
    var resultElement = document.getElementById("results");
    while(resultElement.firstChild) {
      resultElement.removeChild(resultElement.firstChild);
    }
    
    loadMore.style.display = "none";
    
    searchValue = document.getElementById("searchbox").value;
    
    var apiURL = "https://api.soundcloud.com/tracks/";
    var parameters = {
      q: encodeURIComponent(searchValue),
      limit: 200,
      order: "created_at",
      linked_partitioning: 1,
      client_id: config.sc.clientID
    }
    
    var searchDate = document.getElementById("search-date");
    var advancedSearchDate = document.getElementById("advanced-search-date");
    var startDateElement = document.getElementById("date1");
    var endDateElement = document.getElementById("date2");
    
    var pad = function(n) {
      return n < 10 ? '0' + n : n;
    }
    
    switch (searchDate.value) {
      case 'all_time':
        parameters["created_at[from]"] = "1970-01-01 00:00:00";
        break;
      case 'custom':
        var startDate = new Date(startDateElement.getElementsByClassName('date-input-year')[0].value,
                                 startDateElement.getElementsByClassName('date-input-month')[0].value - 1,
                                 startDateElement.getElementsByClassName('date-input-day')[0].value,
                                 0, 0, 0);
        var endDate = new Date(endDateElement.getElementsByClassName('date-input-year')[0].value,
                               endDateElement.getElementsByClassName('date-input-month')[0].value - 1,
                               endDateElement.getElementsByClassName('date-input-day')[0].value,
                               0, 0, 0);
        switch(advancedSearchDate.value) {
          case 'after':
            parameters["created_at[from]"] = startDate.getFullYear() + "-" +
                                             pad(startDate.getMonth() + 1) + "-" +
                                             pad(startDate.getDate()) + " 00:00:00";
            break;
          case 'before':
            parameters["created_at[to]"] = startDate.getFullYear() + "-" +
                                           pad(startDate.getMonth() + 1) + "-" +
                                           pad(startDate.getDate()) + " 00:00:00";
            break;
          case 'between':
            parameters["created_at[from]"] = startDate.getFullYear() + "-" +
                                             pad(startDate.getMonth() + 1) + "-" +
                                             pad(startDate.getDate()) + " 00:00:00";
            parameters["created_at[to]"] = endDate.getFullYear() + "-" +
                                           pad(endDate.getMonth() + 1) + "-" +
                                           pad(endDate.getDate()) + " 00:00:00";
            break;
        }
        break;
      default:
        parameters["created_at"] = searchDate.value;
        break;
    }
    
    var URL = (function(URL, parameters){
      return URL + "?" + Object.keys(parameters).map(function(key) {
        return key+ "=" + parameters[key];
      }).join("&");
    })(apiURL, parameters);
    
    loadResults(URL);
  });
});