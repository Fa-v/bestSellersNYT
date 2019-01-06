(function() {
  /**
   * @namespace books
   * @this Window
   */
  const books = {};
  const baseUrl = `https://api.nytimes.com/svc/books/v3/lists/`;
  const API_KEY = '';
  const lists = `names.json?api-key=${API_KEY}`;
  const bestSellersListUrl = `${baseUrl}${lists}`;
  const header = document.querySelector('.header');
  const container = document.querySelector('.container');
  const spinner = document.querySelector('.pageLoader');
  const footer = document.querySelector('.footer');
  const goBackBtn = document.createElement('button');
  const listName = document.createElement('h2');

  /**
   * getBestSellersListData - Fetches a list of best sellers from the NYT API.
   * In the first request, it sets the data in session storage
   * @param {String} url from the NYT
   * @this books
   * @returns {void}
   */
  books.getBestSellersListData = function(url) {
    const listsLocalData = sessionStorage.getItem('booksListData');
    if (listsLocalData) {
      books.renderLists(JSON.parse(listsLocalData));
      return;
    }
    books.showLoading();
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const { results: booksListData } = data;
        sessionStorage.setItem('booksListData', JSON.stringify(booksListData));
        books.renderLists(booksListData);
      })
      .catch(error => books.handleError(error));
  };

  /**
   * getListDetail - Fetches the list detail for the selected category.
   * In the first request, it sets the data in session storage
   * @param {String} url from the NYT
   * @param {Object} selectedList the list the user has clicked
   * @this books
   * @returns {void}
   */
  books.getListDetail = function(url, selectedList) {
    const detailLocalData = sessionStorage.getItem(selectedList);

    if (detailLocalData) {
      books.renderBestSellers(JSON.parse(detailLocalData));
      return;
    }

    books.showLoading();
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const { results: booksData } = data;
        const detailId = booksData.list_name_encoded;
        sessionStorage.setItem(`${detailId}`, JSON.stringify(booksData));
        books.renderBestSellers(booksData);
      })
      .catch(error => books.handleError(error));
  };

  /**
   * handleError - If an error occurs, show message informing about the error
   * @param {String} error message
   * @this books
   * @returns {String} html template
   */
  books.handleError = function(error) {
    books.removeLoading();

    const template = `
      <div class="error">
        <h1>Sorry it has been an error, try later</h1>
        <p>${error}</p>
      </div>
    `;

    return container.insertAdjacentHTML('afterbegin', template);
  };

  /**
   * Extracts the necessary values to be painted in the DOM
   * @param {Object} list list of best seller
   * @this books
   * @returns {String} html template
   */
  books.renderLists = function(booksListData) {
    books.removeLoading();
    goBackBtn.style.display = 'none';
    listName.style.display = 'none';
    container.innerHTML = '';

    booksListData.map(function(list) {
      const card = document.createElement('div');
      card.setAttribute('class', 'listCard');

      const template = `
      <div>
        <h3>${list.list_name}</h3>
        <p>Oldest: ${list.oldest_published_date}</p>
        <p>Newest: ${list.newest_published_date}</p>
        <p>Updated: ${list.updated}</p>
        </div>
        <div class="readMoreBtn" data-id=${list.list_name_encoded}>
          Read more
        </div>
        `;

      card.insertAdjacentHTML('afterbegin', template);
      container.append(card);
    });
  };

  /**
   * Extracts the necessary values to be painted in the DOM
   * @param {Object} books list of best seller
   * @this books
   * @returns {String} html template
   */
  books.renderBestSellers = function(booksData) {
    books.removeLoading();
    container.innerHTML = '';

    listName.setAttribute('class', 'subtitle');
    listName.style.display = 'block';
    listName.innerText = booksData.list_name;

    header.append(listName);
    goBackBtn.style.display = 'block';

    booksData.books.map(function(book) {
      const card = document.createElement('div');
      card.setAttribute('class', 'card');

      const template = `
      <img class="coverImg" src=${book.book_image} alt="${book.title}"/>
      <div class="cardContent">
        <h3 class="title">#${book.rank} ${book.title}</h3>
        <p>Weeks on list: ${book.weeks_on_list}</p>
        <p class="description">${book.description}</p>
        <a class="linkBtn" href=${
          book.amazon_product_url
        } target="blank">Buy on Amazon</a>
      </div>
    `;

      card.insertAdjacentHTML('afterbegin', template);
      container.append(card);
    });
  };

  /**
   * Creates the back button element in the DOM but doesn't shows it yet.
   * @this books
   * @returns {Void}
   */
  books.setUpBackButton = function() {
    goBackBtn.setAttribute('class', 'backBtn');
    goBackBtn.innerText = 'Back to lists';
    goBackBtn.style.display = 'none';
    header.insertAdjacentElement('afterend', goBackBtn);
  };

  /**
   * Shows an animation until the ajax request is completed and checks if data
   * has been set locally
   * @this books
   * @returns {Void}
   */
  books.showLoading = function() {
    spinner.setAttribute('class', 'loader');
    footer.style.display = 'none';
    container.innerHTML = '';
  };

  /**
   * Hides loading animation
   * @this books
   * @returns {Void}
   */
  books.removeLoading = function() {
    spinner.removeAttribute('class');
    footer.style.display = 'flex';
  };

  /**
   * Adds a click event to go back to the initial page
   * @this books
   * @returns {Void}
   */
  books.createGoBackButtonEventListener = function() {
    const onClickGoBackBtn = function() {
      books.getBestSellersListData(bestSellersListUrl);
    };

    goBackBtn.addEventListener('click', onClickGoBackBtn);
  };

  /**
   * Adds a click event to get the detail from a specific best sellers' list
   * @this books
   * @returns {Void}
   */
  books.createListDetailEventListener = function() {
    const onClickDetail = function(event) {
      const selectedList = event.target.dataset.id;
      const selectedDiv = event.target.nodeName === 'DIV';

      if (selectedDiv && selectedList) {
        const listUrl = `current/${selectedList}.json?api-key=${API_KEY}`;
        const composedUrl = `${baseUrl}${listUrl}`;
        books.getListDetail(composedUrl, selectedList);
      }
    };

    container.addEventListener('click', onClickDetail);
  };

  /**
   * Sets up on buttons when the page is loaded
   * @this books
   * @returns {Void}
   */
  books.setUpEventListeners = function() {
    books.createGoBackButtonEventListener();
    books.createListDetailEventListener();
  };

  /**
   * Initialize the app setting the events and fetching the best sellers' lists
   * @this books
   * @returns {Void}
   */
  books.init = function() {
    books.setUpBackButton();
    books.setUpEventListeners();
    books.getBestSellersListData(bestSellersListUrl);
  };

  books.init();

  return books;
})();
