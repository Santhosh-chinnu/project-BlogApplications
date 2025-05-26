import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface BlogFormProps {
  defaultValues?: {
    id: string;
    title: string;
    content: string;
  };
  isEditing?: boolean;
}

interface FormValues {
  title: string;
  content: string;
}

export default function BlogForm({ defaultValues, isEditing = false }: BlogFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<FormValues>({
    defaultValues: defaultValues ? {
      title: defaultValues.title,
      content: defaultValues.content
    } : undefined
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      if (isEditing && defaultValues) {
        // Update existing blog
        const { error } = await supabase
          .from('blogs')
          .update({
            title: data.title,
            content: data.content,
            updated_at: new Date().toISOString()
          })
          .eq('id', defaultValues.id);
          
        if (error) throw error;
        
        toast.success('Blog updated successfully');
        navigate(`/blog/${defaultValues.id}`);
      } else {
        // Create new blog
        const { data: blog, error } = await supabase
          .from('blogs')
          .insert({
            title: data.title,
            content: data.content,
            author_id: user.id
          })
          .select()
          .single();
          
        if (error) throw error;
        
        toast.success('Blog created successfully');
        navigate(`/blog/${blog.id}`);
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error('Failed to save blog. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="title" className="label">
          Blog Title
        </label>
        <input
          id="title"
          type="text"
          className="input"
          placeholder="Enter your blog title"
          {...register('title', { 
            required: 'Title is required',
            maxLength: { 
              value: 100, 
              message: 'Title cannot exceed 100 characters' 
            }
          })}
        />
        {errors.title && (
          <p className="form-error">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="content" className="label">
          Content
        </label>
        <textarea
          id="content"
          rows={15}
          className="input font-mono"
          placeholder="Write your blog content here... Markdown is supported"
          {...register('content', { 
            required: 'Content is required' 
          })}
        />
        {errors.content && (
          <p className="form-error">{errors.content.message}</p>
        )}
        <p className="text-xs text-slate-500 mt-1">
          Markdown formatting is supported
        </p>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              {isEditing ? 'Updating...' : 'Publishing...'}
            </>
          ) : (
            isEditing ? 'Update Blog' : 'Publish Blog'
          )}
        </button>
      </div>
    </form>
  );
}