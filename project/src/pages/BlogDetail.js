import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit, Trash, User, Calendar, Clock } from 'lucide-react';

interface Blog {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  author: {
    username: string;
    full_name?: string;
  };
}

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBlog(id);
    }
  }, [id]);

  const fetchBlog = async (blogId: string) => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          id,
          title,
          content,
          created_at,
          updated_at,
          author_id,
          profiles!blogs_author_id_fkey (
            username,
            full_name
          )
        `)
        .eq('id', blogId)
        .single();

      if (error) throw error;
      
      // Transform data to match Blog interface
      const blogWithAuthor = {
        ...data,
        author: data.profiles
      } as Blog;
      
      setBlog(blogWithAuthor);
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Blog not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!blog || !user) return;
    
    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', blog.id)
        .eq('author_id', user.id);
        
      if (error) throw error;
      
      toast.success('Blog deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Blog not found</h2>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  const isAuthor = user && user.id === blog.author_id;
  const wasUpdated = blog.updated_at !== blog.created_at;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Link to="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-500 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to all blogs
      </Link>
      
      <article>
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{blog.title}</h1>
          
          <div className="flex flex-wrap items-center text-sm text-slate-600 mb-4">
            <div className="flex items-center mr-4 mb-2">
              <User className="h-4 w-4 mr-1 text-slate-400" />
              <span>{blog.author.full_name || blog.author.username}</span>
            </div>
            <div className="flex items-center mr-4 mb-2">
              <Calendar className="h-4 w-4 mr-1 text-slate-400" />
              <span>{format(new Date(blog.created_at), 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center mb-2">
              <Clock className="h-4 w-4 mr-1 text-slate-400" />
              <span>{formatDistanceToNow(new Date(blog.created_at), { addSuffix: true })}</span>
            </div>
            {wasUpdated && (
              <div className="w-full text-xs text-slate-500 mt-1">
                Updated {formatDistanceToNow(new Date(blog.updated_at), { addSuffix: true })}
              </div>
            )}
          </div>
          
          {isAuthor && (
            <div className="flex space-x-3 mb-6">
              <Link 
                to={`/edit/${blog.id}`} 
                className="btn btn-secondary"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Blog
              </Link>
              
              {!deleteConfirm ? (
                <button 
                  onClick={() => setDeleteConfirm(true)}
                  className="btn btn-danger"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </button>
              ) : (
                <div className="flex space-x-2 items-center">
                  <span className="text-sm text-red-600">Confirm?</span>
                  <button 
                    onClick={handleDelete}
                    className="btn btn-danger"
                  >
                    Yes, Delete
                  </button>
                  <button 
                    onClick={() => setDeleteConfirm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </header>
        
        <div className="prose max-w-none blog-content">
          <ReactMarkdown>{blog.content}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}