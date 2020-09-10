// Api Objects to hold urls and api keys
const apisObject = {
  edemanRecipe: {
    apiKey: "2131beba75508b3126c29d2241dadd5a",
    applicationId: "e6bfc6f0",
    searchURL: "https://api.edamam.com/search",
  },
  wikipedia: {
    searchURL: "https://en.wikipedia.org/w/api.php",
  }
};

// Format query parameters for api fetch
function formatQueryParams(params) {
  const queryItems = Object.keys(params).map(
    (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
  );
  return queryItems.join("&");
}

function displayRecipeResults(responseJson) {
  // if there are previous results, remove them
  $("#results-recipes-list").empty();
  // iterate through the items array
  for (let i = 0; i < responseJson.hits.length; i++) {
    // for each recipe object in the items
    //array, add an item to the results
    $("#results-recipes-list").append(
      `<div class=recipe-item><h3>${responseJson.hits[i].recipe.label}</h3>
      <img src=${responseJson.hits[i].recipe.image} alt=${responseJson.hits[i].recipe.label}>
      <p><a href="${responseJson.hits[i].recipe.url}" target="_blank">Source: ${responseJson.hits[i].recipe.source}</a></p>
      <p>Ingredients: ${responseJson.hits[i].recipe.ingredientLines.length}</p>
      </div>`
    );
  }
  //display the results section
  $('#js-search-form').removeClass("search-child");
  $("#results").removeClass("hidden");
}

function displayWikiResults(responseJson) {
  var wikiUrlBase = `https://en.wikipedia.org/wiki/`;
  var totalNumResults = responseJson.query.search.length;
  var maxNumber = 4;
  // To control number of restuls from wikipedia to be displayed.
  if (maxNumber > totalNumResults) {
    maxNumber = totalNumResults;
  }
  $("#wiki-results-list").empty();
  // iterate through the items array
  for (let i = 0; i < maxNumber; i++) {
    // for each recipe object in the items
    //array, add an item to the results
    $("#wiki-results-list").append(
      `<h3><a href="${wikiUrlBase}${responseJson.query.search[
        i
      ].title.replace(/ /g, "_")}" target="_blank">${
        responseJson.query.search[i].title
      }</a></h3>
      <p>${responseJson.query.search[i].snippet}</p>`
    );
  };
}

function searchWikiInfo(query) {
  const params = {
    action: "query",
    list: "search",
    origin: "*",
    srsearch: query + " food", // Ading keyword to narrow search
    format: "json",
  };
  const queryString = formatQueryParams(params);
  const url = apisObject.wikipedia.searchURL + "?" + queryString;
  console.log(url);
  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then((responseJson) => displayWikiResults(responseJson))
    .catch((err) => {
      $("#js-wikierror-message").text(`Something went wrong: ${err.message}`);
    });
}

function searchFood(food) {
  // Fetch results using the food entry values
  const params = {
    q: food,
  };
  const queryString = formatQueryParams(params);
  const url =
    apisObject.edemanRecipe.searchURL +
    "?" +
    queryString +
    `&app_key=${apisObject.edemanRecipe.apiKey}` +
    `&app_id=${apisObject.edemanRecipe.applicationId}`;

  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then((responseJson) => displayRecipeResults(responseJson))
    .catch((err) => {
      $("#js-error-message").text(`Something went wrong: ${err.message}`);
    });
}

// This function will be the callback when the page loads. it's responsible for
// initially rendering the app, and watching for events in the search bar
function watchFoodie() {
  // Watch for submissions in form
  $("form").submit((event) => {
    event.preventDefault();
    const foodQuery = $("#js-search-food").val().split(/\s+/); // Taking care of double spaces
    // console.log(`Event caught in form ${foodQuery.join(" ")}`);
    searchWikiInfo(foodQuery.join(" "));
    searchFood(foodQuery.join(" "));
  });
}

// when the page loads, call `watchFoodie`
$(watchFoodie);
