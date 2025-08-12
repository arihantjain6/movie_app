import { useEffect,useState } from "react";
import Search from "./Components/Search";
import Spinner from "./Components/Spinner";
import MovieCard from "./Components/MovieCard";
import { useDebounce } from "react-use";
import { updateSearchCount } from "./Components/appwrite";


const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [movielist, setMovielist] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  useDebounce( ()=> setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

const fetchmovies = async (query = '') => {
  setIsLoading(true);
  setErrorMessage('');
  try {
    const endpoint = query 
    ?  `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
    : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
    const response = await fetch(endpoint, API_OPTIONS);
    
    if(!response.ok){
      throw new Error('Failed to fetch movies');
    }
    const data = await response.json();
    if(!data.results || data.results.length===0) {
      setErrorMessage('Failed to fetch movies');
      setMovielist([]);
      return;
    }
    setMovielist(data.results || []);

    if(query&& data.results.length > 0) {
      await updateSearchCount(query, data.results[0]);
    } 

  } catch(error) {
    console.log(`Error fetching movies: ${error}`);
    setErrorMessage('Error fetching movies. Please try again later');
  } finally{
    setIsLoading(false);
  }
}

  useEffect(() => {
    fetchmovies(debouncedSearchTerm);
  }, [debouncedSearchTerm])
  
  return (
    <main>
      <div className="pattern" />
       
       <div className="wrapper">
        <header>
          <img src="./hero (1).png" alt="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        {/* <h1 className="text-white">{searchTerm}</h1> */}
        </header>

        <section className="all-movies">
          <h2 className="mt-[40px] text-white text-2xl font-bold">All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ):(
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-4 gap-x-8 mt-6">
              {movielist.map((movie) => (
                
                <MovieCard key={movie.id} movie={movie}/>
              ))}
            </ul>
          )}
        </section>
       </div>
    </main>
  );
};

export default App;
