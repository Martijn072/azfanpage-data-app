import { Link } from 'react-router-dom';
import { MessageSquare, Clock } from 'lucide-react';

// Mock forum data - this will be replaced with real forum integration
const mockForumData = [
  {
    id: 1,
    title: "Wat verwachten jullie van de volgende wedstrijd?",
    author: "AZFan2024",
    timestamp: "2 uur geleden",
    replies: 12
  },
  {
    id: 2,
    title: "Transfergeruchten winter 2024",
    author: "Voetballiefhebber",
    timestamp: "4 uur geleden",
    replies: 8
  },
  {
    id: 3,
    title: "Analyse van de laatste wedstrijd",
    author: "TactiekExpert",
    timestamp: "6 uur geleden",
    replies: 15
  },
  {
    id: 4,
    title: "Seizoenkaarten 2024/2025",
    author: "StadionGanger",
    timestamp: "8 uur geleden",
    replies: 5
  },
  {
    id: 5,
    title: "Jeugdopleiding AZ - toekomst ziet er goed uit",
    author: "JeugdCoach",
    timestamp: "1 dag geleden",
    replies: 22
  }
];

export const ForumActivityWidget = () => {
  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-az-red" />
          Laatste Discussies
        </h3>
        <Link 
          to="/forum"
          className="text-az-red hover:text-az-red/80 transition-colors text-sm font-medium"
        >
          Meer →
        </Link>
      </div>

      <div className="space-y-3">
        {mockForumData.map((topic) => (
          <Link
            key={topic.id}
            to={`/forum`} // TODO: Update with actual forum topic URL
            className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
          >
            <h4 className="text-sm font-medium text-foreground line-clamp-2 mb-1">
              {topic.title}
            </h4>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-2">
                <span>{topic.author}</span>
                <span>•</span>
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {topic.timestamp}
                </div>
              </div>
              
              <div className="flex items-center text-az-red">
                <MessageSquare className="w-3 h-3 mr-1" />
                {topic.replies}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Link 
        to="/forum"
        className="block mt-4 text-center text-sm text-az-red hover:text-az-red/80 transition-colors font-medium py-2 border border-az-red/20 rounded-lg hover:bg-az-red/5 dark:hover:bg-az-red/10"
      >
        Bekijk Forum →
      </Link>
    </div>
  );
};