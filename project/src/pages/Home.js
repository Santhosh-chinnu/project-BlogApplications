import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BlogCard from '../components/BlogCard';
import Pagination from '../components/Pagination';
import { Pencil, Search, RefreshCw } from 'lucide-react';

interface Blog {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author: {
    username: string;
    full_name?: string;
  };
}

export default function Home() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const blogsPerPage = 6;

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, searchQuery]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      // Calculate range for pagination
      const from = (currentPage - 1) * blogsPerPage;
      const to = from + blogsPerPage - 1;
      
      // Build query
      let query = supabase
        .from('blogs')
        .select(`
          id,
          title,
          content,
          created_at,
          profiles!blogs_author_id_fkey (
            username,
            full_name
          )
        `, { count: 'exact' });

      // Add search filter if query exists
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }
      
      // Get paginated results
      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      // Transform data to match Blog interface
      const formattedBlogs = data.map(blog => ({
        ...blog,
        author: blog.profiles
      })) as Blog[];
      
      setBlogs(formattedBlogs);
      
      // Calculate total pages
      if (count !== null) {
        setTotalPages(Math.ceil(count / blogsPerPage));
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <section className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-accent-600 bg-clip-text text-transparent">
          Welcome to ModernBlog
        </h1>
        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
          A platform where you can share your thoughts and ideas with the world.
          Read inspiring stories or create your own blog today.
        </p>
        
        {user ? (
          <Link to="/create" className="btn btn-primary px-8 py-3">
            <Pencil className="h-4 w-4 mr-2" />
            Write Your Blog
          </Link>
        ) : (
          <Link to="/register" className="btn btn-primary px-8 py-3">
            Get Started
          </Link>
        )}
      </section>

      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex w-full max-w-lg mx-auto">
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input rounded-r-none flex-grow"
          />
          <button 
            type="submit"
            className="btn btn-primary rounded-l-none px-4"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
      ) : blogs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} {...blog} />
            ))}
          </div>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">No blogs found</h2>
          <p className="text-slate-600 mb-6">
            {searchQuery 
              ? `No results found for "${searchQuery}". Try a different search term.` 
              : "There are no blogs yet. Be the first to create one!"}
          </p>
          {user && (
            <Link to="/create" className="btn btn-primary">
              Create First Blog
            </Link>
          )}
        </div>
      )}
    </div>
  );
}