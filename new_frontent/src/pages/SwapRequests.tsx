import { useState } from 'react';
import { Check, X, Clock, MessageCircle, User, ArrowRightLeft } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface SwapRequest {
  id: string;
  fromUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  toUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  offeredSkill: string;
  wantedSkill: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
  isIncoming: boolean;
}

// Mock data
const mockRequests: SwapRequest[] = [
  {
    id: '1',
    fromUser: { id: '2', name: 'Sarah Chen' },
    toUser: { id: '1', name: 'You' },
    offeredSkill: 'React Development',
    wantedSkill: 'UI/UX Design',
    message: 'Hi! I\'d love to learn UI/UX design from you. I have 3 years of React experience and can help you with modern frontend development.',
    status: 'pending',
    createdAt: '2024-01-15T10:30:00Z',
    isIncoming: true,
  },
  {
    id: '2',
    fromUser: { id: '1', name: 'You' },
    toUser: { id: '3', name: 'Marcus Johnson' },
    offeredSkill: 'Photography',
    wantedSkill: 'Python',
    message: 'Hello Marcus! I\'m interested in learning Python for data science. I can teach you photography techniques in exchange.',
    status: 'accepted',
    createdAt: '2024-01-14T14:20:00Z',
    isIncoming: false,
  },
  {
    id: '3',
    fromUser: { id: '4', name: 'Emily Rodriguez' },
    toUser: { id: '1', name: 'You' },
    offeredSkill: 'Video Editing',
    wantedSkill: 'Web Development',
    message: 'I saw your web development skills and would love to learn! I can teach you professional video editing techniques.',
    status: 'pending',
    createdAt: '2024-01-13T16:45:00Z',
    isIncoming: true,
  },
];

export default function SwapRequests() {
  const [requests, setRequests] = useState(mockRequests);
  const [isLoggedIn] = useState(true);
  const { toast } = useToast();

  const handleAccept = async (requestId: string) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId ? { ...req, status: 'accepted' as const } : req
      )
    );
    
    toast({
      title: "Request Accepted!",
      description: "You can now start your skill exchange.",
    });
  };

  const handleReject = async (requestId: string) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId ? { ...req, status: 'rejected' as const } : req
      )
    );
    
    toast({
      title: "Request Rejected",
      description: "The request has been declined.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'accepted':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'completed':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'accepted':
        return <Check className="h-4 w-4" />;
      case 'rejected':
        return <X className="h-4 w-4" />;
      case 'completed':
        return <Check className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const incomingRequests = requests.filter(req => req.isIncoming);
  const outgoingRequests = requests.filter(req => !req.isIncoming);
  const pendingCount = requests.filter(req => req.status === 'pending').length;

  const RequestCard = ({ request }: { request: SwapRequest }) => (
    <div className="skill-card">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
          <span className="text-primary-foreground font-semibold">
            {request.isIncoming ? request.fromUser.name.charAt(0) : request.toUser.name.charAt(0)}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-foreground">
                {request.isIncoming ? request.fromUser.name : request.toUser.name}
              </h3>
              <Badge className={getStatusColor(request.status)}>
                {getStatusIcon(request.status)}
                <span className="ml-1 capitalize">{request.status}</span>
              </Badge>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatDate(request.createdAt)}
            </span>
          </div>

          {/* Skill Exchange */}
          <div className="flex items-center space-x-2 mb-3 text-sm">
            <Badge variant="secondary">{request.offeredSkill}</Badge>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="border-primary/50 text-primary">
              {request.wantedSkill}
            </Badge>
          </div>

          {/* Message */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {request.message}
          </p>

          {/* Actions */}
          {request.status === 'pending' && request.isIncoming && (
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => handleAccept(request.id)}
                className="flex-1"
              >
                <Check className="mr-2 h-4 w-4" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReject(request.id)}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Decline
              </Button>
            </div>
          )}

          {request.status === 'accepted' && (
            <Button size="sm" className="w-full">
              <MessageCircle className="mr-2 h-4 w-4" />
              Start Chat
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn={isLoggedIn} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Skill Swap Requests</h1>
          <p className="text-muted-foreground">
            Manage your incoming and outgoing skill exchange requests.
          </p>
          {pendingCount > 0 && (
            <Badge className="mt-2 bg-primary/10 text-primary">
              {pendingCount} pending requests
            </Badge>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="incoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="incoming" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Incoming ({incomingRequests.length})</span>
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="flex items-center space-x-2">
              <ArrowRightLeft className="h-4 w-4" />
              <span>Outgoing ({outgoingRequests.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incoming" className="space-y-4">
            {incomingRequests.length > 0 ? (
              incomingRequests.map(request => (
                <RequestCard key={request.id} request={request} />
              ))
            ) : (
              <div className="text-center py-12">
                <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No incoming requests</h3>
                <p className="text-muted-foreground">
                  When others send you skill swap requests, they'll appear here.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="outgoing" className="space-y-4">
            {outgoingRequests.length > 0 ? (
              outgoingRequests.map(request => (
                <RequestCard key={request.id} request={request} />
              ))
            ) : (
              <div className="text-center py-12">
                <ArrowRightLeft className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No outgoing requests</h3>
                <p className="text-muted-foreground">
                  Start browsing profiles and send your first skill swap request!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}