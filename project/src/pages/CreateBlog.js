import BlogForm from '../components/BlogForm';

export default function CreateBlog() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create a New Blog</h1>
      <BlogForm />
    </div>
  );
}