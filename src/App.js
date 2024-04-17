import { useEffect, useState } from 'react';
import StarRating from './StarRating';

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const API_ENDPOINT = `http://www.omdbapi.com/?s=$$$MOVIE_NAME$$$&apikey=c5283f98`;
const API_ENDPOINT_MOVIE = `http://www.omdbapi.com/?i=$$$MOVIE_NAME$$$&apikey=c5283f98`;

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  function handleSelectedId(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function hideMovieDetails() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    const newWatchedList = [...watched];
    let duplicate = false;
    newWatchedList.forEach((tempWatched, i) => {
      if (tempWatched.imdbID === movie.imdbID) {
        newWatchedList[i] = movie;
        duplicate = true;
      }
    });
    setWatched((watched) => {
      if (duplicate) return newWatchedList;
      else return [...watched, movie];
    });
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  // using promises and then / catch syntax =
  // useEffect(() => {
  //   fetch(API_ENDPOINT.replace('$$$MOVIE_NAME$$$', homePageMovie))
  //     .then((response) => response.json())
  //     .then((data) => setMovies(data.Search));
  // }, []);

  // using async/await
  useEffect(() => {
    if (query.length < 3) {
      setError('');
      setIsLoading(false);
      setMovies([]);
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await fetch(
          API_ENDPOINT.replace('$$$MOVIE_NAME$$$', query),
          { signal: controller.signal }
        );

        if (!response.ok)
          throw new Error('Something went wrong with fetching the movies..');
        const data = await response.json();
        if (data.Response === 'False') throw new Error('Movie not found');
        setMovies(data.Search);
      } catch (err) {
        // will see aborting the request as an exception
        if (err.name !== 'AbortError') setError(err.message);
      }
      setIsLoading(false);
    })();

    return () => controller.abort();
  }, [query]);

  return (
    <>
      <NavBar movies={movies}>
        <Logo />
        <SearchBar query={query} setQuery={setQuery} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MoviesList movies={movies} handleSelectedId={handleSelectedId} />
          )}
          {error && <ErrorMessage msg={error} />}
        </Box>
        <Box>
          {!selectedId ? (
            <>
              <WatchedSummary watched={watched} />
              <WatchedList
                watched={watched}
                onDeleteFromWatched={handleDeleteWatched}
              />
            </>
          ) : (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={hideMovieDetails}
              onAddToWatched={handleAddWatched}
              watched={watched}
            />
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading results...</p>;
}

function ErrorMessage({ msg }) {
  return (
    <p className="error">
      <span>💥</span>
      {msg}
    </p>
  );
}

function NavBar({ movies, children }) {
  console.log(movies);
  return (
    <nav className="nav-bar">
      {children}
      <p className="num-results">
        Found <strong>{movies.length}</strong> results
      </p>
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function SearchBar({ query, setQuery }) {
  return (
    <form>
      <input
        className="search"
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
}

//
function Main({ children }) {
  return <main className="main">{children}</main>;
}

// ListBox and WatchedBox integrated into a re-usable Box component // saves writing code
function Box({ children }) {
  // children represents the content of the box --> moviesList vs. watchedList
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? '–' : '+'}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieDetails({ selectedId, onCloseMovie, onAddToWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    // check if the movie is already in the watched list
    (async () => {
      const alreadyInTheList = watched.filter(
        (tempMovie) => tempMovie.imdbID === selectedId
      );

      if (alreadyInTheList.length > 0) {
        setUserRating(alreadyInTheList[0].userRating);
      } else {
        setUserRating(0);
      }
    })();
  }, [selectedId, watched]);

  function handlerUpdateRating(rating) {
    setUserRating(rating);
  }

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(' ').at(0)),
      userRating,
    };
    onAddToWatched(newWatchedMovie);
    onCloseMovie();
  }

  // FETCH movie data from API
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          API_ENDPOINT_MOVIE.replace('$$$MOVIE_NAME$$$', selectedId)
        );
        const data = await response.json();
        setMovie(data);
        setIsLoading(false);
      } catch (err) {
        console.log('💥', err);
      }
    })();
  }, [selectedId]);

  // Change the title of the page
  useEffect(() => {
    if (!title) return;
    document.title = `Movie | ${title}`;
    // cleanup function
    return () => (document.title = 'usePopcorn');
  }, [title]);

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              ⬅
            </button>
            <img src={poster} alt={`Poster of ${movie} movie.`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb raring
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              <StarRating
                maxRating={10}
                size={24}
                onSetRating={handlerUpdateRating}
                defaultRating={userRating}
              />
              {userRating > 0 && (
                <button className="btn-add" onClick={handleAdd}>
                  + Add to list
                </button>
              )}
            </div>
            <em>{plot}</em>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

// LIST BOX
function MoviesList({ movies, handleSelectedId }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <MovieItem
          movie={movie}
          key={movie.imdbID}
          onSelectedMovie={handleSelectedId}
        />
      ))}
    </ul>
  );
}

function MovieItem({ movie, onSelectedMovie }) {
  return (
    <li onClick={() => onSelectedMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

// WATCHED BOX
function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedList({ watched, onDeleteFromWatched }) {
  return (
    <ul className="list">
      {watched?.map((movie) => (
        <WatchedItem
          movie={movie}
          key={movie.imdbID}
          onDeleteFromWatched={onDeleteFromWatched}
        />
      ))}
    </ul>
  );
}

function WatchedItem({ movie, onDeleteFromWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onDeleteFromWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}

function ListBox({ children }) {
  const [isOpen1, setIsOpen1] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen1((open) => !open)}
      >
        {isOpen1 ? '–' : '+'}
      </button>
      {isOpen1 && children}
    </div>
  );
}
