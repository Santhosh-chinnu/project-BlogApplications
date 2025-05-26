import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BlogForm from '../components/BlogForm';
import toast from 'react-hot-toast';

interface Blog {
  id: string;
  title: string;
  content: string;
  author_id: string;
}

export default function EditBlog() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchBlog(id);
    }
  }, [id]);

  const fetchBlog = async (blogId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('id, title, content, author_id')
        .eq('id', blogId)
        .single();

      if (error) throw error;
      
      // Check if the user is the author
      if (data.author_id !== user.id) {
        toast.error('You can only edit your own blogs');
        navigate('/');
        return;
      }
      
      setBlog(data as Blog);
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Blog not found');
      navigate('/');
    } finally {
      setLoading(false);
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
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Blog</h1>
      <BlogForm defaultValues={blog} isEditing />
    </div>
  );
}