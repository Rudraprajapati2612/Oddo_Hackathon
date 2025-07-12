import { useState, useEffect } from 'react';
import { Filter, Users, Zap } from 'lucide-react';
import { Header } from '@/components/Header';
import { ProfileCard } from '@/components/ProfileCard';
import { RequestModal } from '@/components/RequestModal';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// Mock data - replace with API calls
const mockProfiles = [
  {
    id: '1',
    name: 'Sarah Chen',
    skillsOffered: ['React', 'TypeScript', 'UI/UX Design'],
    skillsWanted: ['Python', 'Machine Learning', 'Data Science'],
    rating: 4.8,
    availability: 'Available' as const,
    reviewCount: 24,
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    skillsOffered: ['Python', 'Django', 'Machine Learning'],
    skillsWanted: ['React', 'Frontend Development', 'CSS'],
    rating: 4.9,
    availability: 'Busy' as const,
    reviewCount: 18,
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    skillsOffered: ['Photography', 'Photoshop', 'Video Editing'],
    skillsWanted: ['Web Development', 'JavaScript', 'Backend'],
    rating: 4.7,
    availability: 'Available' as const,
    reviewCount: 31,
  },
  {
    id: '4',
    name: 'David Kim',
    skillsOffered: ['Guitar', 'Music Theory', 'Song Writing'],
    skillsWanted: ['Digital Marketing', 'SEO', 'Content Writing'],
    rating: 4.6,
    availability: 'Offline' as const,
    reviewCount: 12,
  },
];

const currentUserSkills = ['JavaScript', 'React', 'Node.js', 'Photography'];

export default function Home() {
  const [profiles, setProfiles] = useState(mockProfiles);
  const [filteredProfiles, setFilteredProfiles] = useState(mockProfiles);
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const { toast } = useToast();

  // Filter profiles based on availability
  useEffect(() => {
    if (availabilityFilter === 'all') {
      setFilteredProfiles(profiles);
    } else {
      setFilteredProfiles(profiles.filter(p => p.availability.toLowerCase() === availabilityFilter));
    }
  }, [profiles, availabilityFilter]);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredProfiles(profiles);
      return;
    }

    const filtered = profiles.filter(profile =>
      profile.skillsOffered.some(skill => 
        skill.toLowerCase().includes(query.toLowerCase())
      ) ||
      profile.skillsWanted.some(skill => 
        skill.toLowerCase().includes(query.toLowerCase())
      ) ||
      profile.name.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredProfiles(filtered);
  };

  const handleRequest = (profileId: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please login to send skill swap requests.",
        variant: "destructive",
      });
      return;
    }

    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setSelectedProfile(profile);
      setIsRequestModalOpen(true);
    }
  };

  const handleSubmitRequest = async (request: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Request Sent!",
      description: `Your skill swap request has been sent to ${selectedProfile?.name}.`,
    });
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    toast({
      title: "Welcome back!",
      description: "You can now send skill swap requests.",
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isLoggedIn={isLoggedIn} 
        onLogout={handleLogout}
        onSearch={handleSearch}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Exchange Skills, Expand Horizons
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with talented individuals, teach what you know, and learn what you love.
              Join our thriving community of skill swappers.
            </p>
            
            {!isLoggedIn && (
              <div className="flex justify-center space-x-4">
                <Button size="lg" onClick={handleLogin}>
                  <Zap className="mr-2 h-5 w-5" />
                  Join Now
                </Button>
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-lg font-medium">
                {filteredProfiles.length} skill swappers
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Availability</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onRequest={handleRequest}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No profiles found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find more skill swappers.
            </p>
          </div>
        )}
      </div>

      {/* Request Modal */}
      {selectedProfile && (
        <RequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          targetUser={selectedProfile}
          currentUserSkills={currentUserSkills}
          onSubmit={handleSubmitRequest}
        />
      )}
    </div>
  );
}