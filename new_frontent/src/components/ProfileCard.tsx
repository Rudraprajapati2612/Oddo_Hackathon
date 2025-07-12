import { Star, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Profile {
  id: string;
  name: string;
  avatar?: string;
  skillsOffered: string[];
  skillsWanted: string[];
  rating: number;
  availability: 'Available' | 'Busy' | 'Offline';
  reviewCount: number;
}

interface ProfileCardProps {
  profile: Profile;
  onRequest: (profileId: string) => void;
  isLoggedIn: boolean;
}

export function ProfileCard({ profile, onRequest, isLoggedIn }: ProfileCardProps) {
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available':
        return 'bg-green-500';
      case 'Busy':
        return 'bg-yellow-500';
      case 'Offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="profile-card group">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-primary-foreground text-xl font-semibold">
                {profile.name.charAt(0)}
              </span>
            )}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getAvailabilityColor(profile.availability)} rounded-full border-2 border-card`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground truncate">{profile.name}</h3>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{profile.rating}</span>
              <span>({profile.reviewCount})</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">{profile.availability}</p>

          {/* Skills Offered */}
          <div className="mb-3">
            <h4 className="text-sm font-medium text-foreground mb-2">Offers:</h4>
            <div className="flex flex-wrap gap-1">
              {profile.skillsOffered.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary" className="skill-badge">
                  {skill}
                </Badge>
              ))}
              {profile.skillsOffered.length > 3 && (
                <Badge variant="outline">+{profile.skillsOffered.length - 3} more</Badge>
              )}
            </div>
          </div>

          {/* Skills Wanted */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-foreground mb-2">Wants:</h4>
            <div className="flex flex-wrap gap-1">
              {profile.skillsWanted.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-primary border-primary/50">
                  {skill}
                </Badge>
              ))}
              {profile.skillsWanted.length > 3 && (
                <Badge variant="outline">+{profile.skillsWanted.length - 3} more</Badge>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => onRequest(profile.id)}
              disabled={!isLoggedIn}
              className="flex-1"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              {isLoggedIn ? 'Send Request' : 'Login to Request'}
            </Button>
            <Button size="sm" variant="outline">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}