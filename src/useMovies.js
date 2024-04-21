import { useEffect, useState } from 'react';

const API_ENDPOINT = `http://www.omdbapi.com/?s=$$$MOVIE_NAME$$$&apikey=c5283f98`;

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

  return { movies, isLoading, error };
}
