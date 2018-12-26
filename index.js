(function() {
  /**
   * @namespace books
   * @this Window
   */
  const books = {};
  const baseUrl = `https://api.nytimes.com/svc/books/v3/lists/`;
  const lists = `names.json?api-key=${API_KEY}`;
  const bestSellersListUrl = `${baseUrl}${lists}`;
  const header = document.querySelector('.header');
  const container = document.querySelector('.container');
  const spinner = document.querySelector('.pageLoader');
  const footer = document.querySelector('.footer');
  const goBackBtn = document.createElement('button');
  const listName = document.createElement('h2');
  const localData = sessionStorage.getItem('booksData');

  /**
   * getBestSellersListData - Fetches a list of best sellers from the NYT API.
   * In the first request, it sets the data in session storage
   * @param {String} url from the NYT
   * @this books
   * @returns {void}
   */
  books.getBestSellersListData = function(url) {
    books.showLoading();

    fetch(url)
      .then(response => response.json())
      .then(data => {
        const { results: booksListData } = data;
        /* sessionStorage.setItem(
            'booksListData',
            JSON.stringify(booksListData)
          ); */
        books.renderLists(booksListData);
      })
      .catch(error => books.handleError(error));
  };

  /**
   * getListDetail - Fetches the list detail for the selected category.
   * In the first request, it sets the data in session storage
   * @param {String} url from the NYT
   * @this books
   * @returns {void}
   */
  books.getListDetail = function(url) {
    books.showLoading();

    fetch(url)
      .then(response => response.json())
      .then(data => {
        const { results: booksData } = data;
        /* sessionStorage.setItem('booksData', JSON.stringify(booksData)); */
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
   * Parses data from session storage
   * @param {Object} books list of best seller
   * @this books
   * @returns {Void}
   */
  /*  books.getLocalData = function(booksData) {
    spinner.removeAttribute('class');
    let parsedData = JSON.parse(booksData);
    books.handleResponse(parsedData);
  }; */

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

  books.setUpBackButton = function() {
    goBackBtn.setAttribute('class', 'backBtn');
    goBackBtn.innerText = 'Back to lists';
    goBackBtn.style.display = 'none';

    header.append(goBackBtn);
  };

  /**
   * Shows an animation until the ajax request is completed and checks if data has been set locally
   * @callback books.getBookList
   * @callback books.getLocalData
   * @param {String} books list of best seller
   * @this books
   * @returns {Void}
   */
  books.showLoading = function() {
    spinner.setAttribute('class', 'loader');
    footer.style.display = 'none';
    container.innerHTML = '';
  };

  books.removeLoading = function() {
    spinner.removeAttribute('class');
    footer.style.display = 'flex';
  };

  books.createGoBackButtonEventListener = function() {
    const onClickGoBackBtn = function() {
      books.getBestSellersListData(bestSellersListUrl);
    };

    goBackBtn.addEventListener('click', onClickGoBackBtn);
  };

  books.createListDetailEventListener = function() {
    const onClickDetail = function(event) {
      const selectedList = event.target.dataset.id;
      const selectedDiv = event.target.nodeName === 'DIV';

      if (selectedDiv && selectedList) {
        const listUrl = `current/${selectedList}.json?api-key=${API_KEY}`;
        const composedUrl = `${baseUrl}${listUrl}`;
        books.getListDetail(composedUrl);
      }
    };

    container.addEventListener('click', onClickDetail);
  };

  books.setUpEventListeners = function() {
    books.createGoBackButtonEventListener();
    books.createListDetailEventListener();
  };

  books.init = function() {
    books.setUpBackButton();
    books.setUpEventListeners();
    books.getBestSellersListData(bestSellersListUrl);
  };

  books.init();

  return books;
})();
