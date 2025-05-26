import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Clock, User } from 'lucide-react';

interface Author {
  username: string;
  full_name?: string;
}

interface BlogCardProps {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author: Author;
}

export default function BlogCard({ id, title, content, created_at, author }: BlogCardProps) {
  // Truncate content for preview
  const previewText = content.length > 150 
    ? `${content.substring(0, 150)}...` 
    : content;

  return (
    <article className="card overflow-hidden group animate-fade-in">
      <Link to={`/blog/${id}`} className="block p-6">
        <h2 className="text-xl font-semibold mb-2 group-hover:text-indigo-600 transition-colors">
          {title}
        </h2>
        
        <div className="flex items-center text-sm text-slate-500 mb-3">
          <div className="flex items-center mr-4">
            <User className="h-3 w-3 mr-1" />
            <span>{author.full_name || author.username}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>{formatDistanceToNow(new Date(created_at), { addSuffix: true })}</span>
          </div>
        </div>
        
        <p className="text-slate-600 mb-4">{previewText}</p>
        
        <div className="text-indigo-600 text-sm font-medium group-hover:underline">
          Read more
        </div>
      </Link>
    </article>
  );
}