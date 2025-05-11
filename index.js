const search = document.getElementById("search");
const getFilmBtn = document.getElementById("get-film");
const populatedList = document.getElementById("populated-list");

getFilmBtn.addEventListener("click", function (event) {
    event.preventDefault();
    console.log(search.value);
    populatedList.innerHTML = ""; // first we clean the container

    fetch(`http://www.omdbapi.com/?s=${search.value}&apikey=22949cc9`)
        .then((res) => res.json())
        .then((data) => {
            if (data.Search) {
                data.Search.forEach((film) => {
                    fetch(`http://www.omdbapi.com/?i=${film.imdbID}&apikey=22949cc9`)
                        .then((res) => res.json())
                        .then((data) => {


                            const fullPlot = data.Plot;
                            const shortPlot =
                                fullPlot.length > 133 ? fullPlot.substring(0, 133) + "..." : fullPlot;
                            const isLongPlot = fullPlot.length > 133;

                            const filmHTML = `
                                <div class="film-container">
                                    <img src="${data.Poster}" alt="${data.Title}" />
                                    <div class="film-info">
                                        <div class="title">
                                            <h3>${data.Title}</h3>
                                            <i class="fas fa-star"></i>
                                            <p>${data.imdbRating}</p>
                                        </div>
                                        <div class="features">
                                            <p class="duration">${data.Runtime}</p>
                                            <p class="genre">${data.Genre}</p>    
                                            <button class="add-remove add-icon" data-film='${JSON.stringify(data)}'></button>
                                            
                                            <p class="action">Watchlist</p>
                                        </div>
                                        <div class="text-container">
                                            <p class="plot" data-full="${fullPlot}" data-short="${shortPlot}">
                                            ${shortPlot} ${isLongPlot ? '<a href="#" class="read-more-link">Read more</a>' : ''}
                                            </p>                       
                                        </div>                                      
                                    </div>
                                </div>                                 
                            `;
                            populatedList.innerHTML += filmHTML;
                        });
                });
            } else {
                populatedList.innerHTML = `
                    <div class="initial">
                        <h3 class="blank-list">Unable to find what you’re looking for. Please try another search.</h3>
                    </div>
                `;
            }
        })
    .catch((err) => console.error("Eroare la fetch:", err));
});

// Delegate the event for Read more/less + button Watchlist
populatedList.addEventListener("click", function (e) {
    // Read more / Read less
    if (e.target.classList.contains("read-more-link")) {
        e.preventDefault();
        const paragraph = e.target.parentElement;
        const full = paragraph.dataset.full;
        const short = paragraph.dataset.short;
        const isExpanded = e.target.textContent === "Read less";

        paragraph.innerHTML = isExpanded
            ? `${short} <a href="#" class="read-more-link">Read more</a>`
            : `${full} <a href="#" class="read-more-link">Read less</a>`;
    }

    // Add film to Watchlist
    if (e.target.classList.contains("add-remove")) {
        const button = e.target;
        const filmData = JSON.parse(button.getAttribute("data-film"));

        let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
        const alreadyAdded = watchlist.some((f) => f.imdbID === filmData.imdbID);

        if (!alreadyAdded) {
            watchlist.push(filmData);
            localStorage.setItem("watchlist", JSON.stringify(watchlist));
            alert(`${filmData.Title} a fost adăugat în watchlist!`);
            // Changing the class button from add-icon to checked-icon
            button.classList.remove("add-icon");
            button.classList.add("checked-icon");
            // 🔄 Changing the text in <p class="action">Watchlist</p> to "Saved"
            const actionText = button.parentElement.querySelector(".action")
            if (actionText) {
                actionText.textContent = "Saved"
            }
        } else {
            alert(`${filmData.Title} este deja în watchlist.`);
        }
    }
});
