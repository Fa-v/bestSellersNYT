(function() {
  /**
   * @namespace books
   * @this Window
   */
  const books = {};
  const baseUrl = `https://api.nytimes.com/svc/books/v3/lists/`;
  const lists = `names.json?api-key=${API_KEY}`;
  const bSListUrl = `${baseUrl}${lists}`;
  const container = document.querySelector('.container');
  const spinner = document.querySelector('.pageLoader');
  const footer = document.querySelector('.footer');
  const localData = sessionStorage.getItem('booksData');

  /**
   * Fetch a list of best sellers from the NYT API, in the first request sets the data in the session storage
   * @param {String} url from the NYT
   * @this books
   * @returns {Object} the response for the ajax request
   */
  books.getBooksData = function(url) {
    fetch(url)
      .then(function(response) {
        if (!response.ok) {
          books.handleError(response.status);
        }
        return response.json();
      })
      .then(function(data) {
        if (data.results.books) {
          const booksData = data.results.books;
          /* sessionStorage.setItem('booksData', JSON.stringify(booksData)); */
          books.renderBestSellers(booksData);
        } else {
          const booksListData = data.results;
          /* sessionStorage.setItem(
            'booksListData',
            JSON.stringify(booksListData)
          ); */
          books.renderLists(booksListData);
        }
      })
      .catch(function(error) {
        books.handleError(error);
      });
  };

  /**
   * If an error occurs, show message informing about the error
   * @param {String} error message
   * @this books
   * @returns {String} html template
   */
  books.handleError = function(error) {
    spinner.removeAttribute('class');
    /* throw new Error('Error status = ', error); */
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
    spinner.removeAttribute('class');
    footer.style.display = 'flex';

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
    books.getList();
  };

  /**
   * Adds a click event to buttons and calls the isLoading function
   * @this books
   * @returns {Void}
   */
  books.getList = function() {
    container.addEventListener('click', function(event) {
      const selectedList = event.target.dataset.id;
      const selectedDiv = event.target.nodeName === 'DIV';

      if (selectedDiv && selectedList) {
        const listUrl = `current/${selectedList}.json?api-key=${API_KEY}`;
        const composedUrl = `${baseUrl}${listUrl}`;
        books.isLoading(composedUrl);
      }
    });
  };

  /**
   * Extracts the necessary values to be painted in the DOM
   * @param {Object} books list of best seller
   * @this books
   * @returns {String} html template
   */
  books.renderBestSellers = function(booksData) {
    spinner.removeAttribute('class');
    footer.style.display = 'flex';

    return booksData.map(function(book) {
      const card = document.createElement('div');
      card.setAttribute('class', 'card');

      bookInfo = {
        title: book.title,
        description: book.description,
        imgSrc: book.book_image,
        height: book.book_image_height,
        width: book.book_image_width,
        buyLink: book.amazon_product_url,
        weeksOnLIst: book.weeks_on_list,
        rank: book.rank,
        rankLastWeek: book.rank_last_week
      };

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
   * Shows an animation until the ajax request is completed and checks if data has been set locally
   * @callback books.getBookList
   * @callback books.getLocalData
   * @param {String} books list of best seller
   * @this books
   * @returns {Void}
   */
  books.isLoading = function(url) {
    spinner.setAttribute('class', 'loader');
    footer.style.display = 'none';
    container.innerHTML = '';

    books.getBooksData(url);
    /* !localData ? books.getBooksData(bSListUrl) : books.getLocalData(localData); */
  };

  books.init = function() {
    books.isLoading(bSListUrl);
  };

  books.init();
  return books;
})();
