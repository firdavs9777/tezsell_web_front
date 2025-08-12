import { Star } from "lucide-react";


const StarRating: React.FC<{ rating: string | number }> = ({ rating }) => {
    const numRating: number = typeof rating === 'string' ? parseFloat(rating) || 0 : rating || 0;
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < numRating ? "text-yellow-400 fill-current" : "text-gray-300"}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({numRating.toFixed(1)})</span>
      </div>
    );
  };
export default StarRating;
